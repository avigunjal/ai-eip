// AI domain service: deterministic insight generation and evidence retrieval.
// The demo runs fully offline via templates; an LLM can be layered on later
// without changing calculated scores.

import { listInsights } from '../insight/insight.service.js';
import { findByEntityId } from '../evidence/evidence.repository.js';

export async function generateInsights() {
  return listInsights();
}

export async function findEvidence(entityId) {
  return findByEntityId(entityId);
}