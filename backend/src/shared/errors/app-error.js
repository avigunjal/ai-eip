// Custom application error with HTTP status.

export class AppError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.name = 'AppError';
  }
}
