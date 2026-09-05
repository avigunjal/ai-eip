// Recognition intelligence: deterministic scoring of a person's verified
// contributions. Never ranks people and never lets an LLM decide outcomes — it
// produces explainable, defensible signals from linked evidence and stored
// impact. The award engine consumes these signals as thresholds.

const SOURCE_WEIGHTS = {
  incident: 1.0,
  github: 0.9,
  pagerduty: 0.85,
  datadog: 0.8,
  jira: 0.7,
  docs: 0.6,
  planning: 0.5,
};

const ROLE_WEIGHTS = { primary: 2.0, supporting: 1.0 };

// A fully-specified bundle is one primary + one supporting evidence at full
// source weight and recency with metric specificity on the primary.
const BUNDLE_REFERENCE = 3.4;

// Single trailing window used by consistency/recency windows (30/60/90).
const TRACKING_WINDOW_DAYS = 90;

function clamp(value) {
  return Math.max(0, Math.min(100, value));
}

function daysBetween(fromDate, toDate) {
  const start = new Date(`${fromDate}T00:00:00Z`);
  const end = new Date(`${toDate}T00:00:00Z`);
  return Math.round((end - start) / 86400000);
}

// A "metric" is a numeric, unit-bearing claim (62%, 22 minutes, 8 engineer-hours).
// Verbal claims like "unblocked" or "three regions" are intentionally excluded
// so hard numbers, not adjectives, gate the exceptional tier.
export function hasMetric(text) {
  return /\b\d+(?:\.\d+)?\s*(?:%|minutes?|hours?|weeks?|days?|engineers?|regions?|teams?|ms)\b|\b\d+%/.test(text ?? '');
}

function recencyFactor(occurredAt, anchor) {
  const days = daysBetween(occurredAt, anchor);
  if (days <= 30) return 1.0;
  if (days <= 60) return 0.8;
  if (days <= 90) return 0.6;
  return 0.3;
}

function evidenceScore(evidence, anchor) {
  const value = (evidence ?? []).reduce((sum, item) => {
    const roleWeight = ROLE_WEIGHTS[item.role] ?? 1.0;
    const sourceWeight = SOURCE_WEIGHTS[item.source] ?? 0.5;
    const metricBonus = item.role === 'primary' && hasMetric(item.statement) ? 0.2 : 0;
    return sum + roleWeight * sourceWeight * recencyFactor(item.occurredAt, anchor) + metricBonus;
  }, 0);
  const score = clamp(Math.round((value / BUNDLE_REFERENCE) * 100));
  return { score, detail: value.toFixed(2) };
}

export function parseImpact(value) {
  try {
    const parsed = JSON.parse(value ?? '');
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
  } catch {
    return [];
  }
}

function impactScore(item) {
  const statements = item.impact ?? [];
  if (!statements.length) return 0;
  const metric = hasMetric(statements.join(' ')) || hasMetric(item.summary);
  return clamp(35 * statements.length + (metric ? 20 : 0));
}

export function evidenceStrengthFor(item, anchor) {
  return evidenceScore(item.evidence, anchor).score;
}

export function impactFor(item) {
  return impactScore(item);
}

// Recognized breadth: distinct projects/areas across the person's approved
// public contributions. Mirrors "scope of impact" without extra queries.
export function contributionBreadth(items) {
  const footprint = new Set();
  for (const item of items) {
    if (item.project?.id) footprint.add(`project:${item.project.id}`);
    if (item.knowledgeArea?.id) footprint.add(`area:${item.knowledgeArea.id}`);
  }
  return footprint.size;
}

function scopeScore(items) {
  const breadth = contributionBreadth(items);
  const scale = [0, 40, 60, 80, 100];
  return { score: scale[Math.min(breadth, scale.length - 1)], breadth };
}

function consistencyScore(items, anchor) {
  const inWindow = items.filter((item) => daysBetween(item.occurredAt, anchor) <= TRACKING_WINDOW_DAYS);
  const months = new Set(inWindow.map((item) => item.occurredAt.slice(0, 7)));
  const contributions = inWindow.length;
  let score = clamp(30 * contributions);
  if (months.size >= 2) score = clamp(score + 15);
  return { score, contributions, monthsSpan: months.size };
}

// Person-level intelligence over their approved public contributions. `anchor`
// is the latest public feed date so windows never drift with the wall clock.
export function intelligenceFor(items, anchor) {
  const strengths = items.map((item) => evidenceScore(item.evidence, anchor));
  const evidenceAvg = strengths.length
    ? Math.round(strengths.reduce((sum, item) => sum + item.score, 0) / strengths.length)
    : 0;
  const impactAvg = items.length
    ? Math.round(items.reduce((sum, item) => sum + impactScore(item), 0) / items.length)
    : 0;
  const scope = scopeScore(items);
  const consistency = consistencyScore(items, anchor);

  const score = Math.round(
    0.3 * evidenceAvg + 0.3 * impactAvg + 0.2 * scope.score + 0.2 * consistency.score,
  );
  const confidence = score >= 70 ? 'high' : score >= 45 ? 'medium' : 'low';

  return {
    evidenceStrength: evidenceAvg,
    impact: impactAvg,
    scope: scope.score,
    breadth: scope.breadth,
    consistency: consistency.score,
    contributions: consistency.contributions,
    monthsSpan: consistency.monthsSpan,
    score,
    confidence,
  };
}