// Risks domain service. Owns the risk → frontend contract mapping so project
// detail views and the risk register share one shape.

import * as repository from './risk.repository.js';
import { toSignals, toActions, lastSignalAt } from '../../utils/mappers.js';

const CATEGORY_REASON = {
  dependency: 'a dependency that can block downstream delivery',
  knowledge: 'a single-owner knowledge gap that raises bus-factor',
  capacity: 'a capacity constraint that slows throughput',
  quality: 'a quality gap that erodes confidence and adds rework',
  schedule: 'a schedule risk to the target date',
};

// Deterministic, grounded framing derived from the risk row itself — the LLM is
// never involved, so "why / impact" can never contradict the numbers.
function describeRisk(row) {
  const anchor = CATEGORY_REASON[row.category] ?? `a ${row.category} risk`;
  const impactPct = Math.round(Number(row.impact) * 100);
  const probabilityPct = Math.round(Number(row.probability) * 100);
  return {
    whyThisMatters: `${row.title} is ${anchor} on ${row.project_name ?? 'the project'}, rated ${row.severity} (${probabilityPct}% probable, ${impactPct}% impact).`,
    expectedImpact: `If it materializes, expect about ${impactPct}% delivery impact on ${row.project_name ?? 'the project'}; it is tracked with ${row.urgency} urgency.`,
  };
}

function toRiskDTO(row, evidence, actions) {
  const description = describeRisk(row);
  return {
    id: row.id,
    title: row.title,
    projectId: row.project_id,
    projectName: row.project_name ?? null,
    severity: row.severity,
    category: row.category,
    confidence: Number(row.confidence),
    probability: Number(row.probability),
    impact: Number(row.impact),
    urgency: Number(row.urgency),
    score: Number(row.score),
    trend: row.trend,
    status: row.status,
    ownerId: row.owner_person_id ?? null,
    ownerName: row.owner_name ?? null,
    lastSignalAt: lastSignalAt(evidence),
    signals: toSignals(evidence),
    actions: toActions(actions),
    ...description,
    suggestedMitigation: actions[0]?.title ?? 'Define a mitigation plan and assign an owner.',
  };
}

export async function enrichRisk(row) {
  const [evidence, actions] = await Promise.all([
    repository.findEvidence(row.id),
    repository.findActions(row.id),
  ]);
  return toRiskDTO(row, evidence, actions);
}

export async function listRisks() {
  const rows = await repository.findAll();
  return Promise.all(rows.map(enrichRisk));
}

export async function getRiskById(id) {
  const row = await repository.findById(id);
  if (!row) return null;
  return enrichRisk(row);
}

export async function updateRisk(id, patch) {
  const row = await repository.update(id, patch);
  return enrichRisk(row);
}

export { toRiskDTO };