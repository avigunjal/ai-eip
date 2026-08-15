// Central mapping of severity / status → visual config.
// Pages read colors from here (via CSS variables) — never hard-code status
// colors in components. Color is never the only signal: every StatusBadge also
// shows an icon + text label.

export const severityConfig = {
  critical: { label: 'Critical', color: 'var(--red)', bg: 'var(--red-lighter)', tone: 'error' },
  high: { label: 'High', color: 'var(--red)', bg: 'var(--red-lighter)', tone: 'error' },
  medium: { label: 'Medium', color: 'var(--amber)', bg: 'var(--amber-lighter)', tone: 'warning' },
  low: { label: 'Low', color: 'var(--teal)', bg: 'var(--teal-lighter)', tone: 'success' },
};

// Project health status (health score thresholds drive tone).
export const healthConfig = {
  healthy: { label: 'Healthy', color: 'var(--teal)', bg: 'var(--teal-lighter)', tone: 'success' },
  attention: { label: 'Needs attention', color: 'var(--amber)', bg: 'var(--amber-lighter)', tone: 'warning' },
  critical: { label: 'Critical', color: 'var(--red)', bg: 'var(--red-lighter)', tone: 'error' },
};

// Project status badges.
export const projectStatusConfig = {
  on_track: { label: 'On track', color: 'var(--teal)', bg: 'var(--teal-lighter)', tone: 'success' },
  at_risk: { label: 'At risk', color: 'var(--amber)', bg: 'var(--amber-lighter)', tone: 'warning' },
  paused: { label: 'Paused', color: 'var(--violet)', bg: 'var(--violet-lighter)', tone: 'secondary' },
  complete: { label: 'Complete', color: 'var(--info)', bg: 'var(--info-lighter)', tone: 'info' },
};

// Risk register workflow status.
export const riskStatusConfig = {
  open: { label: 'Open', color: 'var(--red)', bg: 'var(--red-lighter)', tone: 'error' },
  monitoring: { label: 'Monitoring', color: 'var(--amber)', bg: 'var(--amber-lighter)', tone: 'warning' },
  mitigated: { label: 'Mitigated', color: 'var(--teal)', bg: 'var(--teal-lighter)', tone: 'success' },
};

// Risk trend direction.
export const trendConfig = {
  rising: { label: 'Rising', color: 'var(--red)' },
  stable: { label: 'Stable', color: 'var(--text-muted)' },
  improving: { label: 'Improving', color: 'var(--teal)' },
};

// Knowledge / coverage status derived from coverage %.
export function coverageStatus(coverage) {
  if (coverage >= 75) return healthConfig.healthy;
  if (coverage >= 45) return healthConfig.attention;
  return healthConfig.critical;
}

// Health status derived from health score.
export function healthStatus(score) {
  if (score >= 70) return healthConfig.healthy;
  if (score >= 45) return healthConfig.attention;
  return healthConfig.critical;
}

/** Map a severity key to its display config (safe fallback). */
export function getSeverity(key) {
  return severityConfig[key] ?? severityConfig.medium;
}

/** Map a project status key to its display config (safe fallback). */
export function getProjectStatus(key) {
  return projectStatusConfig[key] ?? projectStatusConfig.on_track;
}

/** Map a risk status key to its display config (safe fallback). */
export function getRiskStatus(key) {
  return riskStatusConfig[key] ?? riskStatusConfig.open;
}

// Knowledge risk level badges.
export const knowledgeRiskConfig = {
  critical: { label: 'Critical', color: 'var(--red)', bg: 'var(--red-lighter)', tone: 'error' },
  high: { label: 'High', color: 'var(--red)', bg: 'var(--red-lighter)', tone: 'error' },
  medium: { label: 'Medium', color: 'var(--amber)', bg: 'var(--amber-lighter)', tone: 'warning' },
  low: { label: 'Low', color: 'var(--teal)', bg: 'var(--teal-lighter)', tone: 'success' },
};

/** Map a knowledge risk level key to its display config (safe fallback). */
export function getRiskLevel(key) {
  return knowledgeRiskConfig[key] ?? knowledgeRiskConfig.low;
}
