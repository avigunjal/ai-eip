/**
 * AI-output sanitization. AI endpoints can occasionally return malformed
 * content — raw JSON blobs, markdown-wrapped fragments, or non-numeric values.
 * Every LLM-derived field that reaches the UI passes through these guards at
 * the API boundary FIRST, so a bad model response degrades to a graceful
 * notice instead of broken markup. Provider/model ids are also stripped here:
 * the UI never needs them.
 */

export const AI_UNAVAILABLE = 'Analysis temporarily unavailable. Please try again.';

const MAX_TEXT_LENGTH = 4000;

const isNonEmptyText = (value) => typeof value === 'string' && value.trim().length > 0;

/**
 * Safe single text field. Anything that is not plainly a string (objects,
 * raw JSON-shaped blobs, empty) falls back to the graceful notice. A single
 * fenced code block is unwrapped so models occasionally wrapping prose in
 * backticks still render cleanly.
 */
export function sanitizeText(value, fallback = AI_UNAVAILABLE) {
  if (!isNonEmptyText(value)) return fallback;
  let text = value.trim();
  const fenced = text.match(/^```[a-zA-Z-]*\n([\s\S]*?)\n```$/);
  if (fenced) text = fenced[1].trim();
  if (/^[{[]/.test(text) || text.includes('{') || /<[a-z][\s\S]*>/i.test(text)) return fallback;
  text = text.replace(/\n{3,}/g, '\n\n');
  if (text.length > MAX_TEXT_LENGTH) text = `${text.slice(0, MAX_TEXT_LENGTH).trim()}…`;
  return text;
}

function sanitizeList(items) {
  if (!Array.isArray(items)) return [];
  return items
    .filter(isNonEmptyText)
    .map((item) => sanitizeText(item, null))
    .filter((item) => typeof item === 'string');
}

function sanitizeNumber(value, min = 0, max = 100) {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max
    ? Math.round(value)
    : null;
}

/**
 * AI explanation shape ({ reasoning, impact }) used by the insight and
 * composition flows. Always returns a renderable object; unusable fields drop
 * to the graceful notice rather than leaking raw content.
 */
export function sanitizeExplanation(explanation) {
  if (!explanation || typeof explanation !== 'object') {
    return { reasoning: AI_UNAVAILABLE, impact: null };
  }
  const reasoning = sanitizeText(explanation.reasoning);
  return {
    reasoning,
    impact: isNonEmptyText(explanation.impact) ? sanitizeText(explanation.impact, null) : null,
  };
}

/**
 * Strip AI metadata down to what the product surfaces. Provider/model ids are
 * deliberately dropped so nothing downstream can ever render them.
 */
export function sanitizeAiMeta(meta) {
  if (!meta || typeof meta !== 'object') return null;
  const clean = {};
  if (isNonEmptyText(meta.source)) clean.source = meta.source;
  if (isNonEmptyText(meta.generatedAt)) clean.generatedAt = meta.generatedAt;
  return clean;
}

/**
 * Normalize a project assessment. Only known fields are forwarded; anything
 * unexpected (including provider/model ids) is dropped.
 */
export function sanitizeAssessment(assessment) {
  if (!assessment || typeof assessment !== 'object') return null;
  const clean = {
    summary: sanitizeText(assessment.summary),
    findings: sanitizeList(assessment.findings),
    recommendedActions: sanitizeList(assessment.recommendedActions),
    confidence: sanitizeNumber(assessment.confidence, 0, 100),
    evidence: Array.isArray(assessment.evidence)
      ? assessment.evidence
          .filter((item) => item && typeof item === 'object')
          .slice(0, 8)
      : [],
    generatedAt: isNonEmptyText(assessment.generatedAt)
      ? assessment.generatedAt
      : new Date().toISOString(),
  };
  return clean;
}

/**
 * Normalize a composition explanation (Composer page). Keeps the backend's
 * wrapper shape ({ explanation, source, generatedAt, ... }) so consumers read
 * `ai.explanation` unchanged; only the LLM text fields are sanitized and
 * provider/model ids are dropped.
 */
export function sanitizeComposition(ai) {
  if (!ai || typeof ai !== 'object') return null;
  const raw = ai.explanation && typeof ai.explanation === 'object' ? ai.explanation : {};
  return {
    ...ai,
    explanation: {
      whyThisTeam: sanitizeText(raw.whyThisTeam),
      tradeOffs: isNonEmptyText(raw.tradeOffs) ? sanitizeText(raw.tradeOffs, null) : null,
      expectedImpact: isNonEmptyText(raw.expectedImpact) ? sanitizeText(raw.expectedImpact, null) : null,
      confidence: sanitizeNumber(raw.confidence, 0, 100),
    },
    provider: null,
    model: null,
  };
}

/**
 * Runtime AI settings surface. Provider/model are backend environment details
 * and are intentionally not part of what the settings page renders.
 */
export function sanitizeAiSettings(settings) {
  if (!settings || typeof settings !== 'object') return { enabled: false };
  return { enabled: Boolean(settings.enabled) };
}