// Team composer service. Recommends a balanced team for a project from
// capability coverage, penalizing over-allocation, and persists the choice as
// a staffing scenario. Deterministic: no randomness, scores recomputable.

import * as repository from './team-composer.repository.js';
import { matchCapabilities } from './skill-matcher.service.js';
import { deliveryPressure } from '../team/team.service.js';

const TEAM_SIZE = 4;
const GAP_CONFIDENCE = 68;
const FULL_CONFIDENCE = 82;

// People on already-overloaded teams cost extra fit points (capacity risk).
function pressurePenalty(team) {
  if (!team) return 0;
  return Math.max(0, (deliveryPressure(team) - 100) * 0.25);
}

async function rankCandidates(requirements) {
  const candidates = await repository.findCandidates();
  return candidates
    .map((person) => {
      const fit = matchCapabilities(person.capabilities, requirements);
      const penalty = pressurePenalty(repository.findTeam(person.team_id));
      return {
        id: person.id,
        name: person.name,
        role: person.role,
        teamId: person.team_id,
        availabilityFte: Number(person.availability_fte),
        fitScore: Math.max(0, Math.round(fit.score - penalty)),
        coverage: fit.coverage,
        matchedSkills: fit.matchedSkills,
      };
    })
    .sort((a, b) => b.fitScore - a.fitScore);
}

function buildAssessment(selected, requirements) {
  const matchedSkills = new Set(selected.flatMap((person) => person.matchedSkills));
  const requiredSkills = requirements.map((requirement) => requirement.name);
  const missingSkills = requiredSkills.filter((skill) => !matchedSkills.has(skill));
  return {
    coverageScore: requiredSkills.length ? Math.round((matchedSkills.size / requiredSkills.length) * 100) : 100,
    missingSkills,
    matchedSkills: [...matchedSkills],
    confidence: missingSkills.length ? GAP_CONFIDENCE : FULL_CONFIDENCE,
  };
}

function tradeOffFor(selected) {
  const overloaded = selected.some((person) => {
    const team = repository.findTeam(person.teamId);
    return team && deliveryPressure(team) > 100;
  });
  return overloaded
    ? 'The source team is already above sustainable capacity; time-box the assignment and pair a backup.'
    : 'No material capacity trade-off identified.';
}

// Deterministic, grounded reason for why a candidate was NOT selected — this is
// what makes the recommendation feel explainable (e.g. "Already overloaded 110%").
function rejectionReasonFor(person) {
  if (person.fitScore <= 0) return 'No matching capability coverage for the required skills';
  const team = repository.findTeam(person.teamId);
  const pressure = team ? deliveryPressure(team) : 0;
  if (pressure > 100) return `Already overloaded ${pressure}%`;
  return 'Lower capability fit than the selected team';
}

function buildTeam(project, requirements, selected, rejected) {
  const assessment = buildAssessment(selected, requirements);
  return {
    name: `Balanced team for ${project.name}`,
    project: { id: project.id, name: project.name },
    requiredSkills: requirements.map((requirement) => requirement.name),
    recommendedTeam: selected,
    rejectedCandidates: rejected,
    assessment,
    rationale: assessment.matchedSkills.length
      ? `Selected for ${assessment.matchedSkills.join(', ')} coverage while accounting for current team delivery pressure.`
      : 'No candidate with usable coverage was found; expand the search pool.',
    tradeOff: tradeOffFor(selected),
    impact: `+${selected.reduce((sum, person) => sum + person.availabilityFte, 0).toFixed(2)} FTE assigned to ${project.name}.`,
  };
}

function buildAlternatives(ranked, primary, project, requirements) {
  const primaryIds = new Set(primary.map((person) => person.id));
  const alternatives = [];
  for (let index = primary.length - 1; index >= Math.max(0, primary.length - 2); index -= 1) {
    const replacement = ranked.find((candidate) => !primaryIds.has(candidate.id) && candidate.fitScore > 0);
    if (!replacement) break;
    const swapped = primary
      .map((person, position) => (position === index ? { ...replacement } : person));
    alternatives.push({
      name: `Alternative: ${replacement.name} in place of ${primary[index].name}`,
      project: { id: project.id, name: project.name },
      requiredSkills: requirements.map((requirement) => requirement.name),
      recommendedTeam: swapped,
      assessment: buildAssessment(swapped, requirements),
      tradeOff: tradeOffFor(swapped),
    });
  }
  return alternatives;
}

async function persistScenario(project, team, teamId) {
  const scenarioNumber = (await repository.countScenarios()) + 1;
  const scenarioId = `sc-${String(scenarioNumber).padStart(2, '0')}`;
  const capacityDeltaFte = team.recommendedTeam.reduce((sum, person) => sum + person.availabilityFte, 0);
  await repository.insertScenario({
    id: scenarioId,
    name: team.name,
    projectId: project.id,
    teamId,
    capacityDeltaFte: Math.round(capacityDeltaFte * 100) / 100,
    capabilityDelta: `+${team.assessment.matchedSkills.join(', ')}`,
    tradeOff: team.tradeOff,
    confidence: team.assessment.confidence,
  });
  const changes = team.recommendedTeam.map((person, index) => [
    `${scenarioId}-change-${index + 1}`,
    scenarioId,
    person.id,
    'add',
    person.availabilityFte,
    'Selected for capability coverage in the composed team',
  ]);
  await repository.insertChanges(changes);
  return scenarioId;
}

export async function composeForProject(projectId, { persist = false } = {}) {
  const project = await repository.findProject(projectId);
  if (!project) return null;
  const requirements = await repository.findRequirements(projectId);
  const ranked = await rankCandidates(requirements);
  const selected = ranked.filter((person) => person.fitScore > 0).slice(0, TEAM_SIZE);
  const selectedIds = new Set(selected.map((person) => person.id));
  const rejected = ranked
    .filter((person) => !selectedIds.has(person.id))
    .slice(0, 3)
    .map((person) => ({ ...person, rejectionReason: rejectionReasonFor(person) }));
  const team = buildTeam(project, requirements, selected, rejected);
  team.alternatives = buildAlternatives(ranked, selected, project, requirements);
  if (persist) {
    team.scenarioId = await persistScenario(project, team, await repository.findPrimaryTeamId(project.id));
  }
  return team;
}

export async function getScenarioById(scenarioId) {
  const scenario = await repository.findScenarioById(scenarioId);
  if (!scenario) return null;
  const project = await repository.findProject(scenario.project_id);
  const requirements = await repository.findRequirements(scenario.project_id);
  const candidates = await repository.findCandidates();
  const byId = new Map(candidates.map((candidate) => [candidate.id, candidate]));
  const changes = await repository.findChangesByScenario(scenario.id);
  const recommendedTeam = changes.map((change) => {
    const person = byId.get(change.person_id);
    const fit = person ? matchCapabilities(person.capabilities, requirements) : { coverage: {} };
    return {
      id: change.person_id,
      name: person?.name ?? change.person_id,
      role: person?.role ?? null,
      teamId: person?.team_id ?? null,
      availabilityFte: Number(change.allocation_delta_fte),
      changeType: change.change_type,
      rationale: change.rationale,
      coverage: fit.coverage,
    };
  });
  const matched = new Set((scenario.capability_delta ?? '').replace(/^\+/, '').split(',').map((skill) => skill.trim()).filter(Boolean));
  const requiredSkills = requirements.map((requirement) => requirement.name);
  const missingSkills = requiredSkills.filter((skill) => !matched.has(skill));
  return {
    id: scenario.id,
    name: scenario.name,
    project: { id: project?.id, name: project?.name },
    requiredSkills,
    recommendedTeam,
    assessment: {
      coverageScore: requiredSkills.length ? Math.round((matched.size / requiredSkills.length) * 100) : 100,
      missingSkills,
      confidence: Number(scenario.confidence),
    },
    tradeOff: scenario.trade_off,
    impact: `+${Number(scenario.capacity_delta_fte).toFixed(2)} FTE assigned to ${project?.name}.`,
  };
}