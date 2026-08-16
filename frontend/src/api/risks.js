import { http } from './client.js';

/**
 * Risk register endpoints (list, detail, local updates).
 */

/**
 * @returns {Promise<Risk[]>}
 */
export async function fetchRisks() {
  const { risks } = await http.get('/risks');
  return risks;
}

/**
 * @param {string} riskId
 * @returns {Promise<Risk>}
 */
export async function fetchRisk(riskId) {
  const { risk } = await http.get(`/risks/${riskId}`);
  return risk;
}

/**
 * @param {string} riskId
 * @param {Partial<Pick<Risk, 'status'|'ownerId'>>} patch - Local updates the UI is allowed to make.
 * @returns {Promise<Risk>}
 */
export async function updateRisk(riskId, patch) {
  const { risk } = await http.patch(`/risks/${riskId}`, patch);
  return risk;
}