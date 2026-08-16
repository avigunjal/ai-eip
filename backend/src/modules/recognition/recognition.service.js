// Recognition domain service. Uses only seeded contribution context; never
// infers performance ranking.

import * as repository from './recognition.repository.js';

const VALID_TYPES = new Set(['reliability', 'mentorship', 'delivery', 'knowledge_sharing']);
const VALID_VISIBILITY = new Set(['public', 'private']);

function toItem(row) {
  return {
    id: row.id,
    personId: row.person_id,
    person: { id: row.person_id, name: row.person_name },
    project: row.project_id ? { id: row.project_id, name: row.project_name } : null,
    knowledgeArea: row.knowledge_area_id ? { id: row.knowledge_area_id, name: row.knowledge_area_name } : null,
    type: row.contribution_type,
    summary: row.summary,
    occurredAt: row.occurred_at,
    visibility: row.visibility,
    evidenceIds: [`ev-${row.id}`, `ev-${row.id}-2`],
  };
}

export async function getFeed() {
  return (await repository.findAll()).map(toItem);
}

export async function createRecognition(payload) {
  if (!VALID_TYPES.has(payload.type)) {
    const error = new Error(`Invalid contribution type "${payload.type}"`);
    error.status = 400;
    throw error;
  }
  if (payload.visibility && !VALID_VISIBILITY.has(payload.visibility)) {
    const error = new Error(`Invalid visibility "${payload.visibility}"`);
    error.status = 400;
    throw error;
  }
  const recognition = {
    id: payload.id ?? `rec-${Date.now()}`,
    personId: payload.personId,
    projectId: payload.projectId ?? null,
    knowledgeAreaId: payload.knowledgeAreaId ?? null,
    type: payload.type,
    summary: payload.summary,
    occurredAt: payload.occurredAt ?? new Date().toISOString().slice(0, 10),
    visibility: payload.visibility ?? 'public',
  };
  repository.insert(recognition);
  return recognition;
}