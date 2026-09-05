/**
 * Recognition award taxonomy — a UI-level distinction layered on top of the
 * backend contribution types. The backend eligibility engine decides each
 * person's highest qualified level (mutually exclusive, evaluated highest →
 * lowest); the frontend only maps those keys to presentation metadata.
 */

export const AWARD_LEVELS = {
  monthly: {
    key: 'monthly',
    label: 'Monthly Award',
    shortLabel: 'Monthly Award',
    title: 'Monthly Awards',
    description: 'Consistent impact and noteworthy contributions every month.',
    color: '#5f8065',
    bg: 'var(--success-lighter)',
    icon: 'calendar',
  },
  quarterly: {
    key: 'quarterly',
    label: 'Quarterly Award',
    shortLabel: 'Quarterly Award',
    title: 'Quarterly Awards',
    description: 'Significant contributions that drive project and team success.',
    color: '#0da6d6',
    bg: 'var(--info-lighter)',
    icon: 'analytics',
  },
  eminence: {
    key: 'eminence',
    label: 'Eminence Award',
    shortLabel: 'Eminence Award',
    title: 'Eminence Awards',
    description: 'Exceptional impact in specialized areas such as innovation, knowledge or technical excellence.',
    color: '#7658d6',
    bg: 'var(--violet-lighter)',
    icon: 'star',
  },
  league: {
    key: 'league',
    label: 'League Extraordinaire',
    shortLabel: 'League Extraordinaire',
    title: 'League Extraordinaire',
    description: 'The highest recognition for transformational, long-term organizational impact.',
    color: '#b8894f',
    bg: 'var(--amber-lighter)',
    icon: 'medal',
    premium: true,
  },
};

/** Display order: lowest milestone → highest. */
export const AWARD_LEVEL_ORDER = ['monthly', 'quarterly', 'eminence', 'league'];

/** Existing backend contribution types as UI "contribution dimensions". */
export const CONTRIBUTION_DIMENSIONS = [
  { key: 'reliability', label: 'Reliability', color: '#159a8a' },
  { key: 'delivery', label: 'Delivery', color: '#708061' },
  { key: 'mentorship', label: 'Mentorship', color: '#0da6d6' },
  { key: 'knowledge_sharing', label: 'Knowledge Sharing', color: '#7658d6' },
];

/** Tab labels for the navigation (spec section 5). */
export const RECOGNITION_TABS = [
  { key: 'overview', label: 'Overview' },
  ...AWARD_LEVEL_ORDER.map((key) => ({
    key,
    label: key === 'league' ? 'League Extraordinaire (Yearly)' : AWARD_LEVELS[key].title,
  })),
];