import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { departments } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';

export async function GET() {
  try {
    const results = await db
      .select()
      .from(departments)
      .where(eq(departments.isActive, true))
      .orderBy(asc(departments.name));

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch departments' },
      { status: 500 }
    );
  }
}
