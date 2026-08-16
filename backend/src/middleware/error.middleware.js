// Centralized error handling middleware.
// Wrap async route handlers or rely on this to normalize errors -> JSON.

import { AppError } from '../shared/errors/app.error.js';

export function notFoundHandler(req, _res, next) {
  next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  const status = err.status || err.statusCode || 500;
  const message = status >= 500 ? 'Internal server error' : err.message;

  if (status >= 500) console.error(err);

  res.status(status).json({
    error: {
      status,
      message,
      // TODO: expose field-level validation details when added
    },
  });
}
