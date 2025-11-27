import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { incidents, statusHistory, auditLog } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { statusChangeSchema } from '@/lib/validations/incident';
import { v4 as uuidv4 } from 'uuid';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 401 }
      );
    }

    const validatedData = statusChangeSchema.parse(body);

    // Get current incident status
    const currentIncident = await db
      .select({ currentStatus: incidents.currentStatus })
      .from(incidents)
      .where(eq(incidents.id, id))
      .limit(1);

    if (currentIncident.length === 0) {
      return NextResponse.json(
        { error: 'Incident not found' },
        { status: 404 }
      );
    }

    const fromStatus = currentIncident[0].currentStatus;
    const toStatus = validatedData.status;
    const now = new Date().toISOString();

    // Update incident status
    await db
      .update(incidents)
      .set({
        currentStatus: toStatus,
        updatedAt: now,
      })
      .where(eq(incidents.id, id));

    // Create status history entry
    await db.insert(statusHistory).values({
      id: uuidv4(),
      incidentId: id,
      fromStatus,
      toStatus,
      changedBy: userId,
      reason: validatedData.reason || null,
      changedAt: now,
    });

    // Audit log
    await db.insert(auditLog).values({
      id: uuidv4(),
      entityType: 'incident',
      entityId: id,
      action: 'status_change',
      userId,
      oldValues: JSON.stringify({ status: fromStatus }),
      newValues: JSON.stringify({ status: toStatus, reason: validatedData.reason }),
      createdAt: now,
    });

    return NextResponse.json({
      success: true,
      fromStatus,
      toStatus,
    });
  } catch (error) {
    console.error('Error updating incident status:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update incident status' },
      { status: 500 }
    );
  }
}
