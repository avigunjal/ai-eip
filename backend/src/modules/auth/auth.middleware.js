// Guards API routes with a signed bearer token. A no-op (open API) until
// credentials are configured via AUTH_PASSWORD — so dev and the demo deploy
// keep working without any setup.

import { AppError } from '../../shared/errors/app.error.js';
import { authEnabled, verifyToken, bearerToken } from './auth.service.js';

export function requireAuth(req, _res, next) {
  if (!authEnabled()) return next();
  const token = bearerToken(req.headers.authorization);
  const username = verifyToken(token);
  if (!username) {
    return next(new AppError(401, 'Authentication required'));
  }
  req.user = { sub: username };
  return next();
}