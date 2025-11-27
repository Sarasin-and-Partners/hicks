import type { IncidentCategory, IncidentStatus, Severity, UserRole } from './types';

// Status Configuration
export const INCIDENT_STATUSES: Record<IncidentStatus, { label: string; color: string; bgColor: string }> = {
  open: { label: 'Open', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  in_review: { label: 'In Review', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  closed: { label: 'Closed', color: 'text-green-700', bgColor: 'bg-green-100' },
};

// Category Configuration
export const INCIDENT_CATEGORIES: Record<IncidentCategory, { label: string; description: string }> = {
  near_miss: { label: 'Near Miss', description: 'An event that could have resulted in an incident' },
  behavioural_issue: { label: 'Behavioural Issue', description: 'Conduct or behaviour related concern' },
  process_gap: { label: 'Process Gap', description: 'Gap or deficiency in existing process' },
  other: { label: 'Other', description: 'Other type of incident' },
};

// Severity Configuration
export const SEVERITY_LEVELS: Record<Severity, { label: string; color: string; bgColor: string; priority: number }> = {
  low: { label: 'Low', color: 'text-gray-700', bgColor: 'bg-gray-100', priority: 1 },
  medium: { label: 'Medium', color: 'text-yellow-700', bgColor: 'bg-yellow-100', priority: 2 },
  high: { label: 'High', color: 'text-orange-700', bgColor: 'bg-orange-100', priority: 3 },
  critical: { label: 'Critical', color: 'text-red-700', bgColor: 'bg-red-100', priority: 4 },
};

// User Roles Configuration
export const USER_ROLES: Record<UserRole, { label: string; description: string; permissions: string[] }> = {
  employee: {
    label: 'Employee',
    description: 'Can submit incidents and view own incidents',
    permissions: ['incidents:create', 'incidents:read:own', 'comments:create'],
  },
  hod: {
    label: 'Head of Department',
    description: 'Can review, comment, and close incidents in their department',
    permissions: [
      'incidents:create',
      'incidents:read:department',
      'incidents:update',
      'incidents:status:change',
      'comments:create',
      'comments:create:private',
      'analytics:read',
    ],
  },
  risk_office: {
    label: 'Risk Office',
    description: 'Can view all incidents, add notes, and access analytics',
    permissions: [
      'incidents:create',
      'incidents:read:all',
      'incidents:reopen',
      'comments:create',
      'comments:create:private',
      'analytics:read',
      'audit:read',
    ],
  },
  admin: {
    label: 'Administrator',
    description: 'Full system access including configuration',
    permissions: [
      'incidents:create',
      'incidents:read:all',
      'incidents:update',
      'comments:create',
      'analytics:read',
      'audit:read',
      'admin:incident-types',
      'admin:teams',
      'admin:processes',
      'admin:users',
    ],
  },
};

// Validation Constants
export const VALIDATION = {
  DESCRIPTION_MIN_LENGTH: 5,
  DESCRIPTION_MAX_LENGTH: 2000,
  COMMENT_MAX_LENGTH: 5000,
  ATTACHMENT_MAX_SIZE_BYTES: 20 * 1024 * 1024, // 20MB
  ALLOWED_ATTACHMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/png',
    'image/jpeg',
    'image/jpg',
  ],
  ALLOWED_ATTACHMENT_EXTENSIONS: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.png', '.jpg', '.jpeg'],
};

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
};

// Analytics Defaults
export const ANALYTICS = {
  MAX_ROWS: 100000,
  DEFAULT_LIMIT: 1000,
  CACHE_TTL_SECONDS: 300, // 5 minutes
};

// Status Transitions
export const STATUS_TRANSITIONS: Record<IncidentStatus, IncidentStatus[]> = {
  open: ['in_review', 'closed'],
  in_review: ['open', 'closed'],
  closed: ['open', 'in_review'],
};

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'dd MMM yyyy',
  DISPLAY_WITH_TIME: 'dd MMM yyyy HH:mm',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  API: 'yyyy-MM-dd',
};

// Navigation Items
export const NAV_ITEMS = [
  { label: 'Dashboard', href: '/', icon: 'LayoutDashboard' },
  { label: 'Incidents', href: '/incidents', icon: 'AlertTriangle' },
  { label: 'Analytics', href: '/analytics', icon: 'BarChart3', roles: ['hod', 'risk_office', 'admin'] },
  { label: 'Admin', href: '/admin', icon: 'Settings', roles: ['admin'] },
];

// Person Role Labels
export const PERSON_ROLES = {
  involved: 'Involved',
  witness: 'Witness',
  other: 'Other',
};

// Comment Visibility Labels
export const COMMENT_VISIBILITY = {
  public: 'Public',
  private: 'Private (HoD/Risk Only)',
};

// Action Status Labels
export const ACTION_STATUSES = {
  open: { label: 'Open', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  done: { label: 'Done', color: 'text-green-700', bgColor: 'bg-green-100' },
  overdue: { label: 'Overdue', color: 'text-red-700', bgColor: 'bg-red-100' },
};
