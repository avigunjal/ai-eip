import { http } from './client.js';

/**
 * Team composer endpoints: candidate teams, AI recommendations, persisted
 * scenarios.
 */

/**
 * @returns {Promise<Team[]>}
 */
export async function fetchComposerTeams() {
  const { teams } = await http.get('/team-composer/teams');
  return teams;
}

/**
 * @param {string} projectId
 * @returns {Promise<TeamRecommendation>}
 */
export async function fetchRecommendations(projectId) {
  const { recommendation } = await http.get('/team-composer/recommendations', {
    params: { projectId },
  });
  return recommendation;
}

/**
 * Persist a staffing scenario for a project.
 *
 * @param {string} projectId
 * @returns {Promise<TeamRecommendation>}
 */
export async function createScenario(projectId) {
  const { recommendation } = await http.post('/team-composer', { projectId });
  return recommendation;
}

/**
 * @param {string} scenarioId
 * @returns {Promise<TeamRecommendation>}
 */
export async function fetchScenario(scenarioId) {
  const { scenario } = await http.get(`/team-composer/${scenarioId}`);
  return scenario;
}