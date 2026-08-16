import { http } from './client.js';

/**
 * Insights + AI evidence endpoints.
 */

/**
 * @returns {Promise<Insight[]>}
 */
export async function fetchInsights() {
  const { insights } = await http.get('/insights');
  return insights;
}

/**
 * Deterministic AI insight generation.
 *
 * @returns {Promise<Insight[]>}
 */
export async function generateInsights() {
  const { insights } = await http.post('/ai/insights');
  return insights;
}

/**
 * @param {string} entityId - e.g. a project, risk, or knowledge area id.
 * @returns {Promise<Signal[]>}
 */
export async function fetchEvidence(entityId) {
  const { evidence } = await http.get(`/ai/evidence/${entityId}`);
  return evidence;
}