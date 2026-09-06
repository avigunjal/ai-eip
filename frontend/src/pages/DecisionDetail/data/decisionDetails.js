/**
 * Decision Workspace (Screen 2) — decision detail content.
 *
 * Six hand-authored, internally-consistent detail records keyed by the Screen 1
 * decision ids. `atlas-staffing` carries the full spec reference content; the
 * other five are concise but valid, each derived from its own Screen 1 signals.
 *
 * The recommendation engine (api/decisionRecommendation.js) *computes* the
 * ranking, reasons, summary, confidence and impact from `evidence`/`options`
 * — this file holds raw decision data only, never pre-written AI copy.
 */

/** Rich reference content per spec §31 — Atlas Platform Migration (staffing). */
const ATLAS = {
  id: 'atlas-staffing',
  problem: {
    why: [
      'The Atlas Platform Migration team is operating at 105% sustainable capacity while critical platform skills are below the level required for the next delivery phase.',
      'Without intervention, delivery risk is likely to increase during the upcoming migration milestones.',
    ],
    drivers: [
      { label: 'Team capacity', value: '105%', tone: 'critical' },
      { label: 'Critical skill coverage', value: '83%', tone: 'neutral' },
      { label: 'Open delivery risks', value: '2', tone: 'high' },
      { label: 'Potential impact', value: '$342K', tone: 'impact' },
    ],
  },
  evidence: [
    {
      key: 'capacity',
      title: 'Capacity pressure',
      value: '105%',
      bar: 105,
      description: 'The team is operating at 105% of sustainable capacity.',
      source: 'Jira + Engineering Capacity',
      updated: '2 hours ago',
    },
    {
      key: 'skill',
      title: 'Skill gap',
      value: '83%',
      bar: 83,
      description: 'Critical platform skill coverage is 83%, below the required threshold.',
      source: 'Skills Inventory',
      updated: '1 day ago',
    },
    {
      key: 'risks',
      title: 'Open delivery risks',
      value: '2',
      description: 'Two active risks could affect the next migration milestone.',
      source: 'Risk register',
      updated: 'Today',
    },
    {
      key: 'trend',
      title: 'Project trend',
      value: 'Increasing',
      trend: 'rising',
      description: 'Delivery pressure has increased over the last 30 days.',
      source: 'Delivery analytics',
      updated: '2 days ago',
    },
  ],
  outcomeRows: [
    {
      label: 'Team capacity',
      values: [
        { value: '82%', tone: 'good' },
        { value: '91%', tone: 'good' },
        { value: '105%', tone: 'critical' },
      ],
    },
    {
      label: 'Skill coverage',
      values: [
        { value: '96%', tone: 'good' },
        { value: '90%', tone: 'good' },
        { value: '83%', tone: 'warn' },
      ],
    },
    {
      label: 'Delivery risk',
      values: [
        { value: 'Low', tone: 'good' },
        { value: 'Medium', tone: 'warn' },
        { value: 'High', tone: 'critical' },
      ],
    },
    {
      label: 'Timeline confidence',
      values: [
        { value: '91%', tone: 'good' },
        { value: '78%', tone: 'warn' },
        { value: '61%', tone: 'critical' },
      ],
    },
    {
      label: 'Estimated cost',
      values: [
        { value: '$14K', tone: 'neutral' },
        { value: '$5K', tone: 'neutral' },
        { value: '$0', tone: 'neutral' },
      ],
    },
    {
      label: 'Expected value',
      values: [
        { value: '$342K', tone: 'good' },
        { value: '$255K', tone: 'good' },
        { value: '$104K', tone: 'warn' },
      ],
    },
  ],
  options: [
    {
      id: 'A',
      tag: 'Recommended',
      name: 'Add targeted platform capacity',
      description:
        'Add two engineers with the required platform expertise before the next migration phase.',
      benefits: ['Reduces capacity pressure quickly', 'Improves critical skill coverage', 'Protects migration milestones'],
      tradeOffs: ['Higher short-term staffing cost', 'Requires suitable engineers to be available'],
      outcomes: { capacity: 82, skill: 96, riskScore: 0, confidence: 91, cost: { value: 14000, currency: 'USD' }, value: { value: 342000, currency: 'USD' }, riskReduction: 62, improvement: 28 },
    },
    {
      id: 'B',
      name: 'Rebalance existing teams',
      description:
        'Move available engineers from lower-priority work and rebalance responsibilities across the migration team.',
      benefits: ['No external hiring required', 'Faster to start', 'Keeps spend flat'],
      tradeOffs: ['Takes engineers off other commitments', 'Limited skill gain'],
      outcomes: { capacity: 91, skill: 90, riskScore: 1, confidence: 78, cost: { value: 5000, currency: 'USD' }, value: { value: 255000, currency: 'USD' }, riskReduction: 45, improvement: 18 },
    },
    {
      id: 'C',
      name: 'Continue with the current plan',
      description:
        'Maintain the existing staffing structure and manage delivery pressure within the current team.',
      benefits: ['No disruption', 'Zero incremental cost'],
      tradeOffs: ['Delivery exposure persists through the target date', 'Migration milestones stay exposed'],
      outcomes: { capacity: 105, skill: 83, riskScore: 2, confidence: 61, cost: { value: 0, currency: 'USD' }, value: { value: 104000, currency: 'USD' }, riskReduction: 12, improvement: 4 },
    },
  ],
};

/** Who should own Payment Service backup — knowledge concentration (critical). */
const PAYMENT_BACKUP = {
  id: 'payment-backup',
  problem: {
    why: [
      'Payment Service runs on knowledge concentrated with a single primary engineer. Documentation coverage sits at 38% and no confirmed backup can independently support the service.',
      'Any unplanned absence creates a production-recovery risk that is not covered today.',
    ],
    drivers: [
      { label: 'Single owner', value: '1', tone: 'high' },
      { label: 'Docs coverage', value: '38%', tone: 'critical' },
      { label: 'Knowledge risk', value: 'Critical', tone: 'critical' },
      { label: 'Potential impact', value: '$287K', tone: 'impact' },
    ],
  },
  evidence: [
    {
      key: 'docs',
      title: 'Documentation gap',
      value: '38%',
      bar: 38,
      description: 'Runbook and architecture docs cover 38% of critical payment flows.',
      source: 'Docs',
      updated: '3 hours ago',
    },
    {
      key: 'owner',
      title: 'Single-owner concentration',
      value: '1',
      description: 'One engineer holds the majority of recent contribution and incident-resolution knowledge.',
      source: 'GitHub + Incidents',
      updated: '1 day ago',
    },
    {
      key: 'backup',
      title: 'No confirmed backup',
      value: '—',
      description: 'No confirmed backup can independently support the service.',
      source: 'Team roster',
      updated: '2 days ago',
    },
  ],
  outcomeRows: [
    {
      label: 'Docs coverage',
      values: [
        { value: '78%', tone: 'good' },
        { value: '64%', tone: 'warn' },
        { value: '38%', tone: 'critical' },
      ],
    },
    {
      label: 'Single-owner risk',
      values: [
        { value: 'Low', tone: 'good' },
        { value: 'Medium', tone: 'warn' },
        { value: 'High', tone: 'critical' },
      ],
    },
    {
      label: 'Delivery risk',
      values: [
        { value: 'Low', tone: 'good' },
        { value: 'Medium', tone: 'warn' },
        { value: 'High', tone: 'critical' },
      ],
    },
    {
      label: 'Timeline confidence',
      values: [
        { value: '85%', tone: 'good' },
        { value: '74%', tone: 'warn' },
        { value: '62%', tone: 'critical' },
      ],
    },
    {
      label: 'Estimated cost',
      values: [
        { value: '$12K', tone: 'neutral' },
        { value: '$4K', tone: 'neutral' },
        { value: '$0', tone: 'neutral' },
      ],
    },
    {
      label: 'Expected value',
      values: [
        { value: '$287K', tone: 'good' },
        { value: '$214K', tone: 'good' },
        { value: '$96K', tone: 'warn' },
      ],
    },
  ],
  options: [
    {
      id: 'A',
      tag: 'Recommended',
      name: 'Document critical flows and pair a backup owner',
      description:
        'Capture runbooks for the critical payment paths and pair a capable engineer for hands-on ownership transfer.',
      benefits: ['Removes the single-owner risk', 'Makes incident response resilient', 'Raises docs coverage'],
      tradeOffs: ['Requires the primary owner\u2019s time', 'Independence builds over several weeks'],
      outcomes: { capacity: 92, skill: 78, riskScore: 0, confidence: 85, cost: { value: 12000, currency: 'USD' }, value: { value: 287000, currency: 'USD' }, riskReduction: 58, improvement: 22 },
    },
    {
      id: 'B',
      name: 'Rebalance ownership',
      description:
        'Cross-train a backup owner across the key flows using delivered sessions rather than full documentation.',
      benefits: ['Fast to start', 'Keeps a single accountable owner'],
      tradeOffs: ['Docs stay light', 'Partial coverage during the transition'],
      outcomes: { capacity: 95, skill: 64, riskScore: 1, confidence: 74, cost: { value: 4000, currency: 'USD' }, value: { value: 214000, currency: 'USD' }, riskReduction: 36, improvement: 14 },
    },
    {
      id: 'C',
      name: 'Continue with the current ownership',
      description: 'Maintain the current ownership structure and keep reliance on the primary engineer.',
      benefits: ['Zero change', 'No cost'],
      tradeOffs: ['Single-owner risk persists', 'Docs coverage stays low'],
      outcomes: { capacity: 98, skill: 38, riskScore: 2, confidence: 62, cost: { value: 0, currency: 'USD' }, value: { value: 96000, currency: 'USD' }, riskReduction: 8, improvement: 2 },
    },
  ],
};

/** Payments 3.0 delivery risk — over capacity with open risks (high). */
const PAYMENTS_DELIVERY = {
  id: 'payments-delivery',
  problem: {
    why: [
      'Payments 3.0 is heading into its integration phase under 116% capacity load with three open delivery risks.',
      'Multiple engineering signals indicate the current delivery plan is unlikely to hold without intervention.',
    ],
    drivers: [
      { label: 'Risk score', value: '69/100', tone: 'high' },
      { label: 'Team capacity', value: '116%', tone: 'critical' },
      { label: 'Open risks', value: '3', tone: 'critical' },
      { label: 'Potential impact', value: '$254K', tone: 'impact' },
    ],
  },
  evidence: [
    {
      key: 'capacity',
      title: 'Capacity pressure',
      value: '116%',
      bar: 116,
      description: 'The Payments 3.0 team is operating at 116% of sustainable capacity.',
      source: 'Jira + Engineering Capacity',
      updated: '2 hours ago',
    },
    {
      key: 'risks',
      title: 'Open delivery risks',
      value: '3',
      description: 'Three open risks sit on the critical path into integration.',
      source: 'Risk register',
      updated: 'Today',
    },
    {
      key: 'dependency',
      title: 'Interlocked dependencies',
      value: '2',
      description: 'Integration milestones depend on two teams that are also over capacity.',
      source: 'Planning',
      updated: '1 day ago',
    },
    {
      key: 'trend',
      title: 'Velocity trend',
      value: 'Declining',
      trend: 'rising',
      description: 'Delivered velocity has declined 12% over the last 30 days.',
      source: 'Delivery analytics',
      updated: '2 days ago',
    },
  ],
  outcomeRows: [
    {
      label: 'Team capacity',
      values: [
        { value: '96%', tone: 'good' },
        { value: '88%', tone: 'good' },
        { value: '116%', tone: 'critical' },
      ],
    },
    {
      label: 'Delivery risk',
      values: [
        { value: 'Low', tone: 'good' },
        { value: 'Medium', tone: 'warn' },
        { value: 'High', tone: 'critical' },
      ],
    },
    {
      label: 'Open risks',
      values: [
        { value: '0', tone: 'good' },
        { value: '2', tone: 'warn' },
        { value: '3', tone: 'critical' },
      ],
    },
    {
      label: 'Timeline confidence',
      values: [
        { value: '86%', tone: 'good' },
        { value: '74%', tone: 'warn' },
        { value: '58%', tone: 'critical' },
      ],
    },
    {
      label: 'Estimated cost',
      values: [
        { value: '$18K', tone: 'neutral' },
        { value: '$3K', tone: 'neutral' },
        { value: '$0', tone: 'neutral' },
      ],
    },
    {
      label: 'Expected value',
      values: [
        { value: '$254K', tone: 'good' },
        { value: '$189K', tone: 'good' },
        { value: '$92K', tone: 'warn' },
      ],
    },
  ],
  options: [
    {
      id: 'A',
      tag: 'Recommended',
      name: 'Insert a triage squad for integration risk',
      description:
        'Stand up a small focused squad to drive the critical-path risks and unblock the integration milestones.',
      benefits: ['Fastest reduction on the critical path', 'Keeps the plan intact', 'Clears interlocked dependencies'],
      tradeOffs: ['Short-term cost', 'Pulls senior engineers from other work'],
      outcomes: { capacity: 96, skill: 84, riskScore: 0, confidence: 86, cost: { value: 18000, currency: 'USD' }, value: { value: 254000, currency: 'USD' }, riskReduction: 55, improvement: 20 },
    },
    {
      id: 'B',
      name: 'Reprioritise scope with sponsors',
      description: 'Rebaseline scope and timelines with sponsors to keep the team at sustainable load.',
      benefits: ['Addresses root-cause capacity', 'Cleaner commitments'],
      tradeOffs: ['Slips a milestone date', 'Requires sponsor sign-off'],
      outcomes: { capacity: 88, skill: 80, riskScore: 1, confidence: 74, cost: { value: 3000, currency: 'USD' }, value: { value: 189000, currency: 'USD' }, riskReduction: 38, improvement: 16 },
    },
    {
      id: 'C',
      name: 'Continue with the current plan',
      description: 'Hold the plan and absorb pressure within the current team.',
      benefits: ['No change', 'No cost'],
      tradeOffs: ['Three open risks stay on the critical path', 'Capacity stays overloaded'],
      outcomes: { capacity: 116, skill: 78, riskScore: 2, confidence: 58, cost: { value: 0, currency: 'USD' }, value: { value: 92000, currency: 'USD' }, riskReduction: 10, improvement: 3 },
    },
  ],
};

/** Checkout Modernization — scope/timeline decision (high). */
const CHECKOUT_PRIORITY = {
  id: 'checkout-priority',
  problem: {
    why: [
      'Checkout Modernization has two engineering teams over capacity and two critical dependencies delaying delivery.',
      'Delivery confidence is at 61%, which makes the current timeline a stretch.',
    ],
    drivers: [
      { label: 'Risk score', value: '58/100', tone: 'medium' },
      { label: 'Delivery confidence', value: '61%', tone: 'medium' },
      { label: 'Open dependencies', value: '2', tone: 'medium' },
      { label: 'Potential impact', value: '$181K', tone: 'impact' },
    ],
  },
  evidence: [
    {
      key: 'confidence',
      title: 'Delivery confidence',
      value: '61%',
      description: 'Delivery confidence has dropped to 61% across the planning horizon.',
      source: 'Planning',
      updated: 'Today',
    },
    {
      key: 'dependency',
      title: 'Open dependencies',
      value: '2',
      description: 'Two external dependencies are delaying gateway and ledger integration.',
      source: 'Jira',
      updated: '1 day ago',
    },
    {
      key: 'capacity',
      title: 'Capacity pressure',
      value: '104%',
      bar: 104,
      description: 'Two teams supporting Checkout are operating above sustainable capacity.',
      source: 'Engineering Capacity',
      updated: '2 hours ago',
    },
    {
      key: 'trend',
      title: 'Milestone trend',
      value: 'Rising risk',
      trend: 'rising',
      description: 'Milestone slip risk has risen over the last 30 days.',
      source: 'Delivery analytics',
      updated: '2 days ago',
    },
  ],
  outcomeRows: [
    {
      label: 'Team capacity',
      values: [
        { value: '88%', tone: 'good' },
        { value: '92%', tone: 'good' },
        { value: '104%', tone: 'critical' },
      ],
    },
    {
      label: 'Delivery confidence',
      values: [
        { value: '84%', tone: 'good' },
        { value: '76%', tone: 'warn' },
        { value: '61%', tone: 'critical' },
      ],
    },
    {
      label: 'Dependency risk',
      values: [
        { value: 'Low', tone: 'good' },
        { value: 'Medium', tone: 'warn' },
        { value: 'High', tone: 'critical' },
      ],
    },
    {
      label: 'Timeline confidence',
      values: [
        { value: '84%', tone: 'good' },
        { value: '76%', tone: 'warn' },
        { value: '61%', tone: 'critical' },
      ],
    },
    {
      label: 'Estimated cost',
      values: [
        { value: '$2K', tone: 'neutral' },
        { value: '$14K', tone: 'neutral' },
        { value: '$0', tone: 'neutral' },
      ],
    },
    {
      label: 'Expected value',
      values: [
        { value: '$181K', tone: 'good' },
        { value: '$146K', tone: 'good' },
        { value: '$74K', tone: 'warn' },
      ],
    },
  ],
  options: [
    {
      id: 'A',
      tag: 'Recommended',
      name: 'Rebaseline scope with sponsors',
      description:
        'Cut non-critical scope from the current milestone and re-sequence dependency-critical work first.',
      benefits: ['Restores delivery confidence', 'Removes over-capacity pressure', 'Protects the core timeline'],
      tradeOffs: ['Defers some features', 'Requires stakeholder alignment'],
      outcomes: { capacity: 88, skill: 82, riskScore: 0, confidence: 84, cost: { value: 2000, currency: 'USD' }, value: { value: 181000, currency: 'USD' }, riskReduction: 42, improvement: 19 },
    },
    {
      id: 'B',
      name: 'Add surge capacity to clear dependencies',
      description: 'Assign focused engineering capacity to clear the gateway and ledger dependencies on the critical path.',
      benefits: ['Keeps the full scope', 'Directly attacks the blockers'],
      tradeOffs: ['Higher cost', 'Ramp-up time before the milestone'],
      outcomes: { capacity: 92, skill: 85, riskScore: 1, confidence: 76, cost: { value: 14000, currency: 'USD' }, value: { value: 146000, currency: 'USD' }, riskReduction: 30, improvement: 14 },
    },
    {
      id: 'C',
      name: 'Continue with the current plan',
      description: 'Hold scope and timeline; manage dependencies reactively.',
      benefits: ['No change', 'No cost'],
      tradeOffs: ['Confidence stays at 61%', 'Dependency risk persists'],
      outcomes: { capacity: 104, skill: 78, riskScore: 2, confidence: 61, cost: { value: 0, currency: 'USD' }, value: { value: 74000, currency: 'USD' }, riskReduction: 9, improvement: 3 },
    },
  ],
};

/** Multi-region Reliability — focused staffing for resilience coverage (high). */
const RELIABILITY_STAFFING = {
  id: 'reliability-staffing',
  problem: {
    why: [
      'Multi-region Reliability has enough overall capacity, but a focused skill gap on resilience engineering and one open reliability risk.',
      'The next reliability rollout needs specific coverage rather than more general load.',
    ],
    drivers: [
      { label: 'Team capacity', value: '82%', tone: 'positive' },
      { label: 'Reliability coverage', value: '81%', tone: 'neutral' },
      { label: 'Open risk', value: '1', tone: 'medium' },
      { label: 'Potential impact', value: '$126K', tone: 'impact' },
    ],
  },
  evidence: [
    {
      key: 'skill',
      title: 'Skill gap',
      value: '81%',
      bar: 81,
      description: 'Reliability-specific skill coverage is 81%, below what the rollout plan assumes.',
      source: 'Skills Inventory',
      updated: '1 day ago',
    },
    {
      key: 'risks',
      title: 'Open reliability risk',
      value: '1',
      description: 'One open reliability risk could affect the next rollout milestone.',
      source: 'Risk register',
      updated: 'Today',
    },
    {
      key: 'trend',
      title: 'On-call trend',
      value: 'Rising',
      trend: 'rising',
      description: 'On-call load for resilience support has grown 15% this quarter.',
      source: 'PagerDuty',
      updated: '3 days ago',
    },
  ],
  outcomeRows: [
    {
      label: 'Team capacity',
      values: [
        { value: '88%', tone: 'good' },
        { value: '84%', tone: 'good' },
        { value: '82%', tone: 'good' },
      ],
    },
    {
      label: 'Skill coverage',
      values: [
        { value: '94%', tone: 'good' },
        { value: '90%', tone: 'good' },
        { value: '81%', tone: 'warn' },
      ],
    },
    {
      label: 'Delivery risk',
      values: [
        { value: 'Low', tone: 'good' },
        { value: 'Medium', tone: 'warn' },
        { value: 'Medium', tone: 'warn' },
      ],
    },
    {
      label: 'Timeline confidence',
      values: [
        { value: '88%', tone: 'good' },
        { value: '79%', tone: 'warn' },
        { value: '66%', tone: 'critical' },
      ],
    },
    {
      label: 'Estimated cost',
      values: [
        { value: '$15K', tone: 'neutral' },
        { value: '$6K', tone: 'neutral' },
        { value: '$0', tone: 'neutral' },
      ],
    },
    {
      label: 'Expected value',
      values: [
        { value: '$126K', tone: 'good' },
        { value: '$98K', tone: 'good' },
        { value: '$59K', tone: 'warn' },
      ],
    },
  ],
  options: [
    {
      id: 'A',
      tag: 'Recommended',
      name: 'Add a resilience engineer to the rollout team',
      description:
        'Bring in one engineer with site-reliability experience to cover the skill gap for the rollout window.',
      benefits: ['Closes the resilience skill gap', 'Reduces on-call load', 'De-risks the rollout'],
      tradeOffs: ['Cost for the window', 'Recruiting lead time'],
      outcomes: { capacity: 88, skill: 94, riskScore: 0, confidence: 88, cost: { value: 15000, currency: 'USD' }, value: { value: 126000, currency: 'USD' }, riskReduction: 38, improvement: 13 },
    },
    {
      id: 'B',
      name: 'Lean on the SRE pool during the rollout',
      description: 'Loan reliability engineers from the SRE pool for the rollout milestones instead of hiring.',
      benefits: ['No new hiring', 'Uses existing expertise'],
      tradeOffs: ['Pool capacity is finite', 'Schedules compete with other projects'],
      outcomes: { capacity: 84, skill: 90, riskScore: 1, confidence: 79, cost: { value: 6000, currency: 'USD' }, value: { value: 98000, currency: 'USD' }, riskReduction: 26, improvement: 8 },
    },
    {
      id: 'C',
      name: 'Continue with the current plan',
      description: 'Run the rollout with the current team and absorb the skill gap.',
      benefits: ['No cost', 'No change'],
      tradeOffs: ['Skill gap stays open', 'On-call load keeps rising'],
      outcomes: { capacity: 82, skill: 81, riskScore: 1, confidence: 66, cost: { value: 0, currency: 'USD' }, value: { value: 59000, currency: 'USD' }, riskReduction: 12, improvement: 2 },
    },
  ],
};

/** Data Lake Consolidation — documentation / knowledge transfer risk (medium). */
const DATA_LAKE_TRANSFER = {
  id: 'data-lake-transfer',
  problem: {
    why: [
      'Data Lake Consolidation\u2019s most critical dependency is documented at 45% and concentrated with a single primary owner.',
      'Knowledge transfer risk is high right as consolidation work is about to expand across teams.',
    ],
    drivers: [
      { label: 'Docs coverage', value: '45%', tone: 'medium' },
      { label: 'Knowledge risk', value: 'High', tone: 'high' },
      { label: 'Single owner', value: '1', tone: 'high' },
      { label: 'Potential impact', value: '$98K', tone: 'impact' },
    ],
  },
  evidence: [
    {
      key: 'docs',
      title: 'Documentation gap',
      value: '45%',
      bar: 45,
      description: 'Critical dependency documentation covers 45% of the flows.',
      source: 'Docs',
      updated: '4 hours ago',
    },
    {
      key: 'owner',
      title: 'Single-owner concentration',
      value: '1',
      description: 'The critical dependency is concentrated around one primary owner.',
      source: 'GitHub',
      updated: '1 day ago',
    },
    {
      key: 'backup',
      title: 'No transfer plan',
      value: '—',
      description: 'No structured knowledge-transfer plan is in place for the dependency.',
      source: 'Planning',
      updated: '2 days ago',
    },
  ],
  outcomeRows: [
    {
      label: 'Docs coverage',
      values: [
        { value: '82%', tone: 'good' },
        { value: '63%', tone: 'warn' },
        { value: '45%', tone: 'critical' },
      ],
    },
    {
      label: 'Knowledge risk',
      values: [
        { value: 'Low', tone: 'good' },
        { value: 'Medium', tone: 'warn' },
        { value: 'High', tone: 'critical' },
      ],
    },
    {
      label: 'Delivery risk',
      values: [
        { value: 'Low', tone: 'good' },
        { value: 'Medium', tone: 'warn' },
        { value: 'High', tone: 'critical' },
      ],
    },
    {
      label: 'Timeline confidence',
      values: [
        { value: '82%', tone: 'good' },
        { value: '71%', tone: 'warn' },
        { value: '58%', tone: 'critical' },
      ],
    },
    {
      label: 'Estimated cost',
      values: [
        { value: '$8K', tone: 'neutral' },
        { value: '$3K', tone: 'neutral' },
        { value: '$0', tone: 'neutral' },
      ],
    },
    {
      label: 'Expected value',
      values: [
        { value: '$98K', tone: 'good' },
        { value: '$67K', tone: 'good' },
        { value: '$36K', tone: 'warn' },
      ],
    },
  ],
  options: [
    {
      id: 'A',
      tag: 'Recommended',
      name: 'Run a structured knowledge transfer',
      description:
        'Run a scheduled transfer program with the primary owner to raise documentation and back up the dependency before consolidation expands.',
      benefits: ['Removes the knowledge risk directly', 'Improves docs coverage', 'Protects consolidation momentum'],
      tradeOffs: ['Borrows the owner\u2019s time', 'Transfer window lands before peak work'],
      outcomes: { capacity: 90, skill: 82, riskScore: 0, confidence: 82, cost: { value: 8000, currency: 'USD' }, value: { value: 98000, currency: 'USD' }, riskReduction: 46, improvement: 24 },
    },
    {
      id: 'B',
      name: 'Document the critical path only',
      description: 'Prioritise documentation for the highest-risk flows and accept lower coverage elsewhere.',
      benefits: ['Low cost', 'Fast to start'],
      tradeOffs: ['Partial coverage', 'Backup still not fully hands-on'],
      outcomes: { capacity: 93, skill: 63, riskScore: 1, confidence: 71, cost: { value: 3000, currency: 'USD' }, value: { value: 67000, currency: 'USD' }, riskReduction: 26, improvement: 13 },
    },
    {
      id: 'C',
      name: 'Continue with the current plan',
      description: 'Keep the current dependency structure and defer transfer work.',
      benefits: ['No cost', 'No change'],
      tradeOffs: ['Knowledge risk persists', 'Consolidation slows when the owner is unavailable'],
      outcomes: { capacity: 95, skill: 45, riskScore: 2, confidence: 58, cost: { value: 0, currency: 'USD' }, value: { value: 36000, currency: 'USD' }, riskReduction: 7, improvement: 2 },
    },
  ],
};

/** Detail registry keyed by Screen 1 decision id. */
export const DECISION_DETAILS = {
  'atlas-staffing': ATLAS,
  'payment-backup': PAYMENT_BACKUP,
  'payments-delivery': PAYMENTS_DELIVERY,
  'checkout-priority': CHECKOUT_PRIORITY,
  'reliability-staffing': RELIABILITY_STAFFING,
  'data-lake-transfer': DATA_LAKE_TRANSFER,
};