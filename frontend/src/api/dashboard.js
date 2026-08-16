import { http } from './client.js';

/**
 * Dashboard endpoints: executive overview + insight feed.
 * The overview endpoint returns a plain object (no envelope); insights are
 * wrapped in `{ insights }`.
 */

/**
 * @returns {Promise<{
 *   health: { value: number; delta: number };
 *   projectsAtRisk: { value: number; detail: string };
 *   knowledgeConcentration: { value: string; detail: string };
 *   teamCapacity: { value: string; detail: string };
 * }>}
 */
export async function fetchDashboardOverview() {
  return http.get('/dashboard/overview');
}

/**
 * @returns {Promise<Insight[]>}
 */
export async function fetchDashboardInsights() {
  const { insights } = await http.get('/dashboard/insights');
  return insights;
}