import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { teams, departments } from '@/lib/db/schema';
import { eq, and, asc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get('departmentId');

    let whereClause = eq(teams.isActive, true);

    if (departmentId) {
      whereClause = and(whereClause, eq(teams.departmentId, departmentId))!;
    }

    const results = await db
      .select({
        id: teams.id,
        name: teams.name,
        departmentId: teams.departmentId,
        departmentName: departments.name,
        isActive: teams.isActive,
        createdAt: teams.createdAt,
        updatedAt: teams.updatedAt,
      })
      .from(teams)
      .leftJoin(departments, eq(teams.departmentId, departments.id))
      .where(whereClause)
      .orderBy(asc(teams.name));

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}
