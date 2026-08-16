// Dashboard aggregation: executive overview built from project, knowledge,
// team, and insight services. Pure orchestration — no HTTP concerns.

import { listProjects } from '../project/project.service.js';
import { listAreas } from '../knowledge/knowledge.service.js';
import { listTeams } from '../team/team.service.js';
import { listInsights } from '../insight/insight.service.js';

function average(values) {
  return values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;
}

export async function getOverview() {
  const [projects, areas, teams] = await Promise.all([listProjects(), listAreas(), listTeams()]);
  const atRisk = projects.filter((project) => project.status === 'at_risk');
  const criticalKnowledge = areas.filter((area) => area.riskLevel === 'critical');
  const maxPressure = Math.max(0, ...teams.map((team) => team.deliveryPressure));
  return {
    summary: {
      health: average(projects.map((project) => project.healthScore)),
      projectsAtRisk: atRisk.length,
      criticalKnowledgeRisks: criticalKnowledge.length,
      highestTeamPressure: maxPressure,
    },
    projects: projects.slice(0, 5),
    knowledgeRisks: criticalKnowledge,
    teams,
  };
}

export async function getInsights() {
  return listInsights();
}