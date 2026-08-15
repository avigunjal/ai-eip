// Cross-cutting request middleware.
// Placeholders for request logging, auth, rate limiting, etc.

// TODO: mount real auth (JWT / sessions) here once implemented.
export function requireAuth(req, _res, next) {
  // Example: const token = req.headers.authorization?.split(' ')[1];
  // Verify token, attach req.user, then next().
  next();
}
