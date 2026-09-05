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