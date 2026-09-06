// Current-state signal detection and the deterministic delivery-exposure model.
//
// These are pure functions of the seeded data. The exposure model collapses the
// four raw signals (risk score, team pressure, capability coverage, knowledge
// concentration) into one 0-100 delivery-exposure number that every simulated
// option is measured against.

import { DEMO_TODAY, severityFor } from '../../shared/constants/index.js';
import { getProjectById } from '../project/project.service.js';
import { listTeams } from '../team/team.service.js';
import { listAreas } from '../knowledge/knowledge.service.js';
import { findRequirements, findCandidates } from '../team-composer/team-composer.repository.js';
import { levelScore } from '../team-composer/skill-matcher.service.js';
import { CAPACITY_PENALTY_PER_POINT, EXPOSURE_WEIGHTS, URGENCY_FACTORS, daysBetween } from './decision.config.js';
import * as repository from './decision.repository.js';

// Team-level coverage: the best capability level available across everyone on
// the project's teams wins the weight for each requirement.
export function teamCoverageScore(personCardsList, requirements) {
  const best = new Map();
  for (const cards of personCardsList) {
    for (const card of cards) {
      const existing = levelScore(best.get(card.capability_id));
      if (levelScore(card.level) > existing) best.set(card.capability_id, card.level);
    }
  }
  let matchedWeight = 0;
  let totalWeight = 0;
  for (const requirement of requirements) {
    const level = best.get(requirement.capability_id);
    totalWeight += Number(requirement.weight);
    if (level) matchedWeight += Number(requirement.weight) * levelScore(level);
  }
  const score = totalWeight ? Math.round((matchedWeight / totalWeight) * 100) : 100;
  const matched = requirements.filter((requirement) => best.has(requirement.capability_id)).map((requirement) => requirement.capability_id);
  const missing = requirements.filter((requirement) => !best.has(requirement.capability_id)).map((requirement) => requirement.capability_id);
  return { score, matched, missing };
}

// Replicates the knowledge-risk single-owner / backup detection over a DTO area.
function singleOwnerOf(area) {
  if (!area) return false;
  const owner = area.expertise.find((entry) => entry.level === 'primary');
  const hasBackup = area.expertise.some((entry) => entry.personId !== owner?.personId && ['capable', 'primary'].includes(entry.level));
  return area.dominantExpertShare >= 70 && !hasBackup;
}

// The deterministic delivery-exposure collapse.
export function computeExposure(signals, remainingDays) {
  const capacityPenalty = signals.capacity.pressure < 100
    ? 0
    : Math.min(100, (signals.capacity.pressure - 100) * CAPACITY_PENALTY_PER_POINT);
  const skillGap = 100 - signals.coverage.score;
  const base = Math.round(
    EXPOSURE_WEIGHTS.risk * signals.risk.score
    + EXPOSURE_WEIGHTS.capacity * capacityPenalty
    + EXPOSURE_WEIGHTS.skillGap * skillGap
    + EXPOSURE_WEIGHTS.knowledge * signals.knowledge.concentration,
  );
  const urgency = URGENCY_FACTORS.find((entry) => remainingDays <= entry.maxDays) ?? URGENCY_FACTORS[URGENCY_FACTORS.length - 1];
  const score = Math.min(100, Math.round(base * urgency.factor));
  return {
    score,
    label: severityFor(score),
    severity: severityFor(score),
    urgencyFactor: urgency.factor,
    remainingDays,
    components: {
      risk: Math.round(EXPOSURE_WEIGHTS.risk * signals.risk.score),
      capacityPenalty,
      skillGap,
      knowledge: Math.round(EXPOSURE_WEIGHTS.knowledge * signals.knowledge.concentration),
    },
  };
}

// Everything the simulator needs for one project, computed once per request.
export async function buildDecisionContext(projectId) {
  const [project, teams, areas, requirements, linkedAreas, candidates] = await Promise.all([
    getProjectById(projectId),
    listTeams(),
    listAreas(),
    Promise.resolve(findRequirements(projectId)),
    Promise.resolve(repository.findLinkedAreas(projectId)),
    Promise.resolve(findCandidates()),
  ]);
  if (!project) return null;

  const members = repository.findProjectMemberCards(projectId);
  const projectTeams = teams.filter((team) => project.teamIds?.includes(team.id));
  const busiest = [...projectTeams].sort((a, b) => b.deliveryPressure - a.deliveryPressure)[0];
  const requirementsCoverage = teamCoverageScore(members.map((member) => member.capabilities), requirements);

  const linkedAreaIds = linkedAreas.map((area) => area.id);
  const linkedAreaDTOs = areas.filter((area) => linkedAreaIds.includes(area.id));
  const riskyArea = [...linkedAreaDTOs].sort((a, b) => b.riskScore - a.riskScore)[0];

  const risk = {
    score: Number(project.risk.score),
    severity: project.risk.severity,
    confidence: Number(project.risk.confidence),
    drivers: project.risk.drivers,
  };
  const capacity = {
    pressure: busiest?.deliveryPressure ?? 0,
    teamId: busiest?.id ?? null,
    teamName: busiest?.name ?? null,
    team: busiest ?? null,
  };
  const coverage = {
    // Skill coverage for the exposure model is the critical knowledge-area
    // coverage (Payment Service at 38%) — the team already covers every generic
    // skill card, so this is the meaningful capability gap.
    score: riskyArea?.coverage ?? requirementsCoverage.score,
    requirementScore: requirementsCoverage.score,
    matched: requirementsCoverage.matched,
    missing: requirementsCoverage.missing,
  };
  const knowledge = {
    concentration: riskyArea?.riskScore ?? 0,
    severity: riskyArea?.riskLevel ?? 'low',
    areaId: riskyArea?.id ?? null,
    areaName: riskyArea?.name ?? null,
    coverage: riskyArea?.coverage ?? 0,
    dominantShare: riskyArea?.dominantExpertShare ?? 0,
    singleOwner: singleOwnerOf(riskyArea),
    expertise: riskyArea ? riskyArea.expertise.map((entry) => ({ ...entry })) : [],
  };

  const currentSignals = {
    risk,
    capacity: { ...capacity, team: undefined },
    coverage,
    knowledge: { ...knowledge, expertise: knowledge.expertise },
    remainingDays: daysBetween(DEMO_TODAY, project.targetDate),
  };
  currentSignals.exposure = computeExposure(currentSignals, currentSignals.remainingDays);

  return {
    project: {
      id: project.id,
      name: project.name,
      description: project.description,
      phase: project.phase,
      status: project.status,
      targetDate: project.targetDate,
      healthScore: Number(project.healthScore),
      deliveryConfidence: Number(project.deliveryConfidence),
      ownerIds: project.ownerIds,
    },
    demoToday: DEMO_TODAY,
    currentSignals,
    teams,
    projectTeams,
    members,
    requirements,
    linkedAreas,
    linkedAreaDTOs,
    candidates,
  };
}

// Lightweight current-state summary for the project context endpoint.
export async function getCurrentSignals(projectId) {
  const context = await buildDecisionContext(projectId);
  if (!context) return null;
  return {
    project: context.project,
    demoToday: context.demoToday,
    currentSignals: context.currentSignals,
    teams: context.projectTeams.map((team) => ({
      id: team.id, name: team.name, capacityPct: team.deliveryPressure,
    })),
    knowledgeAreas: context.linkedAreaDTOs.map((area) => ({
      id: area.id, name: area.name, riskScore: area.riskScore, riskLevel: area.riskLevel,
      coverage: area.coverage, dominantShare: area.dominantExpertShare,
    })),
    requirements: context.requirements,
  };
}

export { severityFor, daysBetween };