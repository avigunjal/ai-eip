// Capabilities domain service.

import * as repository from './capability.repository.js';

async function toCapability(row) {
  const teamCoverage = await repository.findTeamCoverage(row.id);
  const averageCoverage = teamCoverage.length
    ? Math.round(teamCoverage.reduce((sum, item) => sum + Number(item.coverage_score), 0) / teamCoverage.length)
    : 0;
  return {
    id: row.id,
    name: row.name,
    criticality: Number(row.criticality),
    coverageScore: averageCoverage,
    teamCoverage: teamCoverage.map((item) => ({
      teamId: item.team_id,
      teamName: item.team_name,
      coverageScore: Number(item.coverage_score),
    })),
  };
}

export async function listCapabilities() {
  return Promise.all((await repository.findAll()).map(toCapability));
}

export async function getCapabilityById(id) {
  const row = await repository.findById(id);
  if (!row) return null;
  return toCapability(row);
}