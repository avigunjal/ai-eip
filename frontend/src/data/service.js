import {
  people,
  teams,
  projects,
  knowledgeAreas,
  risks,
  recognitions,
  clients,
  personById,
  teamById,
  projectById,
  knowledgeAreaById,
  clientById,
  singleOwnerSystemIds,
} from './fixtures.js';

/**
 * In-memory data service. Mirrors an API surface: async fetchers with a small
 * simulated delay (so loading/skeleton states are real), plus synchronous
 * getters/selectors used by pages after load.
 */

const simulateLatency = (ms = 450) => new Promise((resolve) => setTimeout(resolve, ms));

// ---------------------------------------------------------------------------
// Fetchers (async)
// ---------------------------------------------------------------------------
export async function fetchRisks() { await simulateLatency(500); return risks; }

// ---------------------------------------------------------------------------
// Synchronous getters
// ---------------------------------------------------------------------------
export const getProjects = () => projects;
export const getProject = (id) => projectById[id] ?? null;
export const getRisks = () => risks;
export const getRisk = (id) => risks.find((r) => r.id === id) ?? null;
export const getTeams = () => teams;
export const getTeam = (id) => teamById[id] ?? null;
export const getPeople = () => people;
export const getPerson = (id) => personById[id] ?? null;
export const getKnowledgeAreas = () => knowledgeAreas;
export const getRecognitions = () => recognitions;

export const getRisksForProject = (projectId) => risks.filter((r) => r.projectId === projectId);
export const getProjectsForTeam = (teamId) => projects.filter((p) => p.teamIds.includes(teamId));
export const getProjectsForArea = (areaId) =>
  (knowledgeAreaById[areaId]?.linkedProjectIds ?? [])
    .map((id) => projectById[id])
    .filter(Boolean);

export const getClients = () => clients;
export const getClient = (id) => clientById[id] ?? null;

/** Group projects under their client for the Client → Project → System tree. */
export function projectsByClient() {
  return clients.map((client) => ({
    client,
    projects: projects.filter((p) => p.clientId === client.id),
  }));
}

/** Systems (knowledge areas) linked to a project, with resolved names. */
export function getAreasForProject(projectId) {
  return projects
    .find((p) => p.id === projectId)
    ?.linkedProjectIds?.map((id) => knowledgeAreaById[id])
    .filter(Boolean);
}

/**
 * Resolve the client → project → system (module) chain for a knowledge area.
 * An area can be linked to multiple projects; returns one entry per linked
 * project with the resolved client. Use for breadcrumbs and risk context.
 */
export function areaHierarchy(areaId) {
  const area = knowledgeAreaById[areaId];
  if (!area) return [];
  return (area.linkedProjectIds ?? [])
    .map((projectId) => {
      const project = projectById[projectId];
      if (!project) return null;
      return {
        areaId: area.id,
        areaName: area.name,
        projectId: project.id,
        projectName: project.name,
        clientId: project.clientId,
        clientName: clientById[project.clientId]?.name ?? '—',
      };
    })
    .filter(Boolean);
}

// ---------------------------------------------------------------------------
// Derived selectors (typed aggregates)
// ---------------------------------------------------------------------------

/** Overview KPIs: engineering health, projects at risk, knowledge concentration, team capacity, recognized impact. */
export function overviewKpis() {
  const avgHealth = Math.round(projects.reduce((s, p) => s + p.healthScore, 0) / projects.length);
  const atRisk = projects.filter((p) => p.status === 'at_risk').length;
  const criticalSingleOwner = singleOwnerSystemIds.length;
  const avgCapacity = Math.round(teams.reduce((s, t) => s + t.capacityPct, 0) / teams.length);
  const overloaded = teams.filter((t) => t.capacityPct > 85).length;
  return {
    health: { value: avgHealth, delta: 4 },
    projectsAtRisk: { value: atRisk, detail: 'require action this week' },
    knowledgeConcentration: { value: 'High', detail: `${criticalSingleOwner} critical single-owner areas` },
    teamCapacity: { value: `${avgCapacity}%`, detail: `${overloaded} teams above sustainable load` },
    recognizedImpact: { value: '+14%', delta: 14 },
  };
}

/** Projects sorted by risk, top drivers surfaced. */
export function projectsNeedingAttention(limit = 5) {
  return [...projects]
    .sort((a, b) => a.healthScore - b.healthScore)
    .slice(0, limit);
}

/** Average health grouped by team (for "Health by team" bars). */
export function healthByTeam() {
  return teams.map((t) => {
    const teamProjects = projects.filter((p) => p.teamIds.includes(t.id));
    const avg = teamProjects.length
      ? Math.round(teamProjects.reduce((s, p) => s + p.healthScore, 0) / teamProjects.length)
      : 0;
    return { teamId: t.id, team: t.name, avgHealth: avg, count: teamProjects.length };
  });
}

/** Delivery-confidence buckets for the donut chart. */
export function deliveryConfidenceDistribution() {
  const buckets = { high: 0, medium: 0, low: 0 };
  projects.forEach((p) => {
    if (p.deliveryConfidence >= 75) buckets.high += 1;
    else if (p.deliveryConfidence >= 45) buckets.medium += 1;
    else buckets.low += 1;
  });
  return [
    { name: 'High confidence', value: buckets.high, color: 'var(--teal)' },
    { name: 'Medium confidence', value: buckets.medium, color: 'var(--amber)' },
    { name: 'Low confidence', value: buckets.low, color: 'var(--red)' },
  ];
}

/** Risk register summary counts. */
export function riskSummary() {
  return {
    critical: risks.filter((r) => r.severity === 'critical').length,
    high: risks.filter((r) => r.severity === 'high').length,
    rising: risks.filter((r) => r.trend === 'rising').length,
    overdueActions: 2,
  };
}

/** Risk counts by severity and category (for stacked bars). */
export function riskBySeverityAndCategory() {
  const categories = ['schedule', 'dependency', 'knowledge', 'capacity', 'quality'];
  const severities = ['critical', 'high', 'medium', 'low'];
  return categories.map((cat) => ({
    category: cat,
    ...Object.fromEntries(severities.map((sev) => [sev, risks.filter((r) => r.category === cat && r.severity === sev).length])),
  }));
}

/** Knowledge coverage trend (last 12 weeks of a sample index, for KPI). */
export function coverageTrend() {
  return Array.from({ length: 12 }, (_, i) => ({
    date: `W${i + 1}`,
    coverage: 55 + Math.round(Math.sin(i / 2) * 6) + i,
  }));
}

/** Critical systems ranked by coverage (ascending) for the knowledge card. */
export function criticalSystems() {
  return [...knowledgeAreas].sort((a, b) => a.coverage - b.coverage);
}

/** Single-owner systems (only one primary expert) with resolved names, ranked by criticality. */
export function singleOwnerSystems() {
  return knowledgeAreas
    .filter((a) => singleOwnerSystemIds.includes(a.id))
    .sort((a, b) => b.criticality - a.criticality)
    .map((a) => ({ id: a.id, name: a.name, criticality: a.criticality }));
}

// ---------------------------------------------------------------------------
// Knowledge risk module selectors
// ---------------------------------------------------------------------------

/** Resolve an area's expertise entries to full person objects. */
export function expertiseForArea(area) {
  return (area.expertise ?? []).map((x) => ({ ...x, person: personById[x.personId] ?? null }));
}

/** Knowledge areas sorted so high-risk, low-coverage areas come first. */

/** AI-suggested knowledge-transfer opportunities with expected coverage gain. */
export function transferOpportunities() {
  const opportunities = knowledgeAreas
    .filter((a) => a.riskLevel === 'critical' || a.riskLevel === 'high')
    .slice(0, 4)
    .map((a) => {
      const primary = a.expertise?.find((x) => x.level === 'primary');
      const learner = a.expertise?.find((x) => x.level === 'learning' || x.level === 'capable');
      const learnerId = learner?.personId ?? people[1].id;
      return {
        areaId: a.id,
        areaName: a.name,
        primaryName: primary ? personById[primary.personId]?.name : '—',
        learnerId,
        learnerName: personById[learnerId]?.name,
        expectedGain: `${Math.min(60, 27 + (a.coverage % 20))} pts`,
        effort: a.riskLevel === 'critical' ? 'High' : 'Medium',
      };
    });
  return opportunities;
}

/**
 * Engineering relationship chain for a project:
 * Projects → Teams → People → Skills → Knowledge → Risk.
 * Returns the resolved entities so a card can render each hop with live links.
 */
