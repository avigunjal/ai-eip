// Shared small utilities.
// e.g. asyncHandler wrapper to avoid try/catch in every controller.

export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}
