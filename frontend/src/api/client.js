import axios from 'axios';

/**
 * Axios HTTP transport for the AI-EIP API.
 *
 * Owns only transport concerns: base URL, JSON headers, HTTP verbs, timeout,
 * cancellation, and error normalization. No business logic lives here —
 * resource modules (projects.js, risks.js, ...) own endpoints and envelopes.
 */

// ---------------------------------------------------------------------------
// HTTP status codes (referenced instead of magic numbers across the app)
// ---------------------------------------------------------------------------
export const HttpStatus = Object.freeze({
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
});

const DEFAULT_TIMEOUT_MS = 10_000;

/**
 * @typedef {Object} RequestOptions
 * @property {Record<string, string|number|boolean|undefined>} [params] - Query string params.
 * @property {AbortSignal} [signal] - Abort signal for request cancellation.
 * @property {number} [timeout] - Per-request timeout in ms (overrides the instance default).
 */

// ---------------------------------------------------------------------------
// Error normalization
// ---------------------------------------------------------------------------
/** A normalized, typed error thrown by every request. */
export class ApiError extends Error {
  constructor({ status, message, code = 'HTTP_ERROR', details = null, cause = undefined }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.cause = cause;
  }

  get isNetworkError() {
    return this.code === 'NETWORK_ERROR';
  }

  get isTimeout() {
    return this.code === 'TIMEOUT';
  }

  get isAbort() {
    return this.code === 'CANCELLED';
  }

  get isUnauthorized() {
    return this.status === HttpStatus.UNAUTHORIZED;
  }

  get isNotFound() {
    return this.status === HttpStatus.NOT_FOUND;
  }
}

/** Narrowing guard: `if (isApiError(err))` instead of `instanceof`. */
export function isApiError(error) {
  return error instanceof ApiError;
}

const STATUS_MESSAGES = {
  [HttpStatus.BAD_REQUEST]: 'The request was invalid',
  [HttpStatus.UNAUTHORIZED]: 'You are not signed in',
  [HttpStatus.FORBIDDEN]: 'You do not have permission to do that',
  [HttpStatus.NOT_FOUND]: 'The requested resource was not found',
  [HttpStatus.CONFLICT]: 'The request conflicts with the current state',
  [HttpStatus.TOO_MANY_REQUESTS]: 'Too many requests, try again shortly',
  [HttpStatus.INTERNAL_SERVER_ERROR]: 'Something went wrong on our end',
};

const defaultMessageForStatus = (status) => STATUS_MESSAGES[status] ?? 'Request failed';

function normalizeError(error) {
  if (error instanceof ApiError) return error;

  // Request cancelled via an AbortSignal — not an error, propagate as-is.
  if (axios.isCancel(error) || error.code === 'ERR_CANCELED') {
    return new ApiError({ status: 0, message: 'Request cancelled', code: 'CANCELLED', cause: error });
  }

  // No HTTP response: network failure or timeout.
  if (!error.response) {
    const timedOut = error.code === 'ECONNABORTED';
    return new ApiError({
      status: 0,
      message: timedOut ? 'Request timed out' : 'Network request failed',
      code: timedOut ? 'TIMEOUT' : 'NETWORK_ERROR',
      cause: error,
    });
  }

  const { status, data } = error.response;
  const payload = data?.error;
  return new ApiError({
    status,
    message: payload?.message ?? defaultMessageForStatus(status),
    code: payload?.code ?? `HTTP_${status}`,
    details: payload,
    cause: error,
  });
}

// ---------------------------------------------------------------------------
// Axios instance
// ---------------------------------------------------------------------------
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  timeout: DEFAULT_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Unwrap axios so callers receive the response body directly.
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(normalizeError(error)),
);

// Attach auth tokens here once the backend requires them, e.g.:
// apiClient.interceptors.request.use((config) => {
//   const token = getAuthToken();
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// ---------------------------------------------------------------------------
// HTTP helpers
// ---------------------------------------------------------------------------
/**
 * @param {string} path
 * @param {RequestOptions} [options]
 * @returns {Promise<unknown>}
 */
const get = (path, options = {}) => apiClient.get(path, options);

/**
 * @param {string} path
 * @param {Record<string, unknown>} [body]
 * @param {RequestOptions} [options]
 * @returns {Promise<unknown>}
 */
const post = (path, body, options = {}) => apiClient.post(path, body, options);

/**
 * @param {string} path
 * @param {Record<string, unknown>} [body]
 * @param {RequestOptions} [options]
 * @returns {Promise<unknown>}
 */
const patch = (path, body, options = {}) => apiClient.patch(path, body, options);

export const http = Object.freeze({ get, post, patch });

export default apiClient;