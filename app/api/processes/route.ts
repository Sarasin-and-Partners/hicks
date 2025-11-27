import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { processes } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';

export async function GET() {
  try {
    const results = await db
      .select()
      .from(processes)
      .where(eq(processes.isActive, true))
      .orderBy(asc(processes.name));

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching processes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch processes' },
      { status: 500 }
    );
  }
}
