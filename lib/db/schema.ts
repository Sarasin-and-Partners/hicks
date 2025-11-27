import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// Helper for default timestamp (SQLite stores as text)
const timestamp = (name: string) => text(name);

// Reference Tables
export const departments = sqliteTable('departments', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code').unique(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
});

export const teams = sqliteTable('teams', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  departmentId: text('department_id').references(() => departments.id),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
}, (table) => [
  index('teams_department_idx').on(table.departmentId),
]);

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  adUserId: text('ad_user_id'),
  email: text('email').notNull().unique(),
  displayName: text('display_name').notNull(),
  departmentId: text('department_id').references(() => departments.id),
  teamId: text('team_id').references(() => teams.id),
  role: text('role', { enum: ['employee', 'hod', 'risk_office', 'admin'] }).default('employee').notNull(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
}, (table) => [
  index('users_department_idx').on(table.departmentId),
  index('users_team_idx').on(table.teamId),
  index('users_email_idx').on(table.email),
]);

export const processes = sqliteTable('processes', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
});

export const incidentTypes = sqliteTable('incident_types', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
});

// Core Tables
export const incidents = sqliteTable('incidents', {
  id: text('id').primaryKey(),
  incidentNumber: text('incident_number').unique(),
  reporterId: text('reporter_id').references(() => users.id).notNull(),
  reporterAdUserId: text('reporter_ad_user_id'),
  departmentId: text('department_id').references(() => departments.id).notNull(),
  teamId: text('team_id').references(() => teams.id),
  incidentTypeId: text('incident_type_id').references(() => incidentTypes.id),
  occurredAt: timestamp('occurred_at').notNull(),
  reportedAt: timestamp('reported_at').notNull(),
  category: text('category', { enum: ['near_miss', 'behavioural_issue', 'process_gap', 'other'] }).notNull(),
  severity: text('severity', { enum: ['low', 'medium', 'high', 'critical'] }).default('medium').notNull(),
  description: text('description').notNull(),
  privacyFlag: integer('privacy_flag', { mode: 'boolean' }).default(false).notNull(),
  currentStatus: text('current_status', { enum: ['open', 'in_review', 'closed'] }).default('open').notNull(),
  hodId: text('hod_id').references(() => users.id),
  riskOwnerId: text('risk_owner_id').references(() => users.id),
  escalationRequested: integer('escalation_requested', { mode: 'boolean' }).default(false).notNull(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
}, (table) => [
  index('incidents_reporter_idx').on(table.reporterId),
  index('incidents_department_idx').on(table.departmentId),
  index('incidents_status_idx').on(table.currentStatus),
  index('incidents_category_idx').on(table.category),
  index('incidents_severity_idx').on(table.severity),
  index('incidents_occurred_at_idx').on(table.occurredAt),
]);

// Link Tables
export const incidentPersonLinks = sqliteTable('incident_person_links', {
  id: text('id').primaryKey(),
  incidentId: text('incident_id').references(() => incidents.id, { onDelete: 'cascade' }).notNull(),
  personId: text('person_id').references(() => users.id).notNull(),
  role: text('role', { enum: ['involved', 'witness', 'other'] }).default('involved').notNull(),
  createdAt: timestamp('created_at').notNull(),
}, (table) => [
  index('incident_person_links_incident_idx').on(table.incidentId),
  index('incident_person_links_person_idx').on(table.personId),
]);

export const incidentTeamLinks = sqliteTable('incident_team_links', {
  id: text('id').primaryKey(),
  incidentId: text('incident_id').references(() => incidents.id, { onDelete: 'cascade' }).notNull(),
  teamId: text('team_id').references(() => teams.id).notNull(),
  createdAt: timestamp('created_at').notNull(),
}, (table) => [
  index('incident_team_links_incident_idx').on(table.incidentId),
  index('incident_team_links_team_idx').on(table.teamId),
]);

export const incidentProcessLinks = sqliteTable('incident_process_links', {
  id: text('id').primaryKey(),
  incidentId: text('incident_id').references(() => incidents.id, { onDelete: 'cascade' }).notNull(),
  processId: text('process_id').references(() => processes.id).notNull(),
  createdAt: timestamp('created_at').notNull(),
}, (table) => [
  index('incident_process_links_incident_idx').on(table.incidentId),
  index('incident_process_links_process_idx').on(table.processId),
]);

// Actions
export const actions = sqliteTable('actions', {
  id: text('id').primaryKey(),
  incidentId: text('incident_id').references(() => incidents.id, { onDelete: 'cascade' }).notNull(),
  ownerId: text('owner_id').references(() => users.id).notNull(),
  title: text('title').notNull(),
  notes: text('notes'),
  dueDate: timestamp('due_date'),
  status: text('status', { enum: ['open', 'done', 'overdue'] }).default('open').notNull(),
  createdAt: timestamp('created_at').notNull(),
  completedAt: timestamp('completed_at'),
}, (table) => [
  index('actions_incident_idx').on(table.incidentId),
  index('actions_owner_idx').on(table.ownerId),
  index('actions_status_idx').on(table.status),
]);

// Comments
export const comments = sqliteTable('comments', {
  id: text('id').primaryKey(),
  incidentId: text('incident_id').references(() => incidents.id, { onDelete: 'cascade' }).notNull(),
  authorId: text('author_id').references(() => users.id).notNull(),
  parentId: text('parent_id'),
  body: text('body').notNull(),
  visibility: text('visibility', { enum: ['public', 'private'] }).default('public').notNull(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
}, (table) => [
  index('comments_incident_idx').on(table.incidentId),
  index('comments_author_idx').on(table.authorId),
]);

// Attachments
export const attachments = sqliteTable('attachments', {
  id: text('id').primaryKey(),
  incidentId: text('incident_id').references(() => incidents.id, { onDelete: 'cascade' }).notNull(),
  filename: text('filename').notNull(),
  originalFilename: text('original_filename').notNull(),
  mimeType: text('mime_type').notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  storageUri: text('storage_uri').notNull(),
  uploadedBy: text('uploaded_by').references(() => users.id).notNull(),
  checksum: text('checksum'),
  createdAt: timestamp('created_at').notNull(),
}, (table) => [
  index('attachments_incident_idx').on(table.incidentId),
]);

// Status History
export const statusHistory = sqliteTable('status_history', {
  id: text('id').primaryKey(),
  incidentId: text('incident_id').references(() => incidents.id, { onDelete: 'cascade' }).notNull(),
  fromStatus: text('from_status', { enum: ['open', 'in_review', 'closed'] }),
  toStatus: text('to_status', { enum: ['open', 'in_review', 'closed'] }).notNull(),
  changedBy: text('changed_by').references(() => users.id).notNull(),
  reason: text('reason'),
  changedAt: timestamp('changed_at').notNull(),
}, (table) => [
  index('status_history_incident_idx').on(table.incidentId),
]);

// Tags
export const tags = sqliteTable('tags', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type'),
  createdAt: timestamp('created_at').notNull(),
});

export const incidentTags = sqliteTable('incident_tags', {
  id: text('id').primaryKey(),
  incidentId: text('incident_id').references(() => incidents.id, { onDelete: 'cascade' }).notNull(),
  tagId: text('tag_id').references(() => tags.id).notNull(),
  createdAt: timestamp('created_at').notNull(),
}, (table) => [
  index('incident_tags_incident_idx').on(table.incidentId),
  index('incident_tags_tag_idx').on(table.tagId),
]);

// Audit Log
export const auditLog = sqliteTable('audit_log', {
  id: text('id').primaryKey(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  action: text('action').notNull(),
  userId: text('user_id').references(() => users.id).notNull(),
  oldValues: text('old_values'),
  newValues: text('new_values'),
  metadata: text('metadata'),
  createdAt: timestamp('created_at').notNull(),
}, (table) => [
  index('audit_log_entity_idx').on(table.entityType, table.entityId),
  index('audit_log_user_idx').on(table.userId),
]);

// Saved Reports
export const savedReports = sqliteTable('saved_reports', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  ownerId: text('owner_id').references(() => users.id).notNull(),
  config: text('config').notNull(),
  isShared: integer('is_shared', { mode: 'boolean' }).default(false).notNull(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
}, (table) => [
  index('saved_reports_owner_idx').on(table.ownerId),
]);

// Notification Preferences
export const notificationPreferences = sqliteTable('notification_preferences', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id).notNull().unique(),
  emailOnSubmission: integer('email_on_submission', { mode: 'boolean' }).default(true).notNull(),
  emailOnStatusChange: integer('email_on_status_change', { mode: 'boolean' }).default(true).notNull(),
  emailOnComment: integer('email_on_comment', { mode: 'boolean' }).default(true).notNull(),
  digestFrequency: text('digest_frequency').default('immediate').notNull(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
});

// Relations
export const departmentsRelations = relations(departments, ({ many }) => ({
  teams: many(teams),
  users: many(users),
  incidents: many(incidents),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  department: one(departments, {
    fields: [teams.departmentId],
    references: [departments.id],
  }),
  users: many(users),
  incidentTeamLinks: many(incidentTeamLinks),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  department: one(departments, {
    fields: [users.departmentId],
    references: [departments.id],
  }),
  team: one(teams, {
    fields: [users.teamId],
    references: [teams.id],
  }),
  reportedIncidents: many(incidents, { relationName: 'reporter' }),
  comments: many(comments),
  actions: many(actions),
}));

export const processesRelations = relations(processes, ({ many }) => ({
  incidentProcessLinks: many(incidentProcessLinks),
}));

export const incidentTypesRelations = relations(incidentTypes, ({ many }) => ({
  incidents: many(incidents),
}));

export const incidentsRelations = relations(incidents, ({ one, many }) => ({
  reporter: one(users, {
    fields: [incidents.reporterId],
    references: [users.id],
    relationName: 'reporter',
  }),
  department: one(departments, {
    fields: [incidents.departmentId],
    references: [departments.id],
  }),
  team: one(teams, {
    fields: [incidents.teamId],
    references: [teams.id],
  }),
  incidentType: one(incidentTypes, {
    fields: [incidents.incidentTypeId],
    references: [incidentTypes.id],
  }),
  hod: one(users, {
    fields: [incidents.hodId],
    references: [users.id],
  }),
  riskOwner: one(users, {
    fields: [incidents.riskOwnerId],
    references: [users.id],
  }),
  personLinks: many(incidentPersonLinks),
  teamLinks: many(incidentTeamLinks),
  processLinks: many(incidentProcessLinks),
  comments: many(comments),
  attachments: many(attachments),
  statusHistory: many(statusHistory),
  actions: many(actions),
  incidentTags: many(incidentTags),
}));

export const incidentPersonLinksRelations = relations(incidentPersonLinks, ({ one }) => ({
  incident: one(incidents, {
    fields: [incidentPersonLinks.incidentId],
    references: [incidents.id],
  }),
  person: one(users, {
    fields: [incidentPersonLinks.personId],
    references: [users.id],
  }),
}));

export const incidentTeamLinksRelations = relations(incidentTeamLinks, ({ one }) => ({
  incident: one(incidents, {
    fields: [incidentTeamLinks.incidentId],
    references: [incidents.id],
  }),
  team: one(teams, {
    fields: [incidentTeamLinks.teamId],
    references: [teams.id],
  }),
}));

export const incidentProcessLinksRelations = relations(incidentProcessLinks, ({ one }) => ({
  incident: one(incidents, {
    fields: [incidentProcessLinks.incidentId],
    references: [incidents.id],
  }),
  process: one(processes, {
    fields: [incidentProcessLinks.processId],
    references: [processes.id],
  }),
}));

export const actionsRelations = relations(actions, ({ one }) => ({
  incident: one(incidents, {
    fields: [actions.incidentId],
    references: [incidents.id],
  }),
  owner: one(users, {
    fields: [actions.ownerId],
    references: [users.id],
  }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  incident: one(incidents, {
    fields: [comments.incidentId],
    references: [incidents.id],
  }),
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
}));

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  incident: one(incidents, {
    fields: [attachments.incidentId],
    references: [incidents.id],
  }),
  uploader: one(users, {
    fields: [attachments.uploadedBy],
    references: [users.id],
  }),
}));

export const statusHistoryRelations = relations(statusHistory, ({ one }) => ({
  incident: one(incidents, {
    fields: [statusHistory.incidentId],
    references: [incidents.id],
  }),
  changer: one(users, {
    fields: [statusHistory.changedBy],
    references: [users.id],
  }),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  incidentTags: many(incidentTags),
}));

export const incidentTagsRelations = relations(incidentTags, ({ one }) => ({
  incident: one(incidents, {
    fields: [incidentTags.incidentId],
    references: [incidents.id],
  }),
  tag: one(tags, {
    fields: [incidentTags.tagId],
    references: [tags.id],
  }),
}));

export const savedReportsRelations = relations(savedReports, ({ one }) => ({
  owner: one(users, {
    fields: [savedReports.ownerId],
    references: [users.id],
  }),
}));

export const notificationPreferencesRelations = relations(notificationPreferences, ({ one }) => ({
  user: one(users, {
    fields: [notificationPreferences.userId],
    references: [users.id],
  }),
}));
