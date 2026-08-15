// Shared constants for the AI-EIP mock app.

export const SEVERITY_ORDER = ['critical', 'high', 'medium', 'low'];

export const SEVERITIES = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export const RISK_CATEGORIES = [
  { key: 'schedule', label: 'Schedule' },
  { key: 'dependency', label: 'Dependency' },
  { key: 'knowledge', label: 'Knowledge' },
  { key: 'capacity', label: 'Capacity' },
  { key: 'quality', label: 'Quality' },
];

export const RISK_CATEGORY_LABELS = Object.fromEntries(
  RISK_CATEGORIES.map((c) => [c.key, c.label]),
);

export const RISK_STATUS = {
  open: 'Open',
  monitoring: 'Monitoring',
  mitigated: 'Mitigated',
};

export const PROJECT_STATUS = {
  on_track: 'On track',
  at_risk: 'At risk',
  paused: 'Paused',
  complete: 'Complete',
};

export const DATE_RANGES = [
  { key: '7d', label: 'Last 7 days', days: 7 },
  { key: '30d', label: 'Last 30 days', days: 30 },
  { key: '90d', label: 'Last 90 days', days: 90 },
];

export const DEFAULT_DATE_RANGE = '30d';

export const SUSTAINABLE_CAPACITY = 85;

// Layout dimensions (spec: 248px rail, 72px topbar, 1440 max content width).
export const SIDEBAR_WIDTH = 248;
export const TOPBAR_HEIGHT = 72;
export const CONTENT_MAX_WIDTH = 1400;
export const CONTENT_PADDING = 7; // in theme spacing units (7 * 8 = 56px)
