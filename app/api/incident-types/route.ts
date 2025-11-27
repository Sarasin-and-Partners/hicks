import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { incidentTypes, auditLog } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';
import { createIncidentTypeSchema } from '@/lib/validations/common';
import { v4 as uuidv4 } from 'uuid';

export async function GET() {
  try {
    const results = await db
      .select()
      .from(incidentTypes)
      .where(eq(incidentTypes.isActive, true))
      .orderBy(asc(incidentTypes.name));

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching incident types:', error);
    return NextResponse.json(
      { error: 'Failed to fetch incident types' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 401 }
      );
    }

    const validatedData = createIncidentTypeSchema.parse(body);

    const id = uuidv4();
    const now = new Date().toISOString();

    await db.insert(incidentTypes).values({
      id,
      name: validatedData.name,
      description: validatedData.description,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    // Audit log
    await db.insert(auditLog).values({
      id: uuidv4(),
      entityType: 'incident_type',
      entityId: id,
      action: 'create',
      userId,
      newValues: JSON.stringify(validatedData),
      createdAt: now,
    } as typeof auditLog.$inferInsert);

    const created = await db
      .select()
      .from(incidentTypes)
      .where(eq(incidentTypes.id, id))
      .limit(1);

    return NextResponse.json(created[0], { status: 201 });
  } catch (error) {
    console.error('Error creating incident type:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create incident type' },
      { status: 500 }
    );
  }
}
