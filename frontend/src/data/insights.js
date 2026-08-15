/**
 * Mock AI insights shared by Overview and Insights pages.
 *
 * Each insight carries a severity, an AI confidence score, an evidence count,
 * and a structured "Why am I seeing this?" payload (Evidence → Reasoning →
 * Impact → AI Assessment) so the InsightCard can render an explainable,
 * evidence-backed disclosure.
 *
 * REMAINING (extend later):
 *  - derive from data/service.js selectors instead of a hard-coded list
 *  - per-insight `type` (risk / capacity / knowledge / recognition) for grouping
 */
export const insights = [
  {
    id: 'i-1',
    title: 'Atlas migration is slipping',
    summary: 'Review coverage is down 14% while the API contract is still pending, with 2 reviewers unavailable this sprint.',
    severity: 'high',
    confidence: 86,
    evidenceCount: 4,
    why: {
      evidence: [
        'Review coverage ↓14% vs. last 30 days',
        'API contract still pending finalization',
        '2 reviewers unavailable this sprint',
        'Similar migrations previously slipped 8–12 days',
      ],
      reasoning: 'Declining review coverage plus an unmerged contract removes the safety net for the migration, while unavailable reviewers stall the critical path.',
      impact: 'Likely schedule slip on a critical-path project; API contract delays block downstream teams (billing, checkout).',
      assessment: 'High Risk',
      assessmentTone: 'error',
    },
  },
  {
    id: 'i-2',
    title: 'Payments team above sustainable load',
    summary: 'Two engineers are >20% over capacity with no cross-training relief.',
    severity: 'high',
    confidence: 82,
    evidenceCount: 3,
    why: {
      evidence: [
        '2 engineers >20% over sustainable capacity',
        'No cross-training backup on billing engine',
        'On-call hours up 30% this month',
      ],
      reasoning: 'Overload plus a single-skilled team concentrates delivery and support risk on the same two people.',
      impact: 'Increased burnout risk, slower reviews, and higher chance of incident response gaps on a critical system.',
      assessment: 'High Risk',
      assessmentTone: 'error',
    },
  },
  {
    id: 'i-3',
    title: 'Auth service has a single owner',
    summary: 'One person is the primary expert on a critical identity system.',
    severity: 'critical',
    confidence: 91,
    evidenceCount: 2,
    why: {
      evidence: [
        'Identity & Access Service has exactly 1 primary expert',
        'Criticality rated 5/5 with coverage at 38%',
      ],
      reasoning: 'A single-owner critical system has no bus-factor: absence or departure blocks changes and incident response.',
      impact: 'Any absence stalls auth changes and elevates incident risk across every service that depends on identity.',
      assessment: 'High Risk',
      assessmentTone: 'error',
    },
  },
  {
    id: 'i-4',
    title: 'Checkout documentation is stale',
    summary: 'The checkout service runbook is 90 days old and contradicts current config.',
    severity: 'medium',
    confidence: 74,
    evidenceCount: 2,
    why: {
      evidence: [
        'Runbook last updated 90+ days ago',
        'Config drift detected in staging',
      ],
      reasoning: 'Stale runbooks and config drift reduce the team’s ability to operate and recover the service safely.',
      impact: 'Slower incident recovery and higher operational risk on a revenue-critical flow.',
      assessment: 'Medium Risk',
      assessmentTone: 'warning',
    },
  },
  {
    id: 'i-5',
    title: 'Strong knowledge sharing momentum',
    summary: 'Recognition for mentorship is up 30% this quarter across three teams.',
    severity: 'low',
    confidence: 78,
    evidenceCount: 3,
    why: {
      evidence: [
        'Mentorship recognitions up 30% this quarter',
        'Knowledge-sharing recognitions across 3 teams',
        'Coverage improving on 2 single-owner systems',
      ],
      reasoning: 'Rising mentorship and knowledge-sharing signals indicate growing redundancy and lower future bus-factor.',
      impact: 'Reduced concentration risk and healthier succession across critical systems.',
      assessment: 'Positive',
      assessmentTone: 'success',
    },
  },
];
