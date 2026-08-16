// Risks domain service. Owns the risk → frontend contract mapping so project
// detail views and the risk register share one shape.

import * as repository from './risk.repository.js';
import { toSignals, toActions, lastSignalAt } from '../../utils/mappers.js';

function toRiskDTO(row, evidence, actions) {
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
    lastSignalAt: lastSignalAt(evidence),
    signals: toSignals(evidence),
    actions: toActions(actions),
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