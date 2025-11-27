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
  statusHistory,
  auditLog,
} from '@/lib/db/schema';
import { eq, and, or, gte, lte, ilike, desc, asc, sql, count } from 'drizzle-orm';
import { createIncidentSchema, incidentListQuerySchema } from '@/lib/validations/incident';
import { v4 as uuidv4 } from 'uuid';

// Generate incident number
async function generateIncidentNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `INC-${year}-`;

  // Get the latest incident number for this year
  const latest = await db
    .select({ incidentNumber: incidents.incidentNumber })
    .from(incidents)
    .where(ilike(incidents.incidentNumber, `${prefix}%`))
    .orderBy(desc(incidents.incidentNumber))
    .limit(1);

  let nextNumber = 1;
  if (latest.length > 0 && latest[0].incidentNumber) {
    const lastNumber = parseInt(latest[0].incidentNumber.replace(prefix, ''), 10);
    nextNumber = lastNumber + 1;
  }

  return `${prefix}${String(nextNumber).padStart(4, '0')}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse and validate query parameters
    const queryParams = {
      page: searchParams.get('page') || '1',
      pageSize: searchParams.get('pageSize') || '20',
      status: searchParams.get('status') || undefined,
      category: searchParams.get('category') || undefined,
      severity: searchParams.get('severity') || undefined,
      departmentId: searchParams.get('departmentId') || undefined,
      teamId: searchParams.get('teamId') || undefined,
      reporterId: searchParams.get('reporterId') || undefined,
      fromDate: searchParams.get('fromDate') || undefined,
      toDate: searchParams.get('toDate') || undefined,
      search: searchParams.get('search') || undefined,
      sortBy: searchParams.get('sortBy') || 'reportedAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    };

    const validatedQuery = incidentListQuerySchema.parse(queryParams);
    const { page, pageSize, sortBy, sortOrder, ...filters } = validatedQuery;

    // Build where conditions
    const conditions = [];

    if (filters.status) {
      conditions.push(eq(incidents.currentStatus, filters.status));
    }
    if (filters.category) {
      conditions.push(eq(incidents.category, filters.category));
    }
    if (filters.severity) {
      conditions.push(eq(incidents.severity, filters.severity));
    }
    if (filters.departmentId) {
      conditions.push(eq(incidents.departmentId, filters.departmentId));
    }
    if (filters.teamId) {
      conditions.push(eq(incidents.teamId, filters.teamId));
    }
    if (filters.reporterId) {
      conditions.push(eq(incidents.reporterId, filters.reporterId));
    }
    if (filters.fromDate) {
      conditions.push(gte(incidents.occurredAt, new Date(filters.fromDate).toISOString()));
    }
    if (filters.toDate) {
      conditions.push(lte(incidents.occurredAt, new Date(filters.toDate).toISOString()));
    }
    if (filters.search) {
      conditions.push(
        or(
          ilike(incidents.description, `%${filters.search}%`),
          ilike(incidents.incidentNumber, `%${filters.search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(incidents)
      .where(whereClause);

    const totalCount = totalResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);
    const offset = (page - 1) * pageSize;

    // Determine sort column and order
    const sortColumn = {
      occurredAt: incidents.occurredAt,
      reportedAt: incidents.reportedAt,
      severity: incidents.severity,
      status: incidents.currentStatus,
      incidentNumber: incidents.incidentNumber,
    }[sortBy] || incidents.reportedAt;

    const orderFn = sortOrder === 'asc' ? asc : desc;

    // Fetch incidents with relations
    const results = await db
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
        createdAt: incidents.createdAt,
        updatedAt: incidents.updatedAt,
      })
      .from(incidents)
      .leftJoin(users, eq(incidents.reporterId, users.id))
      .leftJoin(departments, eq(incidents.departmentId, departments.id))
      .leftJoin(teams, eq(incidents.teamId, teams.id))
      .leftJoin(incidentTypes, eq(incidents.incidentTypeId, incidentTypes.id))
      .where(whereClause)
      .orderBy(orderFn(sortColumn))
      .limit(pageSize)
      .offset(offset);

    // Transform results to include nested reporter and department objects
    const transformedResults = results.map((row) => ({
      id: row.id,
      incidentNumber: row.incidentNumber,
      reporterId: row.reporterId,
      reporter: row.reporterName ? {
        id: row.reporterId,
        displayName: row.reporterName,
        email: row.reporterEmail,
      } : null,
      departmentId: row.departmentId,
      department: row.departmentName ? {
        id: row.departmentId,
        name: row.departmentName,
      } : null,
      teamId: row.teamId,
      team: row.teamName ? {
        id: row.teamId,
        name: row.teamName,
      } : null,
      incidentTypeId: row.incidentTypeId,
      incidentType: row.incidentTypeName ? {
        id: row.incidentTypeId,
        name: row.incidentTypeName,
      } : null,
      occurredAt: row.occurredAt,
      reportedAt: row.reportedAt,
      category: row.category,
      severity: row.severity,
      description: row.description,
      privacyFlag: row.privacyFlag,
      currentStatus: row.currentStatus,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));

    return NextResponse.json({
      data: transformedResults,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching incidents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch incidents' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = request.headers.get('x-user-id') || body.reporterId;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 401 }
      );
    }

    const validatedData = createIncidentSchema.parse(body);

    const id = uuidv4();
    const incidentNumber = await generateIncidentNumber();
    const now = new Date().toISOString();

    // Create incident
    await db.insert(incidents).values({
      id,
      incidentNumber,
      reporterId: validatedData.reporterId,
      departmentId: validatedData.departmentId,
      teamId: validatedData.teamId || null,
      incidentTypeId: validatedData.incidentTypeId || null,
      occurredAt: new Date(validatedData.occurredAt).toISOString(),
      reportedAt: now,
      category: validatedData.category,
      severity: validatedData.severity || 'medium',
      description: validatedData.description,
      privacyFlag: validatedData.privacyFlag || false,
      currentStatus: 'open',
      escalationRequested: false,
      createdAt: now,
      updatedAt: now,
    });

    // Create associated team links
    if (validatedData.associatedTeamIds && validatedData.associatedTeamIds.length > 0) {
      for (const teamId of validatedData.associatedTeamIds) {
        await db.insert(incidentTeamLinks).values({
          id: uuidv4(),
          incidentId: id,
          teamId,
          createdAt: now,
        });
      }
    }

    // Create associated process links
    if (validatedData.associatedProcessIds && validatedData.associatedProcessIds.length > 0) {
      for (const processId of validatedData.associatedProcessIds) {
        await db.insert(incidentProcessLinks).values({
          id: uuidv4(),
          incidentId: id,
          processId,
          createdAt: now,
        });
      }
    }

    // Create associated person links
    if (validatedData.associatedPersonIds && validatedData.associatedPersonIds.length > 0) {
      for (const personId of validatedData.associatedPersonIds) {
        await db.insert(incidentPersonLinks).values({
          id: uuidv4(),
          incidentId: id,
          personId,
          role: 'involved',
          createdAt: now,
        });
      }
    }

    // Create initial status history entry
    await db.insert(statusHistory).values({
      id: uuidv4(),
      incidentId: id,
      fromStatus: null,
      toStatus: 'open',
      changedBy: userId,
      reason: 'Incident created',
      changedAt: now,
    });

    // Audit log
    await db.insert(auditLog).values({
      id: uuidv4(),
      entityType: 'incident',
      entityId: id,
      action: 'create',
      userId,
      newValues: JSON.stringify({
        ...validatedData,
        incidentNumber,
        currentStatus: 'open',
      }),
      createdAt: now,
    });

    return NextResponse.json(
      {
        id,
        incidentNumber,
        currentStatus: 'open',
        createdAt: now,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating incident:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create incident' },
      { status: 500 }
    );
  }
}
