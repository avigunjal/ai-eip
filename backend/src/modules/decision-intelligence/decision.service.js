// Decision Impact Simulator orchestration. Builds the per-project context,
// computes current signals, runs all four options deterministically, scores
// them, and selects a winner — all without touching the LLM or the clock.

import { DEMO_TODAY } from '../../shared/constants/index.js';
import { listProjects } from '../project/project.service.js';
import { DECISION_OPTION_KEYS, DECISION_OPTIONS } from './decision.config.js';
import { buildDecisionContext, getCurrentSignals } from './decision-signals.service.js';
import { simulate } from './decision-simulator.service.js';
import { scoreOptions } from './decision-scoring.service.js';
import * as repository from './decision.repository.js';

function attachAssumptions(ctx) {
  const rows = repository.listAssumptions();
  const byRole = new Map(rows.map((row) => [row.role, row]));
  const roleCost = {};
  for (const row of rows) {
    roleCost[row.role] = {
      annual_cost_per_fte: Number(row.annual_cost_per_fte),
      billing_target_per_fte: Number(row.billing_target_per_fte),
      working_days_per_year: Number(row.working_days_per_year),
      recovery_rate: Number(row.recovery_rate),
    };
  }
  ctx.assumptions = { rows, default: byRole.get('default') ?? null, roleCost };
  ctx.projectRisks = repository.findProjectRisks(ctx.project.id);
  return ctx;
}

async function contextFor(projectId) {
  const ctx = await buildDecisionContext(projectId);
  if (!ctx) return null;
  return attachAssumptions(ctx);
}

export function toAssumptionDTO(row) {
  return {
    id: row.id,
    role: row.role,
    annual_cost_per_fte: Number(row.annual_cost_per_fte),
    billing_target_per_fte: Number(row.billing_target_per_fte),
    working_days_per_year: Number(row.working_days_per_year),
    recovery_rate: Number(row.recovery_rate),
    effective_from: row.effective_from,
    notes: row.notes,
  };
}

// Projects with open signals that qualify for decision simulation, ranked by
// delivery exposure (highest first).
export async function listScenarios() {
  const projects = await listProjects();
  const scenarios = [];
  for (const project of projects) {
    const ctx = await contextFor(project.id);
    if (!ctx) continue;
    const open = (ctx.projectRisks ?? []).filter((risk) => risk.status !== 'mitigated');
    if (!open.length) continue;
    const { risk, capacity, coverage, knowledge, exposure } = ctx.currentSignals;
    scenarios.push({
      project: { id: project.id, name: project.name, phase: project.phase, status: project.status, targetDate: project.targetDate },
      signals: {
        risk: { score: risk.score, severity: risk.severity },
        capacity: { pressure: capacity.pressure, teamName: capacity.teamName },
        coverage: { score: coverage.score },
        knowledge: { concentration: knowledge.concentration, severity: knowledge.severity },
        exposure,
      },
      openRisks: open.length,
    });
  }
  scenarios.sort((a, b) => b.signals.exposure.score - a.signals.exposure.score);
  return scenarios;
}

// Current-state summary for one project, with the drivers behind the signals.
export async function getProjectContext(projectId) {
  const [ctx, summary] = await Promise.all([contextFor(projectId), getCurrentSignals(projectId)]);
  if (!ctx || !summary) return null;
  return {
    ...summary,
    drivers: ctx.currentSignals.risk.drivers.map((driver) => ({ ...driver })),
    openRisks: (ctx.projectRisks ?? []).filter((risk) => risk.status !== 'mitigated').length,
    assumptions: ctx.assumptions.rows.map(toAssumptionDTO),
  };
}

// Option descriptors only (no simulation numbers).
export function getOptions(projectId) {
  void projectId;
  return DECISION_OPTION_KEYS.map((key) => ({
    key,
    label: DECISION_OPTIONS[key].label,
    shortLabel: DECISION_OPTIONS[key].shortLabel,
    description: DECISION_OPTIONS[key].description,
    details: DECISION_OPTIONS[key].details,
  }));
}

// Simulate a single option for one project.
export async function simulateDecision(projectId, optionKey) {
  const ctx = await contextFor(projectId);
  if (!ctx) return null;
  const key = DECISION_OPTION_KEYS.includes(optionKey) ? optionKey : 'continue';
  return {
    project: { id: ctx.project.id, name: ctx.project.name, targetDate: ctx.project.targetDate },
    demoToday: ctx.demoToday,
    option: await simulate(key, ctx),
  };
}

// Simulate every option, score them, and pick the recommended decision.
export async function compareDecisions(projectId) {
  const ctx = await contextFor(projectId);
  if (!ctx) return null;
  const options = await Promise.all(DECISION_OPTION_KEYS.map((key) => simulate(key, ctx)));
  const { scored, winner } = scoreOptions(ctx.currentSignals, options);
  return {
    project: {
      id: ctx.project.id,
      name: ctx.project.name,
      description: ctx.project.description,
      phase: ctx.project.phase,
      status: ctx.project.status,
      targetDate: ctx.project.targetDate,
      healthScore: ctx.project.healthScore,
      deliveryConfidence: ctx.project.deliveryConfidence,
    },
    demoToday: DEMO_TODAY,
    currentSignals: ctx.currentSignals,
    options: scored,
    recommended: {
      option: winner.option,
      label: winner.label,
      shortLabel: winner.shortLabel,
      score: winner.score,
      scoreBreakdown: winner.scoreBreakdown,
      reasons: buildReasons(ctx, winner),
      tradeOffs: buildTradeOffs(ctx, winner),
      sourceImpact: winner.sourceImpact,
    },
    assumptions: {
      rows: ctx.assumptions.rows.map(toAssumptionDTO),
      disclaimer: 'Financial figures are planning estimates derived from configurable assumptions — not actual financial records or revenue.',
      asOf: DEMO_TODAY,
    },
    deterministic: true,
    generated: 'deterministic engine (no LLM involvement)',
  };
}

function buildReasons(ctx, winner) {
  const before = ctx.currentSignals;
  const reasons = [];
  if (winner.deltas.riskReduction > 0) {
    reasons.push(`Reduces project risk score from ${before.risk.score} to ${winner.after.risk.score}.`);
  }
  if (winner.deltas.exposureReduction > 0) {
    reasons.push(`Lowers delivery exposure from ${before.exposure.label} (${before.exposure.score}) to ${winner.after.exposure.label} (${winner.after.exposure.score}).`);
  }
  if (before.capacity.pressure > 100 && winner.after.capacity.pressure <= 100) {
    reasons.push(`Brings ${winner.resource.teamName ?? 'the target team'} capacity back under sustainable load (${before.capacity.pressure}% → ${winner.after.capacity.pressure}%).`);
  }
  if (winner.deltas.coverageDelta > 0) {
    reasons.push(`Raises capability coverage from ${before.coverage.score}% to ${winner.after.coverage.score}%.`);
  }
  if (winner.deltas.knowledgeConcentrationDelta > 0) {
    const singleOwnerCleared = before.knowledge.singleOwner && !winner.after.knowledge.singleOwner;
    reasons.push(`Reduces knowledge concentration from ${before.knowledge.concentration} to ${winner.after.knowledge.concentration}${singleOwnerCleared ? ' and clears the single-owner bus-factor risk' : ''}.`);
  }
  if (winner.financial.avoidedExposure > 0) {
    reasons.push(`Avoids an estimated ₹${winner.financial.avoidedExposure.toLocaleString('en-IN')} of exposure across the ${winner.financial.windowDays}-day window.`);
  }
  if (winner.financial.staffingCost === 0 && winner.option !== 'continue') {
    reasons.push('No additional staffing cost — internal resource move.');
  }
  if (winner.option === 'staffing') {
    reasons.push('Uses the persisted staffing scenario already vetted by the team composer.');
  }
  if (!reasons.length) {
    reasons.push('No option improves the current state; continuing as-is is the least-damaging choice.');
  }
  return reasons.map((text) => ({ text }));
}

function buildTradeOffs(ctx, winner) {
  const trades = [];
  if (winner.sourceImpact) {
    trades.push(`${winner.sourceImpact.teamName} moves from ${winner.sourceImpact.pressureBefore}% to ${winner.sourceImpact.pressureAfter}% pressure while ${winner.sourceImpact.personName} is reallocated.`);
  }
  if (winner.option === 'knowledge_transfer' && winner.deltas.capacityPressureDelta === 0) {
    trades.push('No capacity relief — the target team stays above sustainable load.');
  }
  if (winner.option === 'staffing' && winner.financial.staffingCost > 0) {
    trades.push(`Books a prorated planning cost of ₹${winner.financial.staffingCost.toLocaleString('en-IN')} for the window.`);
  }
  if (winner.option === 'reallocate') {
    trades.push('Source-team throughput may drop during the window; time-box the assignment.');
  }
  if (winner.option === 'continue') {
    trades.push('No signal improves; delivery exposure persists through the target date.');
  }
  return trades.map((text) => ({ text }));
}

// --- financial assumptions ---------------------------------------------------

export function listAssumptions() {
  return repository.listAssumptions().map(toAssumptionDTO);
}

export function updateAssumption(id, patch) {
  const row = repository.updateAssumption(id, patch);
  return row ? toAssumptionDTO(row) : null;
}