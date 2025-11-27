# Conduct & Behaviour Log - Implementation Plan

**Project:** Conduct & Behaviour Log System
**Version:** 0.1 MVP
**Created:** 2025-11-27
**Based on:** spec/Conduct Behaviour Log Developer Specification.docx.md

---

## Executive Summary

This plan outlines the implementation of an incident/near-miss tracking system for conduct and behaviour monitoring. The MVP focuses on core functionality without authentication (using a user selector) and without Active Directory integration (using mock data).

---

## Phase 1: Project Foundation

### 1.1 Dependencies Installation

**Database & ORM:**
```bash
npm install drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit
```

**UI Components (ShadCN):**
```bash
npx shadcn@latest init
npx shadcn@latest add button card input label select textarea dialog table tabs form toast dropdown-menu badge avatar separator sheet command popover calendar checkbox
```

**Form & Validation:**
```bash
npm install zod react-hook-form @hookform/resolvers
```

**Utilities:**
```bash
npm install date-fns uuid nanoid clsx tailwind-merge lucide-react
npm install -D @types/uuid
```

**File Upload:**
```bash
npm install @uploadthing/react uploadthing
# OR for MVP: use local storage with built-in Next.js API
```

**Charts (for Analytics):**
```bash
npm install recharts @tanstack/react-table
```

### 1.2 Project Structure

```
project-hicks/
├── app/
│   ├── (auth)/                    # Auth-related pages (user selector for MVP)
│   │   └── select-user/
│   │       └── page.tsx
│   ├── (dashboard)/               # Main application
│   │   ├── layout.tsx             # Dashboard layout with sidebar
│   │   ├── page.tsx               # Dashboard home/overview
│   │   ├── incidents/
│   │   │   ├── page.tsx           # Incident list
│   │   │   ├── new/
│   │   │   │   └── page.tsx       # New incident form
│   │   │   └── [id]/
│   │   │       ├── page.tsx       # Incident detail
│   │   │       └── edit/
│   │   │           └── page.tsx   # Edit incident
│   │   ├── analytics/
│   │   │   └── page.tsx           # Pivot builder & charts
│   │   └── admin/
│   │       ├── page.tsx           # Admin dashboard
│   │       ├── incident-types/
│   │       │   └── page.tsx       # Manage incident types
│   │       ├── teams/
│   │       │   └── page.tsx       # Manage teams
│   │       └── processes/
│   │           └── page.tsx       # Manage processes
│   ├── api/
│   │   ├── incidents/
│   │   │   ├── route.ts           # GET (list), POST (create)
│   │   │   └── [id]/
│   │   │       ├── route.ts       # GET, PUT, DELETE
│   │   │       ├── comments/
│   │   │       │   └── route.ts   # GET, POST comments
│   │   │       ├── attachments/
│   │   │       │   └── route.ts   # GET, POST attachments
│   │   │       └── status/
│   │   │           └── route.ts   # PUT status change
│   │   ├── users/
│   │   │   └── route.ts           # GET users (mock directory)
│   │   ├── teams/
│   │   │   └── route.ts           # CRUD teams
│   │   ├── departments/
│   │   │   └── route.ts           # GET departments
│   │   ├── processes/
│   │   │   └── route.ts           # CRUD processes
│   │   ├── incident-types/
│   │   │   └── route.ts           # CRUD incident types
│   │   ├── analytics/
│   │   │   ├── pivot/
│   │   │   │   └── route.ts       # POST pivot query
│   │   │   └── saved-reports/
│   │   │       └── route.ts       # CRUD saved reports
│   │   └── audit-log/
│   │       └── route.ts           # GET audit entries
│   ├── layout.tsx
│   ├── page.tsx                   # Redirect to dashboard or user select
│   └── globals.css
├── components/
│   ├── ui/                        # ShadCN components
│   ├── forms/
│   │   ├── incident-form.tsx
│   │   ├── comment-form.tsx
│   │   └── status-change-form.tsx
│   ├── incidents/
│   │   ├── incident-card.tsx
│   │   ├── incident-list.tsx
│   │   ├── incident-detail.tsx
│   │   ├── incident-filters.tsx
│   │   └── status-badge.tsx
│   ├── analytics/
│   │   ├── pivot-builder.tsx
│   │   ├── pivot-table.tsx
│   │   ├── chart-display.tsx
│   │   └── dimension-selector.tsx
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   ├── user-nav.tsx
│   │   └── nav-links.tsx
│   └── shared/
│       ├── user-selector.tsx      # Typeahead user search
│       ├── team-selector.tsx
│       ├── process-selector.tsx
│       ├── date-picker.tsx
│       ├── file-upload.tsx
│       ├── loading-spinner.tsx
│       └── empty-state.tsx
├── lib/
│   ├── db/
│   │   ├── index.ts               # Database connection
│   │   ├── schema.ts              # Drizzle schema
│   │   └── migrations/            # Migration files
│   ├── utils.ts                   # Utility functions
│   ├── validations/
│   │   ├── incident.ts            # Incident validation schemas
│   │   └── common.ts              # Shared validation schemas
│   ├── constants.ts               # App constants
│   └── types.ts                   # TypeScript types
├── hooks/
│   ├── use-user.ts                # Current user context
│   ├── use-incidents.ts           # Incident data hooks
│   └── use-analytics.ts           # Analytics hooks
├── providers/
│   ├── user-provider.tsx          # User context provider
│   └── toast-provider.tsx         # Toast notifications
├── drizzle.config.ts              # Drizzle configuration
├── .env.local                     # Environment variables
└── seed/
    └── seed.ts                    # Seed data script
```

### 1.3 Environment Configuration

**.env.local:**
```env
# Database (Neon Serverless PostgreSQL)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Conduct & Behaviour Log"

# File Upload (if using external service)
UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
```

---

## Phase 2: Database Schema

### 2.1 Core Tables

```typescript
// lib/db/schema.ts

import { pgTable, uuid, varchar, text, timestamp, boolean, integer, pgEnum } from 'drizzle-orm/pg-core';

// Enums
export const incidentStatusEnum = pgEnum('incident_status', ['open', 'in_review', 'closed']);
export const incidentCategoryEnum = pgEnum('incident_category', ['near_miss', 'behavioural_issue', 'process_gap', 'other']);
export const severityEnum = pgEnum('severity', ['low', 'medium', 'high', 'critical']);
export const commentVisibilityEnum = pgEnum('comment_visibility', ['public', 'private']);
export const actionStatusEnum = pgEnum('action_status', ['open', 'done', 'overdue']);
export const userRoleEnum = pgEnum('user_role', ['employee', 'hod', 'risk_office', 'admin']);
export const personRoleEnum = pgEnum('person_role', ['involved', 'witness', 'other']);

// Reference Tables
export const departments = pgTable('departments', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  code: varchar('code', { length: 50 }).unique(),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const teams = pgTable('teams', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  departmentId: uuid('department_id').references(() => departments.id),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  adUserId: varchar('ad_user_id', { length: 255 }), // Mock for MVP
  email: varchar('email', { length: 255 }).notNull().unique(),
  displayName: varchar('display_name', { length: 255 }).notNull(),
  departmentId: uuid('department_id').references(() => departments.id),
  teamId: uuid('team_id').references(() => teams.id),
  role: userRoleEnum('role').default('employee'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const processes = pgTable('processes', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const incidentTypes = pgTable('incident_types', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Core Tables
export const incidents = pgTable('incidents', {
  id: uuid('id').primaryKey().defaultRandom(),
  incidentNumber: varchar('incident_number', { length: 50 }).unique(), // e.g., INC-2025-0001
  reporterId: uuid('reporter_id').references(() => users.id).notNull(),
  reporterAdUserId: varchar('reporter_ad_user_id', { length: 255 }),
  departmentId: uuid('department_id').references(() => departments.id).notNull(),
  teamId: uuid('team_id').references(() => teams.id),
  incidentTypeId: uuid('incident_type_id').references(() => incidentTypes.id),
  occurredAt: timestamp('occurred_at').notNull(),
  reportedAt: timestamp('reported_at').defaultNow().notNull(),
  category: incidentCategoryEnum('category').notNull(),
  severity: severityEnum('severity').default('medium'),
  description: text('description').notNull(),
  privacyFlag: boolean('privacy_flag').default(false),
  currentStatus: incidentStatusEnum('current_status').default('open'),
  hodId: uuid('hod_id').references(() => users.id),
  riskOwnerId: uuid('risk_owner_id').references(() => users.id),
  escalationRequested: boolean('escalation_requested').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Link Tables
export const incidentPersonLinks = pgTable('incident_person_links', {
  id: uuid('id').primaryKey().defaultRandom(),
  incidentId: uuid('incident_id').references(() => incidents.id).notNull(),
  personId: uuid('person_id').references(() => users.id).notNull(),
  role: personRoleEnum('role').default('involved'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const incidentTeamLinks = pgTable('incident_team_links', {
  id: uuid('id').primaryKey().defaultRandom(),
  incidentId: uuid('incident_id').references(() => incidents.id).notNull(),
  teamId: uuid('team_id').references(() => teams.id).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const incidentProcessLinks = pgTable('incident_process_links', {
  id: uuid('id').primaryKey().defaultRandom(),
  incidentId: uuid('incident_id').references(() => incidents.id).notNull(),
  processId: uuid('process_id').references(() => processes.id).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Actions
export const actions = pgTable('actions', {
  id: uuid('id').primaryKey().defaultRandom(),
  incidentId: uuid('incident_id').references(() => incidents.id).notNull(),
  ownerId: uuid('owner_id').references(() => users.id).notNull(),
  title: varchar('title', { length: 500 }).notNull(),
  notes: text('notes'),
  dueDate: timestamp('due_date'),
  status: actionStatusEnum('status').default('open'),
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at'),
});

// Comments
export const comments = pgTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  incidentId: uuid('incident_id').references(() => incidents.id).notNull(),
  authorId: uuid('author_id').references(() => users.id).notNull(),
  parentId: uuid('parent_id'), // For threaded comments
  body: text('body').notNull(),
  visibility: commentVisibilityEnum('visibility').default('public'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Attachments
export const attachments = pgTable('attachments', {
  id: uuid('id').primaryKey().defaultRandom(),
  incidentId: uuid('incident_id').references(() => incidents.id).notNull(),
  filename: varchar('filename', { length: 500 }).notNull(),
  originalFilename: varchar('original_filename', { length: 500 }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  storageUri: varchar('storage_uri', { length: 1000 }).notNull(),
  uploadedBy: uuid('uploaded_by').references(() => users.id).notNull(),
  checksum: varchar('checksum', { length: 64 }),
  createdAt: timestamp('created_at').defaultNow(),
});

// Status History (Audit Trail for Status)
export const statusHistory = pgTable('status_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  incidentId: uuid('incident_id').references(() => incidents.id).notNull(),
  fromStatus: incidentStatusEnum('from_status'),
  toStatus: incidentStatusEnum('to_status').notNull(),
  changedBy: uuid('changed_by').references(() => users.id).notNull(),
  reason: text('reason'),
  changedAt: timestamp('changed_at').defaultNow(),
});

// Tags
export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 100 }).notNull(),
  type: varchar('type', { length: 50 }), // trend, risk, theme
  createdAt: timestamp('created_at').defaultNow(),
});

export const incidentTags = pgTable('incident_tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  incidentId: uuid('incident_id').references(() => incidents.id).notNull(),
  tagId: uuid('tag_id').references(() => tags.id).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Audit Log (Immutable)
export const auditLog = pgTable('audit_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  entityType: varchar('entity_type', { length: 50 }).notNull(), // incident, comment, attachment, etc.
  entityId: uuid('entity_id').notNull(),
  action: varchar('action', { length: 50 }).notNull(), // create, update, delete, view, export
  userId: uuid('user_id').references(() => users.id).notNull(),
  oldValues: text('old_values'), // JSON string
  newValues: text('new_values'), // JSON string
  metadata: text('metadata'), // Additional context (IP, filters for export, etc.)
  createdAt: timestamp('created_at').defaultNow(),
});

// Saved Reports
export const savedReports = pgTable('saved_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  ownerId: uuid('owner_id').references(() => users.id).notNull(),
  config: text('config').notNull(), // JSON pivot configuration
  isShared: boolean('is_shared').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Notification Preferences
export const notificationPreferences = pgTable('notification_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id).notNull().unique(),
  emailOnSubmission: boolean('email_on_submission').default(true),
  emailOnStatusChange: boolean('email_on_status_change').default(true),
  emailOnComment: boolean('email_on_comment').default(true),
  digestFrequency: varchar('digest_frequency', { length: 20 }).default('immediate'), // immediate, daily
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

### 2.2 Database Indexes

```typescript
// Additional indexes for performance
// incidents(dept_id, category, severity, occurred_at, current_status)
// actions(incident_id, owner_id, due_date, status)
// status_history(incident_id, changed_at)
// comments(incident_id, created_at)
```

### 2.3 Analytics Views

```sql
-- vw_incidents (for analytics)
CREATE VIEW vw_incidents AS
SELECT
  i.id,
  i.incident_number,
  i.occurred_at,
  i.reported_at,
  i.category,
  i.severity,
  i.current_status,
  i.privacy_flag,
  d.name as department_name,
  d.id as department_id,
  t.name as team_name,
  t.id as team_id,
  it.name as incident_type_name,
  it.id as incident_type_id,
  u.display_name as reporter_name,
  u.id as reporter_id,
  hod.display_name as hod_name,
  EXTRACT(YEAR FROM i.occurred_at) as year,
  EXTRACT(QUARTER FROM i.occurred_at) as quarter,
  EXTRACT(MONTH FROM i.occurred_at) as month,
  EXTRACT(WEEK FROM i.occurred_at) as week
FROM incidents i
LEFT JOIN departments d ON i.department_id = d.id
LEFT JOIN teams t ON i.team_id = t.id
LEFT JOIN incident_types it ON i.incident_type_id = it.id
LEFT JOIN users u ON i.reporter_id = u.id
LEFT JOIN users hod ON i.hod_id = hod.id;
```

---

## Phase 3: Core UI Components

### 3.1 ShadCN Setup & Configuration

Initialize ShadCN with the following configuration:
- Style: Default
- Base color: Slate
- CSS variables: Yes
- React Server Components: Yes

### 3.2 Component Implementation Order

1. **Layout Components** (Priority: High)
   - `sidebar.tsx` - Navigation sidebar
   - `header.tsx` - Top header with user info
   - `user-nav.tsx` - User dropdown menu
   - Dashboard layout wrapper

2. **Shared Components** (Priority: High)
   - `user-selector.tsx` - Typeahead user search
   - `team-selector.tsx` - Team multi-select
   - `process-selector.tsx` - Process multi-select
   - `date-picker.tsx` - Date/time picker
   - `file-upload.tsx` - Drag-drop file upload
   - `status-badge.tsx` - Status indicator badges

3. **Form Components** (Priority: High)
   - `incident-form.tsx` - Main incident submission form
   - `comment-form.tsx` - Comment submission
   - `status-change-form.tsx` - Status update with reason

4. **List & Detail Components** (Priority: Medium)
   - `incident-list.tsx` - Paginated incident list
   - `incident-card.tsx` - Incident summary card
   - `incident-detail.tsx` - Full incident view
   - `incident-filters.tsx` - Filter controls
   - `comment-thread.tsx` - Threaded comments display

5. **Analytics Components** (Priority: Medium)
   - `pivot-builder.tsx` - Drag-drop pivot configuration
   - `pivot-table.tsx` - Results table with sorting
   - `chart-display.tsx` - Chart visualization
   - `dimension-selector.tsx` - Dimension/measure picker
   - `saved-reports-list.tsx` - Saved report management

### 3.3 Key Component Specifications

**Incident Form Fields:**
```typescript
interface IncidentFormData {
  reporterId: string;
  departmentId: string;
  teamId?: string;
  occurredAt: Date;
  category: 'near_miss' | 'behavioural_issue' | 'process_gap' | 'other';
  incidentTypeId?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  description: string; // 5-2000 chars
  associatedPersonIds?: string[];
  associatedTeamIds?: string[];
  associatedProcessIds?: string[];
  attachments?: File[];
  privacyFlag?: boolean;
}
```

**Pivot Builder Configuration:**
```typescript
interface PivotConfig {
  rows: DimensionConfig[];
  columns: DimensionConfig[];
  values: MeasureConfig[];
  filters: FilterConfig[];
  sortBy?: SortConfig;
  limit?: number;
}

interface DimensionConfig {
  field: string;
  label: string;
  dateBucket?: 'day' | 'week' | 'month' | 'quarter' | 'year';
}

interface MeasureConfig {
  field: string;
  aggregation: 'count' | 'sum' | 'avg' | 'min' | 'max';
  label: string;
}
```

---

## Phase 4: API Routes Implementation

### 4.1 API Structure

| Endpoint | Method | Description | Auth Level |
|----------|--------|-------------|------------|
| `/api/incidents` | GET | List incidents with filters | All |
| `/api/incidents` | POST | Create new incident | All |
| `/api/incidents/[id]` | GET | Get incident details | All |
| `/api/incidents/[id]` | PUT | Update incident | HoD, Risk |
| `/api/incidents/[id]/status` | PUT | Change status | HoD |
| `/api/incidents/[id]/comments` | GET | List comments | All |
| `/api/incidents/[id]/comments` | POST | Add comment | All |
| `/api/incidents/[id]/attachments` | GET | List attachments | All |
| `/api/incidents/[id]/attachments` | POST | Upload attachment | All |
| `/api/users` | GET | Search users | All |
| `/api/departments` | GET | List departments | All |
| `/api/teams` | GET | List teams | All |
| `/api/processes` | GET | List processes | All |
| `/api/incident-types` | GET | List incident types | All |
| `/api/incident-types` | POST | Create incident type | Admin |
| `/api/incident-types/[id]` | PUT | Update incident type | Admin |
| `/api/analytics/pivot` | POST | Execute pivot query | HoD, Risk |
| `/api/analytics/saved-reports` | GET | List saved reports | All |
| `/api/analytics/saved-reports` | POST | Save report | All |
| `/api/audit-log` | GET | View audit entries | Admin, Risk |

### 4.2 Request/Response Examples

**Create Incident:**
```typescript
// POST /api/incidents
// Request
{
  "reporterId": "uuid",
  "departmentId": "uuid",
  "teamId": "uuid",
  "occurredAt": "2025-11-26T10:30:00Z",
  "category": "near_miss",
  "severity": "medium",
  "description": "Description of the incident...",
  "associatedPersonIds": ["uuid1", "uuid2"],
  "associatedProcessIds": ["uuid3"]
}

// Response
{
  "id": "uuid",
  "incidentNumber": "INC-2025-0001",
  "currentStatus": "open",
  "createdAt": "2025-11-26T10:35:00Z"
}
```

**Pivot Query:**
```typescript
// POST /api/analytics/pivot
// Request
{
  "rows": [{ "field": "department_name" }],
  "columns": [{ "field": "category" }],
  "values": [{ "field": "id", "aggregation": "count", "label": "Count" }],
  "filters": [
    { "field": "occurred_at", "operator": "gte", "value": "2025-01-01" }
  ]
}

// Response
{
  "data": [
    { "department_name": "Operations", "near_miss": 5, "behavioural_issue": 2 },
    { "department_name": "IT", "near_miss": 3, "process_gap": 4 }
  ],
  "totals": { "near_miss": 8, "behavioural_issue": 2, "process_gap": 4 },
  "metadata": { "rowCount": 2, "executionTimeMs": 45 }
}
```

### 4.3 Validation Schemas

```typescript
// lib/validations/incident.ts
import { z } from 'zod';

export const createIncidentSchema = z.object({
  reporterId: z.string().uuid(),
  departmentId: z.string().uuid(),
  teamId: z.string().uuid().optional(),
  occurredAt: z.string().datetime().refine(
    (date) => new Date(date) <= new Date(),
    { message: "Date of incident cannot be in the future" }
  ),
  category: z.enum(['near_miss', 'behavioural_issue', 'process_gap', 'other']),
  incidentTypeId: z.string().uuid().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  description: z.string().min(5).max(2000),
  associatedPersonIds: z.array(z.string().uuid()).optional(),
  associatedTeamIds: z.array(z.string().uuid()).optional(),
  associatedProcessIds: z.array(z.string().uuid()).optional(),
  privacyFlag: z.boolean().optional().default(false),
});

export const updateStatusSchema = z.object({
  status: z.enum(['open', 'in_review', 'closed']),
  reason: z.string().min(1).max(500).optional(),
});

export const createCommentSchema = z.object({
  body: z.string().min(1).max(5000),
  visibility: z.enum(['public', 'private']).optional().default('public'),
  parentId: z.string().uuid().optional(),
});
```

---

## Phase 5: Page Implementation

### 5.1 Page Routes & Functionality

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Redirect | Redirect to `/select-user` or `/incidents` |
| `/select-user` | UserSelectPage | MVP user selector (replaces auth) |
| `/incidents` | IncidentListPage | Main incident list with filters |
| `/incidents/new` | NewIncidentPage | Incident submission form |
| `/incidents/[id]` | IncidentDetailPage | View incident with comments |
| `/incidents/[id]/edit` | EditIncidentPage | Edit incident (HoD only) |
| `/analytics` | AnalyticsPage | Pivot builder and charts |
| `/admin` | AdminDashboardPage | Admin overview |
| `/admin/incident-types` | IncidentTypesPage | Manage incident types |
| `/admin/teams` | TeamsPage | Manage teams |
| `/admin/processes` | ProcessesPage | Manage processes |

### 5.2 User Flows

**Flow 1: Submit Incident**
1. User clicks "New Incident" button
2. Form loads with reporter pre-selected (current user)
3. Department auto-populates based on user
4. User fills required fields
5. User optionally adds attachments
6. User submits form
7. System validates, creates incident, generates ID
8. System creates audit log entry
9. System sends notifications to CCO and Risk Office
10. User sees success message with incident link

**Flow 2: Review Incident (HoD)**
1. HoD views incident list filtered to their department
2. HoD clicks on incident to view details
3. HoD adds comment or note
4. HoD changes status to "In Review"
5. System records status change in history
6. HoD investigates and takes actions
7. HoD closes incident with closing comments
8. System records final status change

**Flow 3: Analytics**
1. User navigates to Analytics page
2. User drags dimensions to Rows area
3. User drags dimensions to Columns area
4. User selects measure (e.g., Count)
5. User applies date filter
6. System executes query and displays table
7. User switches to chart view
8. User saves report for future use
9. User exports data to CSV

---

## Phase 6: Analytics Pivot Builder

### 6.1 Available Dimensions

| Dimension | Source | Type |
|-----------|--------|------|
| Department | departments.name | String |
| Team | teams.name | String |
| Category | incidents.category | Enum |
| Incident Type | incident_types.name | String |
| Severity | incidents.severity | Enum |
| Status | incidents.current_status | Enum |
| Reporter | users.display_name | String |
| HoD | users.display_name | String |
| Process | processes.name | String |
| Year | occurred_at | Date |
| Quarter | occurred_at | Date |
| Month | occurred_at | Date |
| Week | occurred_at | Date |

### 6.2 Available Measures

| Measure | Aggregation | Description |
|---------|-------------|-------------|
| Count | COUNT(*) | Number of incidents |
| Avg Days to Close | AVG | Average time from open to close |
| % of Total | Calculated | Percentage within filter |

### 6.3 Chart Types

- Bar Chart (horizontal)
- Column Chart (vertical)
- Line Chart (time series)
- Area Chart (stacked time series)
- Pie Chart (composition)
- Stacked Bar/Column (comparison)

### 6.4 Export Formats

- CSV (pivot table data)
- Excel (XLSX with formatting)
- PNG (chart image)

---

## Phase 7: Security & Permissions

### 7.1 Role-Based Access Control

| Feature | Employee | HoD | Risk Office | Admin |
|---------|----------|-----|-------------|-------|
| Submit incident | ✓ | ✓ | ✓ | ✓ |
| View own incidents | ✓ | ✓ | ✓ | ✓ |
| View dept incidents | - | ✓ | ✓ | ✓ |
| View all incidents | - | - | ✓ | ✓ |
| View private incidents | - | ✓ | ✓ | ✓ |
| Add comments | ✓ | ✓ | ✓ | ✓ |
| Add private comments | - | ✓ | ✓ | - |
| Change status | - | ✓ | - | - |
| Reopen incident | - | ✓ | ✓ | - |
| Access analytics | - | ✓ | ✓ | ✓ |
| Manage incident types | - | - | - | ✓ |
| Manage teams | - | - | - | ✓ |
| View audit log | - | - | ✓ | ✓ |

### 7.2 Row-Level Security (Analytics)

```typescript
function applyRowLevelSecurity(query: Query, user: User): Query {
  if (user.role === 'admin' || user.role === 'risk_office') {
    return query; // Full access
  }

  if (user.role === 'hod') {
    return query.where(
      or(
        eq(incidents.departmentId, user.departmentId),
        eq(incidents.reporterId, user.id)
      )
    );
  }

  // Employee - only own incidents
  return query.where(eq(incidents.reporterId, user.id));
}
```

---

## Phase 8: Audit Trail

### 8.1 Audited Actions

| Action | Entity | Details Logged |
|--------|--------|----------------|
| create | incident | All field values |
| update | incident | Changed fields (old → new) |
| status_change | incident | From/to status, reason |
| create | comment | Body, visibility |
| create | attachment | Filename, size, type |
| delete | attachment | Filename |
| view | incident | User, timestamp |
| export | analytics | Filters, row count |
| create | incident_type | Name, description |
| update | incident_type | Changed fields |
| deactivate | incident_type | Reason |

### 8.2 Audit Log Query API

```typescript
// GET /api/audit-log?entityType=incident&entityId=uuid&from=2025-01-01
interface AuditLogEntry {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  userId: string;
  userName: string;
  oldValues: Record<string, any> | null;
  newValues: Record<string, any> | null;
  metadata: Record<string, any> | null;
  createdAt: string;
}
```

---

## Phase 9: Seed Data (MVP)

### 9.1 Mock Users

```typescript
const mockUsers = [
  { displayName: 'John Smith', email: 'john.smith@example.com', role: 'employee', department: 'Operations' },
  { displayName: 'Sarah Johnson', email: 'sarah.johnson@example.com', role: 'employee', department: 'IT' },
  { displayName: 'Hadley Simons', email: 'hadley.simons@example.com', role: 'hod', department: 'Client Admin' },
  { displayName: 'Michael Brown', email: 'michael.brown@example.com', role: 'risk_office', department: 'Risk' },
  { displayName: 'Admin User', email: 'admin@example.com', role: 'admin', department: 'IT' },
  // Add 10-15 more users across departments
];
```

### 9.2 Reference Data

```typescript
const departments = [
  'Client Admin', 'Operations', 'IT', 'Risk', 'Compliance', 'Finance', 'HR'
];

const teams = [
  { name: 'Client Onboarding', department: 'Client Admin' },
  { name: 'Client Support', department: 'Client Admin' },
  { name: 'Infrastructure', department: 'IT' },
  { name: 'Development', department: 'IT' },
  // etc.
];

const processes = [
  'Client Onboarding', 'KYC Review', 'Account Opening', 'Trade Execution',
  'Settlement', 'Reporting', 'Compliance Check', 'Risk Assessment'
];

const incidentTypes = [
  { name: 'Data Entry Error', description: 'Incorrect data entered into system' },
  { name: 'Process Deviation', description: 'Deviation from standard procedure' },
  { name: 'Communication Failure', description: 'Failure in internal/external communication' },
  { name: 'System Error', description: 'Technical system malfunction' },
  { name: 'Deadline Breach', description: 'Missed deadline or SLA' },
];
```

---

## Implementation Checklist

### Phase 1: Foundation
- [ ] Install all dependencies
- [ ] Create folder structure
- [ ] Set up environment variables
- [ ] Initialize ShadCN
- [ ] Configure Drizzle

### Phase 2: Database
- [ ] Create schema file
- [ ] Run initial migration
- [ ] Create analytics views
- [ ] Set up database connection
- [ ] Create seed script
- [ ] Run seed data

### Phase 3: UI Components
- [ ] Layout components (sidebar, header)
- [ ] Form components (incident form, comment form)
- [ ] Selector components (user, team, process)
- [ ] List components (incident list, filters)
- [ ] Detail components (incident detail, comments)

### Phase 4: API Routes
- [ ] Incidents CRUD
- [ ] Comments CRUD
- [ ] Attachments upload
- [ ] Status changes
- [ ] Reference data endpoints
- [ ] Analytics pivot endpoint
- [ ] Audit log endpoint

### Phase 5: Pages
- [ ] User selector page
- [ ] Dashboard layout
- [ ] Incident list page
- [ ] New incident page
- [ ] Incident detail page
- [ ] Admin pages

### Phase 6: Analytics
- [ ] Pivot builder UI
- [ ] Pivot query execution
- [ ] Chart rendering
- [ ] Export functionality
- [ ] Saved reports

### Phase 7: Polish
- [ ] Error handling
- [ ] Loading states
- [ ] Toast notifications
- [ ] Form validation UX
- [ ] Responsive design
- [ ] Testing

---

## Acceptance Criteria Mapping

| AC# | Description | Implementation |
|-----|-------------|----------------|
| 1 | Users can submit incidents | NewIncidentPage + POST /api/incidents |
| 2 | Auto-routing within 1 min | On-submit notification logic |
| 3 | HoD can comment/change status | IncidentDetailPage + status API |
| 4 | Risk Office can add notes | Comment with private visibility |
| 5 | Pivot builder with Dept/Category/Count | AnalyticsPage + pivot API |
| 6 | Switch pivot to chart, export PNG | ChartDisplay component |
| 7 | Row-level security on privacy flag | applyRowLevelSecurity function |
| 8 | All changes in audit log | auditLog table + logging middleware |
| 9 | Admin can manage Incident Types | AdminIncidentTypesPage + CRUD API |

---

## Risk & Considerations

1. **File Storage**: For MVP, consider local storage or Neon's blob storage. Production should use S3 or similar.

2. **Notifications**: MVP can skip email notifications or use console logging. Production needs email service integration.

3. **Performance**: Analytics queries on large datasets may need:
   - Materialized views
   - Query caching
   - Pagination
   - Background job processing

4. **Security**: MVP skips authentication but should still:
   - Validate all inputs
   - Sanitize outputs
   - Log all actions
   - Implement CSRF protection

5. **Browser Support**: Target modern browsers (Chrome, Firefox, Edge, Safari latest 2 versions).
