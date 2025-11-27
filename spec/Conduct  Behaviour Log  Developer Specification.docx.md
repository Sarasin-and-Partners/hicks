# Conduct & Behaviour Log – Developer Specification (Draft)

**Owner:** Matthew Hicks (Sarasin)  
**Version:** 0.1 (Draft)  
**Date:** 21 Nov 2025

## 1\. Purpose & Overview

**Objective**  
Provide a structured workflow for recording, reviewing, and learning from conduct/behaviour “near misses” and related incidents. The system ensures consistent capture, assignment to people/teams/processes, and oversight by Heads of Department (HoD) and the Risk Office.

**Users & Stakeholders**  
All employees – report incidents / near misses (Currently only limited to Client Admin)  
Heads of Department – review, comment, action, close. (Currently only limited to Hadley Simons)  
Risk Office – note, monitor trends.  
 

**Expected Outcomes**  
Centralised, searchable register of incidents and near misses.  
Clear ownership, actions, and audit trail.  
Pivot-like analytics to identify patterns by person, team, process, category, severity, time period.  
Evidence of control effectiveness and continuous improvement.

## 2\. Scope & Initial Workflow

**Scope**   
Incident submission by targeted pilot users (technically open to all employees).  
Routing to HoD for review and to Risk Office for noting.  
Status tracking (Open → In Review → Closed).  
Basic dashboards & self-serve analytics (pivot-style tables & charts).  
Audit trail of all edits, transitions, comments, and notifications.

**High-Level Workflow**  
1\) **Employee submits form** (incident details, category, associations).  
2\) **System routes** to HoD (review) and Risk Office (noting).  
3\) **HoD review**: add comments, change status.  
4\) **Risk Office**: add notes  
5\) **Closure**: HoD (or designated reviewer).  
6\) **Reporting**: Incident available in analytics and dashboards.

## 3\. Functional Requirements

### 3.1 Incident Submission Form

**Fields (minimum viable):**  
*Incident ID* (system-generated, immutable).  
*Reported by* (searchable directory field; typeahead from **Active Directory**; stores directory user ID).  
*Department / Team* (Department auto-populated from **Active Directory** when *Reported by* is selected; Team remains selectable with suggestions filtered by department).  
*Date of incident* (date/time).  
*Date reported* (auto, UTC \+ user’s TZ).  
*Category* (Near Miss, Behavioural Issue, Process Gap, Other).  
*Description* (free text, 5–2000 chars).  
*Associated person(s)* (searchable user picklist; optional).  
*Associated team(s)* (multi-select).  
*Associated process(es)* (searchable picklist; multi-select from current K2 form)  
*Attachments* (docs/images; size & type constraints).

**Directory-driven behaviour:**  
Selecting **Reported by** via AD lookup **auto-populates Department**; if a mismatch exists, show an info banner and allow privileged override (HoD/Risk only).  
Store AD identifiers (e.g., ad\_user\_id, ad\_department\_id) for traceability.  
Fall back to SSO identity for the current user if the reporter leaves *Reported by* blank (permission-dependent).

**Validation:**  
Required: Date of incident, Category, Description, Department/Team.  
**Reported by** must resolve to a valid Active Directory user; persist the directory user ID.  
Department must match AD mapping for the selected user unless a privileged override reason is captured.  
Date of incident cannot be in future  
Description length and prohibited content scan (no secrets/credentials).  
Attachments: virus scan, max size per file (e.g., 20MB), allowed types (PDF, DOCX, PNG, JPG,XLS).

**Submission Behaviour:**  
On submit, status \= **Open**.  
Notifications sent to CCO and to Risk Office inbox.  
Reporter receives confirmation & link to view entry.

### 3.2 Review & Actions

* **HoD capabilities:** add comments, edit category, change status to *In Review* / *Closed*.

* **Risk Office capabilities:** add notes

* **Commenting:** threaded comments with @mentions, timestamps, and visibility rules (private to HoD/Risk vs. general).

* **Attachments:** reviewers can add further evidence/attachments subject to same validation.

### 3.3 Status Model

* **Open** → **In Review** → **Closed**.

* **Reopen** allowed by HoD or Risk Office (requires reason).

### 3.4 Notifications

* Email notifications on: submission, status change

* User preferences for frequency (immediate, daily digest).

### 3.5 Search & List Views

* Filter by status, category, severity, department/team, process, date ranges, reporter

## 4\. Data Model (Relational)

**Tables (core):**  
\- **incidents**: id, reporter\_id, reporter\_ad\_user\_id, dept\_id, occurred\_at, reported\_at, category, severity, description, privacy\_flag, current\_status, hod\_id, risk\_owner\_id, escalation\_requested (bool), created\_at, updated\_at.  
\- **incident\_person\_links**: incident\_id, person\_id, role (e.g., involved, witness).  
\- **incident\_team\_links**: incident\_id, team\_id.  
\- **incident\_process\_links**: incident\_id, process\_id.  
\- **actions**: id, incident\_id, owner\_id, title, notes, due\_date, status (open/done/overdue), created\_at, completed\_at.  
\- **comments**: id, incident\_id, author\_id, body, visibility (public/private), created\_at.  
\- **attachments**: id, incident\_id, filename, mime\_type, size\_bytes, storage\_uri, uploaded\_by, created\_at, checksum.  
\- **status\_history**: id, incident\_id, from\_status, to\_status, changed\_by, reason, changed\_at.  
\- **tags**: id, name, type (trend/risk/theme); **incident\_tags**: incident\_id, tag\_id.  
\- reference: teams, processes, departments, users (synced from Active Directory, incl. ad\_user\_id, email, display\_name, dept\_id).

**Indexes & Keys:**  
\- incidents(dept\_id, category, severity, occurred\_at, current\_status).  
\- actions(incident\_id, owner\_id, due\_date, status).  
\- status\_history(incident\_id, changed\_at).  
\- comments(incident\_id, created\_at).  
\- FKs with cascading deletes prohibited (use soft delete flags where needed).

## 

## 5\. Reporting & Analytics (Pivot-Style Builder)

**Goal:** Allow users (HoD, Risk Office, authorised staff) to build **tables and charts using pivot-like functionality** directly from the database, without requiring IT.

**Functional Requirements:**  
\- **Data Source:** read-only analytics views (e.g., vw\_incidents, vw\_actions, vw\_status\_transitions) optimised for aggregation.  
\- **Dimensions (examples):** Category, **Incident Type**, Severity, Department, Team, Process, HoD, Reporter, Current Status, Month/Quarter/Year of Occurrence.  
\- **Pivot Builder UI:** drag-and-drop **Rows**, **Columns**, **Values**, **Filters**; supports grouping, sorting, and top-N.  
\- **Charts:** bar, column, line, area, pie, stacked; one-click switch from table to chart.  
\- **Calculated Fields:** simple formulas (e.g., % of total, rolling 3-month count).  
\- **Date Buckets:** auto bucketing (day/week/month/quarter/year) with rolling windows (e.g., last 90 days).  
\- **Saved Reports:** users can save, share  
\- **Export:** CSV/Excel export for pivot tables  
\- **Performance:** results for typical pivots (\< 100k rows) in \< 3s at P50; cache recent queries.

**Security & Privacy in Analytics:**  
\- Row-level security: users only see incidents they are entitled to (by dept/team/role/privacy flag).  
\- All exports logged with user, timestamp, and filter context.

## 6\. Non-Functional Requirements

* **Authentication & SSO:** SAML/OIDC with MFA; auto-provision roles from IAM groups (Employee, HoD, Risk).

* **Authorisation (RBAC):** granular permissions by role; privacy-flagged records restricted to HoD & Risk.

* **Availability:** 99.9% during business hours; maintenance window out of hours.

* **Performance:** P95 page load \< 2s; API P95 \< 500ms for non-analytics endpoints.

* **Scalability:** start with single-tenant DB; plan for partitioning by department/date for growth.

* **Observability:** structured logs, metrics, traces; error budgets; alerting on failure rates  use Open Telemetry.

* **Data Retention:** retain incidents and audit logs for 7 years (configurable).

## 7\. Security, Compliance & Audit

* **Encryption:** TLS in transit; AES-256 at rest.

* **Audit Trail:** immutable event log of submissions, edits, status changes, views, exports.

* **GDPR:** lawful basis (legitimate interests), data minimisation, DSAR & deletion workflows, privacy notices.

* **Regulatory Alignment:** supports evidencing conduct risk management and near-miss learning.

## 8\. Acceptance Criteria (Phase 1\)

1. Users in pilot group can submit incidents with required fields; entries visible in list and detail views.

2. Automatic routing to HoD and Risk Office occurs within 1 minute; notifications delivered.

3. HoD can add comments and change status through all states.

4. Risk Office can add notes

5. Pivot builder allows users to create a table with **Rows:** Department, **Columns:** Category, **Values:** Count of Incidents; save view and export CSV.

6. Users can switch the above pivot to a chart and export PNG.

7. Row-level security prevents non-authorised users from viewing privacy-flagged incidents.

8. All state changes and exports appear in the audit log with user, timestamp, and context.

9. **Admin user can create, edit, and deactivate Incident Types via UI without developer involvement; changes take effect immediately and are audited.**

## 9\. Implementation Notes

* **Tech Preferences (suggested):**

  * Backend: RESTful API (NextJS) \+ relational DB (PostgreSQL) \+ Drizzle ORM.

  * Frontend: NextJS with component-based form and analytics UI using tailwind and ShadCN.

  * Analytics: materialised views \+ caching layer; consider embedded pivot library or build-in-house.

* **Directory Integration:**

  * Use Microsoft Graph/LDAP to query **Active Directory/Azure AD** for typeahead on *Reported by*.

  * Cache recent queries; respect directory rate limits; fall back gracefully if AD unavailable.

  * Nightly sync of reference users/departments; on-submit verify user against live directory.

* **Environments:** Dev / UAT / Prod; feature flags for pilot rollout.

* **Migration:** initial seed of reference data (departments, teams, processes, users).

10. ## MVP Implementation Notes

* No authentication provide a user selector to MVP

* No LDAP/AD Integration provide mock data

* Neon Serverless Postgress DB


  