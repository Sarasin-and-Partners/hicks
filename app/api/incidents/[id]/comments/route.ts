import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { comments, users, auditLog } from '@/lib/db/schema';
import { eq, asc } from 'drizzle-orm';
import { createCommentSchema } from '@/lib/validations/incident';
import { v4 as uuidv4 } from 'uuid';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const results = await db
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
      .orderBy(asc(comments.createdAt));

    const transformedComments = results.map((comment) => ({
      id: comment.id,
      authorId: comment.authorId,
      author: {
        id: comment.authorId,
        displayName: comment.authorName,
      },
      body: comment.body,
      visibility: comment.visibility,
      parentId: comment.parentId,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    }));

    return NextResponse.json(transformedComments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: incidentId } = await params;
    const body = await request.json();
    const userId = request.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 401 }
      );
    }

    const validatedData = createCommentSchema.parse(body);

    const id = uuidv4();
    const now = new Date().toISOString();

    await db.insert(comments).values({
      id,
      incidentId,
      authorId: userId,
      body: validatedData.body,
      visibility: validatedData.visibility || 'public',
      parentId: validatedData.parentId || null,
      createdAt: now,
      updatedAt: now,
    });

    // Audit log
    await db.insert(auditLog).values({
      id: uuidv4(),
      entityType: 'comment',
      entityId: id,
      action: 'create',
      userId,
      newValues: JSON.stringify({
        incidentId,
        body: validatedData.body,
        visibility: validatedData.visibility,
      }),
      createdAt: now,
    } as typeof auditLog.$inferInsert);

    // Fetch created comment with author info
    const created = await db
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
      .where(eq(comments.id, id))
      .limit(1);

    const response = {
      id: created[0].id,
      authorId: created[0].authorId,
      author: {
        id: created[0].authorId,
        displayName: created[0].authorName,
      },
      body: created[0].body,
      visibility: created[0].visibility,
      parentId: created[0].parentId,
      createdAt: created[0].createdAt,
      updatedAt: created[0].updatedAt,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation error', details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
