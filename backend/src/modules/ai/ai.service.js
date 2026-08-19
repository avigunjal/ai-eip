// AI domain service. Orchestrates the three AI use cases, always keeping the
// app deterministic-safe:
//
//   deterministic intelligence → compact context → LLM (if enabled) → validate
//   → cache. Any provider failure falls back to deterministic output, never a 500.
//
// Request protection (three layers):
//   1. 5-minute completed-result cache
//   2. In-flight per-key Promise dedupe (entry removed in finally)
//   3. Frontend loading state

import { env } from '../../config/env.config.js';
import { AppError } from '../../shared/errors/app.error.js';
import { getProjectById } from '../project/project.service.js';
import { listInsights, findInsightById } from '../insight/insight.service.js';
import { findByEntityId } from '../evidence/evidence.repository.js';
import { composeForProject } from '../team-composer/team-composer.service.js';
import { registerProvider, getLLMProvider, isAIEnabled, ProviderError } from './llm.provider.js';
import { getAiSettings, setAiEnabled } from './ai.settings.js';
import { createOpenRouterProvider } from './openrouter.provider.js';
import { createXaiProvider } from './xai.provider.js';
import {
  SYSTEM_ANALYZE,
  SYSTEM_INSIGHTS,
  SYSTEM_COMPOSITION,
  projectContext,
  insightsContext,
  compositionContext,
} from './context.js';
import {
  PROJECT_ANALYSIS_SCHEMA,
  INSIGHT_EXPLANATION_SCHEMA,
  COMPOSITION_EXPLANATION_SCHEMA,
} from './schemas.js';

registerProvider('openrouter', () => createOpenRouterProvider({ apiKey: env.openrouterApiKey, model: env.openrouterModel }));
registerProvider('xai', () => createXaiProvider({ apiKey: env.xaiApiKey, model: env.xaiModel }));

// ---------------------------------------------------------------------------
// Cache + in-flight dedupe
// ---------------------------------------------------------------------------

const CACHE_TTL_MS = 5 * 60 * 1000;
// Project analyses are cached for 30 minutes so re-opening a project page (or
// re-running an analysis) never hits the LLM twice for the same deterministic
// result. Explicit regeneration bypasses the cache. In-memory only for MVP.
export const ANALYSIS_CACHE_TTL_MS = 30 * 60 * 1000;
// Insight explanations are cached per insight for 30 minutes so re-opening the
// Insights page (or explaining again) never hits the LLM twice for the same
// deterministic result. In-memory only for MVP.
const INSIGHT_CACHE_TTL_MS = 30 * 60 * 1000;
const cache = new Map();
const inFlight = new Map();

function getCached(key, ttl = CACHE_TTL_MS) {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (Date.now() - entry.at > ttl) {
    cache.delete(key);
    return undefined;
  }
  return entry.value;
}

async function runCached(key, factory, ttl = CACHE_TTL_MS) {
  const cached = getCached(key, ttl);
  if (cached !== undefined) return cached;
  if (inFlight.has(key)) return inFlight.get(key);

  const promise = (async () => {
    const value = await factory();
    cache.set(key, { at: Date.now(), value });
    return value;
  })();

  inFlight.set(key, promise);
  try {
    return await promise;
  } finally {
    inFlight.delete(key);
  }
}

// In-flight dedupe without caching: concurrent duplicate requests share one
// upstream call, but the result is never stored as a whole (per-insight cache
// entries are the source of truth for insight explanations).
async function runOnce(key, factory) {
  if (inFlight.has(key)) return inFlight.get(key);
  const promise = (async () => factory())();
  inFlight.set(key, promise);
  try {
    return await promise;
  } finally {
    inFlight.delete(key);
  }
}

// Bounded LLM retry. Max 3 attempts total (2 retries). The free router picks a
// random model per call, so a second/third attempt often lands on a cooperative
// one. Transient failures (timeout, network, rate-limit, 5xx, malformed output)
// are retried with a short capped backoff so users never have to click again;
// non-transient errors (4xx) fail fast to the deterministic fallback. Returns
// { model, coerced } or null when every attempt produced unusable output.
const MAX_LLM_ATTEMPTS = 3;
const MAX_RATE_LIMIT_WAIT_MS = 5_000;
const RETRYABLE_HTTP_STATUSES = new Set([429, 500, 502, 503, 504]);
const RETRYABLE_CODES = new Set(['MALFORMED_RESPONSE', 'TIMEOUT', 'NETWORK', 'RATE_LIMITED']);

function isRetryableError(error) {
  if (!(error instanceof ProviderError)) return false;
  if (!error.status) return RETRYABLE_CODES.has(error.code);
  return RETRYABLE_HTTP_STATUSES.has(error.status);
}

function backoffMs(attempt, error) {
  if (error?.retryAfter) {
    const seconds = Number(error.retryAfter);
    if (Number.isFinite(seconds)) return Math.min(seconds * 1000, MAX_RATE_LIMIT_WAIT_MS);
  }
  return 300 * (attempt + 1);
}

async function completeWithRetry(provider, system, user, options, coerce) {
  for (let attempt = 0; attempt < MAX_LLM_ATTEMPTS; attempt += 1) {
    let content;
    let model;
    try {
      ({ content, model } = await provider.complete(system, user, options));
    } catch (error) {
      if (attempt < MAX_LLM_ATTEMPTS - 1 && isRetryableError(error)) {
        await delay(backoffMs(attempt, error));
        continue;
      }
      throw error;
    }
    const coerced = coerce(content);
    if (coerced !== null) return { model, coerced };
    if (attempt < MAX_LLM_ATTEMPTS - 1) continue;
  }
  return null;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Output coercion — LLM output is advisory; invalid output ⇒ deterministic.
// ---------------------------------------------------------------------------

function asStringArray(value, cap = 5) {
  if (!Array.isArray(value)) return [];
  const flat = [];
  const walk = (items) => {
    for (const item of items) {
      if (typeof item === 'string' && item.trim()) flat.push(item.trim());
      else if (Array.isArray(item)) walk(item);
    }
  };
  walk(value);
  return flat.slice(0, cap);
}

function clampConfidence(value) {
  return Number.isFinite(value) ? Math.min(100, Math.max(0, Math.round(value))) : null;
}

// The LLM self-assesses the grounding of its analysis. An aberrantly low value
// (e.g. 1%) would be misleading, so anything below the floor surfaces as null
// and the UI renders n/a.
const MIN_GROUNDED_CONFIDENCE = 20;

function groundedConfidence(value) {
  const clamped = clampConfidence(value);
  return clamped !== null && clamped < MIN_GROUNDED_CONFIDENCE ? null : clamped;
}

function coerceEvidence(value, cap = 5) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => item && typeof item === 'object')
    .map((item) => ({
      id: typeof item.id === 'string' ? item.id.trim() : '',
      type: typeof item.type === 'string' ? item.type.trim() : '',
      summary: typeof item.summary === 'string' ? item.summary.trim() : '',
    }))
    .filter((item) => item.id && item.type && item.summary)
    .slice(0, cap);
}

function coerceProjectAnalysis(content) {
  if (!content || typeof content !== 'object') return null;
  const summary = typeof content.summary === 'string' ? content.summary.trim() : '';
  const findings = asStringArray(content.findings);
  const recommendedActions = asStringArray(content.recommendedActions);
  if (!summary || (findings.length === 0 && recommendedActions.length === 0)) return null;
  return {
    summary,
    findings,
    recommendedActions,
    confidence: groundedConfidence(content.confidence),
    evidence: coerceEvidence(content.evidence),
  };
}

function coerceInsightExplanations(content) {
  if (!content || typeof content !== 'object') return null;
  if (!Array.isArray(content.explanations)) return null;
  const byInsightId = new Map();
  for (const item of content.explanations) {
    if (!item || typeof item !== 'object') continue;
    const explanation = item.explanation;
    if (typeof item.insightId !== 'string' || !explanation || typeof explanation !== 'object') continue;
    const reasoning = typeof explanation.reasoning === 'string' ? explanation.reasoning.trim() : '';
    const impact = typeof explanation.impact === 'string' ? explanation.impact.trim() : null;
    if (reasoning) byInsightId.set(item.insightId, { reasoning, impact });
  }
  return byInsightId.size ? byInsightId : null;
}

function coerceCompositionExplanation(content) {
  if (!content || typeof content !== 'object') return null;
  const explanation = content.explanation;
  if (!explanation || typeof explanation !== 'object') return null;
  const whyThisTeam = typeof explanation.whyThisTeam === 'string' ? explanation.whyThisTeam.trim() : '';
  if (!whyThisTeam) return null;
  return {
    whyThisTeam,
    tradeOffs: typeof explanation.tradeOffs === 'string' ? explanation.tradeOffs.trim() : null,
    expectedImpact: typeof explanation.expectedImpact === 'string' ? explanation.expectedImpact.trim() : null,
    confidence: groundedConfidence(explanation.confidence),
  };
}

// ---------------------------------------------------------------------------
// Deterministic fallbacks
// ---------------------------------------------------------------------------

const STATUS_LABEL = { on_track: 'on track', at_risk: 'at risk', on_hold: 'on hold', completed: 'complete' };

function deterministicAnalysis(project) {
  const status = STATUS_LABEL[project.status] ?? project.status;
  const topDriver = project.risk?.drivers?.[0];
  const drivers = project.risk?.drivers ?? [];
  return {
    projectId: project.id,
    source: 'deterministic',
    provider: null,
    model: null,
    generatedAt: new Date().toISOString(),
    summary: `${project.name} is ${status} with a health score of ${project.healthScore} and ${project.deliveryConfidence}% delivery confidence.`
      + (topDriver ? ` Primary driver: ${topDriver.title}.` : ''),
    findings: drivers.slice(0, 3).map((driver) => `${driver.title} (${driver.category})`),
    recommendedActions: (project.risks ?? [])
      .slice(0, 3)
      .flatMap((risk) => (risk.actions ?? []).map((action) => action.title))
      .slice(0, 5),
    evidence: drivers.slice(0, 3).map((driver) => ({
      id: driver.riskId ?? driver.title,
      type: 'risk',
      summary: driver.title,
    })),
    // A deterministic fallback has no AI grounding to self-assess, so there is
    // no analysis confidence. Delivery confidence stays on the project KPIs.
    confidence: null,
  };
}

// ---------------------------------------------------------------------------
// Existing deterministic endpoints (unchanged)
// ---------------------------------------------------------------------------

export async function generateInsights() {
  return listInsights();
}

export async function findEvidence(entityId) {
  return findByEntityId(entityId);
}

// ---------------------------------------------------------------------------
// Runtime AI settings (Module 0.5)
// ---------------------------------------------------------------------------

/**
 * Read the current runtime AI settings (key-free). Provider/model are read-only
 * views of the environment; only `enabled` is runtime-mutable.
 */
export function getSettings() {
  return getAiSettings();
}

/**
 * Update the runtime enable state. The AI result cache is cleared so a switch
 * to deterministic mode can never serve a previously cached LLM result.
 * @param {{ enabled: boolean }} input
 */
export function updateSettings({ enabled }) {
  setAiEnabled(enabled);
  cache.clear();
  return getAiSettings();
}

// ---------------------------------------------------------------------------
// Use case 1 — project AI analysis
// ---------------------------------------------------------------------------

function buildProjectAnalysis(project, provider, outcome) {
  const { model, coerced } = outcome;
  return {
    projectId: project.id,
    source: 'llm',
    provider: provider.name,
    model,
    generatedAt: new Date().toISOString(),
    summary: coerced.summary,
    findings: coerced.findings,
    recommendedActions: coerced.recommendedActions,
    confidence: coerced.confidence ?? null,
    evidence: coerced.evidence,
  };
}

/**
 * Cache-only read used on page load. The deterministic assessment is always
 * computed (source of truth, no LLM involved); `ai` is the previously cached
 * LLM result or null — the UI shows an empty "Explain with AI" state then.
 */
export async function getProjectAssessment(projectId) {
  const project = await getProjectById(projectId);
  if (!project) return null;
  return {
    deterministic: deterministicAnalysis(project),
    ai: getCached(`project-analysis:${projectId}`, ANALYSIS_CACHE_TTL_MS) ?? null,
  };
}

/**
 * Explicit "Explain with AI" action. Serves the cached AI analysis on a HIT;
 * otherwise calls the LLM exactly once (in-flight dedupe shares concurrent
 * requests) and caches the result. Returns `{ found, analysis }` — `analysis`
 * is null when AI is unavailable or the provider failed, never a deterministic
 * fallback (the deterministic assessment is served separately, always on).
 */
export async function analyzeProject(projectId) {
  const project = await getProjectById(projectId);
  if (!project) return { found: false, analysis: null };

  const key = `project-analysis:${projectId}`;
  const cached = getCached(key, ANALYSIS_CACHE_TTL_MS);
  if (cached !== undefined) return { found: true, analysis: cached };

  return runOnce(key, async () => {
    const provider = isAIEnabled() ? getLLMProvider() : null;
    if (!provider) return { found: true, analysis: null };

    try {
      const outcome = await completeWithRetry(
        provider,
        SYSTEM_ANALYZE,
        projectContext(project),
        { maxTokens: 2048, schema: PROJECT_ANALYSIS_SCHEMA },
        coerceProjectAnalysis,
      );
      if (!outcome) return { found: true, analysis: null };
      const value = buildProjectAnalysis(project, provider, outcome);
      cache.set(key, { at: Date.now(), value });
      return { found: true, analysis: value };
    } catch (error) {
      if (error instanceof ProviderError) {
        console.warn(`[ai] ${provider.name} failed (${error.code}) explaining project ${project.id}.`);
        return { found: true, analysis: null };
      }
      throw error;
    }
  });
}

// ---------------------------------------------------------------------------
// Use case 2 — AI insight explanation (per-insight cache + regenerate)
// ---------------------------------------------------------------------------

/**
 * Run the LLM over `insights` and return a Map<insightId, cached-value>. The
 * explanation contract is advisory-only: `reasoning` (why the evidence creates
 * the risk) and `impact` (the practical consequence). Deterministic scores,
 * confidence, evidence, drivers, and recommended actions are never modified.
 * Returns null when the LLM produced no usable output.
 */
async function explainWithProvider(provider, insights) {
  const outcome = await completeWithRetry(
    provider,
    SYSTEM_INSIGHTS,
    insightsContext(insights),
    { maxTokens: 2048, schema: INSIGHT_EXPLANATION_SCHEMA },
    coerceInsightExplanations,
  );
  if (!outcome) return null;
  const byInsightId = outcome.coerced;
  const results = new Map();
  for (const insight of insights) {
    const llm = byInsightId.get(insight.id);
    if (llm) {
      results.set(insight.id, {
        explanation: { reasoning: llm.reasoning, impact: llm.impact ?? null },
        source: 'llm',
        provider: provider.name,
        model: outcome.model,
        generatedAt: new Date().toISOString(),
      });
    }
  }
  return results.size ? results : null;
}

/** Deterministic explanation for an insight (used when AI is off/fails). */
function deterministicInsightExplanation(insight, generatedAt = new Date().toISOString()) {
  return {
    explanation: { reasoning: insight.summary, impact: null },
    source: 'deterministic',
    provider: null,
    model: null,
    generatedAt,
  };
}

/**
 * Explain all deterministic insights, one batch LLM call only for the insights
 * missing from the per-insight cache. Previously generated explanations are
 * served from cache (30 min) — never re-fetched on page load.
 */
export async function explainInsights() {
  return runOnce('insight-explanation:batch', async () => {
    const insights = await listInsights();
    const provider = isAIEnabled() ? getLLMProvider() : null;
    const missing = insights.filter((insight) => !getCached(`insight:${insight.id}`, INSIGHT_CACHE_TTL_MS));

    if (provider && missing.length > 0) {
      try {
        const results = await explainWithProvider(provider, missing);
        for (const [id, value] of results ?? []) cache.set(`insight:${id}`, { at: Date.now(), value });
      } catch (error) {
        if (!(error instanceof ProviderError)) throw error;
        console.warn(`[ai] ${provider.name} failed (${error.code}); using deterministic insight explanations.`);
      }
    }

    const now = new Date().toISOString();
    const explained = insights.map((insight) => {
      const cached = getCached(`insight:${insight.id}`, INSIGHT_CACHE_TTL_MS);
      const { explanation, source, provider: p, model, generatedAt } = cached
        ?? deterministicInsightExplanation(insight, now);
      return {
        ...insight,
        explanation,
        explanationMeta: { source, provider: p, model, generatedAt },
      };
    });

    return {
      insights: explained,
      source: explained.some((insight) => insight.explanationMeta.source === 'llm') ? 'llm' : 'deterministic',
      generatedAt: now,
    };
  });
}

/**
 * Explicitly regenerate a single insight's explanation: bypass the cache, call
 * the LLM, and store the fresh result. On failure the previous cached
 * explanation is kept and an error is thrown — the previous result is never
 * lost.
 */
export async function regenerateInsightExplanation(insightId) {
  const insight = await findInsightById(insightId);
  if (!insight) return null;

  const key = `insight:${insightId}`;
  const previous = getCached(key, INSIGHT_CACHE_TTL_MS);

  const provider = isAIEnabled() ? getLLMProvider() : null;
  if (!provider) throw new AppError(503, 'AI is disabled — nothing to regenerate.');

  let value;
  try {
    const results = await explainWithProvider(provider, [insight]);
    value = results?.get(insightId) ?? null;
  } catch (error) {
    if (!(error instanceof ProviderError)) throw error;
    console.warn(`[ai] regeneration failed (${error.code}) for insight ${insightId}.`);
    value = null;
  }

  if (value) {
    cache.set(key, { at: Date.now(), value });
    return {
      insightId,
      explanation: value.explanation,
      explanationMeta: {
        source: value.source,
        provider: value.provider,
        model: value.model,
        generatedAt: value.generatedAt,
      },
    };
  }

  // Failed: restore the previous valid explanation and report the error.
  if (previous) cache.set(key, { at: Date.now(), value: previous });
  throw new AppError(502, 'AI regeneration failed; the previous explanation is still available.');
}

/** Normalize a per-insight cached value into the API response shape. */
function toInsightExplanationShape(insightId, value) {
  return {
    insightId,
    explanation: value.explanation,
    explanationMeta: {
      source: value.source,
      provider: value.provider,
      model: value.model,
      generatedAt: value.generatedAt,
    },
  };
}

/**
 * Explicit "Explain with AI" for ONE insight. Serves the per-insight cache on
 * a hit; otherwise explains only this insight (a small LLM call, never the
 * whole page) and caches the result. Deterministic fallback when AI is off.
 */
export async function explainInsight(insightId) {
  const insight = await findInsightById(insightId);
  if (!insight) return null;

  const key = `insight:${insightId}`;
  const cached = getCached(key, INSIGHT_CACHE_TTL_MS);
  if (cached) return toInsightExplanationShape(insightId, cached);

  const provider = isAIEnabled() ? getLLMProvider() : null;
  if (!provider) return toInsightExplanationShape(insightId, deterministicInsightExplanation(insight));

  let value;
  try {
    const results = await explainWithProvider(provider, [insight]);
    value = results?.get(insightId) ?? null;
  } catch (error) {
    if (!(error instanceof ProviderError)) throw error;
    console.warn(`[ai] ${provider.name} failed (${error.code}) explaining insight ${insightId}.`);
    value = null;
  }

  if (value) {
    cache.set(key, { at: Date.now(), value });
    return toInsightExplanationShape(insightId, value);
  }
  return toInsightExplanationShape(insightId, deterministicInsightExplanation(insight));
}

/**
 * Cache-only read for the Insights page (no LLM call ever): every insight with
 * its cached AI explanation (or null) so revisits surface previously generated
 * explanations without regenerating them.
 */
export async function getInsightExplanations() {
  const insights = await listInsights();
  return insights.map((insight) => {
    const cached = getCached(`insight:${insight.id}`, INSIGHT_CACHE_TTL_MS);
    return cached
      ? toInsightExplanationShape(insight.id, cached)
      : { insightId: insight.id, explanation: null, explanationMeta: null };
  });
}

/**
 * Explicitly regenerate a project's AI analysis: bypass the 30-min cache, call
 * the LLM, and store the fresh result. On failure the previous cached analysis
 * is kept and an error is thrown — the previous result is never lost.
 */
export async function regenerateProjectAnalysis(projectId) {
  const project = await getProjectById(projectId);
  if (!project) return null;

  const key = `project-analysis:${projectId}`;
  const previous = getCached(key, ANALYSIS_CACHE_TTL_MS);

  const provider = isAIEnabled() ? getLLMProvider() : null;
  if (!provider) throw new AppError(503, 'AI is disabled — nothing to regenerate.');

  let value;
  try {
    const outcome = await completeWithRetry(
      provider,
      SYSTEM_ANALYZE,
      projectContext(project),
      { maxTokens: 2048, schema: PROJECT_ANALYSIS_SCHEMA },
      coerceProjectAnalysis,
    );
    if (outcome) {
      const { model, coerced } = outcome;
      value = {
        projectId: project.id,
        source: 'llm',
        provider: provider.name,
        model,
        generatedAt: new Date().toISOString(),
        summary: coerced.summary,
        findings: coerced.findings,
        recommendedActions: coerced.recommendedActions,
        confidence: coerced.confidence ?? null,
        evidence: coerced.evidence,
      };
    }
  } catch (error) {
    if (!(error instanceof ProviderError)) throw error;
    console.warn(`[ai] regeneration failed (${error.code}) for project ${projectId}.`);
    value = null;
  }

  if (value) {
    cache.set(key, { at: Date.now(), value });
    return value;
  }

  // Failed: restore the previous valid analysis and report the error.
  if (previous) cache.set(key, { at: Date.now(), value: previous });
  throw new AppError(502, 'AI regeneration failed; the previous analysis is still available.');
}

// ---------------------------------------------------------------------------
// Use case 3 — AI composition explanation
// ---------------------------------------------------------------------------

export async function explainComposition(projectId) {
  const composition = await composeForProject(projectId);
  if (!composition) return null;

  const key = `composition-explanation:${projectId}`;
  return runOnce(key, async () => {
    const cached = getCached(key, CACHE_TTL_MS);
    if (cached) return cached;

    const fallback = {
      recommendation: composition,
      explanation: {
        whyThisTeam: composition.rationale,
        tradeOffs: composition.tradeOff,
        expectedImpact: composition.impact,
        confidence: composition.assessment?.confidence ?? null,
      },
      source: 'deterministic',
      provider: null,
      model: null,
      generatedAt: new Date().toISOString(),
    };

    const provider = isAIEnabled() ? getLLMProvider() : null;
    if (!provider) return fallback;

    try {
      const outcome = await completeWithRetry(
        provider,
        SYSTEM_COMPOSITION,
        compositionContext(composition),
        { maxTokens: 1500, schema: COMPOSITION_EXPLANATION_SCHEMA },
        coerceCompositionExplanation,
      );
      if (!outcome) return fallback;
      const { model, coerced } = outcome;

      const value = {
        recommendation: composition,
        explanation: {
          ...coerced,
          confidence: coerced.confidence ?? null,
        },
        source: 'llm',
        provider: provider.name,
        model,
        generatedAt: new Date().toISOString(),
      };
      cache.set(key, { at: Date.now(), value });
      return value;
    } catch (error) {
      if (error instanceof ProviderError) {
        console.warn(`[ai] ${provider.name} failed (${error.code}); using deterministic composition explanation for ${projectId}.`);
        return fallback;
      }
      throw error;
    }
  });
}

/**
 * Cache-only read for the Composer page (no LLM call ever): the deterministic
 * explanation is always computed; `ai` is the cached LLM explanation or null.
 */
export async function getCompositionAssessment(projectId) {
  const composition = await composeForProject(projectId);
  if (!composition) return null;
  const cached = getCached(`composition-explanation:${projectId}`, CACHE_TTL_MS);
  return {
    deterministic: {
      whyThisTeam: composition.rationale,
      tradeOffs: composition.tradeOff,
      expectedImpact: composition.impact,
      confidence: composition.assessment?.confidence ?? null,
    },
    ai: cached?.source === 'llm' ? cached : null,
  };
}

/**
 * Explicitly regenerate a composition's AI explanation: bypass the cache, call
 * the LLM, and store the fresh result. On failure the previous cached
 * explanation is kept and an error is thrown.
 */
export async function regenerateCompositionExplanation(projectId) {
  const composition = await composeForProject(projectId);
  if (!composition) return null;

  const key = `composition-explanation:${projectId}`;
  const previous = getCached(key, CACHE_TTL_MS);

  const provider = isAIEnabled() ? getLLMProvider() : null;
  if (!provider) throw new AppError(503, 'AI is disabled — nothing to regenerate.');

  let value;
  try {
    const outcome = await completeWithRetry(
      provider,
      SYSTEM_COMPOSITION,
      compositionContext(composition),
      { maxTokens: 1500, schema: COMPOSITION_EXPLANATION_SCHEMA },
      coerceCompositionExplanation,
    );
    if (outcome) {
      const { model, coerced } = outcome;
      value = {
        recommendation: composition,
        explanation: { ...coerced, confidence: coerced.confidence ?? null },
        source: 'llm',
        provider: provider.name,
        model,
        generatedAt: new Date().toISOString(),
      };
    }
  } catch (error) {
    if (!(error instanceof ProviderError)) throw error;
    console.warn(`[ai] regeneration failed (${error.code}) for composition ${projectId}.`);
    value = null;
  }

  if (value) {
    cache.set(key, { at: Date.now(), value });
    return value;
  }

  // Failed: restore the previous valid explanation and report the error.
  if (previous) cache.set(key, { at: Date.now(), value: previous });
  throw new AppError(502, 'AI regeneration failed; the previous explanation is still available.');
}