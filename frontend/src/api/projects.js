import { http } from './client.js';

/**
 * Projects portfolio + project detail endpoints.
 */

/**
 * @param {{ status?: string; teamId?: string }} [params] - Optional filters.
 * @returns {Promise<Project[]>}
 */
export async function fetchProjects(params) {
  const { projects } = await http.get('/projects', { params });
  return projects;
}

/**
 * @param {string} projectId
 * @returns {Promise<Project>}
 */
export async function fetchProject(projectId) {
  const { project } = await http.get(`/projects/${projectId}`);
  return project;
}

/**
 * @param {string} projectId
 * @returns {Promise<Risk[]>}
 */
export async function fetchProjectRisks(projectId) {
  const { risks } = await http.get(`/projects/${projectId}/risks`);
  return risks;
}