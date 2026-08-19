// Runtime AI settings.
//
// AI_ENABLED from the environment seeds the initial state at process start;
// PATCH /api/ai/settings overrides it for the process lifetime. The runtime
// toggle never writes to .env and never persists (in-memory only for MVP).
// Provider/model stay read-only (configured in env) and API keys are never
// exposed.

import { env } from '../../config/env.config.js';

let enabled = env.aiEnabled;

/** Whether the AI reasoning layer is currently enabled. */
export function isAiEnabled() {
  return enabled;
}

/** Public, key-free view of the AI settings. */
export function getAiSettings() {
  return {
    enabled,
    provider: env.aiProvider,
    model: env.aiProvider === 'xai' ? env.xaiModel : env.openrouterModel,
  };
}

/** Set the runtime enable state. Returns the effective value. */
export function setAiEnabled(next) {
  enabled = Boolean(next);
  return enabled;
}
