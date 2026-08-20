import { http } from './client.js';

/**
 * Exchange credentials for a signed token.
 *
 * @param {string} username
 * @param {string} password
 * @returns {Promise<{ user: string, token: string }>}
 */
export async function login(username, password) {
  return http.post('/auth/login', { username, password });
}

/**
 * Public probe: whether the backend requires auth and whether the current
 * token is still valid. Never 401s — reports `authenticated` instead.
 *
 * @returns {Promise<{ authEnabled: boolean, authenticated: boolean, user: string|null }>}
 */
export async function fetchAuthStatus() {
  return http.get('/auth/status');
}