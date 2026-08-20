import axios from 'axios';
import { getToken } from '../auth/token.js';

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
  const normalized = new ApiError({
    status,
    message: payload?.message ?? defaultMessageForStatus(status),
    code: payload?.code ?? `HTTP_${status}`,
    details: payload,
    cause: error,
  });

  // A 401 from a guarded endpoint means the session is no longer valid.
  // The auth store listens for this and returns the app to the login gate.
  // Login/status probes may 401 legitimately (wrong password) — never treat
  // those as a session loss.
  const isAuthProbe = /\/auth\/(login|status)/.test(String(error.config?.url ?? ''));
  if (status === HttpStatus.UNAUTHORIZED && !isAuthProbe && typeof window !== 'undefined') {
    window.dispatchEvent(new Event('aieip:auth:expired'));
  }

  return normalized;
}

/**
 * Resolve the API base URL.
 * - If VITE_API_BASE_URL is explicitly set, use it.
 * - If running on localhost without an explicit URL, use the Vite proxy ('/api').
 * - This allows zero-config local dev while supporting remote prod URLs.
 */
function resolveBaseUrl() {
  const explicit = import.meta.env.VITE_API_BASE_URL;
  if (explicit) return explicit;

  // No explicit URL → if we're on localhost, use the dev proxy.
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return '/api';
  }

  // Fallback: assume same-origin API.
  return '/api';
}

// ---------------------------------------------------------------------------
// Axios instance
// ---------------------------------------------------------------------------
const apiClient = axios.create({
  baseURL: resolveBaseUrl(),
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

// Attach the signed token to every request so guarded endpoints stay open.
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

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

// ---------------------------------------------------------------------------
// Bounded automatic retry
// ---------------------------------------------------------------------------
/**
 * Default transient check for AI actions. Never retries on validation/4xx,
 * auth, aborts, or the app's own long timeouts — those always surface
 * immediately so users are not kept waiting on a dead-end path.
 */
function defaultRetryable(error) {
  if (error.isTimeout || error.isAbort || error.isUnauthorized) return false;
  if (error.status >= 500 && error.status < 600) return true;
  return error.status === HttpStatus.TOO_MANY_REQUESTS || error.isNetworkError;
}

/**
 * Retry an action a bounded number of times after transient failures so users
 * never have to click again on a network blip, rate-limit, or server hiccup.
 * Fails fast (re-throws immediately) on non-retryable errors.
 *
 * @template T
 * @param {() => Promise<T>} action
 * @param {{ retries?: number, baseDelayMs?: number, retryable?: (error: ApiError) => boolean }} [options]
 * @returns {Promise<T>}
 */
export async function withRetry(action, { retries = 1, baseDelayMs = 1_000, retryable = defaultRetryable } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await action();
    } catch (error) {
      lastError = error;
      if (!isApiError(error) || attempt >= retries || !retryable(error)) throw error;
      await new Promise((resolve) => setTimeout(resolve, baseDelayMs * 2 ** attempt));
    }
  }
  throw lastError;
}

export default apiClient;
