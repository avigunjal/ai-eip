/**
 * Screen 1 (Decision Inbox) dataset. Centralized, data-driven mock data for
 * the decisions that need attention. Every item is a decision to make — not
 * simply a detected risk — with a stable id (used for /decision-intelligence/:id).
 *
 * The shape mirrors the spec data model: type, severity, context, question,
 * description, signals[] (label + value + tone), potentialValue.
 */

export const DECISION_CATEGORIES = [
  { key: 'staffing', label: 'Staffing' },
  { key: 'risk_mitigation', label: 'Risk mitigation' },
  { key: 'knowledge', label: 'Knowledge' },
  { key: 'priority_scope', label: 'Priority / Scope' },
];

export const DECISIONS = [
  {
    id: 'atlas-staffing',
    type: 'staffing',
    severity: 'critical',
    context: 'Atlas Platform Migration',
    question: 'How should we staff Atlas Platform Migration?',
    description:
      'The current team is above sustainable capacity and has gaps in critical platform skills.',
    signals: [
      { label: 'Capacity', value: '105%', tone: 'critical' },
      { label: 'Skills', value: '83%', tone: 'neutral' },
      { label: 'Risks', value: '2', tone: 'high' },
    ],
    potentialValue: { value: 342000, currency: 'USD' },
  },
  {
    id: 'payment-backup',
    type: 'knowledge',
    severity: 'critical',
    context: 'Payment Service',
    question: 'Who should be the backup owner for Payment Service?',
    description:
      'Critical knowledge is concentrated with a single primary engineer and no confirmed backup can independently support the service.',
    signals: [
      { label: 'Single owner', value: '1', tone: 'high' },
      { label: 'Docs coverage', value: '38%', tone: 'critical' },
      { label: 'Knowledge risk', value: 'Critical', tone: 'critical' },
    ],
    potentialValue: { value: 287000, currency: 'USD' },
  },
  {
    id: 'payments-delivery',
    type: 'risk_mitigation',
    severity: 'high',
    context: 'Payments 3.0',
    question: 'How do we reduce delivery risk for Payments 3.0?',
    description:
      'Multiple engineering signals indicate the current delivery plan may not be achievable without intervention.',
    signals: [
      { label: 'Risk score', value: '69', tone: 'high' },
      { label: 'Capacity', value: '116%', tone: 'critical' },
      { label: 'Risks', value: '3', tone: 'critical' },
    ],
    potentialValue: { value: 254000, currency: 'USD' },
  },
  {
    id: 'checkout-priority',
    type: 'priority_scope',
    severity: 'high',
    context: 'Checkout Modernization',
    question: 'Should we adjust scope or timeline?',
    description:
      'Two engineering teams are over capacity while critical dependencies are delaying delivery.',
    signals: [
      { label: 'Risk score', value: '58', tone: 'medium' },
      { label: 'Delivery confidence', value: '61%', tone: 'medium' },
      { label: 'Dependencies', value: '2', tone: 'medium' },
    ],
    potentialValue: { value: 181000, currency: 'USD' },
  },
  {
    id: 'reliability-staffing',
    type: 'staffing',
    severity: 'high',
    context: 'Multi-region Reliability',
    question: 'How should we improve system resilience?',
    description:
      'The platform needs additional reliability coverage while balancing available engineering capacity.',
    signals: [
      { label: 'Capacity', value: '82%', tone: 'positive' },
      { label: 'Skills', value: '81%', tone: 'neutral' },
      { label: 'Risks', value: '1', tone: 'medium' },
    ],
    potentialValue: { value: 126000, currency: 'USD' },
  },
  {
    id: 'data-lake-transfer',
    type: 'risk_mitigation',
    severity: 'medium',
    context: 'Data Lake Consolidation',
    question: 'How do we reduce documentation and knowledge transfer risk?',
    description:
      'Coverage remains low for a critical system dependency concentrated with one primary owner.',
    signals: [
      { label: 'Docs coverage', value: '45%', tone: 'medium' },
      { label: 'Knowledge risk', value: 'High', tone: 'high' },
      { label: 'Single owner', value: '1', tone: 'high' },
    ],
    potentialValue: { value: 98000, currency: 'USD' },
  },
];

/** KPI strip values (spec section 5). */
export const KPI_SUMMARY = {
  decisionsRequiringAction: 6,
  newInLast30Days: 2,
  estimatedValue: '$1.3M',
  riskReductionPct: '62%',
  aiConfidencePct: '84%',
};

/** Bottom summary — Potential outcomes (spec section 12.B). */
export const POTENTIAL_OUTCOMES = [
  { key: 'riskReduction', arrow: 'down', value: '62%', label: 'Risk reduction' },
  { key: 'capacity', arrow: 'up', value: '28%', label: 'Capacity' },
  { key: 'estimatedValue', arrow: null, value: '$727K', label: 'Value' },
  { key: 'singleOwner', arrow: null, value: '3', label: 'Single-owner risks resolved' },
];