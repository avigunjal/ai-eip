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
  ['p-01', 'Aarav Sharma', 'Engineering Manager', 't-04', 0.8, 14, [['cap-tech-leadership', 'primary'], ['cap-agile', 'primary'], ['cap-jira', 'primary'], ['cap-system-design', 'capable'], ['cap-node', 'capable'], ['cap-aws', 'capable']]],
  ['p-02', 'Emma Johnson', 'Engineering Manager', 't-02', 0.85, 15, [['cap-tech-leadership', 'primary'], ['cap-agile', 'primary'], ['cap-jira', 'primary'], ['cap-react', 'capable'], ['cap-javascript', 'capable']]],
  ['p-03', 'Rohan Patel', 'Engineering Manager', 't-03', 0.8, 13, [['cap-tech-leadership', 'primary'], ['cap-agile', 'primary'], ['cap-jira', 'primary'], ['cap-python', 'primary'], ['cap-sql', 'capable']]],
  ['p-04', 'Olivia Williams', 'Engineering Manager', 't-01', 0.8, 14, [['cap-tech-leadership', 'primary'], ['cap-agile', 'primary'], ['cap-jira', 'primary'], ['cap-aws', 'capable'], ['cap-kubernetes', 'capable']]],
  ['p-05', 'Priya Iyer', 'Engineering Manager', 't-05', 0.85, 12, [['cap-tech-leadership', 'primary'], ['cap-agile', 'primary'], ['cap-jira', 'primary'], ['cap-cicd', 'primary'], ['cap-docker', 'capable']]],
  ['p-06', 'James Brown', 'Senior Engineer', 't-01', 0.9, 9, [['cap-node', 'primary'], ['cap-javascript', 'primary'], ['cap-rest-api', 'primary'], ['cap-microservices', 'capable'], ['cap-postgres', 'capable']]],
  ['p-07', 'Vikram Singh', 'Cloud Engineer', 't-05', 0.9, 9, [['cap-kubernetes', 'primary'], ['cap-docker', 'primary'], ['cap-aws', 'primary'], ['cap-node', 'capable'], ['cap-cicd', 'capable']]],
  ['p-08', 'Sophia Davis', 'Senior Engineer', 't-02', 0.9, 8, [['cap-react', 'primary'], ['cap-typescript', 'primary'], ['cap-javascript', 'primary'], ['cap-redux', 'capable'], ['cap-rest-api', 'capable']]],
  ['p-09', 'Arjun Reddy', 'Engineering Manager', 't-06', 0.75, 13, [['cap-tech-leadership', 'primary'], ['cap-python', 'primary'], ['cap-genai', 'primary'], ['cap-llm', 'capable'], ['cap-rag', 'capable']]],
  ['p-10', 'Michael Miller', 'SRE', 't-08', 0.9, 11, [['cap-aws', 'primary'], ['cap-kubernetes', 'primary'], ['cap-cicd', 'primary'], ['cap-docker', 'capable'], ['cap-distributed-systems', 'capable']]],
  ['p-11', 'Riya Kumar', 'Platform Engineer', 't-04', 0.9, 8, [['cap-cicd', 'primary'], ['cap-docker', 'primary'], ['cap-node', 'capable'], ['cap-aws', 'capable'], ['cap-kubernetes', 'capable']]],
  ['p-12', 'David Wilson', 'Senior Engineer', 't-01', 0.9, 9, [['cap-node', 'primary'], ['cap-rest-api', 'primary'], ['cap-microservices', 'primary'], ['cap-postgres', 'capable'], ['cap-sql', 'capable']]],
  ['p-13', 'Kiran Nair', 'Staff Engineer', 't-09', 0.85, 15, [['cap-system-design', 'primary'], ['cap-api-design', 'primary'], ['cap-node', 'primary'], ['cap-microservices', 'primary'], ['cap-aws', 'capable'], ['cap-distributed-systems', 'capable']]],
  ['p-14', 'Sarah Anderson', 'QA Lead', 't-07', 0.95, 4, [['cap-react', 'primary'], ['cap-javascript', 'primary'], ['cap-typescript', 'capable'], ['cap-redux', 'capable']]],
  ['p-15', 'Ananya Gupta', 'Data Engineer', 't-06', 0.9, 8, [['cap-python', 'primary'], ['cap-sql', 'primary'], ['cap-postgres', 'primary'], ['cap-mongodb', 'capable'], ['cap-redis', 'capable']]],
  ['p-16', 'Ryan Thomas', 'SRE', 't-08', 0.85, 10, [['cap-kubernetes', 'primary'], ['cap-aws', 'primary'], ['cap-docker', 'primary'], ['cap-cicd', 'capable'], ['cap-distributed-systems', 'capable']]],
  ['p-17', 'Ishaan Sharma', 'Engineer', 't-03', 0.95, 3, [['cap-node', 'primary'], ['cap-javascript', 'primary'], ['cap-docker', 'capable'], ['cap-cicd', 'capable']]],
  ['p-18', 'Emily Johnson', 'Engineer', 't-01', 0.95, 4, [['cap-node', 'capable'], ['cap-javascript', 'capable'], ['cap-rest-api', 'capable'], ['cap-react', 'learning'], ['cap-postgres', 'capable']]],
  ['p-19', 'Sanjay Patel', 'Tech Lead', 't-09', 0.8, 12, [['cap-node', 'primary'], ['cap-api-design', 'primary'], ['cap-system-design', 'primary'], ['cap-microservices', 'primary'], ['cap-aws', 'capable']]],
  ['p-20', 'Rachel Williams', 'QA Engineer', 't-07', 0.95, 3, [['cap-react', 'primary'], ['cap-javascript', 'primary'], ['cap-redux', 'capable'], ['cap-typescript', 'capable']]],
  ['p-21', 'Meera Iyer', 'Data Engineer', 't-06', 0.9, 9, [['cap-python', 'primary'], ['cap-sql', 'capable'], ['cap-mongodb', 'capable'], ['cap-genai', 'capable'], ['cap-llm', 'capable'], ['cap-rag', 'capable']]],
  ['p-22', 'Daniel Brown', 'Platform Engineer', 't-04', 0.85, 10, [['cap-kubernetes', 'primary'], ['cap-aws', 'primary'], ['cap-docker', 'primary'], ['cap-cicd', 'capable'], ['cap-distributed-systems', 'capable']]],
  ['p-23', 'Rahul Singh', 'Engineer', 't-03', 0.9, 5, [['cap-node', 'capable'], ['cap-cicd', 'capable'], ['cap-docker', 'capable'], ['cap-aws', 'capable'], ['cap-javascript', 'capable']]],
  ['p-24', 'Grace Davis', 'Senior Engineer', 't-01', 0.85, 10, [['cap-node', 'primary'], ['cap-postgres', 'primary'], ['cap-rest-api', 'primary'], ['cap-microservices', 'capable'], ['cap-sql', 'capable']]],
  ['p-25', 'Divya Reddy', 'Engineer', 't-03', 0.95, 4, [['cap-node', 'capable'], ['cap-rest-api', 'capable'], ['cap-kubernetes', 'capable'], ['cap-docker', 'capable'], ['cap-javascript', 'capable']]],
  ['p-26', 'Matthew Miller', 'Engineer', 't-02', 0.95, 5, [['cap-react', 'primary'], ['cap-javascript', 'primary'], ['cap-typescript', 'capable'], ['cap-redux', 'capable']]],
  ['p-27', 'Aditi Kumar', 'Data Engineer', 't-06', 0.9, 7, [['cap-python', 'capable'], ['cap-sql', 'primary'], ['cap-postgres', 'capable'], ['cap-mongodb', 'capable'], ['cap-redis', 'capable']]],
  ['p-28', 'Christopher Wilson', 'Cloud Engineer', 't-05', 0.85, 9, [['cap-aws', 'primary'], ['cap-kubernetes', 'primary'], ['cap-docker', 'capable'], ['cap-distributed-systems', 'capable']]],
];

// ---------------------------------------------------------------------------
// Teams
// ---------------------------------------------------------------------------
// [id, name, managerPersonId, sustainableCapacityFte, committedFte, unplannedFte]
// Committed load is spread realistically: Payments, Backend and Platform run
// above sustainable capacity while the rest stay within it.
export const teams = [
  ['t-01', 'Payments Engineering', 'p-04', 3.4, 3.8, 0.15],
  ['t-02', 'Frontend Engineering', 'p-02', 3.4, 2.75, 0.04],
  ['t-03', 'Backend Engineering', 'p-03', 3.4, 3.2, 0.06],
  ['t-04', 'Platform Engineering', 'p-01', 3.4, 3.5, 0.07],
  ['t-05', 'Cloud & Infrastructure', 'p-05', 2.4, 1.6, 0.03],
  ['t-06', 'Data Engineering', 'p-09', 3.4, 2.55, 0.03],
  ['t-07', 'QA Engineering', 'p-14', 1.7, 1.2, 0.01],
  ['t-08', 'SRE / Reliability Engineering', 'p-10', 1.7, 1.4, 0.03],
  ['t-09', 'Engineering Leadership & Architecture', 'p-13', 1.6, 0.97, 0.02],
];

// team_memberships: [teamId, personId]
export const teamMemberships = [
  ['t-01', 'p-04'], ['t-01', 'p-06'], ['t-01', 'p-12'], ['t-01', 'p-18'], ['t-01', 'p-24'],
  ['t-02', 'p-02'], ['t-02', 'p-08'], ['t-02', 'p-26'],
  ['t-03', 'p-03'], ['t-03', 'p-17'], ['t-03', 'p-23'], ['t-03', 'p-25'],
  ['t-04', 'p-01'], ['t-04', 'p-11'], ['t-04', 'p-22'],
  ['t-05', 'p-05'], ['t-05', 'p-07'], ['t-05', 'p-28'],
  ['t-06', 'p-09'], ['t-06', 'p-15'], ['t-06', 'p-21'], ['t-06', 'p-27'],
  ['t-07', 'p-14'], ['t-07', 'p-20'],
  ['t-08', 'p-10'], ['t-08', 'p-16'],
  ['t-09', 'p-13'], ['t-09', 'p-19'],
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

// project_teams: [projectId, teamId] — primary team first, supporting teams after.
// Balanced so every team has 1–3 projects (no 0-project teams, no team spread thin).
export const projectTeams = [
  ['pr-01', 't-04'], ['pr-01', 't-05'],
  ['pr-02', 't-02'], ['pr-02', 't-03'], ['pr-02', 't-07'],
  ['pr-03', 't-06'], ['pr-03', 't-09'],
  ['pr-04', 't-06'], ['pr-04', 't-09'],
  ['pr-05', 't-08'],
  ['pr-06', 't-04'], ['pr-06', 't-02'],
  ['pr-07', 't-01'], ['pr-07', 't-03'], ['pr-07', 't-07'],
  ['pr-08', 't-02'], ['pr-08', 't-07'],
  ['pr-09', 't-01'], ['pr-09', 't-03'], ['pr-09', 't-09'],
  ['pr-10', 't-05'], ['pr-10', 't-08'],
];

// project_owners: [projectId, personId]
export const projectOwners = [
  ['pr-01', 'p-01'], ['pr-02', 'p-02'], ['pr-03', 'p-09'], ['pr-04', 'p-09'],
  ['pr-05', 'p-10'], ['pr-06', 'p-01'], ['pr-07', 'p-04'], ['pr-08', 'p-02'],
  ['pr-09', 'p-04'], ['pr-10', 'p-05'],
];

// ---------------------------------------------------------------------------
// Capabilities
// ---------------------------------------------------------------------------
// capabilities: [id, name, criticality]
// 28 realistic enterprise engineering skills grouped by category (see taxonomy):
// Frontend / Backend / Cloud-DevOps / Data / Architecture / AI / Process.
export const capabilities = [
  // Frontend
  ['cap-react', 'React', 74],
  ['cap-angular', 'Angular', 55],
  ['cap-typescript', 'TypeScript', 74],
  ['cap-javascript', 'JavaScript', 74],
  ['cap-redux', 'Redux', 55],
  // Backend
  ['cap-node', 'Node.js', 92],
  ['cap-java', 'Java Spring Boot', 74],
  ['cap-rest-api', 'REST API', 92],
  ['cap-microservices', 'Microservices', 92],
  ['cap-python', 'Python', 74],
  // Cloud / DevOps
  ['cap-aws', 'AWS', 92],
  ['cap-azure', 'Azure', 55],
  ['cap-docker', 'Docker', 74],
  ['cap-kubernetes', 'Kubernetes', 74],
  ['cap-cicd', 'CI/CD', 74],
  // Data
  ['cap-sql', 'SQL', 74],
  ['cap-postgres', 'PostgreSQL', 74],
  ['cap-mongodb', 'MongoDB', 55],
  ['cap-redis', 'Redis', 55],
  // Architecture
  ['cap-system-design', 'System Design', 74],
  ['cap-distributed-systems', 'Distributed Systems', 92],
  ['cap-api-design', 'API Design', 92],
  // AI / Data
  ['cap-genai', 'Generative AI', 55],
  ['cap-llm', 'LLM Integration', 55],
  ['cap-rag', 'RAG', 55],
  // Engineering process / leadership
  ['cap-agile', 'Agile/Scrum', 55],
  ['cap-jira', 'Jira', 55],
  ['cap-tech-leadership', 'Technical Leadership', 74],
];

// team_capability_coverage: [teamId, capabilityId, coverageScore]
export const teamCapabilityCoverage = [
  // Payments Engineering
  ['t-01', 'cap-node', 86], ['t-01', 'cap-rest-api', 84], ['t-01', 'cap-microservices', 80],
  ['t-01', 'cap-postgres', 78], ['t-01', 'cap-sql', 70], ['t-01', 'cap-javascript', 74],
  ['t-01', 'cap-aws', 60],
  // Frontend Engineering
  ['t-02', 'cap-react', 88], ['t-02', 'cap-typescript', 82], ['t-02', 'cap-javascript', 88],
  ['t-02', 'cap-redux', 68], ['t-02', 'cap-rest-api', 72],
  // Backend Engineering
  ['t-03', 'cap-node', 82], ['t-03', 'cap-java', 74], ['t-03', 'cap-rest-api', 84],
  ['t-03', 'cap-microservices', 80], ['t-03', 'cap-sql', 76], ['t-03', 'cap-postgres', 74],
  ['t-03', 'cap-api-design', 70],
  // Platform Engineering
  ['t-04', 'cap-kubernetes', 78], ['t-04', 'cap-docker', 82], ['t-04', 'cap-aws', 80],
  ['t-04', 'cap-cicd', 74], ['t-04', 'cap-node', 70], ['t-04', 'cap-api-design', 74],
  ['t-04', 'cap-system-design', 76],
  // Cloud & Infrastructure
  ['t-05', 'cap-aws', 86], ['t-05', 'cap-azure', 60], ['t-05', 'cap-kubernetes', 74],
  ['t-05', 'cap-docker', 76], ['t-05', 'cap-cicd', 78], ['t-05', 'cap-distributed-systems', 70],
  // Data Engineering
  ['t-06', 'cap-python', 90], ['t-06', 'cap-sql', 84], ['t-06', 'cap-postgres', 78],
  ['t-06', 'cap-mongodb', 70], ['t-06', 'cap-redis', 62], ['t-06', 'cap-genai', 60],
  ['t-06', 'cap-llm', 55], ['t-06', 'cap-rag', 55],
  // QA Engineering
  ['t-07', 'cap-javascript', 70], ['t-07', 'cap-typescript', 66], ['t-07', 'cap-react', 68],
  ['t-07', 'cap-rest-api', 64],
  // SRE / Reliability
  ['t-08', 'cap-aws', 84], ['t-08', 'cap-kubernetes', 82], ['t-08', 'cap-docker', 74],
  ['t-08', 'cap-cicd', 72], ['t-08', 'cap-distributed-systems', 80], ['t-08', 'cap-redis', 66],
  // Leadership & Architecture
  ['t-09', 'cap-system-design', 84], ['t-09', 'cap-api-design', 82],
  ['t-09', 'cap-distributed-systems', 78], ['t-09', 'cap-tech-leadership', 88],
  ['t-09', 'cap-agile', 80], ['t-09', 'cap-jira', 78],
];

// project_requirements: [projectId, capabilityId, weight]
export const projectRequirements = [
  ['pr-01', 'cap-kubernetes', 1], ['pr-01', 'cap-node', 1], ['pr-01', 'cap-aws', 0.8],
  ['pr-01', 'cap-docker', 0.8], ['pr-01', 'cap-api-design', 0.8], ['pr-01', 'cap-microservices', 0.5],
  ['pr-02', 'cap-react', 1], ['pr-02', 'cap-typescript', 0.8], ['pr-02', 'cap-javascript', 1],
  ['pr-02', 'cap-rest-api', 0.8], ['pr-02', 'cap-node', 0.8], ['pr-02', 'cap-microservices', 0.5],
  ['pr-03', 'cap-python', 1], ['pr-03', 'cap-sql', 1], ['pr-03', 'cap-postgres', 0.8],
  ['pr-03', 'cap-mongodb', 0.5], ['pr-03', 'cap-aws', 0.5],
  ['pr-04', 'cap-python', 1], ['pr-04', 'cap-genai', 0.8], ['pr-04', 'cap-llm', 0.8],
  ['pr-04', 'cap-rag', 0.5], ['pr-04', 'cap-aws', 0.8], ['pr-04', 'cap-kubernetes', 0.5],
  ['pr-05', 'cap-aws', 1], ['pr-05', 'cap-kubernetes', 1], ['pr-05', 'cap-docker', 0.8],
  ['pr-05', 'cap-distributed-systems', 1], ['pr-05', 'cap-cicd', 0.5],
  ['pr-06', 'cap-react', 1], ['pr-06', 'cap-typescript', 0.8], ['pr-06', 'cap-javascript', 1],
  ['pr-06', 'cap-api-design', 0.8], ['pr-06', 'cap-aws', 0.5], ['pr-06', 'cap-cicd', 0.5],
  ['pr-07', 'cap-node', 1], ['pr-07', 'cap-rest-api', 1], ['pr-07', 'cap-microservices', 0.8],
  ['pr-07', 'cap-postgres', 0.8], ['pr-07', 'cap-javascript', 0.8], ['pr-07', 'cap-sql', 0.5],
  ['pr-07', 'cap-aws', 0.5],
  ['pr-08', 'cap-react', 1], ['pr-08', 'cap-typescript', 0.8], ['pr-08', 'cap-javascript', 1],
  ['pr-08', 'cap-python', 0.8], ['pr-08', 'cap-postgres', 0.5], ['pr-08', 'cap-aws', 0.5],
  ['pr-09', 'cap-node', 1], ['pr-09', 'cap-rest-api', 1], ['pr-09', 'cap-postgres', 0.8],
  ['pr-09', 'cap-microservices', 0.8], ['pr-09', 'cap-javascript', 0.8], ['pr-09', 'cap-sql', 0.5],
  ['pr-09', 'cap-aws', 0.5],
  ['pr-10', 'cap-aws', 1], ['pr-10', 'cap-kubernetes', 0.8], ['pr-10', 'cap-docker', 0.5],
  ['pr-10', 'cap-distributed-systems', 0.5], ['pr-10', 'cap-redis', 0.5], ['pr-10', 'cap-cicd', 0.5],
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

// knowledge_transfer_plans: [id, areaId, ownerPersonId, targetCoverage, dueDate, status, progress, nextSessionAt, backupPersonId]
export const transferPlans = [
  ['tp-01', 'k-01', 'p-01', 65, '2026-09-20', 'in_progress', 15, '2026-08-21', null],
  ['tp-03', 'k-03', 'p-15', 75, '2026-09-25', 'todo', 0, '2026-08-24', null],
  ['tp-06', 'k-06', 'p-06', 75, '2026-09-22', 'scheduled', 40, '2026-08-22', null],
  ['tp-13', 'k-13', 'p-12', 75, '2026-10-01', 'todo', 0, '2026-08-26', 'p-24'],
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
  ['action-capacity', 'r-03', 'Rebalance Frontend Engineering capacity for four weeks', 'p-02', '2026-08-21', 'todo', 'Bring delivery pressure below 100%'],
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
  ['ev-r03-1', 'risk', 'r-03', 'planning', 'Frontend Engineering committed demand is 104% of sustainable capacity.', '2026-08-14', null],
  ['ev-r03-2', 'risk', 'r-03', 'jira', 'Two engineers carry ten open tickets between them this sprint.', '2026-08-12', 'https://hitachi.atlassian.net/browse/GRW-114'],
  ['ev-r04-1', 'risk', 'r-04', 'jira', 'Release is blocked pending a billing engine dependency change.', '2026-08-14', 'https://hitachi.atlassian.net/browse/BILL-77'],
  ['ev-r08-1', 'risk', 'r-08', 'github', 'Feature-flag rollout has no documented rollback plan.', '2026-08-13', 'https://github.com/hitachi/atlas'],
  ['ev-r10-1', 'risk', 'r-10', 'docs', 'Kubernetes upgrade is incomplete for three node pools.', '2026-08-12', 'https://wiki.hitachi/runbooks/k8s'],
  ['ev-r11-1', 'risk', 'r-11', 'pagerduty', 'Notifications service on-call has no named backup this rotation.', '2026-08-11', null],
  ['ev-r12-1', 'risk', 'r-12', 'docs', 'Data lake schema change log has not been updated in six weeks.', '2026-08-10', 'https://wiki.hitachi/architecture/datalake'],
  ['ev-r13-1', 'risk', 'r-13', 'datadog', 'Recommendation engine p95 latency rose 40% after the latest release.', '2026-08-14', null],
  ['ev-r16-1', 'risk', 'r-16', 'github', 'All recent payment releases were led by the same two engineers.', '2026-08-15', 'https://github.com/hitachi/payments-30'],
  ['ev-r17-1', 'risk', 'r-17', 'incident', 'Rate-limit misconfiguration caused a public API outage last month.', '2026-08-09', 'https://status.hitachi.io'],
  ...knowledgeAreas
    .filter(([areaId]) => areaId !== 'k-01')
    .flatMap(([areaId, name]) => [
      [`kev-${areaId}-gh`, 'knowledge_area', areaId, 'github', `The primary expert owns the majority of ${name} pull requests and incident resolutions.`, '2026-08-14', null],
      [`kev-${areaId}-inc`, 'knowledge_area', areaId, 'incident', `The primary expert resolved the most recent ${name} production incidents.`, '2026-08-12', null],
      [`kev-${areaId}-docs`, 'knowledge_area', areaId, 'docs', `${name} runbook and architecture documentation are owned by a single engineer.`, '2026-08-10', null],
      [`kev-${areaId}-jira`, 'knowledge_area', areaId, 'jira', `Only the primary expert has led ${name} changes and releases this quarter.`, '2026-08-08', null],
    ]),
];

// ---------------------------------------------------------------------------
// Staffing scenarios
// ---------------------------------------------------------------------------
// [id, name, projectId, teamId, capacityDeltaFte, capabilityDelta, tradeOff, confidence]
export const staffingScenarios = [
  ['sc-01', 'Balanced Payments team for Payments 3.0', 'pr-07', 't-01', 0.9, '+1 Node.js, +1 PostgreSQL, +1 REST API', 'Payments Engineering is already above sustainable capacity; time-box the assignment and pair the backup.', 82],
  ['sc-02', 'Growth rebalance for Checkout Modernization', 'pr-02', 't-02', 0.6, '+1 React, +1 TypeScript, +1 REST API', 'Frontend Engineering is near sustainable capacity; the rebalance reduces checkout throughput for two weeks.', 74],
  ['sc-03', 'Reliability lift for Multi-region rollout', 'pr-05', 't-08', 0.5, '+1 Kubernetes, +1 AWS, +1 Distributed Systems', 'SRE / Reliability Engineering loses a senior engineer from incident rotation for the window.', 71],
];

// scenario_changes: [id, scenarioId, personId, changeType, allocationDeltaFte, rationale]
export const scenarioChanges = [
  ['sc-01-change-1', 'sc-01', 'p-06', 'add', 0.6, 'Primary Node.js and REST API skills for the payments 3.0 build'],
  ['sc-01-change-2', 'sc-01', 'p-12', 'add', 0.6, 'Microservices and PostgreSQL depth for the integration surface'],
  ['sc-01-change-3', 'sc-01', 'p-07', 'reallocate', 0.4, 'AWS/Kubernetes coverage from Cloud & Infrastructure (time-boxed)'],
  ['sc-02-change-1', 'sc-02', 'p-08', 'reallocate', 0.5, 'React and TypeScript lead for checkout modernization'],
  ['sc-02-change-2', 'sc-02', 'p-26', 'add', 0.4, 'Checkout and Redux coverage'],
  ['sc-03-change-1', 'sc-03', 'p-16', 'reallocate', 0.5, 'Kubernetes and AWS support for multi-region rollout'],
  ['sc-03-change-2', 'sc-03', 'p-22', 'add', 0.4, 'Distributed Systems coverage for the new region'],
];

// ---------------------------------------------------------------------------
// Recognition
// ---------------------------------------------------------------------------
// [id, personId, projectId, knowledgeAreaId, contributionType, summary, occurredAt, visibility, impact(JSON)]
export const recognitions = [
  ['rec-01', 'p-10', 'pr-10', 'k-15', 'reliability', 'Led the incident review and improved the production runbook.', '2026-08-14', 'public', '["+ reduced incident resolution time", "+ improved production runbook coverage"]'],
  ['rec-02', 'p-05', 'pr-07', 'k-01', 'knowledge_sharing', 'Paired on two Payment Service changes to build backup capability.', '2026-08-12', 'public', '["+ increased Payment Service knowledge coverage", "+ reduced single-owner bus-factor"]'],
  ['rec-03', 'p-08', 'pr-02', null, 'delivery', 'Unblocked the checkout UI validation path before integration testing.', '2026-08-10', 'public', '["+ faster path to integration testing", "+ removed a delivery blocker"]'],
  ['rec-04', 'p-13', 'pr-01', 'k-16', 'reliability', 'Caught an API gateway rate-limit misconfig before it reached production.', '2026-08-11', 'private', '["+ prevented a production incident before rollout"]'],
  ['rec-05', 'p-03', 'pr-03', 'k-03', 'knowledge_sharing', 'Documented the data lake ingestion schema, unblocking two downstream teams.', '2026-08-09', 'public', '["+ increased knowledge coverage for two downstream teams", "+ unblocked downstream delivery"]'],
  ['rec-06', 'p-14', 'pr-08', 'k-08', 'delivery', 'Reduced p95 search latency by 40% via query tuning.', '2026-08-08', 'public', '["+ reduced p95 search latency 40%", "+ improved search reliability"]'],
  ['rec-07', 'p-11', 'pr-06', 'k-14', 'delivery', 'Automated the CI flakiness, saving 8 engineer-hours weekly.', '2026-08-07', 'public', '["+ saved 8 engineer-hours weekly", "+ stabilized CI pipeline"]'],
  ['rec-08', 'p-16', 'pr-05', 'k-05', 'reliability', 'Completed the Kubernetes upgrade for the remaining node pools.', '2026-08-06', 'public', '["+ completed multi-region rollout coverage", "+ reduced infrastructure risk"]'],
  ['rec-09', 'p-06', 'pr-09', 'k-06', 'mentorship', 'Cross-trained the payments team on billing engine internals.', '2026-08-05', 'public', '["+ increased billing knowledge coverage", "+ reduced payments bus-factor"]'],
  ['rec-10', 'p-09', 'pr-04', 'k-04', 'mentorship', 'Mentored two engineers through the ML inference migration.', '2026-08-04', 'private', '["+ expanded ML inference capability coverage"]'],
  ['rec-11', 'p-12', 'pr-07', 'k-13', 'reliability', 'Resolved a storage layer capacity incident during the night rotation.', '2026-08-03', 'public', '["+ resolved a storage capacity incident", "+ reduced outage risk"]'],
  ['rec-12', 'p-02', 'pr-02', 'k-11', 'mentorship', 'Rallied cross-team review coverage for the auth gateway contract.', '2026-08-02', 'public', '["+ increased review coverage for the auth gateway contract"]'],
  ['rec-13', 'p-01', 'pr-07', 'k-01', 'knowledge_sharing', 'Ran a Payment Service architecture walkthrough for the new hires.', '2026-08-01', 'private', '["+ increased Payment Service knowledge coverage among new hires"]'],
  ['rec-14', 'p-15', 'pr-03', 'k-10', 'delivery', 'Diagnosed analytics pipeline drift and proposed a re-training schedule.', '2026-07-31', 'public', '["+ improved analytics data quality", "+ enabled a re-training schedule"]'],
  ['rec-15', 'p-07', 'pr-01', 'k-05', 'delivery', 'Shipped the feature-flag rollback tooling ahead of schedule.', '2026-07-30', 'public', '["+ shipped rollback tooling ahead of schedule", "+ reduced feature-flag rollout risk"]'],
  ['rec-16', 'p-04', 'pr-05', 'k-15', 'reliability', 'Created runbooks for the observability stack across all regions.', '2026-07-29', 'public', '["+ improved observability coverage across regions", "+ reduced on-call resolution time"]'],
  ['rec-17', 'p-18', 'pr-02', 'k-02', 'delivery', 'Fixed the checkout validation regression in the test environment.', '2026-07-28', 'private', '["+ fixed a checkout validation regression"]'],
  ['rec-18', 'p-19', 'pr-01', 'k-16', 'reliability', 'Resolved the API rate-limit misconfig across three regions.', '2026-07-27', 'public', '["+ resolved rate-limit misconfig across regions", "+ reduced API outage risk"]'],
];