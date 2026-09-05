// Recognition domain service. Feeds real linked evidence and deterministic
// award eligibility; never infers performance ranking and never lets an LLM
// make award decisions.
//
// State visibility is strict: 'approved' items reach the public feed; 'rejected'
// items never do; 'recommended' items surface only in the governance queue.
// Every evaluation uses an explicit anchor and evaluationMode so pending data
// can never shift the public feed's scoring windows.

import * as repository from './recognition.repository.js';
import { evaluateAwards } from './recognition-award.service.js';
import {
  evidenceStrengthFor,
  impactFor,
  parseImpact,
} from './recognition-intelligence.service.js';

const VALID_TYPES = new Set(['reliability', 'mentorship', 'delivery', 'knowledge_sharing', 'innovation']);
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
    rejectedAt: row.rejected_at ?? null,
    rejectedBy: row.rejected_by ?? null,
    rejectedReason: row.rejected_reason ?? null,
    relatedWork: row.related_work ?? null,
    evidence,
  };
  if (item.visibility === 'public') {
    item.evidenceStrength = evidenceStrengthFor(item, anchor);
    item.impactScore = impactFor(item);
  }
  return item;
}

function isPublicApproved(row) {
  return row.visibility === 'public' && row.approval_status === 'approved';
}

function isPublicRecommended(row) {
  return row.visibility === 'public' && row.approval_status === 'recommended';
}

// Explicit, mode-scoped anchors — recognition data never drifts with the wall
// clock. The public anchor is the latest approved public contribution. The
// governance anchor is the later of that and the latest pending recommendation,
// so pending items still score inside their windows but never shift the feed's.
export function anchorsFrom(rows) {
  const publicAnchor = rows.reduce(
    (latest, row) => (isPublicApproved(row) && row.occurred_at > latest ? row.occurred_at : latest),
    '',
  );
  const recommendedAnchor = rows.reduce(
    (latest, row) => (isPublicRecommended(row) && row.occurred_at > latest ? row.occurred_at : latest),
    '',
  );
  return { public: publicAnchor, governance: recommendedAnchor > publicAnchor ? recommendedAnchor : publicAnchor };
}

// Person-level award eligibility, evaluated explicitly from a given anchor and
// evaluationMode. 'public' counts approved items only; 'governance' also
// includes pending recommendations (for the queue, never the feed). Returns a
// Map personId → { highestQualifiedLevel, qualifiedLevels, basis, intelligence,
// confidence }.
export async function personEvaluationsFrom(items, { anchorDate, evaluationMode }) {
  const statuses = evaluationMode === 'governance' ? ['approved', 'recommended'] : ['approved'];
  const byPerson = new Map();
  for (const item of items) {
    if (!byPerson.has(item.personId)) byPerson.set(item.personId, []);
    byPerson.get(item.personId).push(item);
  }
  const awards = new Map();
  for (const [personId, personItems] of byPerson) {
    const result = evaluateAwards(personItems, anchorDate, { statuses });
    awards.set(personId, {
      highestQualifiedLevel: result.highestQualifiedLevel,
      qualifiedLevels: result.qualifiedLevels,
      basis: result.basis,
      intelligence: result.intelligence,
      confidence: result.intelligence.confidence,
    });
  }
  return awards;
}

// Apply the person-level award to each of their approved public items.
function attachAwards(items, awards) {
  return items.map((item) => {
    if (item.visibility === 'public' && item.approvalStatus === 'approved') {
      item.award = awards.get(item.personId) ?? null;
    }
    return item;
  });
}

export async function getFeed() {
  const rows = await repository.findAll();
  const anchor = anchorsFrom(rows).public;
  const published = rows.filter((row) => row.approval_status === 'approved');

  const items = await Promise.all(published.map(async (row) => {
    const evidence = (await repository.findEvidenceForRecognition(row.id)).map(toEvidence);
    return toItem(row, evidence, anchor);
  }));

  const awards = await personEvaluationsFrom(items, { anchorDate: anchor, evaluationMode: 'public' });
  return attachAwards(items, awards);
}

export async function getRecognition(id) {
  const row = await repository.findById(id);
  if (!row) return null;
  const anchors = anchorsFrom(await repository.findAll());
  const evaluationMode = row.approval_status === 'recommended' ? 'governance' : 'public';
  const anchor = anchors[evaluationMode];
  const evidence = (await repository.findEvidenceForRecognition(id)).map(toEvidence);
  const item = toItem(row, evidence, anchor);

  if (item.visibility === 'public' && ['approved', 'recommended'].includes(item.approvalStatus)) {
    const rowsForPerson = await repository.findByPerson(row.person_id);
    const scoped = rowsForPerson.filter((r) =>
      r.visibility === 'public' && ['approved', 'recommended'].includes(r.approval_status));
    const allItems = await Promise.all(scoped.map(async (r) => {
      const ev = (await repository.findEvidenceForRecognition(r.id)).map(toEvidence);
      return toItem(r, ev, anchor);
    }));
    const awards = await personEvaluationsFrom(allItems, { anchorDate: anchor, evaluationMode });
    item.award = awards.get(item.personId) ?? null;
  }
  return item;
}

// Human review queue: pending recommendations, labeled as such, each with the
// deterministic evidence trail and the recommended award level behind it.
export async function getGovernanceQueue() {
  const rows = await repository.findAll();
  const anchor = anchorsFrom(rows).governance;
  const queue = rows.filter(isPublicRecommended);
  if (queue.length === 0) return { items: [], total: 0 };

  const personIds = new Set(queue.map((row) => row.person_id));
  const scoped = rows.filter((row) =>
    personIds.has(row.person_id) &&
    row.visibility === 'public' &&
    ['approved', 'recommended'].includes(row.approval_status));

  const pool = await Promise.all(scoped.map(async (row) => {
    const evidence = (await repository.findEvidenceForRecognition(row.id)).map(toEvidence);
    return toItem(row, evidence, anchor);
  }));
  const awards = await personEvaluationsFrom(pool, { anchorDate: anchor, evaluationMode: 'governance' });

  const items = pool
    .filter((item) => item.approvalStatus === 'recommended')
    .map((item) => ({
      ...item,
      award: awards.get(item.personId) ?? null,
      confidence: awards.get(item.personId)?.intelligence?.confidence ?? null,
    }));

  return { items, total: items.length };
}

// Evidence-grounded context used by the "why was this recognized" explainer.
// Works for both approved (public decision trail) and recommended (queue)
// recognitions so reviewers can open and interrogate the same panel.
export async function getRecognitionDetail(id) {
  const item = await getRecognition(id);
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
    relatedWork: payload.relatedWork ?? null,
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

export async function rejectRecognition(id, actor = 'admin', reason = null) {
  const row = await repository.findById(id);
  if (!row) {
    const error = new Error('Recognition not found');
    error.status = 404;
    throw error;
  }
  if (row.approval_status !== 'recommended') {
    const error = new Error('Only pending recommendations can be rejected');
    error.status = 400;
    throw error;
  }
  const rejectedAt = new Date().toISOString().slice(0, 10);
  repository.setRejection(id, actor, reason ?? null, rejectedAt);
  return { id, status: 'rejected', rejectedAt, rejectedBy: actor, reason: reason ?? null };
}