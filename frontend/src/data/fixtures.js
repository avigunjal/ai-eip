import dayjs from 'dayjs';

/**
 * Deterministic in-memory fixtures for the AI-EIP mock app.
 * Uses a seeded PRNG so the data is stable across reloads within a session.
 * All timestamps are relative to "now" so the data stays in the selected period.
 *
 * Minimum seed sizes: 10 projects, 6 teams, 28 people, 16 knowledge areas,
 * 18 risks, 30 recognition events, 12 weekly trend points.
 * Varied states: 2 critical + 3 high risks, 3 single-owner systems,
 * 2 overloaded teams, plus empty-filter and error-state triggers.
 */

// ---------- seeded PRNG ----------
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260813);

// ---------- small helpers ----------
const pick = (arr, r = rand) => arr[Math.floor(r() * arr.length)];
const between = (min, max, r = rand) => Math.floor(r() * (max - min + 1)) + min;
const daysAgo = (n) => dayjs().subtract(n, 'day').toISOString();
const weekLabel = (i) => dayjs().subtract(11 - i, 'week').format('D MMM');

// ---------- name / role pools ----------
const FIRST = [
  'Aarav', 'Emma', 'Rohan', 'Olivia', 'Priya', 'James', 'Vikram', 'Sophia', 'Arjun', 'Michael',
  'Riya', 'David', 'Kiran', 'Sarah', 'Ananya', 'Ryan', 'Ishaan', 'Emily', 'Sanjay', 'Rachel',
  'Meera', 'Daniel', 'Rahul', 'Grace', 'Divya', 'Matthew', 'Aditi', 'Christopher',
];
const LAST = [
  'Sharma', 'Johnson', 'Patel', 'Williams', 'Iyer', 'Brown', 'Singh', 'Davis', 'Reddy',
  'Miller', 'Kumar', 'Wilson', 'Nair', 'Anderson', 'Gupta', 'Thomas',
];
const ROLES = [
  'Staff Engineer', 'Senior Engineer', 'Engineer', 'Tech Lead',
  'Engineering Manager', 'SRE', 'Platform Engineer', 'Data Engineer',
];

const AVATAR_COLORS = ['#2563EB', '#0F9F8A', '#D88A12', '#7C5CE0', '#D14343', '#0DA6D6', '#3385F0', '#099F69'];

// ---------- teams ----------
const teamMeta = [
  { name: 'Platform Engineering', manager: 'Aarav Sharma' },
  { name: 'Growth Engineering', manager: 'Emma Johnson' },
  { name: 'Data Platform', manager: 'Rohan Patel' },
  { name: 'Core Infrastructure', manager: 'Priya Iyer' },
  { name: 'Developer Experience', manager: 'Arjun Singh' },
  { name: 'Payments Engineering', manager: 'Olivia Davis' },
];

// ---------- knowledge areas ----------
const areaMeta = [
  { name: 'Identity & Access Service', criticality: 5 },
  { name: 'Checkout Service', criticality: 5 },
  { name: 'Data Lake', criticality: 4 },
  { name: 'ML Inference Platform', criticality: 4 },
  { name: 'Kubernetes Platform', criticality: 5 },
  { name: 'Billing Engine', criticality: 5 },
  { name: 'Notifications Service', criticality: 3 },
  { name: 'Search Index', criticality: 4 },
  { name: 'Feature Flags', criticality: 3 },
  { name: 'Analytics Pipeline', criticality: 4 },
  { name: 'Auth Gateway', criticality: 5 },
  { name: 'Recommendation Engine', criticality: 3 },
  { name: 'Storage Layer', criticality: 5 },
  { name: 'CI/CD Pipeline', criticality: 4 },
  { name: 'Observability Stack', criticality: 4 },
  { name: 'API Gateway', criticality: 5 },
];

// ---------- people (28) ----------
const YEARS_BY_ROLE = {
  'Engineering Manager': between(12, 16),
  'Tech Lead': between(12, 16),
  'Staff Engineer': between(12, 16),
  'Senior Engineer': between(7, 11),
  'Platform Engineer': between(7, 11),
  SRE: between(7, 11),
  'Data Engineer': between(7, 11),
  Engineer: between(3, 6),
};
const people = Array.from({ length: 28 }, (_, i) => {
  const first = FIRST[i % FIRST.length];
  const last = LAST[i % LAST.length];
  const name = `${first} ${last}`;
  const teamIndex = i % teamMeta.length;
  const initials = `${first[0]}${last[0]}`;
  const numAreas = between(2, 4);
  const areaIndexes = new Set();
  while (areaIndexes.size < numAreas) areaIndexes.add(between(0, areaMeta.length - 1));
  const expertise = [...areaIndexes].map((idx) => ({
    knowledgeAreaId: `k-${String(idx + 1).padStart(2, '0')}`,
    level: pick(['primary', 'capable', 'learning']),
    lastContributionAt: daysAgo(between(1, 40)),
  }));
  const role = i % teamMeta.length === 0 ? 'Engineering Manager' : ROLES[i % ROLES.length];
  return {
    id: `p-${String(i + 1).padStart(2, '0')}`,
    name,
    initials,
    role,
    yearsOfExperience: YEARS_BY_ROLE[role] ?? between(3, 16),
    teamId: `t-${String(teamIndex + 1).padStart(2, '0')}`,
    availabilityFte: Number((between(80, 100) / 100).toFixed(2)),
    avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
    expertise,
  };
});

// Ensure a couple of people have the same area as a primary expert (for single-owner).
people[0].expertise = [{ knowledgeAreaId: 'k-01', level: 'primary', lastContributionAt: daysAgo(2) }];

// ---------- teams (6) ----------
const teams = teamMeta.map((t, i) => {
  const manager = people.find((p) => p.name === t.manager) ?? people[0];
  const memberIds = people
    .filter((p) => p.teamId === `t-${String(i + 1).padStart(2, '0')}`)
    .map((p) => p.id);
  return {
    id: `t-${String(i + 1).padStart(2, '0')}`,
    name: t.name,
    managerId: manager.id,
    capacityPct: [92, 88, 74, 66, 81, 95][i], // 92, 88, 95 = overloaded (above 85)
    healthScore: [72, 68, 81, 85, 77, 58][i],
    memberIds,
  };
});

// ---------- knowledge areas (16) ----------
// Each area carries the knowledge-risk model fields (riskScore/riskLevel,
// expertise distribution with shares, evidence, transfer plan) plus the legacy
// `criticality` (1–5) / `expertIds` fields that existing pages still consume.
const areaRiskConfig = [
  // idx: [numExperts, coverage, riskLevel, riskScore, dominantExpertShare]
  [1, 38, 'critical', 86, 85],
  [3, 82, 'low', 22, 45],
  [1, 52, 'high', 64, 80],
  [2, 71, 'medium', 48, 62],
  [4, 64, 'medium', 40, 40],
  [1, 45, 'high', 71, 78],
  [2, 78, 'low', 24, 50],
  [3, 88, 'low', 18, 38],
  [2, 90, 'low', 15, 52],
  [3, 72, 'medium', 38, 46],
  [4, 60, 'medium', 44, 42],
  [2, 80, 'low', 20, 55],
  [3, 55, 'high', 58, 66],
  [3, 86, 'low', 16, 40],
  [2, 74, 'medium', 33, 58],
  [3, 69, 'medium', 36, 47],
];
// ---------- evidence for knowledge areas ----------
const evidenceSources = [
  { label: 'Pull request', source: 'github', statement: 'Led service PRs and incident resolutions.' },
  { label: 'Runbook ownership', source: 'docs', statement: 'Only named owner of the runbook and deployment procedure.' },
  { label: 'Production change', source: 'jira', statement: 'Completed a change but has not led a release or incident response.' },
  { label: 'Architecture doc', source: 'docs', statement: 'Architecture document last meaningfully updated recently.' },
  { label: 'Incident resolution', source: 'incident', statement: 'Resolved the most recent production incident.' },
  { label: 'On-call rotation', source: 'pagerduty', statement: 'No confirmed backup for on-call coverage.' },
];
function buildEvidenceFor(i, name) {
  const count = between(2, 4);
  return Array.from({ length: count }, (_, s) => {
    const src = evidenceSources[(i + s) % evidenceSources.length];
    return {
      id: `kev-${i + 1}-${s + 1}`,
      source: src.source,
      statement: `${src.label}: ${src.statement} (${name}).`,
      occurredAt: daysAgo(between(1, 20)),
      url: 'https://github.com/hitachi',
    };
  });
}

const knowledgeAreas = areaMeta.map((a, i) => {
  const [numExperts, coverage, riskLevel, riskScore, dominantExpertShare] = areaRiskConfig[i];
  const expertIds = [];
  const pool = [...people];
  while (expertIds.length < numExperts && pool.length) {
    const idx = between(0, pool.length - 1);
    expertIds.push(pool[idx].id);
    pool.splice(idx, 1);
  }
  const expertise = expertIds.map((personId, k) => {
    const level = k === 0 ? 'primary' : k === 1 ? 'capable' : 'learning';
    const share = k === 0 ? dominantExpertShare : Math.max(4, Math.round((100 - dominantExpertShare) / (expertIds.length - 1 || 1)));
    return {
      personId,
      level,
      share,
      lastContributionAt: daysAgo(between(1, 40)),
      backupOwner: k === 1,
    };
  });
  return {
    id: `k-${String(i + 1).padStart(2, '0')}`,
    name: a.name,
    type: 'service',
    criticality: a.criticality,
    criticalityScore: a.criticality === 5 ? 92 : a.criticality === 4 ? 74 : a.criticality === 3 ? 55 : 40,
    coverage,
    documentationFreshnessDays: between(5, 120),
    riskScore,
    riskLevel,
    dominantExpertShare,
    expertIds,
    expertise,
    evidence: buildEvidenceFor(i, a.name),
    transferPlanId: riskLevel === 'critical' || riskLevel === 'high' ? `tp-${String(i + 1).padStart(2, '0')}` : undefined,
    linkedProjectIds: [],
  };
});

// Flagship example per spec: k-01 is the "Payment Service"-style critical
// single-owner service with an 85% / 10% / 5% expertise distribution.
knowledgeAreas[0].name = 'Payment Service';
knowledgeAreas[0].type = 'service';
knowledgeAreas[0].criticalityScore = 92;
knowledgeAreas[0].riskScore = 86;
knowledgeAreas[0].riskLevel = 'critical';
knowledgeAreas[0].coverage = 38;
knowledgeAreas[0].dominantExpertShare = 85;
knowledgeAreas[0].documentationFreshnessDays = 47;
knowledgeAreas[0].expertise = [
  { personId: 'p-01', level: 'primary', share: 85, lastContributionAt: daysAgo(2), backupOwner: false },
  { personId: 'p-05', level: 'learning', share: 10, lastContributionAt: daysAgo(18), backupOwner: false },
  { personId: 'p-09', level: 'unverified', share: 5, lastContributionAt: daysAgo(60), backupOwner: false },
];
knowledgeAreas[0].expertIds = knowledgeAreas[0].expertise.map((e) => e.personId);
knowledgeAreas[0].transferPlanId = 'tp-01';

knowledgeAreas[0].evidence = [
  {
    id: 'kev-ps-1', source: 'github',
    statement: '83% of service pull requests and all three recent production incident resolutions were led by the primary expert.',
    occurredAt: daysAgo(2), url: 'https://github.com/hitachi/payment',
  },
  {
    id: 'kev-ps-2', source: 'docs',
    statement: 'Primary expert is the only named owner for the payment runbook and deployment procedure.',
    occurredAt: daysAgo(5), url: 'https://wiki.hitachi/runbooks/payment',
  },
  {
    id: 'kev-ps-3', source: 'jira',
    statement: 'Backup completed two recent changes but has not led a release or incident response.',
    occurredAt: daysAgo(9), url: 'https://hitachi.atlassian.net/browse/PAY-221',
  },
  {
    id: 'kev-ps-4', source: 'docs',
    statement: 'The architecture document was last updated 47 days ago.',
    occurredAt: daysAgo(12), url: 'https://wiki.hitachi/architecture/payment',
  },
];

// ---------- transfer plans ----------
// One plan per Critical/High area that declared a transferPlanId, so every
// plan links to a distinct knowledge area (k-01 Payment Service, k-03, k-06, k-13).
const transferPlanStatus = ['todo', 'scheduled', 'in_progress', 'todo'];
const atRiskAreas = knowledgeAreas.filter((a) => a.transferPlanId);
const transferPlans = atRiskAreas.map((area, i) => {
  const id = area.transferPlanId;
  const fromCoverage = area.coverage ?? 40;
  const targetCoverage = Math.min(90, fromCoverage + 27);
  const primary = area.expertise?.[0]?.personId ?? people[0].id;
  const backup = area.expertise?.[1]?.personId ?? people[1].id;
  return {
    id,
    title: `Raise coverage for ${area.name}`,
    areaId: area.id,
    riskLevel: area.riskLevel,
    ownerId: primary,
    backupOwnerId: backup,
    nextSessionAt: daysAgo(-between(1, 9)),
    dueDate: daysAgo(-between(12, 30)),
    status: transferPlanStatus[i % transferPlanStatus.length],
    progress: [15, 40, 65, 0][i % 4],
    fromCoverage,
    targetCoverage,
    actions: [
      { id: `${id}-a1`, title: 'Assign backup ownership', ownerId: backup, dueDate: daysAgo(-6), status: i === 2 ? 'in_progress' : 'todo', expectedOutcome: 'Named on-call/release backup' },
      { id: `${id}-a2`, title: 'Pair on real work', ownerId: primary, dueDate: daysAgo(-9), status: i === 2 ? 'scheduled' : 'todo', expectedOutcome: 'Backup completes a production change' },
      { id: `${id}-a3`, title: 'Update operational runbook', ownerId: primary, dueDate: daysAgo(-12), status: 'todo', expectedOutcome: 'Fresh incident/release guide' },
      { id: `${id}-a4`, title: 'Backup leads a supervised release', ownerId: backup, dueDate: daysAgo(-18), status: 'todo', expectedOutcome: 'Validate operational readiness' },
    ],
  };
});

// ---------- coverage history (12 weeks) for each knowledge area ----------
knowledgeAreas.forEach((a) => {
  a.coverageHistory = Array.from({ length: 12 }, (_, wk) => ({
    date: weekLabel(wk),
    coverage: Math.max(5, Math.min(98, a.coverage - between(0, 20) + wk)),
  }));
});

// ---------- clients (service-based org) ----------
const clientMeta = [
  { name: 'Zenith Retail Group' },
  { name: 'Meridian Financial' },
  { name: 'Aurelia Health Systems' },
  { name: 'Orbit Logistics' },
];

// ---------- projects (10) ----------
const projectMeta = [
  { name: 'Atlas Platform Migration', client: 'Zenith Retail Group', status: 'at_risk', team: 'Platform Engineering', type: 'migration', phase: 'implementation', description: 'Migration of legacy platform services to Kubernetes architecture.' },
  { name: 'Checkout Modernization', client: 'Zenith Retail Group', status: 'at_risk', team: 'Growth Engineering', type: 'modernization', phase: 'implementation', description: 'Modernization of checkout services to an event-driven architecture.' },
  { name: 'Data Lake Consolidation', client: 'Meridian Financial', status: 'on_track', team: 'Data Platform', type: 'migration', phase: 'design', description: 'Consolidation of siloed data warehouses into a single analytics data lake.' },
  { name: 'ML Inference at Scale', client: 'Meridian Financial', status: 'on_track', team: 'Data Platform', type: 'research', phase: 'implementation', description: 'Scaling ML inference workloads with lower-latency serving infrastructure.' },
  { name: 'Multi-region Reliability', client: 'Aurelia Health Systems', status: 'at_risk', team: 'Core Infrastructure', type: 'platform', phase: 'implementation', description: 'Extending service reliability across multiple cloud regions.' },
  { name: 'Developer Portal', client: 'Aurelia Health Systems', status: 'on_track', team: 'Developer Experience', type: 'platform', phase: 'release', description: 'Self-service developer portal for internal platform tooling.' },
  { name: 'Payments 3.0', client: 'Meridian Financial', status: 'at_risk', team: 'Payments Engineering', type: 'migration', phase: 'implementation', description: 'Replatforming payment services to the new Payments 3.0 architecture.' },
  { name: 'Search Relevance', client: 'Zenith Retail Group', status: 'on_track', team: 'Growth Engineering', type: 'new_feature', phase: 'testing', description: 'Improving search ranking and relevance for the product catalog.' },
  { name: 'Billing Upgrade', client: 'Orbit Logistics', status: 'paused', team: 'Payments Engineering', type: 'modernization', phase: 'design', description: 'Migration of billing services to a new payment gateway with improved reliability and transaction processing.' },
  { name: 'Observability Rollout', client: 'Orbit Logistics', status: 'complete', team: 'Core Infrastructure', type: 'maintenance', phase: 'complete', description: 'Rolling out standard observability tooling to all production services.' },
];

const drivers = [
  'API contract pending', 'Single SME for auth service', '2 engineers over capacity',
  'Dependency on billing engine', 'Documentation gaps', 'Knowledge concentration',
  'Schedule slip', 'Review coverage declining', 'Unplanned ops load', 'Quality regressions',
];

const clients = clientMeta.map((c, i) => ({
  id: `cl-${String(i + 1).padStart(2, '0')}`,
  name: c.name,
}));
const clientByName = Object.fromEntries(clients.map((c) => [c.name, c.id]));

const projects = projectMeta.map((pm, i) => {
  const team = teams.find((t) => t.name === pm.team) ?? teams[0];
  const healthScore = pm.status === 'at_risk' ? between(40, 62) : pm.status === 'paused' ? 30 : between(72, 92);
  const trend = Array.from({ length: 12 }, (_, wk) => {
    const base = healthScore + between(-6, 6);
    return { date: weekLabel(wk), score: Math.max(15, Math.min(100, base)) };
  });
  return {
    id: `pr-${String(i + 1).padStart(2, '0')}`,
    name: pm.name,
    description: pm.description,
    type: pm.type,
    phase: pm.phase,
    clientId: clientByName[pm.client],
    status: pm.status,
    healthScore,
    healthDelta: between(-8, 9),
    deliveryConfidence: Math.max(30, Math.min(98, healthScore + between(-6, 6))),
    targetDate: daysAgo(between(-60, 150)),
    teamIds: [team.id],
    teamSize: team.memberIds.length,
    ownerIds: team.memberIds.slice(0, between(1, 3)),
    topDriver: drivers[i % drivers.length],
    trend,
  };
});

// link knowledge areas to projects
projects.forEach((proj, i) => {
  const areaIdx = (i * 2) % knowledgeAreas.length;
  const areas = [areaIdx, (areaIdx + 1) % knowledgeAreas.length];
  areas.forEach((a) => {
    if (!knowledgeAreas[a].linkedProjectIds.includes(proj.id)) {
      knowledgeAreas[a].linkedProjectIds.push(proj.id);
    }
  });
});

// derive project AI metadata + knowledgeAreas from the linked areas above
projects.forEach((proj) => {
  proj.knowledgeAreas = knowledgeAreas
    .filter((area) => area.linkedProjectIds.includes(proj.id))
    .map((area) => ({ id: area.id, name: area.name }));
  proj.aiMetadata = {
    lastAnalyzedAt: '2026-08-16',
    confidence: between(70, 95),
    signalsUsed: ['technical_dependency', 'knowledge_dependency', 'team_capacity', 'delivery_history'],
  };
});

// ---------- risks (18) ----------
const riskTitles = [
  'API contract for payments not yet finalized',
  'Single SME owns auth service knowledge',
  'Two engineers exceed sustainable capacity',
  'Billing engine dependency blocking release',
  'ML inference model drift unaddressed',
  'Checkout service documentation out of date',
  'Observability coverage gaps in EU region',
  'Feature-flag rollout lacks rollback plan',
  'Search index performance regression',
  'Kubernetes upgrade incomplete',
  'Notification service has no on-call backup',
  'Data lake schema changes undocumented',
  'Recommendation engine latency spike',
  'Storage layer capacity near threshold',
  'CI/CD pipeline flaky in staging',
  'Payments team lacks cross-training',
  'API gateway rate-limit misconfig risk',
  'Analytics pipeline data-quality issues',
];

const categoryFor = [
  'dependency', 'knowledge', 'capacity', 'dependency', 'quality',
  'knowledge', 'quality', 'schedule', 'quality', 'schedule',
  'capacity', 'knowledge', 'quality', 'capacity', 'quality',
  'knowledge', 'dependency', 'quality',
];

const severityFor = [
  'critical', 'high', 'high', 'medium', 'high',
  'medium', 'low', 'medium', 'medium', 'low',
  'medium', 'low', 'low', 'high', 'low',
  'medium', 'critical', 'low',
];

const riskSignalSources = [
  { label: 'Delayed PR merge times', source: 'GitHub' },
  { label: 'Blocked ticket in sprint', source: 'Jira' },
  { label: 'Declining review coverage', source: 'GitHub' },
  { label: 'Elevated error rate', source: 'Datadog' },
  { label: 'Unplanned on-call pages', source: 'PagerDuty' },
];

const risks = riskTitles.map((title, i) => {
  const numSignals = between(2, 4);
  const signals = Array.from({ length: numSignals }, (_, s) => {
    const src = riskSignalSources[(i + s) % riskSignalSources.length];
    return {
      id: `sig-${i + 1}-${s + 1}`,
      label: src.label,
      source: src.source,
      occurredAt: daysAgo(between(1, 14)),
      url: 'https://github.com/hitachi',
    };
  });
  const probability = between(30, 90);
  const impact = between(30, 90);
  return {
    id: `r-${String(i + 1).padStart(2, '0')}`,
    title,
    projectId: projects[i % projects.length].id,
    severity: severityFor[i],
    category: categoryFor[i],
    confidence: between(70, 95),
    probability,
    impact,
    trend: pick(['rising', 'stable', 'improving']),
    status: i < 6 ? 'open' : i < 12 ? 'monitoring' : 'mitigated',
    ownerId: people[i % people.length].id,
    lastSignalAt: daysAgo(between(0, 5)),
    signals,
  };
});

// ---------- recognitions (30) ----------
const recognitionSummaries = [
  'Caught a race condition in the auth service before it hit production.',
  'Led the on-call rotation during the incident, stabilizing checkout.',
  'Mentored three engineers through the Kubernetes migration.',
  'Documented the data lake schema, unblocking two downstream teams.',
  'Reduced p95 latency on search by 40% via query tuning.',
  'Shipped the feature-flag rollback tooling ahead of schedule.',
  'Cross-trained the payments team on billing engine internals.',
  'Rallied cross-team review coverage for the API contract.',
  'Diagnosed the ML drift and proposed a re-training schedule.',
  'Automated the CI flakiness, saving 8 engineer-hours weekly.',
  'Created runbooks for the observability stack.',
  'Resolved the rate-limit misconfig across three regions.',
];

const recognitionTypes = ['reliability', 'mentorship', 'delivery', 'knowledge_sharing'];

const recognitions = Array.from({ length: 30 }, (_, i) => ({
  id: `rec-${String(i + 1).padStart(2, '0')}`,
  personId: people[i % people.length].id,
  type: recognitionTypes[i % recognitionTypes.length],
  summary: recognitionSummaries[i % recognitionSummaries.length],
  evidenceIds: [`ev-${i + 1}`, `ev-${i + 2}`],
  occurredAt: daysAgo(between(0, 30)),
  visibility: i % 3 === 0 ? 'private' : 'public',
}));

// ---------- derived lookups ----------
const byId = (list) => Object.fromEntries(list.map((x) => [x.id, x]));

export const personById = byId(people);
export const teamById = byId(teams);
export const projectById = byId(projects);
export const knowledgeAreaById = byId(knowledgeAreas);
export const transferPlanById = byId(transferPlans);
export const riskById = byId(risks);
export const clientById = byId(clients);

export { people, teams, projects, knowledgeAreas, transferPlans, risks, recognitions, clients };

/**
 * The set of system ids considered "single-owner": either only one person has
 * expertise, or no one is a confirmed capable backup owner.
 */
export const singleOwnerSystemIds = knowledgeAreas
  .filter((a) => {
    const hasBackup = (a.expertise ?? []).some((x) => x.level === 'capable');
    return a.expertIds.length <= 1 || !hasBackup;
  })
  .map((a) => a.id);

/** The teams considered overloaded (above sustainable capacity, 85%). */
export const overloadedTeamIds = teams
  .filter((t) => t.capacityPct > 85)
  .map((t) => t.id);
