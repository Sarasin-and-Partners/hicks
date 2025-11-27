// User & Auth Types
export type UserRole = 'employee' | 'hod' | 'risk_office' | 'admin';

export interface User {
  id: string;
  adUserId?: string;
  email: string;
  displayName: string;
  departmentId: string;
  departmentName?: string;
  teamId?: string;
  teamName?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Incident Types
export type IncidentStatus = 'open' | 'in_review' | 'closed';
export type IncidentCategory = 'near_miss' | 'behavioural_issue' | 'process_gap' | 'other';
export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type CommentVisibility = 'public' | 'private';
export type ActionStatus = 'open' | 'done' | 'overdue';
export type PersonRole = 'involved' | 'witness' | 'other';

export interface Incident {
  id: string;
  incidentNumber: string;
  reporterId: string;
  reporter?: User;
  reporterAdUserId?: string;
  departmentId: string;
  department?: Department;
  teamId?: string;
  team?: Team;
  incidentTypeId?: string;
  incidentType?: IncidentType;
  occurredAt: Date;
  reportedAt: Date;
  category: IncidentCategory;
  severity: Severity;
  description: string;
  privacyFlag: boolean;
  currentStatus: IncidentStatus;
  hodId?: string;
  hod?: User;
  riskOwnerId?: string;
  riskOwner?: User;
  escalationRequested: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  associatedPersons?: IncidentPersonLink[];
  associatedTeams?: IncidentTeamLink[];
  associatedProcesses?: IncidentProcessLink[];
  comments?: Comment[];
  attachments?: Attachment[];
  statusHistory?: StatusHistoryEntry[];
  actions?: Action[];
  tags?: Tag[];
}

export interface IncidentPersonLink {
  id: string;
  incidentId: string;
  personId: string;
  person?: User;
  role: PersonRole;
  createdAt: Date;
}

export interface IncidentTeamLink {
  id: string;
  incidentId: string;
  teamId: string;
  team?: Team;
  createdAt: Date;
}

export interface IncidentProcessLink {
  id: string;
  incidentId: string;
  processId: string;
  process?: Process;
  createdAt: Date;
}

// Reference Types
export interface Department {
  id: string;
  name: string;
  code?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Team {
  id: string;
  name: string;
  departmentId?: string;
  department?: Department;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Process {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IncidentType {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Action Types
export interface Action {
  id: string;
  incidentId: string;
  ownerId: string;
  owner?: User;
  title: string;
  notes?: string;
  dueDate?: Date;
  status: ActionStatus;
  createdAt: Date;
  completedAt?: Date;
}

// Comment Types
export interface Comment {
  id: string;
  incidentId: string;
  authorId: string;
  author?: User;
  parentId?: string;
  body: string;
  visibility: CommentVisibility;
  createdAt: Date;
  updatedAt: Date;
  replies?: Comment[];
}

// Attachment Types
export interface Attachment {
  id: string;
  incidentId: string;
  filename: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  storageUri: string;
  uploadedBy: string;
  uploader?: User;
  checksum?: string;
  createdAt: Date;
}

// Status History
export interface StatusHistoryEntry {
  id: string;
  incidentId: string;
  fromStatus?: IncidentStatus;
  toStatus: IncidentStatus;
  changedBy: string;
  changer?: User;
  reason?: string;
  changedAt: Date;
}

// Tags
export interface Tag {
  id: string;
  name: string;
  type?: string;
  createdAt: Date;
}

// Audit Log
export interface AuditLogEntry {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  userId: string;
  user?: User;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

// Saved Reports
export interface SavedReport {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  owner?: User;
  config: PivotConfig;
  isShared: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Analytics Types
export interface DimensionConfig {
  field: string;
  label: string;
  dateBucket?: 'day' | 'week' | 'month' | 'quarter' | 'year';
}

export interface MeasureConfig {
  field: string;
  aggregation: 'count' | 'sum' | 'avg' | 'min' | 'max';
  label: string;
}

export interface FilterConfig {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'like';
  value: unknown;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PivotConfig {
  rows: DimensionConfig[];
  columns: DimensionConfig[];
  values: MeasureConfig[];
  filters: FilterConfig[];
  sortBy?: SortConfig;
  limit?: number;
}

export interface PivotResult {
  data: Record<string, unknown>[];
  totals: Record<string, number>;
  metadata: {
    rowCount: number;
    executionTimeMs: number;
  };
}

// Notification Preferences
export interface NotificationPreferences {
  id: string;
  userId: string;
  emailOnSubmission: boolean;
  emailOnStatusChange: boolean;
  emailOnComment: boolean;
  digestFrequency: 'immediate' | 'daily';
  createdAt: Date;
  updatedAt: Date;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

// Form Types
export interface IncidentFormData {
  reporterId: string;
  departmentId: string;
  teamId?: string;
  occurredAt: Date;
  category: IncidentCategory;
  incidentTypeId?: string;
  severity?: Severity;
  description: string;
  associatedPersonIds?: string[];
  associatedTeamIds?: string[];
  associatedProcessIds?: string[];
  privacyFlag?: boolean;
}

export interface CommentFormData {
  body: string;
  visibility?: CommentVisibility;
  parentId?: string;
}

export interface StatusChangeFormData {
  status: IncidentStatus;
  reason?: string;
}
