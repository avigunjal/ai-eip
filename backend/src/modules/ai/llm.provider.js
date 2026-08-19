// LLM provider registry. The AI service talks only to this module; swapping
// providers (OpenRouter, xAI Grok, ...) never touches business logic.
//
//   ai.service.js → llm.provider.js → openrouter.provider.js / xai.provider.js

import { env } from '../../config/env.config.js';
import { isAiEnabled as isRuntimeEnabled } from './ai.settings.js';

/** Error thrown by any provider on timeout, network, HTTP, or parse failures. */
export class ProviderError extends Error {
  constructor(message, { code = 'PROVIDER_ERROR', status = null, retryAfter = null, cause } = {}) {
    super(message);
    this.name = 'ProviderError';
    this.code = code;
    this.status = status;
    this.retryAfter = retryAfter;
    this.cause = cause;
  }
}

const providers = new Map();

/**
 * Register a provider factory. The factory runs lazily so a missing API key at
 * import time never breaks registration.
 * @param {string} name
 * @param {() => object} factory
 */
export function registerProvider(name, factory) {
  providers.set(name, factory);
}

/** The provider selected by env.aiProvider, or null when not registered. */
export function getLLMProvider() {
  const factory = providers.get(env.aiProvider);
  return factory ? factory() : null;
}

/**
 * True only when the runtime switch is on, the selected provider is registered,
 * and its API key is present. Anything else keeps the app deterministic.
 */
export function isAIEnabled() {
  if (!isRuntimeEnabled()) return false;
  if (!providers.has(env.aiProvider)) return false;
  const apiKey = env.aiProvider === 'openrouter' ? env.openrouterApiKey : env.xaiApiKey;
  return Boolean(apiKey);
}

// ---------------------------------------------------------------------------
// Structured JSON parsing (shared by providers)
// ---------------------------------------------------------------------------

function tryParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/**
 * Parse structured JSON from a model response. Handles markdown code fences,
 * wrapping braces (`{ {...} }`), and trailing prose by scanning every balanced
 * `{...}` candidate. Throws ProviderError(MALFORMED_RESPONSE) when nothing parses.
 */
export function parseStructuredJson(text) {
  const trimmed = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
  const direct = tryParse(trimmed);
  if (direct !== null) return direct;

  const start = trimmed.indexOf('{');
  if (start !== -1) {
    for (let i = start; i < trimmed.length; i += 1) {
      if (trimmed[i] !== '{') continue;
      let depth = 0;
      for (let j = i; j < trimmed.length; j += 1) {
        if (trimmed[j] === '{') depth += 1;
        else if (trimmed[j] === '}') {
          depth -= 1;
          if (depth === 0) {
            const parsed = tryParse(trimmed.slice(i, j + 1));
            if (parsed !== null) return parsed;
            break;
          }
        }
      }
    }
  }
  throw new ProviderError('LLM response was not valid JSON', { code: 'MALFORMED_RESPONSE' });
}