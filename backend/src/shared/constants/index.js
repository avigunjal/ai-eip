// Shared constants: severity/category labels shared across the API.

// A fixed "demo today" keeps every date deterministic and stable across
// re-seeds, unlike relative dates which drift on every run.
export const DEMO_TODAY = '2026-08-16';

export const SEVERITIES = ['critical', 'high', 'medium', 'low'];

export const RISK_CATEGORIES = ['schedule', 'dependency', 'knowledge', 'capacity', 'quality'];

export const EXPERTISE_LEVELS = ['primary', 'capable', 'learning', 'unverified'];

// Severity thresholds used for both risk scores and knowledge concentration.
// Order matters: first matching threshold wins.
export const SEVERITY_THRESHOLDS = [
  { min: 80, severity: 'critical' },
  { min: 60, severity: 'high' },
  { min: 40, severity: 'medium' },
  { min: 0, severity: 'low' },
];

export function severityFor(score) {
  const threshold = SEVERITY_THRESHOLDS.find((entry) => score >= entry.min) ?? SEVERITY_THRESHOLDS[SEVERITY_THRESHOLDS.length - 1];
  return threshold.severity;
}