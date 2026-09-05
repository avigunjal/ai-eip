import { http } from './client.js';

/**
 * Recognition / impact endpoints.
 */

/**
 * @returns {Promise<Recognition[]>}
 */
export async function fetchRecognitionFeed() {
  const { feed } = await http.get('/recognition/feed');
  return feed;
}

/**
 * @param {Pick<Recognition, 'personId'|'type'|'summary'|'occurredAt'|'visibility'>} payload
 * @returns {Promise<Recognition>}
 */
export async function createRecognition(payload) {
  const { recognition } = await http.post('/recognition', payload);
  return recognition;
}

/**
 * Human-in-the-loop approval (or rejection) of a recommendation.
 * @param {string} id
 * @param {'approved'|'rejected'} [status]
 * @returns {Promise<{id: string, status: string, approvedAt: string|null, approvedBy: string|null}>}
 */
export async function approveRecognition(id, status = 'approved') {
  const { recognition } = await http.post(`/recognition/${id}/approve`, { status });
  return recognition;
}

/**
 * Full recognition detail for the "Why this recognition?" panel: recognition,
 * evidence[], impact, intelligence, award and approval state.
 * @param {string} id
 * @returns {Promise<Recognition>}
 */
export async function fetchRecognitionDetail(id) {
  const { recognition } = await http.get(`/recognition/${id}`);
  return recognition;
}

/**
 * Evidence-grounded "why was this person recognized" explanation.
 * Always carries a deterministic narrative; `ai` is present when the LLM
 * explanation is available.
 */
export async function fetchRecognitionExplanation(id) {
  return http.get(`/recognition/${id}/explanation`);
}

/**
 * Human review queue — pending recommendations with their recommended award,
 * confidence and evidence. Never contains approved (public) or rejected items.
 * @returns {Promise<{items: Recognition[], total: number}>}
 */
export async function fetchGovernanceQueue() {
  return http.get('/recognition/governance');
}

/**
 * Reject a pending recommendation. Rejection is permanent for the public
 * surface (auditable in the record, never published).
 * @param {string} id
 * @param {string} [reason]
 * @returns {Promise<{id: string, status: string, rejectedAt: string|null, rejectedBy: string|null, reason: string|null}>}
 */
export async function rejectRecognition(id, reason) {
  const { recognition } = await http.post(`/recognition/${id}/reject`, { reason: reason ?? null });
  return recognition;
}