// Minimal localStorage persistence for the auth token. Kept dependency-free so
// the axios client can attach it without importing the auth store (no cycles).

const STORAGE_KEY = 'aieip.auth.token';

/** @returns {string|null} the stored token, if any. */
export function getToken() {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

/** Persist (or clear, when null) the token. */
export function setToken(token) {
  try {
    if (token) window.localStorage.setItem(STORAGE_KEY, token);
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage unavailable (private mode) — auth still works for the session.
  }
}

/** Remove the stored token. */
export function clearToken() {
  setToken(null);
}