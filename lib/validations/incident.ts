import { z } from 'zod';
import { VALIDATION } from '../constants';

// Incident Categories
export const incidentCategorySchema = z.enum(['near_miss', 'behavioural_issue', 'process_gap', 'other']);

// Severity Levels
export const severitySchema = z.enum(['low', 'medium', 'high', 'critical']);

// Incident Status
export const incidentStatusSchema = z.enum(['open', 'in_review', 'closed']);

// Comment Visibility
export const commentVisibilitySchema = z.enum(['public', 'private']);

// Person Role in Incident
export const personRoleSchema = z.enum(['involved', 'witness', 'other']);

// Create Incident Schema
export const createIncidentSchema = z.object({
  reporterId: z.string().uuid('Invalid reporter ID'),
  departmentId: z.string().uuid('Invalid department ID'),
  teamId: z.string().uuid('Invalid team ID').optional().nullable(),
  incidentTypeId: z.string().uuid('Invalid incident type ID').optional().nullable(),
  occurredAt: z.string().datetime({ message: 'Invalid date format' }).refine(
    (date) => new Date(date) <= new Date(),
    { message: 'Date of incident cannot be in the future' }
  ),
  category: incidentCategorySchema,
  severity: severitySchema.optional().default('medium'),
  description: z
    .string()
    .min(VALIDATION.DESCRIPTION_MIN_LENGTH, `Description must be at least ${VALIDATION.DESCRIPTION_MIN_LENGTH} characters`)
    .max(VALIDATION.DESCRIPTION_MAX_LENGTH, `Description cannot exceed ${VALIDATION.DESCRIPTION_MAX_LENGTH} characters`),
  associatedPersonIds: z.array(z.string().uuid()).optional().default([]),
  associatedTeamIds: z.array(z.string().uuid()).optional().default([]),
  associatedProcessIds: z.array(z.string().uuid()).optional().default([]),
  privacyFlag: z.boolean().optional().default(false),
});

export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;

// Update Incident Schema
export const updateIncidentSchema = z.object({
  departmentId: z.string().uuid('Invalid department ID').optional(),
  teamId: z.string().uuid('Invalid team ID').optional().nullable(),
  incidentTypeId: z.string().uuid('Invalid incident type ID').optional().nullable(),
  category: incidentCategorySchema.optional(),
  severity: severitySchema.optional(),
  description: z
    .string()
    .min(VALIDATION.DESCRIPTION_MIN_LENGTH, `Description must be at least ${VALIDATION.DESCRIPTION_MIN_LENGTH} characters`)
    .max(VALIDATION.DESCRIPTION_MAX_LENGTH, `Description cannot exceed ${VALIDATION.DESCRIPTION_MAX_LENGTH} characters`)
    .optional(),
  privacyFlag: z.boolean().optional(),
  hodId: z.string().uuid('Invalid HoD ID').optional().nullable(),
  riskOwnerId: z.string().uuid('Invalid Risk Owner ID').optional().nullable(),
  escalationRequested: z.boolean().optional(),
});

export type UpdateIncidentInput = z.infer<typeof updateIncidentSchema>;

// Status Change Schema
export const statusChangeSchema = z.object({
  status: incidentStatusSchema,
  reason: z.string().max(500, 'Reason cannot exceed 500 characters').optional(),
});

export type StatusChangeInput = z.infer<typeof statusChangeSchema>;

// Create Comment Schema
export const createCommentSchema = z.object({
  body: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(VALIDATION.COMMENT_MAX_LENGTH, `Comment cannot exceed ${VALIDATION.COMMENT_MAX_LENGTH} characters`),
  visibility: commentVisibilitySchema.optional().default('public'),
  parentId: z.string().uuid('Invalid parent comment ID').optional().nullable(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;

// Create Action Schema
export const createActionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title cannot exceed 500 characters'),
  notes: z.string().max(5000, 'Notes cannot exceed 5000 characters').optional(),
  ownerId: z.string().uuid('Invalid owner ID'),
  dueDate: z.string().datetime({ message: 'Invalid date format' }).optional().nullable(),
});

export type CreateActionInput = z.infer<typeof createActionSchema>;

// Update Action Schema
export const updateActionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title cannot exceed 500 characters').optional(),
  notes: z.string().max(5000, 'Notes cannot exceed 5000 characters').optional().nullable(),
  ownerId: z.string().uuid('Invalid owner ID').optional(),
  dueDate: z.string().datetime({ message: 'Invalid date format' }).optional().nullable(),
  status: z.enum(['open', 'done', 'overdue']).optional(),
});

export type UpdateActionInput = z.infer<typeof updateActionSchema>;

// Associated Person Link Schema
export const personLinkSchema = z.object({
  personId: z.string().uuid('Invalid person ID'),
  role: personRoleSchema.optional().default('involved'),
});

export type PersonLinkInput = z.infer<typeof personLinkSchema>;

// Incident List Query Schema
export const incidentListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(1000).optional().default(20),
  status: incidentStatusSchema.optional(),
  category: incidentCategorySchema.optional(),
  severity: severitySchema.optional(),
  departmentId: z.string().uuid().optional(),
  teamId: z.string().uuid().optional(),
  reporterId: z.string().uuid().optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['occurredAt', 'reportedAt', 'severity', 'status', 'incidentNumber']).optional().default('reportedAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type IncidentListQuery = z.infer<typeof incidentListQuerySchema>;
