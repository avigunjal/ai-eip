/**
 * Backend DTO → frontend view-model adapters for the Overview module.
 *
 * Pure mapping functions: no HTTP, no React. They keep backend contracts
 * decoupled from the UI (see docs/frontend/backend-integration-guide.md §6–§7).
 * Insight mapping lives in `insights.adapter.js` (shared by Overview + Insights).
 */

/** Build the Engineering-relationships graph model from a project DTO. */
function buildChain(project) {
  const areas = project.knowledgeAreas ?? [];
  const drivers = project.risk?.drivers ?? [];
  return {
    project: {
      id: project.id,
      name: project.name,
      healthScore: project.healthScore ?? null,
      status: project.status ?? null,
      phase: project.phase ?? null,
      ownerId: project.owners?.[0]?.id ?? null,
      owner: project.owners?.[0]?.name ?? null,
    },
    teams: (project.teams ?? []).map((team) => ({ id: team.id, name: team.name })),
    people: (project.owners ?? []).map((person) => ({ id: person.id, name: person.name })),
    // Skills are the capability areas the project requires; systems are the
    // knowledge areas (services/components) the project touches.
    skills: (project.skills ?? []).map((skill) => ({ id: skill.id, name: skill.name })),
    systems: areas.map((area) => ({ id: area.id, name: area.name })),
    risks: drivers.map((driver) => ({
      id: driver.riskId,
      title: driver.title,
      category: driver.category ?? null,
      severity: driver.severity ?? null,
      score: driver.score ?? null,
      evidence: driver.evidence ?? [],
    })),
  };
}

/**
 * Map `GET /api/dashboard` → the Overview view model.
 *
 * @param {{
 *   summary?: { health?: number; projectsAtRisk?: number; criticalKnowledgeRisks?: number; highestTeamPressure?: number };
 *   projects?: Project[];
 *   knowledgeRisks?: KnowledgeArea[];
 * }} dto
 * @returns {{
 *   kpis: {
 *     health: { value: number; delta: number };
 *     projectsAtRisk: { value: number; detail: string };
 *     knowledgeConcentration: { value: number; detail: string };
 *     teamCapacity: { value: string; detail: string };
 *     recognizedImpact: { value: string; delta: number };
 *   };
 *   attention: Project[];
 *   knowledgeRisks: { id: string; name: string }[];
 *   chain: ReturnType<typeof buildChain> | null;
 * }}
 */
export function mapDashboardOverview(dto) {
  const summary = dto.summary ?? {};
  const projects = [...(dto.projects ?? [])].sort((a, b) => a.healthScore - b.healthScore);

  return {
    kpis: {
      health: { value: summary.health ?? 0, delta: 0 },
      projectsAtRisk: { value: summary.projectsAtRisk ?? 0, detail: 'require action this week' },
      knowledgeConcentration: { value: summary.criticalKnowledgeRisks ?? 0, detail: 'critical knowledge risks' },
      teamCapacity: { value: `${summary.highestTeamPressure ?? 0}%`, detail: 'highest team pressure' },
      recognizedImpact: { value: '+14%', delta: 14 },
    },
    attention: projects,
    knowledgeRisks: (dto.knowledgeRisks ?? []).map((area) => ({ id: area.id, name: area.name })),
    chain: projects[0] ? buildChain(projects[0]) : null,
  };
}