// The four decision option simulators. Each one starts from the current signals
// and applies a deterministic, grounded transformation — never an LLM, never a
// clock, never a hardcoded winner.

import { severityFor } from '../../shared/constants/index.js';
import { concentrationScore } from '../analytics/knowledge-risk/knowledge-risk.service.js';
import { findExpertise, findTransferPlan } from '../knowledge/knowledge.repository.js';
import { matchCapabilities } from '../team-composer/skill-matcher.service.js';
import { teamCoverageScore, computeExposure } from './decision-signals.service.js';
import { financialImpact } from './financial-impact.service.js';
import {
  DECISION_OPTIONS,
  KNOWLEDGE_COVERAGE_GAIN,
  KNOWLEDGE_SHARE_FROM_LEVEL,
  MIN_SOURCE_SUSTAINABLE_FTE,
  MITIGATION_EFFECTIVENESS,
  REALLOCATION_FTE_FACTOR,
  REALLOCATION_KNOWLEDGE_MITIGATION,
} from './decision.config.js';
import { findScenarioForProject, findScenarioChanges } from './decision.repository.js';

// --- shared helpers ----------------------------------------------------------

function cloneSignals(ctx) {
  return structuredClone(ctx.currentSignals);
}

function pressureFor(team, sustainableCapacity) {
  if (!sustainableCapacity) return 0;
  const load = Number(team.committedFte) + Number(team.unplannedFte);
  return Math.round((load / sustainableCapacity) * 100);
}

// Re-assess a linked knowledge area from a transformed expertise set.
function reassessKnowledge(area, expertiseRows, coverageScore) {
  const assessment = concentrationScore({ ...area, expertise: expertiseRows, coverage_score: coverageScore });
  return {
    concentration: Math.min(100, assessment.concentration),
    severity: severityFor(assessment.concentration),
    singleOwner: assessment.singleOwner,
    dominantShare: assessment.dominantShare,
    hasBackup: assessment.hasBackup,
    coverage: coverageScore,
    areaId: area.id,
    areaName: area.name,
  };
}

// Promote an existing in-area expert toward backup capability, redistributing
// shares. A "learning" backup (real onboarding) reaches capable; an "unverified"
// name on the list only reaches learning.
function promoteExpertRows(expertise, personId, person, level) {
  const target = expertise.find((entry) => entry.person_id === personId);
  if (!target) return expertise;
  const promotedLevel = level === 'learning' ? 'capable' : 'learning';
  const share = KNOWLEDGE_SHARE_FROM_LEVEL[promotedLevel] ?? KNOWLEDGE_SHARE_FROM_LEVEL.learning;
  const scale = (100 - share) / 100;
  const others = expertise
    .filter((entry) => entry.person_id !== personId)
    .map((entry) => ({ ...entry, share_pct: Math.round(Number(entry.share_pct) * scale) }));
  const promoted = {
    person_id: target.person_id,
    name: target.name ?? person?.name ?? null,
    role: target.role ?? person?.role ?? null,
    level: promotedLevel,
    share_pct: share,
    is_backup: 1,
    last_contributed_at: target.last_contributed_at ?? null,
  };
  return [...others, promoted];
}

// Add a candidate as a capable backup expert, redistributing shares.
function addExpertRows(expertise, person, level) {
  if (expertise.some((entry) => entry.person_id === person.id)) return expertise;
  const share = KNOWLEDGE_SHARE_FROM_LEVEL[level] ?? KNOWLEDGE_SHARE_FROM_LEVEL.learning;
  const scale = (100 - share) / 100;
  const others = expertise.map((entry) => ({ ...entry, share_pct: Math.round(Number(entry.share_pct) * scale) }));
  others.push({
    person_id: person.id,
    name: person.name,
    role: person.role,
    level: 'capable',
    share_pct: share,
    is_backup: 1,
    last_contributed_at: null,
  });
  return others;
}

function coverageGainForLevel(level) {
  return KNOWLEDGE_COVERAGE_GAIN[level] ?? KNOWLEDGE_COVERAGE_GAIN.learning;
}

function sourcePenaltyFor(pressureAfter) {
  return Math.min(60, Math.max(0, pressureAfter - 90) * 2);
}

const LEVEL_RANK = { primary: 3, capable: 2, learning: 1 };

// Average open risk score after applying mitigation effectiveness to every
// knowledge-category risk (probability × (1 − effectiveness), impact × 0.85).
// Non-knowledge risks keep their current score.
export function mitigatedRiskScore(ctx, effectiveness) {
  const open = (ctx.projectRisks ?? []).filter((risk) => risk.status !== 'mitigated');
  if (!open.length) return 0;
  const total = open.reduce((sum, risk) => {
    if (risk.category !== 'knowledge') return sum + Number(risk.score);
    const probability = Number(risk.probability) * (1 - effectiveness);
    const impact = Math.min(1, Number(risk.impact) * 0.85);
    return sum + Math.min(100, Math.round(probability * impact * Number(risk.urgency) * 100));
  }, 0);
  return Math.round(total / open.length);
}

// Build the uniform option result shape from before/after states.
function resultFor(ctx, optionKey, { after, action, resource, org, sourceImpact, financialAnnualCostPerFte }) {
  const before = ctx.currentSignals;
  const beforeExposure = before.exposure;
  const afterExposure = computeExposure(after, beforeExposure.remainingDays);
  const meta = DECISION_OPTIONS[optionKey];

  const deltas = {
    riskReduction: Math.max(0, before.risk.score - after.risk.score),
    exposureReduction: Math.max(0, beforeExposure.score - afterExposure.score),
    capacityPressureDelta: Math.max(0, before.capacity.pressure - after.capacity.pressure),
    coverageDelta: Math.max(0, after.coverage.score - before.coverage.score),
    knowledgeConcentrationDelta: Math.max(0, before.knowledge.concentration - after.knowledge.concentration),
  };

  const fteDelta = resource?.fteDelta ?? 0;
  const financial = financialImpact(ctx, {
    option: optionKey,
    beforeExposureScore: beforeExposure.score,
    afterExposureScore: afterExposure.score,
    fteDelta,
    role: resource?.role ?? null,
    annualCostPerFte: financialAnnualCostPerFte,
  });

  return {
    option: optionKey,
    label: meta.label,
    shortLabel: meta.shortLabel,
    description: meta.description,
    action: {
      summary: action?.summary ?? meta.description,
      details: action?.details ?? [],
    },
    before: {
      risk: { score: before.risk.score, severity: before.risk.severity },
      capacity: { pressure: before.capacity.pressure },
      coverage: { score: before.coverage.score },
      knowledge: {
        concentration: before.knowledge.concentration,
        severity: before.knowledge.severity,
        singleOwner: before.knowledge.singleOwner,
        coverage: before.knowledge.coverage,
      },
      exposure: beforeExposure,
    },
    after: {
      risk: { score: after.risk.score, severity: severityFor(after.risk.score) },
      capacity: { pressure: after.capacity.pressure },
      coverage: { score: after.coverage.score },
      knowledge: {
        concentration: after.knowledge.concentration,
        severity: severityFor(after.knowledge.concentration),
        singleOwner: after.knowledge.singleOwner,
        coverage: after.knowledge.coverage,
      },
      exposure: afterExposure,
    },
    deltas,
    resource: {
      pressureBefore: before.capacity.pressure,
      pressureAfter: after.capacity.pressure,
      fteDelta,
      role: resource?.role ?? null,
    },
    financial,
    org: {
      netOrgImpact: Math.round(org?.netOrgImpact ?? 0),
      targetGain: org?.targetGain ?? 0,
      sourceImpact,
    },
    sourceImpact,
  };
}

// --- Option A: continue ------------------------------------------------------

function simulateContinue(ctx) {
  const after = cloneSignals(ctx);
  return resultFor(ctx, 'continue', {
    after,
    action: { summary: 'No changes applied. Continue with the current plan through the target date.', details: DECISION_OPTIONS.continue.details },
    resource: { fteDelta: 0 },
    org: { netOrgImpact: 0, targetGain: 0 },
    sourceImpact: null,
  });
}

// --- Option B: apply the saved staffing scenario ------------------------------

function simulateStaffing(ctx) {
  const after = cloneSignals(ctx);
  const scenario = findScenarioForProject(ctx.project.id);
  const changes = scenario ? findScenarioChanges(scenario.id) : [];
  const fteDelta = Number(scenario?.capacity_delta_fte ?? 0);
  const details = scenario ? [`Scenario: ${scenario.name}`, `+${fteDelta} FTE capacity added to ${after.capacity.teamName}`] : ['No saved staffing scenario found for this project'];

  const targetTeam = ctx.teams.find((team) => team.id === after.capacity.teamId) ?? null;
  if (targetTeam) {
    const sustainable = Number(targetTeam.sustainableCapacityFte) + fteDelta;
    after.capacity.pressure = pressureFor(targetTeam, sustainable);
  }

  const projectTeamIds = new Set(ctx.projectTeams.map((team) => team.id));
  const currentIds = new Set(ctx.members.map((member) => member.id));
  const addedCards = [];
  let blendedCost = 0;
  let blendedFte = 0;
  let sourceImpact = null;

  for (const change of changes) {
    const person = ctx.candidates.find((candidate) => candidate.id === change.person_id);
    if (!person || change.change_type === 'remove') continue;
    blendedCost += Number(change.allocation_delta_fte) * Number(ctx.assumptions?.roleCost?.[person.role]?.annual_cost_per_fte ?? ctx.assumptions?.default?.annual_cost_per_fte ?? 0);
    blendedFte += Number(change.allocation_delta_fte);
    if (!currentIds.has(person.id)) {
      addedCards.push(person.capabilities);
      if (!projectTeamIds.has(person.team_id)) {
        const sourceTeam = ctx.teams.find((team) => team.id === person.team_id);
        if (sourceTeam) {
          const removedFte = Number(change.allocation_delta_fte);
          const sustainable = Math.max(0, Number(sourceTeam.sustainableCapacityFte) - removedFte);
          sourceImpact = {
            teamId: sourceTeam.id,
            teamName: sourceTeam.name,
            personName: person.name,
            fte: removedFte,
            pressureBefore: sourceTeam.deliveryPressure,
            pressureAfter: sustainable ? pressureFor(sourceTeam, sustainable) : 100,
            capabilityLoss: person.capabilities.filter((card) => card.level === 'primary').map((card) => ({ capabilityId: card.capability_id, level: card.level })),
            note: 'Time-boxed assignment; the scenario is the persisted plan for this project.',
          };
        }
      }
    }
  }

  if (addedCards.length) {
    const coverage = teamCoverageScore([...ctx.members.map((member) => member.capabilities), ...addedCards], ctx.requirements);
    after.coverage = { ...after.coverage, requirementScore: coverage.score, matched: coverage.matched, missing: coverage.missing };
  }

  const relief = after.capacity.pressure < Number(ctx.currentSignals.capacity.pressure)
    ? Number(ctx.currentSignals.capacity.pressure) - after.capacity.pressure
    : 0;
  const coverageGain = after.coverage.score - ctx.currentSignals.coverage.score;
  const targetGain = Math.min(100, Math.round(relief * 0.5 + Math.max(0, coverageGain) * 0.5));
  const org = {
    netOrgImpact: Math.max(0, targetGain - (sourceImpact ? sourcePenaltyFor(sourceImpact.pressureAfter) : 0)),
    targetGain,
  };

  const annualCostPerFte = blendedFte ? Math.round(blendedCost / blendedFte) : 0;
  return resultFor(ctx, 'staffing', {
    after,
    action: {
      summary: `Apply ${scenario?.name ?? 'the saved staffing scenario'}`,
      details: [...details, ...changes.map((change) => {
        const person = ctx.candidates.find((candidate) => candidate.id === change.person_id);
        return `${change.change_type}: ${person?.name ?? change.person_id} ${change.change_type === 'reallocate' ? '(from another team)' : ''} +${change.allocation_delta_fte} FTE`;
      })],
    },
    resource: { fteDelta, role: null },
    org,
    sourceImpact,
    financialAnnualCostPerFte: annualCostPerFte,
  });
}

// --- Option C: reallocate the best available internal engineer ----------------

async function simulateReallocate(ctx) {
  const after = cloneSignals(ctx);
  const projectTeamIds = new Set(ctx.projectTeams.map((team) => team.id));

  // Exclude anyone who is the last viable expert on a linked knowledge area.
  const protectedOwners = new Set();
  for (const area of ctx.linkedAreas) {
    const expertise = await findExpertise(area.id);
    const owner = expertise.find((entry) => entry.level === 'primary');
    const hasBackup = expertise.some((entry) => entry.person_id !== owner?.person_id && ['capable', 'primary'].includes(entry.level));
    if (owner && !hasBackup && Number(owner.share_pct) >= 70) protectedOwners.add(owner.person_id);
  }

  const baseRequirementCoverage = ctx.currentSignals.coverage.requirementScore;
  const evaluated = [];
  for (const candidate of ctx.candidates) {
    if (projectTeamIds.has(candidate.team_id)) continue;
    if (protectedOwners.has(candidate.id)) continue;
    const sourceTeam = ctx.teams.find((team) => team.id === candidate.team_id);
    if (!sourceTeam) continue;
    const fte = Math.round(Number(candidate.availability_fte) * REALLOCATION_FTE_FACTOR * 10) / 10;
    if (fte <= 0) continue;
    const sustainableAfter = Math.max(0, Number(sourceTeam.sustainableCapacityFte) - fte);
    if (sustainableAfter < MIN_SOURCE_SUSTAINABLE_FTE) continue;
    const load = Number(sourceTeam.committedFte) + Number(sourceTeam.unplannedFte);
    const sourcePressureAfter = sustainableAfter ? Math.round((load / sustainableAfter) * 100) : 100;

    // Marginal value on the target: how much does this candidate genuinely add?
    // The team already covers ~every generic skill card, so the meaningful gains
    // are (a) lift on the critical knowledge-area coverage and (b) any skill the
    // team was actually missing. Both are traded off against source damage.
    // Knowledge credit is restricted to the canonical knowledge-signal area so
    // before/after signals stay comparable.
    const canonicalAreaId = ctx.currentSignals.knowledge.areaId;
    let knowledgeGain = 0;
    let gainedArea = null;
    for (const area of ctx.linkedAreas) {
      if (area.id !== canonicalAreaId) continue;
      const expertise = await findExpertise(area.id);
      const held = expertise.find((entry) => entry.person_id === candidate.id);
      if (!held) continue;
      const gain = coverageGainForLevel(held.level);
      const projectedCoverage = Math.min(90, Number(area.coverage_score) + gain);
      const transformed = held.level === 'learning' || held.level === 'unverified'
        ? promoteExpertRows(expertise, candidate.id, candidate, held.level)
        : addExpertRows(expertise, candidate, held.level);
      const beforeAssessment = concentrationScore({ ...area, expertise });
      const afterAssessment = concentrationScore({ ...area, expertise: transformed, coverage_score: projectedCoverage });
      if (beforeAssessment.concentration - afterAssessment.concentration > knowledgeGain) {
        knowledgeGain = beforeAssessment.concentration - afterAssessment.concentration;
        gainedArea = { area, heldLevel: held.level, afterCoverage: projectedCoverage, transformed };
      }
    }
    const requirementAfter = teamCoverageScore([...ctx.members.map((member) => member.capabilities), candidate.capabilities], ctx.requirements).score;
    const marginalCoverage = Math.max(0, requirementAfter - baseRequirementCoverage);

    const penalty = sourcePenaltyFor(sourcePressureAfter);
    const netOrgImpact = Math.max(0, Math.round(Math.min(100, knowledgeGain * 2.2 + marginalCoverage * 2.2) - penalty));
    evaluated.push({
      candidate, sourceTeam, fte, sourcePressureAfter,
      fit: matchCapabilities(candidate.capabilities, ctx.requirements).score,
      knowledgeGain, gainedArea, marginalCoverage, penalty, netOrgImpact,
    });
  }

  const chosen = [...evaluated].sort((a, b) =>
    b.netOrgImpact - a.netOrgImpact
    || b.knowledgeGain - a.knowledgeGain
    || (LEVEL_RANK[b.gainedArea?.heldLevel ?? ''] ?? 0) - (LEVEL_RANK[a.gainedArea?.heldLevel ?? ''] ?? 0)
    || a.candidate.name.localeCompare(b.candidate.name))[0];

  if (!chosen) {
    return resultFor(ctx, 'reallocate', {
      after,
      action: { summary: 'No eligible internal candidate found (all candidates would destabilize their source team).', details: [] },
      resource: { fteDelta: 0 },
      org: { netOrgImpact: 0, targetGain: 0 },
      sourceImpact: null,
    });
  }

  const { candidate, sourceTeam, fte, gainedArea } = chosen;

  // Target team capacity relief.
  const targetTeam = ctx.teams.find((team) => team.id === after.capacity.teamId) ?? null;
  if (targetTeam) {
    const sustainable = Number(targetTeam.sustainableCapacityFte) + fte;
    after.capacity.pressure = pressureFor(targetTeam, sustainable);
  }

  // Capability coverage gain (requirement-facing and knowledge-area-facing).
  const requirementCoverage = teamCoverageScore([...ctx.members.map((member) => member.capabilities), candidate.capabilities], ctx.requirements);
  after.coverage = { ...after.coverage, requirementScore: requirementCoverage.score, matched: requirementCoverage.matched, missing: requirementCoverage.missing };

  // Knowledge gain when the candidate holds expertise in a linked area, plus
  // partial mitigation of knowledge-category risks.
  if (gainedArea) {
    after.knowledge = {
      ...reassessKnowledge(gainedArea.area, gainedArea.transformed, gainedArea.afterCoverage),
      expertise: gainedArea.transformed,
    };
    after.coverage = { ...after.coverage, score: after.knowledge.coverage };
    const nextRiskScore = mitigatedRiskScore(ctx, REALLOCATION_KNOWLEDGE_MITIGATION);
    after.risk = { ...after.risk, score: nextRiskScore, severity: severityFor(nextRiskScore) };
  }

  const sourceImpact = {
    teamId: sourceTeam.id,
    teamName: sourceTeam.name,
    personName: candidate.name,
    personRole: candidate.role,
    fte,
    pressureBefore: sourceTeam.deliveryPressure,
    pressureAfter: chosen.sourcePressureAfter,
    capabilityLoss: candidate.capabilities.filter((card) => card.level === 'primary').map((card) => ({ capabilityId: card.capability_id, level: card.level })),
    note: `Reallocated for the ${ctx.currentSignals.exposure.remainingDays}-day window; the source team absorbs the remaining load.`,
  };

  const org = { netOrgImpact: chosen.netOrgImpact, targetGain: Math.round(chosen.netOrgImpact + (chosen.penalty || 0)) };

  return resultFor(ctx, 'reallocate', {
    after,
    action: {
      summary: `Reallocate ${candidate.name} (${candidate.role}) from ${sourceTeam.name} at ${fte} FTE`,
      details: [
        `Candidate: ${candidate.name}, ${candidate.role}`,
        `Source team: ${sourceTeam.name} (${sourceTeam.deliveryPressure}% → ${chosen.sourcePressureAfter}%)`,
        `Marginal requirement coverage: +${chosen.marginalCoverage} points`,
        gainedArea ? `Adds ${gainedArea.heldLevel} expertise on ${gainedArea.area.name}; coverage ${ctx.currentSignals.knowledge.coverage}% → ${gainedArea.afterCoverage}%` : 'No linked knowledge-area expertise held by candidate',
      ],
    },
    resource: { fteDelta: fte, role: candidate.role },
    org,
    sourceImpact,
  });
}

// --- Option D: accelerate the knowledge transfer plan -------------------------

async function simulateKnowledgeTransfer(ctx) {
  const after = cloneSignals(ctx);
  const canonicalAreaId = ctx.currentSignals.knowledge.areaId;
  const area = ctx.linkedAreas.find((entry) => entry.id === canonicalAreaId)
    ?? [...ctx.linkedAreas].sort((a, b) => Number(b.criticality) - Number(a.criticality))[0];
  const plan = area ? await findTransferPlan(area.id) : null;
  const details = [];

  if (area) {
    const expertise = await findExpertise(area.id);
    const owner = expertise.find((entry) => entry.level === 'primary') ?? expertise[0];
    const backup = expertise.find((entry) => entry.person_id === plan?.backup_person_id)
      ?? expertise.find((entry) => entry.level === 'learning')
      ?? expertise[0];
    const targetCoverage = Number(plan?.target_coverage ?? Math.min(90, Number(area.coverage_score) + 27));

    if (owner && backup && backup.person_id !== owner.person_id) {
      const remainder = Math.max(0, 100 - 60 - 25);
      const othersTotal = expertise
        .filter((entry) => entry.person_id !== owner.person_id && entry.person_id !== backup.person_id)
        .reduce((sum, entry) => sum + Number(entry.share_pct), 0);
      const otherExperts = expertise
        .filter((entry) => entry.person_id !== owner.person_id && entry.person_id !== backup.person_id)
        .map((entry) => ({
          ...entry,
          share_pct: othersTotal ? Math.round((Number(entry.share_pct) / othersTotal) * remainder) : 0,
        }));
      const transformed = [
        { ...owner, share_pct: 60 },
        { ...backup, level: 'capable', is_backup: 1, share_pct: 25 },
        ...otherExperts,
      ];
      after.knowledge = {
        ...reassessKnowledge(area, transformed, targetCoverage),
        expertise: transformed,
      };
      after.coverage = { ...after.coverage, score: after.knowledge.coverage };
      details.push(`Transfer plan ${plan?.id ?? 'for ' + area.name} applied: ${owner.name} → ${backup.name} promoted to capable backup`);
      details.push(`Knowledge coverage ${area.coverage_score}% → ${targetCoverage}% (target)`);
      details.push(`Concentration ${ctx.currentSignals.knowledge.concentration} → ${after.knowledge.concentration}; single-owner risk cleared`);
    }
  }

  // Mitigation effectiveness on knowledge-category risks.
  if (ctx.projectRisks?.length) {
    const nextScore = mitigatedRiskScore(ctx, MITIGATION_EFFECTIVENESS);
    after.risk = { ...after.risk, score: nextScore, severity: severityFor(nextScore) };
    details.push(`Knowledge risk exposure reduced (mitigation effectiveness ${Math.round(MITIGATION_EFFECTIVENESS * 100)}%)`);
  }

  const knowledgeGain = Math.max(0, ctx.currentSignals.knowledge.concentration - after.knowledge.concentration);
  const targetGain = Math.min(100, Math.round(knowledgeGain * 2));
  const org = { netOrgImpact: targetGain, targetGain };

  return resultFor(ctx, 'knowledge_transfer', {
    after,
    action: {
      summary: plan ? `Execute ${area?.name} knowledge transfer plan (${plan.id})` : 'Execute knowledge transfer for the linked knowledge area',
      details: details.length
        ? details
        : ['No linked knowledge area found', 'No transfer plan to apply'],
    },
    resource: { fteDelta: 0 },
    org,
    sourceImpact: null,
  });
}

// --- dispatch ----------------------------------------------------------------

export async function simulate(optionKey, ctx) {
  switch (optionKey) {
    case 'continue': return simulateContinue(ctx);
    case 'staffing': return simulateStaffing(ctx);
    case 'reallocate': return simulateReallocate(ctx);
    case 'knowledge_transfer': return simulateKnowledgeTransfer(ctx);
    default: return simulateContinue(ctx);
  }
}