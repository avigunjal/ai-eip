// Auth handlers: login (credentials -> token) and status (public auth probe).

import { validateCredentials, issueToken, verifyToken, authEnabled, bearerToken } from './auth.service.js';
import { AppError } from '../../shared/errors/app.error.js';

/**
 * POST /api/auth/login — exchange credentials for a signed token.
 */
export function login(req, res) {
  const { username, password } = req.body ?? {};
  const user = validateCredentials(username, password);
  if (!user) throw new AppError(401, 'Invalid username or password');
  res.json({ user, token: issueToken(user) });
}

/**
 * GET /api/auth/status — public probe so the client knows whether to show a
 * login gate and whether the stored token is still valid. Never 401s: it
 * reports `authenticated` instead, so the app can branch without error noise.
 */
export function status(req, res) {
  const auth = authEnabled();
  const token = auth ? bearerToken(req.headers.authorization) : null;
  const user = token ? verifyToken(token) : null;
  res.json({ authEnabled: auth, authenticated: Boolean(user), user });
}