import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  incidents,
  users,
  departments,
  teams,
  incidentTypes,
  incidentTeamLinks,
  incidentProcessLinks,
  incidentPersonLinks,
  comments,
  statusHistory,
  processes,
} from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { updateIncidentSchema } from '@/lib/validations/incident';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch incident with basic relations
    const incidentResult = await db
      .select({
        id: incidents.id,
        incidentNumber: incidents.incidentNumber,
        reporterId: incidents.reporterId,
        reporterName: users.displayName,
        reporterEmail: users.email,
        departmentId: incidents.departmentId,
        departmentName: departments.name,
        teamId: incidents.teamId,
        teamName: teams.name,
        incidentTypeId: incidents.incidentTypeId,
        incidentTypeName: incidentTypes.name,
        occurredAt: incidents.occurredAt,
        reportedAt: incidents.reportedAt,
        category: incidents.category,
        severity: incidents.severity,
        description: incidents.description,
        privacyFlag: incidents.privacyFlag,
        currentStatus: incidents.currentStatus,
        hodId: incidents.hodId,
        riskOwnerId: incidents.riskOwnerId,
        escalationRequested: incidents.escalationRequested,
        createdAt: incidents.createdAt,
        updatedAt: incidents.updatedAt,
      })
      .from(incidents)
      .leftJoin(users, eq(incidents.reporterId, users.id))
      .leftJoin(departments, eq(incidents.departmentId, departments.id))
      .leftJoin(teams, eq(incidents.teamId, teams.id))
      .leftJoin(incidentTypes, eq(incidents.incidentTypeId, incidentTypes.id))
      .where(eq(incidents.id, id))
      .limit(1);

    if (incidentResult.length === 0) {
      return NextResponse.json(
        { error: 'Incident not found' },
        { status: 404 }
      );
    }

    const incident = incidentResult[0];

    // Fetch associated teams
    const teamLinks = await db
      .select({
        id: incidentTeamLinks.id,
        teamId: incidentTeamLinks.teamId,
        teamName: teams.name,
        createdAt: incidentTeamLinks.createdAt,
      })
      .from(incidentTeamLinks)
      .leftJoin(teams, eq(incidentTeamLinks.teamId, teams.id))
      .where(eq(incidentTeamLinks.incidentId, id));

    // Fetch associated processes
    const processLinks = await db
      .select({
        id: incidentProcessLinks.id,
        processId: incidentProcessLinks.processId,
        processName: processes.name,
        createdAt: incidentProcessLinks.createdAt,
      })
      .from(incidentProcessLinks)
      .leftJoin(processes, eq(incidentProcessLinks.processId, processes.id))
      .where(eq(incidentProcessLinks.incidentId, id));

    // Fetch associated persons
    const personLinks = await db
      .select({
        id: incidentPersonLinks.id,
        personId: incidentPersonLinks.personId,
        personName: users.displayName,
        role: incidentPersonLinks.role,
        createdAt: incidentPersonLinks.createdAt,
      })
      .from(incidentPersonLinks)
      .leftJoin(users, eq(incidentPersonLinks.personId, users.id))
      .where(eq(incidentPersonLinks.incidentId, id));

    // Fetch comments
    const incidentComments = await db
      .select({
        id: comments.id,
        authorId: comments.authorId,
        authorName: users.displayName,
        body: comments.body,
        visibility: comments.visibility,
        parentId: comments.parentId,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
      })
      .from(comments)
      .leftJoin(users, eq(comments.authorId, users.id))
      .where(eq(comments.incidentId, id))
      .orderBy(comments.createdAt);

    // Fetch status history
    const history = await db
      .select({
        id: statusHistory.id,
        fromStatus: statusHistory.fromStatus,
        toStatus: statusHistory.toStatus,
        changedBy: statusHistory.changedBy,
        changerName: users.displayName,
        reason: statusHistory.reason,
        changedAt: statusHistory.changedAt,
      })
      .from(statusHistory)
      .leftJoin(users, eq(statusHistory.changedBy, users.id))
      .where(eq(statusHistory.incidentId, id))
      .orderBy(statusHistory.changedAt);

    // Transform and return
    const response = {
      id: incident.id,
      incidentNumber: incident.incidentNumber,
      reporterId: incident.reporterId,
      reporter: incident.reporterName
        ? {
            id: incident.reporterId,
            displayName: incident.reporterName,
            email: incident.reporterEmail,
          }
        : null,
      departmentId: incident.departmentId,
      department: incident.departmentName
        ? {
            id: incident.departmentId,
            name: incident.departmentName,
          }
        : null,
      teamId: incident.teamId,
      team: incident.teamName
        ? {
            id: incident.teamId,
            name: incident.teamName,
          }
        : null,
      incidentTypeId: incident.incidentTypeId,
      incidentType: incident.incidentTypeName
        ? {
            id: incident.incidentTypeId,
            name: incident.incidentTypeName,
          }
        : null,
      occurredAt: incident.occurredAt,
      reportedAt: incident.reportedAt,
      category: incident.category,
      severity: incident.severity,
      description: incident.description,
      privacyFlag: incident.privacyFlag,
      currentStatus: incident.currentStatus,
      hodId: incident.hodId,
      riskOwnerId: incident.riskOwnerId,
      escalationRequested: incident.escalationRequested,
      createdAt: incident.createdAt,
      updatedAt: incident.updatedAt,
      associatedTeams: teamLinks.map((link) => ({
        id: link.id,
        teamId: link.teamId,
        team: { id: link.teamId, name: link.teamName },
        createdAt: link.createdAt,
      })),
      associatedProcesses: processLinks.map((link) => ({
        id: link.id,
        processId: link.processId,
        process: { id: link.processId, name: link.processName },
        createdAt: link.createdAt,
      })),
      associatedPersons: personLinks.map((link) => ({
        id: link.id,
        personId: link.personId,
        person: { id: link.personId, displayName: link.personName },
        role: link.role,
        createdAt: link.createdAt,
      })),
      comments: incidentComments.map((comment) => ({
        id: comment.id,
        authorId: comment.authorId,
        author: { id: comment.authorId, displayName: comment.authorName },
        body: comment.body,
        visibility: comment.visibility,
        parentId: comment.parentId,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      })),
      statusHistory: history.map((entry) => ({
        id: entry.id,
        fromStatus: entry.fromStatus,
        toStatus: entry.toStatus,
        changedBy: entry.changedBy,
        changer: { id: entry.changedBy, displayName: entry.changerName },
        reason: entry.reason,
        changedAt: entry.changedAt,
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching incident:', error);
    return NextResponse.json(
      { error: 'Failed to fetch incident' },
      { status: 500 }
    );
  }
}

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

    const validatedData = updateIncidentSchema.parse(body);

    const now = new Date().toISOString();

    await db
      .update(incidents)
      .set({
        ...validatedData,
        updatedAt: now,
      })
      .where(eq(incidents.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating incident:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update incident' },
      { status: 500 }
    );
  }
}
