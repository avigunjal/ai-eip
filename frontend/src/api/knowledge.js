import { http } from './client.js';

/**
 * Knowledge area + transfer plan endpoints.
 */

/**
 * @returns {Promise<KnowledgeArea[]>}
 */
export async function fetchKnowledgeAreas() {
  const { areas } = await http.get('/knowledge');
  return areas;
}

/**
 * @param {string} areaId
 * @returns {Promise<KnowledgeArea>}
 */
export async function fetchKnowledgeArea(areaId) {
  const { area } = await http.get(`/knowledge/${areaId}`);
  return area;
}

/**
 * @returns {Promise<TransferPlan[]>}
 */
export async function fetchTransferPlans() {
  const { plans } = await http.get('/knowledge/transfer-plans');
  return plans;
}

/**
 * @param {string} planId
 * @param {Partial<Pick<TransferPlan, 'status'>>} patch - Progress/status updates on a plan.
 * @returns {Promise<TransferPlan>}
 */
export async function updateTransferPlan(planId, patch) {
  const { plan } = await http.patch(`/knowledge/transfer-plans/${planId}`, patch);
  return plan;
}

/**
 * @param {{ areaId: string, backupOwnerId: string, dueDate: string }} payload
 * @returns {Promise<TransferPlan>}
 */
export async function createTransferPlan(payload) {
  const { plan } = await http.post('/knowledge/transfer-plans', payload);
  return plan;
}