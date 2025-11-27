// Seed data for MVP - Mock Active Directory data

export const seedDepartments = [
  { name: 'Client Admin', code: 'CA' },
  { name: 'Operations', code: 'OPS' },
  { name: 'IT', code: 'IT' },
  { name: 'Risk', code: 'RISK' },
  { name: 'Compliance', code: 'COMP' },
  { name: 'Finance', code: 'FIN' },
  { name: 'HR', code: 'HR' },
];

export const seedTeams = [
  { name: 'Client Onboarding', departmentCode: 'CA' },
  { name: 'Client Support', departmentCode: 'CA' },
  { name: 'Account Management', departmentCode: 'CA' },
  { name: 'Trade Operations', departmentCode: 'OPS' },
  { name: 'Settlement', departmentCode: 'OPS' },
  { name: 'Reconciliation', departmentCode: 'OPS' },
  { name: 'Infrastructure', departmentCode: 'IT' },
  { name: 'Development', departmentCode: 'IT' },
  { name: 'Support', departmentCode: 'IT' },
  { name: 'Risk Analysis', departmentCode: 'RISK' },
  { name: 'Risk Monitoring', departmentCode: 'RISK' },
  { name: 'Regulatory Compliance', departmentCode: 'COMP' },
  { name: 'AML/KYC', departmentCode: 'COMP' },
  { name: 'Financial Reporting', departmentCode: 'FIN' },
  { name: 'Treasury', departmentCode: 'FIN' },
  { name: 'Recruitment', departmentCode: 'HR' },
  { name: 'Employee Relations', departmentCode: 'HR' },
];

export const seedUsers = [
  // Client Admin Department
  { displayName: 'Victoria Ashworth', email: 'victoria.ashworth@sarasin.com', departmentCode: 'CA', teamName: 'Client Onboarding', role: 'hod' as const },
  { displayName: 'Emma Thompson', email: 'emma.thompson@sarasin.com', departmentCode: 'CA', teamName: 'Client Onboarding', role: 'employee' as const },
  { displayName: 'James Wilson', email: 'james.wilson@sarasin.com', departmentCode: 'CA', teamName: 'Client Support', role: 'employee' as const },
  { displayName: 'Sophie Brown', email: 'sophie.brown@sarasin.com', departmentCode: 'CA', teamName: 'Account Management', role: 'employee' as const },

  // Operations Department
  { displayName: 'Robert Chen', email: 'robert.chen@sarasin.com', departmentCode: 'OPS', teamName: 'Trade Operations', role: 'hod' as const },
  { displayName: 'Maria Garcia', email: 'maria.garcia@sarasin.com', departmentCode: 'OPS', teamName: 'Trade Operations', role: 'employee' as const },
  { displayName: 'David Kim', email: 'david.kim@sarasin.com', departmentCode: 'OPS', teamName: 'Settlement', role: 'employee' as const },
  { displayName: 'Lisa Anderson', email: 'lisa.anderson@sarasin.com', departmentCode: 'OPS', teamName: 'Reconciliation', role: 'employee' as const },

  // IT Department
  { displayName: 'Michael Scott', email: 'michael.scott@sarasin.com', departmentCode: 'IT', teamName: 'Development', role: 'hod' as const },
  { displayName: 'Sarah Connor', email: 'sarah.connor@sarasin.com', departmentCode: 'IT', teamName: 'Infrastructure', role: 'employee' as const },
  { displayName: 'John Smith', email: 'john.smith@sarasin.com', departmentCode: 'IT', teamName: 'Development', role: 'employee' as const },
  { displayName: 'Emily Davis', email: 'emily.davis@sarasin.com', departmentCode: 'IT', teamName: 'Support', role: 'employee' as const },

  // Risk Department
  { displayName: 'Michael Brown', email: 'michael.brown@sarasin.com', departmentCode: 'RISK', teamName: 'Risk Analysis', role: 'risk_office' as const },
  { displayName: 'Jennifer Lee', email: 'jennifer.lee@sarasin.com', departmentCode: 'RISK', teamName: 'Risk Monitoring', role: 'risk_office' as const },
  { displayName: 'Thomas Wright', email: 'thomas.wright@sarasin.com', departmentCode: 'RISK', teamName: 'Risk Analysis', role: 'employee' as const },

  // Compliance Department
  { displayName: 'Amanda Foster', email: 'amanda.foster@sarasin.com', departmentCode: 'COMP', teamName: 'Regulatory Compliance', role: 'hod' as const },
  { displayName: 'Christopher Moore', email: 'christopher.moore@sarasin.com', departmentCode: 'COMP', teamName: 'AML/KYC', role: 'employee' as const },

  // Finance Department
  { displayName: 'Patricia White', email: 'patricia.white@sarasin.com', departmentCode: 'FIN', teamName: 'Financial Reporting', role: 'hod' as const },
  { displayName: 'Daniel Harris', email: 'daniel.harris@sarasin.com', departmentCode: 'FIN', teamName: 'Treasury', role: 'employee' as const },

  // HR Department
  { displayName: 'Rebecca Taylor', email: 'rebecca.taylor@sarasin.com', departmentCode: 'HR', teamName: 'Employee Relations', role: 'hod' as const },
  { displayName: 'Kevin Martin', email: 'kevin.martin@sarasin.com', departmentCode: 'HR', teamName: 'Recruitment', role: 'employee' as const },

  // Admin User
  { displayName: 'Admin User', email: 'admin@sarasin.com', departmentCode: 'IT', teamName: 'Development', role: 'admin' as const },
];

export const seedProcesses = [
  { name: 'Client Onboarding', description: 'End-to-end process for onboarding new clients' },
  { name: 'KYC Review', description: 'Know Your Customer verification and review process' },
  { name: 'Account Opening', description: 'Process for opening new client accounts' },
  { name: 'Trade Execution', description: 'Trade order execution and confirmation' },
  { name: 'Settlement', description: 'Trade settlement and reconciliation' },
  { name: 'Corporate Actions', description: 'Processing corporate actions and events' },
  { name: 'Reporting', description: 'Client and regulatory reporting processes' },
  { name: 'Compliance Check', description: 'Pre-trade and post-trade compliance checks' },
  { name: 'Risk Assessment', description: 'Client and portfolio risk assessment' },
  { name: 'Fee Calculation', description: 'Management and performance fee calculations' },
  { name: 'Client Communication', description: 'Client correspondence and updates' },
  { name: 'Document Management', description: 'Client document storage and retrieval' },
  { name: 'Cash Management', description: 'Client cash position management' },
  { name: 'NAV Calculation', description: 'Net Asset Value calculation process' },
  { name: 'Audit Support', description: 'Internal and external audit support' },
];

export const seedIncidentTypes = [
  { name: 'Data Entry Error', description: 'Incorrect data entered into system' },
  { name: 'Process Deviation', description: 'Deviation from standard operating procedure' },
  { name: 'Communication Failure', description: 'Failure in internal or external communication' },
  { name: 'System Error', description: 'Technical system malfunction or unexpected behaviour' },
  { name: 'Deadline Breach', description: 'Missed deadline or SLA breach' },
  { name: 'Documentation Error', description: 'Incorrect or incomplete documentation' },
  { name: 'Calculation Error', description: 'Incorrect calculation or formula application' },
  { name: 'Authorization Issue', description: 'Unauthorized action or missing approval' },
  { name: 'Training Gap', description: 'Insufficient training or knowledge' },
  { name: 'Resource Constraint', description: 'Inadequate resources causing issues' },
];

export const seedTags = [
  { name: 'High Priority', type: 'priority' },
  { name: 'Recurring', type: 'trend' },
  { name: 'Client Impact', type: 'risk' },
  { name: 'Financial Impact', type: 'risk' },
  { name: 'Regulatory', type: 'risk' },
  { name: 'System Related', type: 'theme' },
  { name: 'Process Related', type: 'theme' },
  { name: 'People Related', type: 'theme' },
  { name: 'Training Required', type: 'action' },
  { name: 'Policy Update', type: 'action' },
];

// Sample incidents for demo purposes - focused on staff conduct/behaviour
export const seedIncidents = [
  {
    reporterEmail: 'emma.thompson@sarasin.com',
    departmentCode: 'CA',
    teamName: 'Client Onboarding',
    category: 'behavioural_issue' as const,
    severity: 'medium' as const,
    description: 'Colleague observed speaking dismissively to a junior team member during a client call, causing visible embarrassment. The tone was unprofessional and could have been overheard by the client.',
    occurredDaysAgo: 5,
    incidentTypeName: 'Communication Failure',
    status: 'in_review' as const,
  },
  {
    reporterEmail: 'maria.garcia@sarasin.com',
    departmentCode: 'OPS',
    teamName: 'Trade Operations',
    category: 'near_miss' as const,
    severity: 'high' as const,
    description: 'Team member almost shared confidential client information in a group chat, realising just before sending. Need to reinforce data protection awareness.',
    occurredDaysAgo: 3,
    incidentTypeName: 'Authorization Issue',
    status: 'open' as const,
  },
  {
    reporterEmail: 'john.smith@sarasin.com',
    departmentCode: 'IT',
    teamName: 'Development',
    category: 'behavioural_issue' as const,
    severity: 'low' as const,
    description: 'Developer consistently arriving 30+ minutes late to morning stand-ups without advance notice, disrupting team coordination. Pattern observed over two weeks.',
    occurredDaysAgo: 10,
    incidentTypeName: 'Process Deviation',
    status: 'closed' as const,
  },
  {
    reporterEmail: 'david.kim@sarasin.com',
    departmentCode: 'OPS',
    teamName: 'Settlement',
    category: 'behavioural_issue' as const,
    severity: 'critical' as const,
    description: 'Staff member discovered to have accessed client accounts outside of their normal duties without documented business reason. Potential breach of access controls and need-to-know principles.',
    occurredDaysAgo: 1,
    incidentTypeName: 'Authorization Issue',
    status: 'open' as const,
  },
  {
    reporterEmail: 'christopher.moore@sarasin.com',
    departmentCode: 'COMP',
    teamName: 'AML/KYC',
    category: 'near_miss' as const,
    severity: 'high' as const,
    description: 'Analyst nearly approved a high-risk client without completing all mandatory checks, citing workload pressure. Caught by supervisor before sign-off. Highlights potential training gap and resourcing concerns.',
    occurredDaysAgo: 7,
    incidentTypeName: 'Training Gap',
    status: 'in_review' as const,
  },
  {
    reporterEmail: 'sophie.brown@sarasin.com',
    departmentCode: 'CA',
    teamName: 'Account Management',
    category: 'behavioural_issue' as const,
    severity: 'medium' as const,
    description: 'Team member observed making inappropriate comments about a colleague\'s appearance in the open office. Several staff members overheard and expressed discomfort.',
    occurredDaysAgo: 2,
    incidentTypeName: 'Communication Failure',
    status: 'open' as const,
  },
  {
    reporterEmail: 'lisa.anderson@sarasin.com',
    departmentCode: 'OPS',
    teamName: 'Reconciliation',
    category: 'near_miss' as const,
    severity: 'medium' as const,
    description: 'Staff member nearly sent an email containing sensitive performance review information to the wrong distribution list. Error caught when previewing recipients before sending.',
    occurredDaysAgo: 4,
    incidentTypeName: 'Communication Failure',
    status: 'closed' as const,
  },
  {
    reporterEmail: 'sarah.connor@sarasin.com',
    departmentCode: 'IT',
    teamName: 'Infrastructure',
    category: 'behavioural_issue' as const,
    severity: 'high' as const,
    description: 'Engineer shared system admin credentials with a contractor via unencrypted email, bypassing the secure credential sharing process. Potential security policy violation.',
    occurredDaysAgo: 6,
    incidentTypeName: 'Authorization Issue',
    status: 'in_review' as const,
  },
  {
    reporterEmail: 'daniel.harris@sarasin.com',
    departmentCode: 'FIN',
    teamName: 'Treasury',
    category: 'process_gap' as const,
    severity: 'low' as const,
    description: 'Noticed that expense claims are being approved without proper supporting documentation. Need clearer guidelines on what evidence is required for different expense types.',
    occurredDaysAgo: 14,
    incidentTypeName: 'Process Deviation',
    status: 'closed' as const,
  },
  {
    reporterEmail: 'kevin.martin@sarasin.com',
    departmentCode: 'HR',
    teamName: 'Recruitment',
    category: 'behavioural_issue' as const,
    severity: 'critical' as const,
    description: 'Hiring manager discovered to have conducted interviews without HR present, potentially asking non-compliant questions. Two candidates have raised concerns about the interview process.',
    occurredDaysAgo: 3,
    incidentTypeName: 'Process Deviation',
    status: 'open' as const,
  },
  {
    reporterEmail: 'thomas.wright@sarasin.com',
    departmentCode: 'RISK',
    teamName: 'Risk Analysis',
    category: 'near_miss' as const,
    severity: 'medium' as const,
    description: 'Risk report containing client names was left on a printer in a shared area for over an hour. Retrieved before any confirmed exposure but highlights need for secure printing protocols.',
    occurredDaysAgo: 8,
    incidentTypeName: 'Documentation Error',
    status: 'in_review' as const,
  },
];
