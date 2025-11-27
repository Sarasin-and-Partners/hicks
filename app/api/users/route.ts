import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, departments, teams } from '@/lib/db/schema';
import { eq, ilike, or, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '20');
    const departmentId = searchParams.get('departmentId');

    let whereClause = eq(users.isActive, true);

    if (departmentId) {
      whereClause = and(whereClause, eq(users.departmentId, departmentId))!;
    }

    const results = await db
      .select({
        id: users.id,
        email: users.email,
        displayName: users.displayName,
        departmentId: users.departmentId,
        departmentName: departments.name,
        teamId: users.teamId,
        teamName: teams.name,
        role: users.role,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .leftJoin(departments, eq(users.departmentId, departments.id))
      .leftJoin(teams, eq(users.teamId, teams.id))
      .where(
        query
          ? and(
              whereClause,
              or(
                ilike(users.displayName, `%${query}%`),
                ilike(users.email, `%${query}%`)
              )
            )
          : whereClause
      )
      .limit(limit);

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
