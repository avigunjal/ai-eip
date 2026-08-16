import { http } from './client.js';

/**
 * Team endpoints.
 */

/**
 * @returns {Promise<Team[]>}
 */
export async function fetchTeams() {
  const { teams } = await http.get('/teams');
  return teams;
}

/**
 * @param {string} teamId
 * @returns {Promise<Team>}
 */
export async function fetchTeam(teamId) {
  const { team } = await http.get(`/teams/${teamId}`);
  return team;
}