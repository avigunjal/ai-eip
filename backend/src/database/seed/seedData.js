// Canonical demo dataset for AI-EIP.
//
// Single source of truth for demo data. Re-run against SQLite today and
// Supabase tomorrow; never export/import the local database file.
//
// Shapes mirror the frontend fixture world (frontend/src/data/fixtures.js) so
// the API can be swapped in without UI redesign. IDs are human-readable text
// ids (p-01, t-01, pr-07, k-01, r-01, ...).

// A fixed "demo today" keeps every date deterministic and stable across
// re-seeds, unlike relative dates which drift on every run.
import { DEMO_TODAY } from '../../shared/constants/index.js';

export { DEMO_TODAY };

// ---------------------------------------------------------------------------
// People
// ---------------------------------------------------------------------------
// [id, name, role, teamId, availabilityFte, yearsOfExperience, capabilities: [capabilityId, level][]]
export const people = [
  ['p-01', 'Aarav Sharma', 'Engineering Manager', 't-01', 0.8, 14, [['cap-node', 'primary'], ['cap-api', 'primary'], ['cap-kubernetes', 'capable']]],
  ['p-02', 'Emma Johnson', 'Engineering Manager', 't-02', 0.85, 15, [['cap-frontend', 'primary'], ['cap-api', 'capable']]],
  ['p-03', 'Rohan Patel', 'Engineering Manager', 't-03', 0.8, 13, [['cap-data', 'primary'], ['cap-databases', 'primary']]],
  ['p-04', 'Olivia Williams', 'Engineering Manager', 't-04', 0.8, 14, [['cap-reliability', 'primary'], ['cap-kubernetes', 'capable'], ['cap-observability', 'capable']]],
  ['p-05', 'Priya Iyer', 'Engineering Manager', 't-05', 0.85, 12, [['cap-devx', 'primary'], ['cap-node', 'capable']]],
  ['p-06', 'James Brown', 'Senior Engineer', 't-06', 0.9, 9, [['cap-payments', 'primary'], ['cap-node', 'capable'], ['cap-databases', 'capable']]],
  ['p-07', 'Vikram Singh', 'Platform Engineer', 't-01', 0.9, 9, [['cap-node', 'capable'], ['cap-kubernetes', 'primary'], ['cap-api', 'capable']]],
  ['p-08', 'Sophia Davis', 'Senior Engineer', 't-02', 0.9, 8, [['cap-frontend', 'primary'], ['cap-payments', 'capable'], ['cap-api', 'capable']]],
  ['p-09', 'Arjun Reddy', 'Engineering Manager', 't-03', 0.75, 13, [['cap-data', 'capable'], ['cap-ml', 'primary']]],
  ['p-10', 'Michael Miller', 'SRE', 't-04', 0.9, 11, [['cap-reliability', 'primary'], ['cap-observability', 'primary']]],
  ['p-11', 'Riya Kumar', 'Platform Engineer', 't-05', 0.9, 8, [['cap-devx', 'primary'], ['cap-node', 'capable']]],
  ['p-12', 'David Wilson', 'Senior Engineer', 't-06', 0.9, 9, [['cap-payments', 'primary'], ['cap-api', 'primary'], ['cap-databases', 'capable']]],
  ['p-13', 'Kiran Nair', 'Staff Engineer', 't-01', 0.85, 15, [['cap-api', 'primary'], ['cap-node', 'primary'], ['cap-kubernetes', 'capable']]],
  ['p-14', 'Sarah Anderson', 'Engineer', 't-02', 0.95, 4, [['cap-frontend', 'primary'], ['cap-analytics', 'primary']]],
  ['p-15', 'Ananya Gupta', 'Data Engineer', 't-03', 0.9, 8, [['cap-data', 'primary'], ['cap-databases', 'capable'], ['cap-analytics', 'capable']]],
  ['p-16', 'Ryan Thomas', 'SRE', 't-04', 0.85, 10, [['cap-kubernetes', 'primary'], ['cap-reliability', 'capable'], ['cap-observability', 'capable']]],
  ['p-17', 'Ishaan Sharma', 'Engineer', 't-05', 0.95, 3, [['cap-devx', 'primary'], ['cap-frontend', 'capable']]],
  ['p-18', 'Emily Johnson', 'Engineer', 't-06', 0.95, 4, [['cap-payments', 'capable'], ['cap-frontend', 'learning'], ['cap-api', 'capable']]],
  ['p-19', 'Sanjay Patel', 'Tech Lead', 't-01', 0.8, 12, [['cap-node', 'primary'], ['cap-api', 'primary']]],
  ['p-20', 'Rachel Williams', 'Engineer', 't-02', 0.95, 3, [['cap-frontend', 'capable'], ['cap-analytics', 'capable']]],
  ['p-21', 'Meera Iyer', 'Data Engineer', 't-03', 0.9, 9, [['cap-data', 'primary'], ['cap-ml', 'capable'], ['cap-databases', 'capable']]],
  ['p-22', 'Daniel Brown', 'Platform Engineer', 't-04', 0.85, 10, [['cap-kubernetes', 'primary'], ['cap-reliability', 'capable'], ['cap-observability', 'capable']]],
  ['p-23', 'Rahul Singh', 'Engineer', 't-05', 0.9, 5, [['cap-devx', 'capable'], ['cap-api', 'capable']]],
  ['p-24', 'Grace Davis', 'Senior Engineer', 't-06', 0.85, 10, [['cap-payments', 'primary'], ['cap-databases', 'primary'], ['cap-api', 'capable']]],
  ['p-25', 'Divya Reddy', 'Engineer', 't-01', 0.95, 4, [['cap-api', 'capable'], ['cap-kubernetes', 'capable']]],
  ['p-26', 'Matthew Miller', 'Engineer', 't-02', 0.95, 5, [['cap-frontend', 'primary'], ['cap-analytics', 'capable'], ['cap-payments', 'capable']]],
  ['p-27', 'Aditi Kumar', 'Data Engineer', 't-03', 0.9, 7, [['cap-data', 'capable'], ['cap-analytics', 'capable'], ['cap-databases', 'capable']]],
  ['p-28', 'Christopher Wilson', 'SRE', 't-04', 0.85, 9, [['cap-reliability', 'primary'], ['cap-kubernetes', 'capable']]],
];

// ---------------------------------------------------------------------------
// Teams
// ---------------------------------------------------------------------------
// [id, name, managerPersonId, sustainableCapacityFte, committedFte, unplannedFte]
export const teams = [
  ['t-01', 'Platform Engineering', 'p-01', 4.25, 4.6, 0.1],
  ['t-02', 'Growth Engineering', 'p-02', 4.25, 4.4, 0.1],
  ['t-03', 'Data Platform', 'p-03', 4.25, 3.7, 0.05],
  ['t-04', 'Core Infrastructure', 'p-05', 4.25, 3.3, 0.0],
  ['t-05', 'Developer Experience', 'p-09', 3.4, 3.24, 0.0],
  ['t-06', 'Payments Engineering', 'p-04', 3.4, 3.8, 0.15],
];

// team_memberships: [teamId, personId]
export const teamMemberships = [
  ['t-01', 'p-01'], ['t-01', 'p-07'], ['t-01', 'p-13'], ['t-01', 'p-19'], ['t-01', 'p-25'],
  ['t-02', 'p-02'], ['t-02', 'p-08'], ['t-02', 'p-14'], ['t-02', 'p-20'], ['t-02', 'p-26'],
  ['t-03', 'p-03'], ['t-03', 'p-09'], ['t-03', 'p-15'], ['t-03', 'p-21'], ['t-03', 'p-27'],
  ['t-04', 'p-04'], ['t-04', 'p-10'], ['t-04', 'p-16'], ['t-04', 'p-22'], ['t-04', 'p-28'],
  ['t-05', 'p-05'], ['t-05', 'p-11'], ['t-05', 'p-17'], ['t-05', 'p-23'],
  ['t-06', 'p-06'], ['t-06', 'p-12'], ['t-06', 'p-18'], ['t-06', 'p-24'],
];

// ---------------------------------------------------------------------------
// Clients and projects
// ---------------------------------------------------------------------------
// clients: [id, name]
export const clients = [
  ['cl-01', 'Zenith Retail Group'],
  ['cl-02', 'Meridian Financial'],
  ['cl-03', 'Aurelia Health Systems'],
  ['cl-04', 'Orbit Logistics'],
];

// projects: [id, name, status, targetDate, healthScore, healthDelta, deliveryConfidence, clientId]
// [id, name, description, type, phase, status, targetDate, healthScore, healthDelta, deliveryConfidence, clientId]
export const projects = [
  ['pr-01', 'Atlas Platform Migration', 'Migration of legacy platform services to Kubernetes architecture.', 'migration', 'implementation', 'at_risk', '2026-09-30', 54, -8, 52, 'cl-01'],
  ['pr-02', 'Checkout Modernization', 'Modernization of checkout services to an event-driven architecture.', 'modernization', 'implementation', 'at_risk', '2026-08-30', 58, -6, 61, 'cl-01'],
  ['pr-03', 'Data Lake Consolidation', 'Consolidation of siloed data warehouses into a single analytics data lake.', 'migration', 'design', 'on_track', '2026-10-15', 82, 4, 86, 'cl-02'],
  ['pr-04', 'ML Inference at Scale', 'Scaling ML inference workloads with lower-latency serving infrastructure.', 'research', 'implementation', 'on_track', '2026-10-22', 78, 2, 80, 'cl-02'],
  ['pr-05', 'Multi-region Reliability', 'Extending service reliability across multiple cloud regions.', 'platform', 'implementation', 'at_risk', '2026-09-18', 60, -5, 64, 'cl-03'],
  ['pr-06', 'Developer Portal', 'Self-service developer portal for internal platform tooling.', 'platform', 'release', 'on_track', '2026-09-12', 84, 3, 88, 'cl-03'],
  ['pr-07', 'Payments 3.0', 'Replatforming payment services to the new Payments 3.0 architecture.', 'migration', 'implementation', 'at_risk', '2026-09-08', 56, -7, 60, 'cl-02'],
  ['pr-08', 'Search Relevance', 'Improving search ranking and relevance for the product catalog.', 'new_feature', 'testing', 'on_track', '2026-10-05', 81, 1, 84, 'cl-01'],
  ['pr-09', 'Billing Upgrade', 'Migration of billing services to a new payment gateway with improved reliability and transaction processing.', 'modernization', 'design', 'paused', '2026-10-18', 30, -2, 35, 'cl-04'],
  ['pr-10', 'Observability Rollout', 'Rolling out standard observability tooling to all production services.', 'maintenance', 'complete', 'complete', '2026-08-01', 91, 5, 96, 'cl-04'],
];

// project_teams: [projectId, teamId]
export const projectTeams = [
  ['pr-01', 't-01'], ['pr-02', 't-02'], ['pr-03', 't-03'], ['pr-04', 't-03'],
  ['pr-05', 't-04'], ['pr-06', 't-05'], ['pr-07', 't-06'], ['pr-08', 't-02'],
  ['pr-09', 't-06'], ['pr-10', 't-04'],
];

// project_owners: [projectId, personId]
export const projectOwners = [
  ['pr-01', 'p-01'], ['pr-02', 'p-02'], ['pr-03', 'p-03'], ['pr-04', 'p-03'],
  ['pr-05', 'p-05'], ['pr-06', 'p-09'], ['pr-07', 'p-04'], ['pr-08', 'p-02'],
  ['pr-09', 'p-04'], ['pr-10', 'p-05'],
];

// ---------------------------------------------------------------------------
// Capabilities
// ---------------------------------------------------------------------------
// capabilities: [id, name, criticality]
export const capabilities = [
  ['cap-node', 'Node.js Services', 74],
  ['cap-frontend', 'React Frontend', 74],
  ['cap-payments', 'Payments & Billing', 92],
  ['cap-api', 'API & Platform', 92],
  ['cap-data', 'Data Engineering', 74],
  ['cap-ml', 'ML & Inference', 55],
  ['cap-databases', 'SQL & PostgreSQL', 74],
  ['cap-reliability', 'SRE & Reliability', 92],
  ['cap-kubernetes', 'Kubernetes & Platform Ops', 74],
  ['cap-observability', 'Observability', 74],
  ['cap-devx', 'CI/CD & Developer Experience', 55],
  ['cap-analytics', 'Search & Analytics', 55],
];

// team_capability_coverage: [teamId, capabilityId, coverageScore]
export const teamCapabilityCoverage = [
  ['t-01', 'cap-node', 82], ['t-01', 'cap-api', 86], ['t-01', 'cap-kubernetes', 74],
  ['t-02', 'cap-frontend', 88], ['t-02', 'cap-api', 72], ['t-02', 'cap-analytics', 68], ['t-02', 'cap-payments', 52],
  ['t-03', 'cap-data', 90], ['t-03', 'cap-databases', 84], ['t-03', 'cap-ml', 62],
  ['t-04', 'cap-reliability', 86], ['t-04', 'cap-kubernetes', 78], ['t-04', 'cap-observability', 80],
  ['t-05', 'cap-devx', 88], ['t-05', 'cap-node', 70], ['t-05', 'cap-api', 64],
  ['t-06', 'cap-payments', 86], ['t-06', 'cap-api', 74], ['t-06', 'cap-databases', 78], ['t-06', 'cap-node', 66],
];

// project_requirements: [projectId, capabilityId, weight]
export const projectRequirements = [
  ['pr-01', 'cap-api', 1], ['pr-01', 'cap-node', 1], ['pr-01', 'cap-kubernetes', 0.8],
  ['pr-02', 'cap-frontend', 1], ['pr-02', 'cap-payments', 0.8], ['pr-02', 'cap-api', 1],
  ['pr-03', 'cap-data', 1], ['pr-03', 'cap-databases', 1], ['pr-03', 'cap-ml', 0.5],
  ['pr-04', 'cap-data', 1], ['pr-04', 'cap-ml', 1], ['pr-04', 'cap-databases', 0.5],
  ['pr-05', 'cap-reliability', 1], ['pr-05', 'cap-observability', 1], ['pr-05', 'cap-kubernetes', 0.8],
  ['pr-06', 'cap-devx', 1], ['pr-06', 'cap-frontend', 0.8], ['pr-06', 'cap-api', 0.5],
  ['pr-07', 'cap-payments', 1], ['pr-07', 'cap-node', 1], ['pr-07', 'cap-databases', 0.8], ['pr-07', 'cap-api', 0.8],
  ['pr-08', 'cap-frontend', 1], ['pr-08', 'cap-analytics', 1], ['pr-08', 'cap-data', 0.5],
  ['pr-09', 'cap-payments', 1], ['pr-09', 'cap-api', 0.8], ['pr-09', 'cap-databases', 0.5],
  ['pr-10', 'cap-reliability', 1], ['pr-10', 'cap-observability', 1],
];

// ---------------------------------------------------------------------------
// Knowledge areas
// ---------------------------------------------------------------------------
// [id, name, type, criticality, coverage, documentationFreshnessDays, documentationCompleteness]
export const knowledgeAreas = [
  ['k-01', 'Payment Service', 'service', 92, 38, 47, 42],
  ['k-02', 'Checkout Service', 'service', 92, 82, 18, 82],
  ['k-03', 'Data Lake', 'service', 74, 52, 64, 60],
  ['k-04', 'ML Inference Platform', 'service', 74, 71, 30, 75],
  ['k-05', 'Kubernetes Platform', 'service', 92, 64, 28, 70],
  ['k-06', 'Billing Engine', 'service', 92, 45, 75, 45],
  ['k-07', 'Notifications Service', 'service', 55, 78, 20, 80],
  ['k-08', 'Search Index', 'service', 74, 88, 12, 90],
  ['k-09', 'Feature Flags', 'service', 55, 90, 9, 92],
  ['k-10', 'Analytics Pipeline', 'service', 74, 72, 22, 78],
  ['k-11', 'Auth Gateway', 'service', 92, 60, 25, 70],
  ['k-12', 'Recommendation Engine', 'service', 55, 80, 15, 84],
  ['k-13', 'Storage Layer', 'service', 92, 55, 35, 60],
  ['k-14', 'CI/CD Pipeline', 'service', 74, 86, 10, 88],
  ['k-15', 'Observability Stack', 'service', 74, 74, 15, 85],
  ['k-16', 'API Gateway', 'service', 92, 69, 20, 72],
];

// knowledge_area_projects: [knowledgeAreaId, projectId]
export const knowledgeAreaProjects = [
  ['k-01', 'pr-07'],
  ['k-02', 'pr-02'],
  ['k-03', 'pr-03'],
  ['k-04', 'pr-04'],
  ['k-05', 'pr-01'], ['k-05', 'pr-05'],
  ['k-06', 'pr-09'],
  ['k-07', 'pr-08'],
  ['k-08', 'pr-08'],
  ['k-09', 'pr-06'],
  ['k-10', 'pr-03'], ['k-10', 'pr-08'],
  ['k-11', 'pr-02'], ['k-11', 'pr-07'],
  ['k-12', 'pr-04'],
  ['k-13', 'pr-09'],
  ['k-14', 'pr-06'],
  ['k-15', 'pr-05'], ['k-15', 'pr-10'],
  ['k-16', 'pr-01'], ['k-16', 'pr-02'],
];

// knowledge_expertise: [areaId, personId, level, sharePct, lastContributedAt, isBackup]
export const knowledgeExpertise = [
  ['k-01', 'p-01', 'primary', 85, '2026-08-15', 0],
  ['k-01', 'p-05', 'learning', 10, '2026-07-29', 0],
  ['k-01', 'p-09', 'unverified', 5, '2026-06-17', 0],
  ['k-02', 'p-08', 'primary', 45, '2026-08-12', 0],
  ['k-02', 'p-14', 'capable', 35, '2026-08-11', 1],
  ['k-02', 'p-20', 'learning', 20, '2026-08-05', 0],
  ['k-03', 'p-15', 'primary', 80, '2026-08-13', 0],
  ['k-03', 'p-21', 'learning', 20, '2026-07-22', 0],
  ['k-04', 'p-09', 'primary', 62, '2026-08-10', 0],
  ['k-04', 'p-21', 'capable', 38, '2026-08-02', 1],
  ['k-05', 'p-10', 'primary', 40, '2026-08-14', 0],
  ['k-05', 'p-16', 'capable', 30, '2026-08-12', 1],
  ['k-05', 'p-22', 'capable', 30, '2026-08-04', 1],
  ['k-06', 'p-06', 'primary', 78, '2026-08-15', 0],
  ['k-06', 'p-24', 'learning', 22, '2026-07-20', 0],
  ['k-07', 'p-26', 'primary', 50, '2026-08-09', 0],
  ['k-07', 'p-14', 'capable', 50, '2026-08-01', 1],
  ['k-08', 'p-14', 'primary', 38, '2026-08-11', 0],
  ['k-08', 'p-26', 'capable', 32, '2026-08-07', 1],
  ['k-08', 'p-08', 'learning', 30, '2026-07-25', 0],
  ['k-09', 'p-11', 'primary', 52, '2026-08-12', 0],
  ['k-09', 'p-17', 'capable', 48, '2026-08-06', 1],
  ['k-10', 'p-15', 'primary', 46, '2026-08-13', 0],
  ['k-10', 'p-21', 'capable', 30, '2026-08-08', 1],
  ['k-10', 'p-27', 'learning', 24, '2026-07-28', 0],
  ['k-11', 'p-13', 'primary', 42, '2026-08-12', 0],
  ['k-11', 'p-25', 'capable', 30, '2026-08-09', 1],
  ['k-11', 'p-01', 'capable', 28, '2026-08-01', 1],
  ['k-12', 'p-09', 'primary', 55, '2026-08-08', 0],
  ['k-12', 'p-21', 'capable', 45, '2026-07-30', 1],
  ['k-13', 'p-12', 'primary', 66, '2026-08-14', 0],
  ['k-13', 'p-24', 'capable', 34, '2026-08-10', 1],
  ['k-14', 'p-11', 'primary', 40, '2026-08-11', 0],
  ['k-14', 'p-17', 'capable', 30, '2026-08-05', 1],
  ['k-14', 'p-05', 'learning', 30, '2026-07-26', 0],
  ['k-15', 'p-10', 'primary', 58, '2026-08-15', 0],
  ['k-15', 'p-16', 'capable', 42, '2026-08-12', 1],
  ['k-16', 'p-19', 'primary', 47, '2026-08-10', 0],
  ['k-16', 'p-25', 'capable', 30, '2026-08-05', 1],
  ['k-16', 'p-13', 'learning', 23, '2026-07-24', 0],
];

// knowledge_transfer_plans: [id, areaId, ownerPersonId, targetCoverage, dueDate, status, progress, nextSessionAt]
export const transferPlans = [
  ['tp-01', 'k-01', 'p-01', 65, '2026-09-20', 'in_progress', 15, '2026-08-21'],
  ['tp-03', 'k-03', 'p-15', 75, '2026-09-25', 'todo', 0, '2026-08-24'],
  ['tp-06', 'k-06', 'p-06', 75, '2026-09-22', 'scheduled', 40, '2026-08-22'],
  ['tp-13', 'k-13', 'p-12', 75, '2026-10-01', 'todo', 0, '2026-08-26'],
];

// transfer_actions: [id, planId, title, ownerPersonId, dueDate, status, expectedOutcome]
export const transferActions = [
  ['ta-01-1', 'tp-01', 'Assign backup ownership for Payment Service', 'p-01', '2026-08-20', 'in_progress', 'Named on-call/release backup'],
  ['ta-01-2', 'tp-01', 'Pair on real Payment Service work', 'p-01', '2026-08-27', 'scheduled', 'Backup completes a production change'],
  ['ta-01-3', 'tp-01', 'Update payment runbook and deployment procedure', 'p-01', '2026-09-05', 'todo', 'Fresh incident/release guide'],
  ['ta-01-4', 'tp-01', 'Backup leads a supervised release', 'p-05', '2026-09-12', 'todo', 'Validate operational readiness'],
  ['ta-03-1', 'tp-03', 'Pair on data lake schema work', 'p-15', '2026-08-25', 'todo', 'Backup owns a schema change'],
  ['ta-03-2', 'tp-03', 'Document data lake ingestion contracts', 'p-15', '2026-09-02', 'todo', 'Undocumented changes captured'],
  ['ta-06-1', 'tp-06', 'Backup completes a billing engine change', 'p-06', '2026-08-24', 'scheduled', 'Second owner verified'],
  ['ta-06-2', 'tp-06', 'Update billing architecture document', 'p-06', '2026-09-03', 'todo', 'Fresh architecture reference'],
  ['ta-13-1', 'tp-13', 'Cross-train storage layer operations', 'p-12', '2026-08-28', 'todo', 'Storage on-call backup available'],
];

// ---------------------------------------------------------------------------
// Risks (score and severity are derived in the seed runner from p × i × u)
// ---------------------------------------------------------------------------
// [id, projectId, title, category, probability, impact, urgency, confidence, trend, status, ownerPersonId]
export const risks = [
  ['r-01', 'pr-07', 'API contract for payments not yet finalized', 'dependency', 0.95, 0.95, 0.9, 87, 'rising', 'open', 'p-04'],
  ['r-02', 'pr-07', 'Single SME owns Payment Service knowledge', 'knowledge', 0.85, 0.85, 0.9, 84, 'rising', 'open', 'p-01'],
  ['r-03', 'pr-02', 'Two engineers exceed sustainable capacity', 'capacity', 0.85, 0.8, 0.9, 79, 'stable', 'open', 'p-02'],
  ['r-04', 'pr-05', 'Billing engine dependency blocking release', 'dependency', 0.7, 0.75, 0.75, 76, 'stable', 'monitoring', 'p-05'],
  ['r-05', 'pr-04', 'ML inference model drift unaddressed', 'quality', 0.7, 0.75, 0.8, 74, 'stable', 'monitoring', 'p-03'],
  ['r-06', 'pr-02', 'Checkout service documentation out of date', 'knowledge', 0.7, 0.7, 0.85, 72, 'stable', 'monitoring', 'p-02'],
  ['r-07', 'pr-10', 'Observability coverage gaps in EU region', 'quality', 0.7, 0.7, 0.85, 71, 'improving', 'monitoring', 'p-05'],
  ['r-08', 'pr-01', 'Feature-flag rollout lacks rollback plan', 'schedule', 0.7, 0.7, 0.9, 74, 'rising', 'open', 'p-01'],
  ['r-09', 'pr-08', 'Search index performance regression', 'quality', 0.5, 0.5, 0.7, 70, 'stable', 'monitoring', 'p-02'],
  ['r-10', 'pr-01', 'Kubernetes upgrade incomplete', 'schedule', 0.7, 0.7, 0.85, 73, 'stable', 'open', 'p-01'],
  ['r-11', 'pr-05', 'Notification service has no on-call backup', 'capacity', 0.7, 0.7, 0.85, 72, 'rising', 'open', 'p-05'],
  ['r-12', 'pr-03', 'Data lake schema changes undocumented', 'knowledge', 0.7, 0.75, 0.8, 75, 'stable', 'monitoring', 'p-03'],
  ['r-13', 'pr-04', 'Recommendation engine latency spike', 'quality', 0.8, 0.85, 0.9, 77, 'rising', 'open', 'p-03'],
  ['r-14', 'pr-01', 'Storage layer capacity near threshold', 'capacity', 0.5, 0.6, 0.7, 69, 'stable', 'monitoring', 'p-01'],
  ['r-15', 'pr-06', 'CI/CD pipeline flaky in staging', 'quality', 0.7, 0.7, 0.85, 71, 'improving', 'monitoring', 'p-09'],
  ['r-16', 'pr-07', 'Payments team lacks cross-training', 'knowledge', 0.85, 0.8, 0.9, 81, 'rising', 'open', 'p-04'],
  ['r-17', 'pr-09', 'API gateway rate-limit misconfig risk', 'dependency', 0.9, 0.95, 0.95, 86, 'rising', 'open', 'p-04'],
  ['r-18', 'pr-03', 'Analytics pipeline data-quality issues', 'quality', 0.55, 0.5, 0.7, 68, 'stable', 'monitoring', 'p-03'],
];

// prevention_actions: [id, riskId, title, ownerPersonId, dueDate, status, expectedOutcome]
export const preventionActions = [
  ['action-contract-review', 'r-01', 'Run API contract review and assign decision owner', 'p-04', '2026-08-18', 'todo', 'Unblock dependent payments stories'],
  ['action-payment-backup', 'r-02', 'Assign a capable Payment Service backup and pair on the next release', 'p-01', '2026-08-20', 'in_progress', 'Raise verified Payment Service coverage above 60%'],
  ['action-capacity', 'r-03', 'Rebalance Growth Engineering capacity for four weeks', 'p-02', '2026-08-21', 'todo', 'Bring delivery pressure below 100%'],
  ['action-rollback', 'r-08', 'Draft and review a rollback plan for the feature-flag rollout', 'p-01', '2026-08-22', 'todo', 'Rollback exercise passes in staging'],
  ['action-oncall', 'r-11', 'Add a named on-call backup for the notifications service', 'p-05', '2026-08-19', 'todo', 'No unbacked on-call windows'],
  ['action-latency', 'r-13', 'Profile and fix the recommendation engine latency regression', 'p-03', '2026-08-25', 'in_progress', 'p95 latency returns under threshold'],
  ['action-crosstrain', 'r-16', 'Schedule cross-training sessions for the Payments team', 'p-04', '2026-08-28', 'todo', 'Two capable engineers per critical path'],
  ['action-gateway', 'r-17', 'Audit and correct API gateway rate-limit configuration', 'p-04', '2026-08-23', 'todo', 'Rate-limit policy verified across regions'],
];

// evidence: [id, entityType, entityId, source, statement, occurredAt, sourceUrl]
export const evidence = [
  ['kev-ps-1', 'knowledge_area', 'k-01', 'github', '83% of service pull requests and all three recent production incident resolutions were led by the primary expert.', '2026-08-15', 'https://github.com/hitachi/payment'],
  ['kev-ps-2', 'knowledge_area', 'k-01', 'docs', 'The primary expert is the only named owner for the payment runbook and deployment procedure.', '2026-08-12', 'https://wiki.hitachi/runbooks/payment'],
  ['kev-ps-3', 'knowledge_area', 'k-01', 'jira', 'The backup completed two recent changes but has not led a release or incident response.', '2026-08-08', 'https://hitachi.atlassian.net/browse/PAY-221'],
  ['kev-ps-4', 'knowledge_area', 'k-01', 'docs', 'The Payment Service architecture document was last updated 47 days ago.', '2026-08-03', 'https://wiki.hitachi/architecture/payment'],
  ['ev-r01-1', 'risk', 'r-01', 'jira', 'Three payments stories are blocked by the unresolved API contract.', '2026-08-15', 'https://hitachi.atlassian.net/browse/PAY-221'],
  ['ev-r01-2', 'risk', 'r-01', 'github', 'API contract review PR has been open for nine days without a decision owner.', '2026-08-13', 'https://github.com/hitachi/payments-30'],
  ['ev-r02-1', 'risk', 'r-02', 'github', '83% of Payment Service pull requests and all three recent production incidents were led by Aarav Sharma.', '2026-08-15', 'https://github.com/hitachi/payment'],
  ['ev-r02-2', 'risk', 'r-02', 'incident', 'Aarav Sharma is the only named owner for the payment runbook and deployment procedure.', '2026-08-13', 'https://wiki.hitachi/runbooks/payment'],
  ['ev-r02-3', 'risk', 'r-02', 'docs', 'The Payment Service architecture document was last updated 47 days ago.', '2026-08-03', 'https://wiki.hitachi/architecture/payment'],
  ['ev-r03-1', 'risk', 'r-03', 'planning', 'Growth Engineering committed demand is 104% of sustainable capacity.', '2026-08-14', null],
  ['ev-r03-2', 'risk', 'r-03', 'jira', 'Two engineers carry ten open tickets between them this sprint.', '2026-08-12', 'https://hitachi.atlassian.net/browse/GRW-114'],
  ['ev-r04-1', 'risk', 'r-04', 'jira', 'Release is blocked pending a billing engine dependency change.', '2026-08-14', 'https://hitachi.atlassian.net/browse/BILL-77'],
  ['ev-r08-1', 'risk', 'r-08', 'github', 'Feature-flag rollout has no documented rollback plan.', '2026-08-13', 'https://github.com/hitachi/atlas'],
  ['ev-r10-1', 'risk', 'r-10', 'docs', 'Kubernetes upgrade is incomplete for three node pools.', '2026-08-12', 'https://wiki.hitachi/runbooks/k8s'],
  ['ev-r11-1', 'risk', 'r-11', 'pagerduty', 'Notifications service on-call has no named backup this rotation.', '2026-08-11', null],
  ['ev-r12-1', 'risk', 'r-12', 'docs', 'Data lake schema change log has not been updated in six weeks.', '2026-08-10', 'https://wiki.hitachi/architecture/datalake'],
  ['ev-r13-1', 'risk', 'r-13', 'datadog', 'Recommendation engine p95 latency rose 40% after the latest release.', '2026-08-14', null],
  ['ev-r16-1', 'risk', 'r-16', 'github', 'All recent payment releases were led by the same two engineers.', '2026-08-15', 'https://github.com/hitachi/payments-30'],
  ['ev-r17-1', 'risk', 'r-17', 'incident', 'Rate-limit misconfiguration caused a public API outage last month.', '2026-08-09', 'https://status.hitachi.io'],
];

// ---------------------------------------------------------------------------
// Staffing scenarios
// ---------------------------------------------------------------------------
// [id, name, projectId, teamId, capacityDeltaFte, capabilityDelta, tradeOff, confidence]
export const staffingScenarios = [
  ['sc-01', 'Balanced Payments team for Payments 3.0', 'pr-07', 't-06', 0.9, '+1 payments, +1 node/postgres', 'Platform Engineering is already above sustainable capacity; time-box the assignment and pair the backup.', 82],
  ['sc-02', 'Growth rebalance for Checkout Modernization', 'pr-02', 't-02', 0.6, '+1 frontend, +1 api', 'Growth Engineering is near sustainable capacity; the rebalance reduces checkout throughput for two weeks.', 74],
  ['sc-03', 'Reliability lift for Multi-region rollout', 'pr-05', 't-04', 0.5, '+1 reliability, +1 observability', 'Core Infrastructure loses a senior SRE from incident rotation for the window.', 71],
];

// scenario_changes: [id, scenarioId, personId, changeType, allocationDeltaFte, rationale]
export const scenarioChanges = [
  ['sc-01-change-1', 'sc-01', 'p-06', 'add', 0.6, 'Primary payments capability for the payments 3.0 build'],
  ['sc-01-change-2', 'sc-01', 'p-12', 'add', 0.6, 'API and billing depth for the integration surface'],
  ['sc-01-change-3', 'sc-01', 'p-07', 'reallocate', 0.4, 'Node/API coverage from Platform Engineering (time-boxed)'],
  ['sc-02-change-1', 'sc-02', 'p-08', 'reallocate', 0.5, 'Frontend lead for checkout modernization'],
  ['sc-02-change-2', 'sc-02', 'p-26', 'add', 0.4, 'Checkout and analytics coverage'],
  ['sc-03-change-1', 'sc-03', 'p-16', 'reallocate', 0.5, 'Kubernetes/reliability support for multi-region rollout'],
  ['sc-03-change-2', 'sc-03', 'p-22', 'add', 0.4, 'Observability coverage for the new region'],
];

// ---------------------------------------------------------------------------
// Recognition
// ---------------------------------------------------------------------------
// [id, personId, projectId, knowledgeAreaId, contributionType, summary, occurredAt, visibility]
export const recognitions = [
  ['rec-01', 'p-10', 'pr-10', 'k-15', 'reliability', 'Led the incident review and improved the production runbook.', '2026-08-14', 'public'],
  ['rec-02', 'p-05', 'pr-07', 'k-01', 'knowledge_sharing', 'Paired on two Payment Service changes to build backup capability.', '2026-08-12', 'public'],
  ['rec-03', 'p-08', 'pr-02', null, 'delivery', 'Unblocked the checkout UI validation path before integration testing.', '2026-08-10', 'public'],
  ['rec-04', 'p-13', 'pr-01', 'k-16', 'reliability', 'Caught an API gateway rate-limit misconfig before it reached production.', '2026-08-11', 'private'],
  ['rec-05', 'p-03', 'pr-03', 'k-03', 'knowledge_sharing', 'Documented the data lake ingestion schema, unblocking two downstream teams.', '2026-08-09', 'public'],
  ['rec-06', 'p-14', 'pr-08', 'k-08', 'delivery', 'Reduced p95 search latency by 40% via query tuning.', '2026-08-08', 'public'],
  ['rec-07', 'p-11', 'pr-06', 'k-14', 'delivery', 'Automated the CI flakiness, saving 8 engineer-hours weekly.', '2026-08-07', 'public'],
  ['rec-08', 'p-16', 'pr-05', 'k-05', 'reliability', 'Completed the Kubernetes upgrade for the remaining node pools.', '2026-08-06', 'public'],
  ['rec-09', 'p-06', 'pr-09', 'k-06', 'mentorship', 'Cross-trained the payments team on billing engine internals.', '2026-08-05', 'public'],
  ['rec-10', 'p-09', 'pr-04', 'k-04', 'mentorship', 'Mentored two engineers through the ML inference migration.', '2026-08-04', 'private'],
  ['rec-11', 'p-12', 'pr-07', 'k-13', 'reliability', 'Resolved a storage layer capacity incident during the night rotation.', '2026-08-03', 'public'],
  ['rec-12', 'p-02', 'pr-02', 'k-11', 'mentorship', 'Rallied cross-team review coverage for the auth gateway contract.', '2026-08-02', 'public'],
  ['rec-13', 'p-01', 'pr-07', 'k-01', 'knowledge_sharing', 'Ran a Payment Service architecture walkthrough for the new hires.', '2026-08-01', 'private'],
  ['rec-14', 'p-15', 'pr-03', 'k-10', 'delivery', 'Diagnosed analytics pipeline drift and proposed a re-training schedule.', '2026-07-31', 'public'],
  ['rec-15', 'p-07', 'pr-01', 'k-05', 'delivery', 'Shipped the feature-flag rollback tooling ahead of schedule.', '2026-07-30', 'public'],
  ['rec-16', 'p-04', 'pr-05', 'k-15', 'reliability', 'Created runbooks for the observability stack across all regions.', '2026-07-29', 'public'],
  ['rec-17', 'p-18', 'pr-02', 'k-02', 'delivery', 'Fixed the checkout validation regression in the test environment.', '2026-07-28', 'private'],
  ['rec-18', 'p-19', 'pr-01', 'k-16', 'reliability', 'Resolved the API rate-limit misconfig across three regions.', '2026-07-27', 'public'],
];