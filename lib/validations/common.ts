import { z } from 'zod';
import { VALIDATION } from '../constants';

// UUID Schema
export const uuidSchema = z.string().uuid('Invalid ID format');

// Pagination Schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(20),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

// Search Query Schema
export const searchQuerySchema = z.object({
  q: z.string().min(1).max(200).optional(),
  limit: z.coerce.number().int().positive().max(50).optional().default(10),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;

// File Upload Validation
export const fileUploadSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  mimeType: z.string().refine(
    (type) => VALIDATION.ALLOWED_ATTACHMENT_TYPES.includes(type),
    { message: 'File type not allowed. Allowed types: PDF, DOCX, XLS, XLSX, PNG, JPG' }
  ),
  sizeBytes: z.number().int().positive().max(
    VALIDATION.ATTACHMENT_MAX_SIZE_BYTES,
    `File size cannot exceed ${VALIDATION.ATTACHMENT_MAX_SIZE_BYTES / (1024 * 1024)}MB`
  ),
});

export type FileUploadInput = z.infer<typeof fileUploadSchema>;

// Create Department Schema
export const createDepartmentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name cannot exceed 255 characters'),
  code: z.string().max(50, 'Code cannot exceed 50 characters').optional(),
});

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;

// Create Team Schema
export const createTeamSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name cannot exceed 255 characters'),
  departmentId: z.string().uuid('Invalid department ID').optional().nullable(),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;

// Create Process Schema
export const createProcessSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name cannot exceed 255 characters'),
  description: z.string().max(2000, 'Description cannot exceed 2000 characters').optional(),
});

export type CreateProcessInput = z.infer<typeof createProcessSchema>;

// Create Incident Type Schema
export const createIncidentTypeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name cannot exceed 255 characters'),
  description: z.string().max(2000, 'Description cannot exceed 2000 characters').optional(),
});

export type CreateIncidentTypeInput = z.infer<typeof createIncidentTypeSchema>;

// Update Incident Type Schema
export const updateIncidentTypeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name cannot exceed 255 characters').optional(),
  description: z.string().max(2000, 'Description cannot exceed 2000 characters').optional().nullable(),
  isActive: z.boolean().optional(),
});

export type UpdateIncidentTypeInput = z.infer<typeof updateIncidentTypeSchema>;

// User Role Schema
export const userRoleSchema = z.enum(['employee', 'hod', 'risk_office', 'admin']);

// Create User Schema (for admin)
export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  displayName: z.string().min(1, 'Display name is required').max(255, 'Display name cannot exceed 255 characters'),
  departmentId: z.string().uuid('Invalid department ID').optional().nullable(),
  teamId: z.string().uuid('Invalid team ID').optional().nullable(),
  role: userRoleSchema.optional().default('employee'),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

// Saved Report Schema
export const createSavedReportSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name cannot exceed 255 characters'),
  description: z.string().max(1000, 'Description cannot exceed 1000 characters').optional(),
  config: z.object({
    rows: z.array(z.object({
      field: z.string(),
      label: z.string(),
      dateBucket: z.enum(['day', 'week', 'month', 'quarter', 'year']).optional(),
    })),
    columns: z.array(z.object({
      field: z.string(),
      label: z.string(),
      dateBucket: z.enum(['day', 'week', 'month', 'quarter', 'year']).optional(),
    })),
    values: z.array(z.object({
      field: z.string(),
      aggregation: z.enum(['count', 'sum', 'avg', 'min', 'max']),
      label: z.string(),
    })),
    filters: z.array(z.object({
      field: z.string(),
      operator: z.enum(['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'in', 'like']),
      value: z.unknown(),
    })),
    sortBy: z.object({
      field: z.string(),
      direction: z.enum(['asc', 'desc']),
    }).optional(),
    limit: z.number().int().positive().max(10000).optional(),
  }),
  isShared: z.boolean().optional().default(false),
});

export type CreateSavedReportInput = z.infer<typeof createSavedReportSchema>;

// Pivot Query Schema
export const pivotQuerySchema = z.object({
  rows: z.array(z.object({
    field: z.string(),
    label: z.string().optional(),
    dateBucket: z.enum(['day', 'week', 'month', 'quarter', 'year']).optional(),
  })).optional().default([]),
  columns: z.array(z.object({
    field: z.string(),
    label: z.string().optional(),
    dateBucket: z.enum(['day', 'week', 'month', 'quarter', 'year']).optional(),
  })).optional().default([]),
  values: z.array(z.object({
    field: z.string(),
    aggregation: z.enum(['count', 'sum', 'avg', 'min', 'max']),
    label: z.string().optional(),
  })).min(1, 'At least one measure is required'),
  filters: z.array(z.object({
    field: z.string(),
    operator: z.enum(['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'in', 'like']),
    value: z.unknown(),
  })).optional().default([]),
  sortBy: z.object({
    field: z.string(),
    direction: z.enum(['asc', 'desc']),
  }).optional(),
  limit: z.number().int().positive().max(10000).optional().default(1000),
});

export type PivotQueryInput = z.infer<typeof pivotQuerySchema>;

// Date Range Schema
export const dateRangeSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
}).refine(
  (data) => {
    if (data.from && data.to) {
      return new Date(data.from) <= new Date(data.to);
    }
    return true;
  },
  { message: 'From date must be before or equal to To date' }
);

export type DateRangeInput = z.infer<typeof dateRangeSchema>;
