// Recognition domain service. Feeds real linked evidence and deterministic
// award eligibility; never infers performance ranking and never lets an LLM
// make award decisions.

import * as repository from './recognition.repository.js';
import { evaluateAwards } from './recognition-award.service.js';
import {
  evidenceStrengthFor,
  impactFor,
  parseImpact,
} from './recognition-intelligence.service.js';

const VALID_TYPES = new Set(['reliability', 'mentorship', 'delivery', 'knowledge_sharing']);
const VALID_VISIBILITY = new Set(['public', 'private']);
const VALID_APPROVAL = new Set(['approved', 'rejected']);

function toEvidence(row) {
  return {
    id: row.id,
    role: row.role,
    entityType: row.entity_type,
    entityId: row.entity_id,
    source: row.source,
    statement: row.statement,
    occurredAt: row.occurred_at,
    url: row.source_url ?? undefined,
  };
}

function toItem(row, evidence, anchor) {
  const item = {
    id: row.id,
    personId: row.person_id,
    person: { id: row.person_id, name: row.person_name },
    project: row.project_id ? { id: row.project_id, name: row.project_name } : null,
    knowledgeArea: row.knowledge_area_id ? { id: row.knowledge_area_id, name: row.knowledge_area_name } : null,
    type: row.contribution_type,
    summary: row.summary,
    impact: parseImpact(row.impact),
    occurredAt: row.occurred_at,
    visibility: row.visibility,
    approvalStatus: row.approval_status ?? 'recommended',
    approvedAt: row.approved_at ?? null,
    approvedBy: row.approved_by ?? null,
    evidence,
  };
  if (item.visibility === 'public') {
    item.evidenceStrength = evidenceStrengthFor(item, anchor);
    item.impactScore = impactFor(item);
  }
  return item;
}

// Person-level award eligibility over approved public contributions. Returns a
// Map personId → { highestQualifiedLevel, qualifiedLevels, basis, intelligence }.
async function personAwardsFrom(items, anchor) {
  const byPerson = new Map();
  for (const item of items) {
    if (item.visibility !== 'public' || item.approvalStatus !== 'approved') continue;
    if (!byPerson.has(item.personId)) byPerson.set(item.personId, []);
    byPerson.get(item.personId).push(item);
  }
  const awards = new Map();
  for (const [personId, personItems] of byPerson) {
    const result = evaluateAwards(personItems, anchor);
    awards.set(personId, {
      highestQualifiedLevel: result.highestQualifiedLevel,
      qualifiedLevels: result.qualifiedLevels,
      basis: result.basis,
      intelligence: result.intelligence,
    });
  }
  return awards;
}

// Apply the person-level award to each of that person's approved public items.
function attachAwards(items, awards) {
  return items.map((item) => {
    if (item.visibility === 'public' && item.approvalStatus === 'approved') {
      item.award = awards.get(item.personId) ?? null;
    }
    return item;
  });
}

// Year-month of the latest public contribution is the deterministic "now" that
// anchors every window — recognition data never drifts with the wall clock.
function anchorFrom(rows) {
  return rows.reduce((latest, row) =>
    row.visibility === 'public' && row.occurred_at > latest ? row.occurred_at : latest,
    '');
}

export async function getFeed() {
  const rows = await repository.findAll();
  const anchor = anchorFrom(rows);

  const items = await Promise.all(rows.map(async (row) => {
    const evidence = (await repository.findEvidenceForRecognition(row.id)).map(toEvidence);
    return toItem(row, evidence, anchor);
  }));

  const awards = await personAwardsFrom(items, anchor);
  return attachAwards(items, awards);
}

export async function getRecognition(id) {
  const row = await repository.findById(id);
  if (!row) return null;
  const evidence = (await repository.findEvidenceForRecognition(id)).map(toEvidence);
  const anchor = anchorFrom([row]);
  const item = toItem(row, evidence, anchor);

  if (item.visibility === 'public' && item.approvalStatus === 'approved') {
    const rowsForPerson = await repository.findByPerson(row.person_id);
    const allItems = await Promise.all(rowsForPerson.map(async (r) => {
      const ev = (await repository.findEvidenceForRecognition(r.id)).map(toEvidence);
      return toItem(r, ev, anchorFrom(rowsForPerson));
    }));
    const awards = await personAwardsFrom(allItems, anchorFrom(rowsForPerson));
    item.award = awards.get(item.personId) ?? null;
  }
  return item;
}

// Evidence-grounded context used by the "why was this recognized" explainer.
export async function getRecognitionDetail(id) {
  const feed = await getFeed();
  const item = feed.find((entry) => entry.id === id);
  if (!item) return null;
  return {
    id: item.id,
    person: item.person,
    summary: item.summary,
    type: item.type,
    impact: item.impact,
    evidence: item.evidence,
    intelligence: item.award?.intelligence ?? null,
    award: item.award
      ? {
          highestQualifiedLevel: item.award.highestQualifiedLevel,
          qualifiedLevels: item.award.qualifiedLevels,
          basis: item.award.basis,
        }
      : null,
  };
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
  if (payload.impact && !Array.isArray(payload.impact)) {
    const error = new Error('Invalid impact: expected an array of statements');
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
    impact: payload.impact ?? [],
  };
  repository.insert(recognition);
  return { ...recognition, approvalStatus: 'recommended', evidence: [] };
}

export async function approveRecognition(id, status, actor = 'admin') {
  if (!VALID_APPROVAL.has(status)) {
    const error = new Error(`Invalid approval status "${status}"`);
    error.status = 400;
    throw error;
  }
  const approvedAt = new Date().toISOString().slice(0, 10);
  repository.setApproval(id, status, approvedAt, actor);
  return { id, status, approvedAt, approvedBy: actor };
}