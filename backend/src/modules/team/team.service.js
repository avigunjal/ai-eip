// Teams domain service. Returns frontend-shaped team records with delivery
// pressure and a derived health score.

import * as repository from './team.repository.js';

// Delivery pressure = (committed + unplanned) / sustainable capacity.
// Sustainable capacity is treated as the committed ceiling; >100% means
// the team is operating above what it can sustain.
export function deliveryPressure(team) {
  const sustainable = Number(team.sustainable_capacity_fte);
  const committed = Number(team.committed_fte) + Number(team.unplanned_fte);
  if (!sustainable) return 0;
  return Math.round((committed / sustainable) * 100);
}

async function toTeam(row) {
  const [memberIds, projects, riskExposure] = await Promise.all([
    repository.findMemberIds(row.id),
    repository.findProjects(row.id),
    repository.findRiskExposure(row.id),
  ]);
  const averageHealth = projects.length
    ? Math.round(projects.reduce((sum, project) => sum + Number(project.health_score), 0) / projects.length)
    : 0;
  return {
    id: row.id,
    name: row.name,
    managerId: row.manager_person_id ?? null,
    sustainableCapacityFte: Number(row.sustainable_capacity_fte),
    committedFte: Number(row.committed_fte),
    unplannedFte: Number(row.unplanned_fte),
    capacityPct: deliveryPressure(row),
    deliveryPressure: deliveryPressure(row),
    healthScore: averageHealth,
    riskExposure,
    memberIds,
    projectIds: projects.map((project) => project.id),
  };
}

export async function listTeams() {
  return Promise.all((await repository.findAll()).map(toTeam));
}

export async function getTeamById(id) {
  const row = await repository.findById(id);
  if (!row) return null;
  return toTeam(row);
}