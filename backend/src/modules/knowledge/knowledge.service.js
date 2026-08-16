// Knowledge areas domain service. Owns the area → frontend contract mapping,
// including the deterministic knowledge-risk assessment.

import { concentrationScore } from '../analytics/knowledge-risk/knowledge-risk.service.js';
import { severityFor } from '../../shared/constants/index.js';
import { toEvidence } from '../../utils/mappers.js';
import * as repository from './knowledge.repository.js';

export async function toArea(row) {
  const [expertise, linkedProjectIds, evidence, transferPlan] = await Promise.all([
    repository.findExpertise(row.id),
    repository.findLinkedProjectIds(row.id),
    repository.findEvidence(row.id),
    repository.findTransferPlan(row.id),
  ]);
  const assessment = concentrationScore({ ...row, expertise });
  const criticality = Number(row.criticality);
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    criticality: scaleCriticality(criticality),
    criticalityScore: criticality,
    coverage: Number(row.coverage_score),
    documentationFreshnessDays: Number(row.documentation_freshness_days),
    documentationCompleteness: Number(row.documentation_completeness),
    riskScore: assessment.concentration,
    riskLevel: severityFor(assessment.concentration),
    dominantExpertShare: assessment.dominantShare,
    expertIds: expertise.map((item) => item.person_id),
    expertise: expertise.map((item) => ({
      personId: item.person_id,
      name: item.name,
      role: item.role,
      level: item.level,
      share: Number(item.share_pct),
      lastContributionAt: item.last_contributed_at,
      backupOwner: Boolean(item.is_backup),
    })),
    evidence: toEvidence(evidence),
    transferPlanId: transferPlan?.id ?? null,
    linkedProjectIds,
  };
}

// The frontend expects both a 1-5 `criticality` and a 0-100 `criticalityScore`.
function scaleCriticality(score) {
  if (score >= 90) return 5;
  if (score >= 70) return 4;
  if (score >= 50) return 3;
  return 2;
}

export async function listAreas() {
  return Promise.all((await repository.findAllAreas()).map(toArea));
}

export async function getAreaById(id) {
  const row = await repository.findById(id);
  if (!row) return null;
  return toArea(row);
}