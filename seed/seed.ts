import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import * as schema from '../lib/db/schema';
import {
  seedDepartments,
  seedTeams,
  seedUsers,
  seedProcesses,
  seedIncidentTypes,
  seedTags,
  seedIncidents,
} from './data';
import { existsSync, mkdirSync } from 'fs';
import { dirname } from 'path';

const dbPath = process.env.DATABASE_PATH || './data/conduct-log.db';

// Ensure the directory exists
const dbDir = dirname(dbPath);
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

const sqlite = new Database(dbPath);
sqlite.pragma('foreign_keys = ON');
const db = drizzle(sqlite, { schema });

function toISOString(date: Date): string {
  return date.toISOString();
}

async function seed() {
  console.log('🌱 Starting seed process...\n');

  try {
    // Clear existing data (in reverse order of dependencies)
    console.log('🗑️  Clearing existing data...');
    db.delete(schema.incidentTags).run();
    db.delete(schema.incidentProcessLinks).run();
    db.delete(schema.incidentTeamLinks).run();
    db.delete(schema.incidentPersonLinks).run();
    db.delete(schema.statusHistory).run();
    db.delete(schema.attachments).run();
    db.delete(schema.comments).run();
    db.delete(schema.actions).run();
    db.delete(schema.auditLog).run();
    db.delete(schema.savedReports).run();
    db.delete(schema.notificationPreferences).run();
    db.delete(schema.incidents).run();
    db.delete(schema.tags).run();
    db.delete(schema.incidentTypes).run();
    db.delete(schema.processes).run();
    db.delete(schema.users).run();
    db.delete(schema.teams).run();
    db.delete(schema.departments).run();

    const now = new Date();

    // Insert departments
    console.log('📁 Inserting departments...');
    const departmentIds: Record<string, string> = {};
    for (const dept of seedDepartments) {
      const id = uuidv4();
      departmentIds[dept.code] = id;
      db.insert(schema.departments).values({
        id,
        name: dept.name,
        code: dept.code,
        isActive: true,
        createdAt: toISOString(now),
        updatedAt: toISOString(now),
      }).run();
    }
    console.log(`   ✓ ${seedDepartments.length} departments created`);

    // Insert teams
    console.log('👥 Inserting teams...');
    const teamIds: Record<string, string> = {};
    for (const team of seedTeams) {
      const id = uuidv4();
      teamIds[team.name] = id;
      db.insert(schema.teams).values({
        id,
        name: team.name,
        departmentId: departmentIds[team.departmentCode],
        isActive: true,
        createdAt: toISOString(now),
        updatedAt: toISOString(now),
      }).run();
    }
    console.log(`   ✓ ${seedTeams.length} teams created`);

    // Insert users
    console.log('👤 Inserting users...');
    const userIds: Record<string, string> = {};
    for (const user of seedUsers) {
      const id = uuidv4();
      userIds[user.email] = id;
      db.insert(schema.users).values({
        id,
        email: user.email,
        displayName: user.displayName,
        departmentId: departmentIds[user.departmentCode],
        teamId: teamIds[user.teamName],
        role: user.role,
        adUserId: `AD_${user.email.split('@')[0].toUpperCase()}`,
        isActive: true,
        createdAt: toISOString(now),
        updatedAt: toISOString(now),
      }).run();
    }
    console.log(`   ✓ ${seedUsers.length} users created`);

    // Insert processes
    console.log('⚙️  Inserting processes...');
    const processIds: Record<string, string> = {};
    for (const process of seedProcesses) {
      const id = uuidv4();
      processIds[process.name] = id;
      db.insert(schema.processes).values({
        id,
        name: process.name,
        description: process.description,
        isActive: true,
        createdAt: toISOString(now),
        updatedAt: toISOString(now),
      }).run();
    }
    console.log(`   ✓ ${seedProcesses.length} processes created`);

    // Insert incident types
    console.log('📋 Inserting incident types...');
    const incidentTypeIds: Record<string, string> = {};
    for (const type of seedIncidentTypes) {
      const id = uuidv4();
      incidentTypeIds[type.name] = id;
      db.insert(schema.incidentTypes).values({
        id,
        name: type.name,
        description: type.description,
        isActive: true,
        createdAt: toISOString(now),
        updatedAt: toISOString(now),
      }).run();
    }
    console.log(`   ✓ ${seedIncidentTypes.length} incident types created`);

    // Insert tags
    console.log('🏷️  Inserting tags...');
    const tagIds: Record<string, string> = {};
    for (const tag of seedTags) {
      const id = uuidv4();
      tagIds[tag.name] = id;
      db.insert(schema.tags).values({
        id,
        name: tag.name,
        type: tag.type,
        createdAt: toISOString(now),
      }).run();
    }
    console.log(`   ✓ ${seedTags.length} tags created`);

    // Insert sample incidents
    console.log('🚨 Inserting sample incidents...');
    let incidentCounter = 1;
    for (const incident of seedIncidents) {
      const id = uuidv4();
      const incidentNumber = `INC-2025-${String(incidentCounter).padStart(4, '0')}`;
      const occurredAt = new Date();
      occurredAt.setDate(occurredAt.getDate() - incident.occurredDaysAgo);
      const reportedAt = new Date(occurredAt.getTime() + 24 * 60 * 60 * 1000);

      db.insert(schema.incidents).values({
        id,
        incidentNumber,
        reporterId: userIds[incident.reporterEmail],
        departmentId: departmentIds[incident.departmentCode],
        teamId: teamIds[incident.teamName],
        incidentTypeId: incidentTypeIds[incident.incidentTypeName],
        category: incident.category,
        severity: incident.severity,
        description: incident.description,
        currentStatus: incident.status,
        occurredAt: toISOString(occurredAt),
        reportedAt: toISOString(reportedAt),
        privacyFlag: false,
        escalationRequested: false,
        createdAt: toISOString(now),
        updatedAt: toISOString(now),
      }).run();

      // Add initial status to history
      db.insert(schema.statusHistory).values({
        id: uuidv4(),
        incidentId: id,
        fromStatus: null,
        toStatus: 'open',
        changedBy: userIds[incident.reporterEmail],
        reason: 'Incident created',
        changedAt: toISOString(reportedAt),
      }).run();

      // If status is not open, add status change history
      if (incident.status !== 'open') {
        db.insert(schema.statusHistory).values({
          id: uuidv4(),
          incidentId: id,
          fromStatus: 'open',
          toStatus: incident.status,
          changedBy: userIds['victoria.ashworth@sarasin.com'],
          reason: incident.status === 'in_review' ? 'Under investigation' : 'Investigation complete, remediation actions taken',
          changedAt: toISOString(now),
        }).run();
      }

      incidentCounter++;
    }
    console.log(`   ✓ ${seedIncidents.length} incidents created`);

    // Create notification preferences for all users
    console.log('🔔 Creating notification preferences...');
    for (const email of Object.keys(userIds)) {
      db.insert(schema.notificationPreferences).values({
        id: uuidv4(),
        userId: userIds[email],
        emailOnSubmission: true,
        emailOnStatusChange: true,
        emailOnComment: true,
        digestFrequency: 'immediate',
        createdAt: toISOString(now),
        updatedAt: toISOString(now),
      }).run();
    }
    console.log(`   ✓ Notification preferences created for all users`);

    console.log('\n✅ Seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • ${seedDepartments.length} departments`);
    console.log(`   • ${seedTeams.length} teams`);
    console.log(`   • ${seedUsers.length} users`);
    console.log(`   • ${seedProcesses.length} processes`);
    console.log(`   • ${seedIncidentTypes.length} incident types`);
    console.log(`   • ${seedTags.length} tags`);
    console.log(`   • ${seedIncidents.length} sample incidents`);

  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    sqlite.close();
  }
}

seed().catch(console.error);
