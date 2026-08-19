import { http } from './client.js';

/**
 * LLM-augmented AI endpoints. Every request is explicitly user-triggered
 * (no AI calls happen on page load) and always falls back to deterministic
 * output on the backend when AI is disabled or the provider fails.
 *
 * Free OpenRouter reasoning models can take a while to generate, so these
 * requests use a much longer timeout than the 10s app default.
 */
const AI_REQUEST_TIMEOUT_MS = 120_000;

/**
 * Cache-only read for the project detail page (no AI call ever). Returns the
 * always-on deterministic assessment plus the cached AI analysis (or null).
 *
 * @param {string} projectId
 * @returns {Promise<{ deterministic: ProjectAssessment, ai: ProjectAssessment|null }>}
 */
export async function getProjectAssessment(projectId) {
  return http.get(`/ai/analyze/project/${projectId}`);
}

/**
 * Explicit "Explain with AI" action. Serves the cached AI analysis on a hit;
 * otherwise calls the LLM once and caches the result. Returns the analysis
 * (source: "llm") or null when AI is unavailable — never a deterministic
 * fallback (the deterministic assessment is always shown separately).
 *
 * @param {string} projectId
 * @returns {Promise<ProjectAssessment|null>}
 */
export async function explainProjectAnalysis(projectId) {
  const { analysis } = await http.post(`/ai/analyze/project/${projectId}`, undefined, { timeout: AI_REQUEST_TIMEOUT_MS });
  return analysis;
}

/**
 * Explicitly regenerate a project's AI analysis (bypasses the cache). On
 * failure the backend keeps the previous analysis and returns an error.
 *
 * @param {string} projectId
 * @returns {Promise<ProjectAssessment>}
 */
export async function regenerateProjectAnalysis(projectId) {
  const { analysis } = await http.post(`/ai/analyze/project/${projectId}/regenerate`, undefined, { timeout: AI_REQUEST_TIMEOUT_MS });
  return analysis;
}

/**
 * Explain the deterministic insights in plain language. Previously generated
 * explanations are served from a 30-minute per-insight cache — this never
 * triggers an automatic LLM call on page load.
 *
 * @returns {Promise<{ insights: Insight[], source: string, generatedAt: string }>}
 */
export async function explainInsights() {
  return http.post('/ai/explain/insights', undefined, { timeout: AI_REQUEST_TIMEOUT_MS });
}

/**
 * Cache-only read for the Insights page (no AI call ever): every insight with
 * its cached AI explanation (or null) so revisits surface previously generated
 * explanations without regenerating them.
 *
 * @returns {Promise<Array<{ insightId: string, explanation: { reasoning: string, impact: string|null }|null, explanationMeta: object|null }>>}
 */
export async function fetchInsightExplanations() {
  return http.get('/ai/explain/insights');
}

/**
 * Explicit "Explain with AI" for a single insight. Only this insight is sent to
 * the LLM (a small call, never the whole page); repeat clicks are served from
 * the 30-minute per-insight cache.
 *
 * @param {string} insightId
 * @returns {Promise<{ insightId: string, explanation: { reasoning: string, impact: string|null }, explanationMeta: { source: string, provider: string|null, model: string|null, generatedAt: string } }>}
 */
export async function explainInsight(insightId) {
  return http.post(`/ai/explain/insights/${insightId}`, undefined, { timeout: AI_REQUEST_TIMEOUT_MS });
}

/**
 * Explicitly regenerate a single insight's AI explanation (bypasses the cache).
 * On failure the backend keeps the previous explanation and returns an error.
 *
 * @param {string} insightId
 * @returns {Promise<{ insightId: string, explanation: { reasoning: string, impact: string|null }, explanationMeta: { source: string, provider: string|null, model: string|null, generatedAt: string } }>}
 */
export async function regenerateInsightExplanation(insightId) {
  return http.post(`/ai/explain/insights/${insightId}/regenerate`, undefined, { timeout: AI_REQUEST_TIMEOUT_MS });
}

/**
 * Explain why a team was recommended for a project.
 *
 * @param {string} projectId
 * @returns {Promise<{ recommendation: TeamRecommendation, explanation: { whyThisTeam: string, tradeOffs: string|null, expectedImpact: string|null, confidence: number|null }, source: string, provider: string|null, model: string|null }>}
 */
export async function explainComposition(projectId) {
  return http.post('/ai/explain/composition', { projectId }, { timeout: AI_REQUEST_TIMEOUT_MS });
}

/**
 * Cache-only read for the Composer page (no AI call ever): the deterministic
 * explanation is always present; `ai` is the cached LLM explanation or null.
 *
 * @param {string} projectId
 * @returns {Promise<{ deterministic: { whyThisTeam: string, tradeOffs: string|null, expectedImpact: string|null, confidence: number|null }, ai: CompositionExplanation|null }>}
 */
export async function getCompositionAssessment(projectId) {
  return http.get(`/ai/explain/composition/${projectId}`);
}

/**
 * Explicitly regenerate a composition's AI explanation (bypasses the cache).
 * On failure the backend keeps the previous explanation and returns an error.
 *
 * @param {string} projectId
 * @returns {Promise<CompositionExplanation>}
 */
export async function regenerateCompositionExplanation(projectId) {
  return http.post(`/ai/explain/composition/${projectId}/regenerate`, undefined, { timeout: AI_REQUEST_TIMEOUT_MS });
}

/**
 * Runtime AI settings. `enabled` is the live toggle; provider/model are
 * read-only views of the backend environment. API keys never leave the server.
 *
 * @returns {Promise<{ enabled: boolean, provider: string, model: string }>}
 */
export async function fetchAiSettings() {
  return http.get('/ai/settings');
}

/**
 * Toggle the runtime AI setting (in-memory; does not touch .env).
 *
 * @param {{ enabled: boolean }} input
 * @returns {Promise<{ enabled: boolean, provider: string, model: string }>}
 */
export async function updateAiSettings({ enabled }) {
  return http.patch('/ai/settings', { enabled });
}