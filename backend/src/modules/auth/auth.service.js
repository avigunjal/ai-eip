// Lightweight authentication: HMAC-signed bearer tokens (no JWT dependency).
// The API stays fully open in dev/demo until AUTH_PASSWORD is set.

import { createHmac, timingSafeEqual } from 'node:crypto';
import { env } from '../../config/env.config.js';

const TOKEN_TTL_MS = env.authTokenTtlHours * 60 * 60 * 1000;

/** base64url-encode a string or Buffer. */
function b64url(input) {
  return Buffer.from(input).toString('base64url');
}

/** HMAC-SHA256 signature, base64url-encoded. */
function sign(data) {
  return createHmac('sha256', env.authTokenSecret).update(data).digest('base64url');
}

/** Whether authentication is required (credentials configured). */
export function authEnabled() {
  return Boolean(env.authPassword);
}

/**
 * Constant-time string comparison for credentials.
 * @returns {boolean}
 */
function safeEqual(a, b) {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

/**
 * Validate username/password against the configured single credential.
 * @returns {string|null} the authenticated username, or null.
 */
export function validateCredentials(username, password) {
  if (!authEnabled()) return null;
  const okUser = typeof username === 'string' && safeEqual(username, env.authUser);
  const okPass = typeof password === 'string' && safeEqual(password, env.authPassword);
  return okUser && okPass ? env.authUser : null;
}

/**
 * Issue a signed token for a username with an expiry.
 * @returns {string} `payload.signature`
 */
export function issueToken(username) {
  const payload = b64url(JSON.stringify({ sub: username, exp: Date.now() + TOKEN_TTL_MS }));
  return `${payload}.${sign(payload)}`;
}

/**
 * Verify a bearer token. Returns the username when valid, else null.
 * Rejects tampered tokens, expired tokens, and malformed input.
 */
export function verifyToken(token) {
  if (typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payload, signature] = parts;
  const expected = sign(payload);
  const given = Buffer.from(signature);
  const want = Buffer.from(expected);
  if (given.length !== want.length || !timingSafeEqual(given, want)) return null;
  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (typeof decoded.sub !== 'string' || decoded.sub.length === 0) return null;
    if (typeof decoded.exp !== 'number' || decoded.exp < Date.now()) return null;
    return decoded.sub;
  } catch {
    return null;
  }
}

/** Extract a bearer token from an Authorization header, if present. */
export function bearerToken(header) {
  if (typeof header !== 'string') return null;
  return header.startsWith('Bearer ') ? header.slice('Bearer '.length) : null;
}