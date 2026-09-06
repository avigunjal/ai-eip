// Deterministic configuration for the Decision Impact Simulator.
//
// Every number the engine depends on lives here so the model can be tuned
// without hunting through service code. Nothing in this module talks to the LLM
// or to any clock: dates are anchored to DEMO_TODAY and every computation is a
// pure function of the seeded data.
//
// The four simulated decision options. Order matters — `continue` is the
// baseline every other option is compared against.
export const DECISION_OPTION_KEYS = ['continue', 'staffing', 'reallocate', 'knowledge_transfer'];

export const DECISION_OPTIONS = {
  continue: {
    key: 'continue',
    label: 'Continue Current Plan',
    shortLabel: 'Continue',
    description: 'No intervention. Keep the current team, plan, and knowledge state as-is through the target date.',
    details: ['No resource changes', 'No capacity changes', 'No capability coverage changes', 'No knowledge changes'],
  },
  staffing: {
    key: 'staffing',
    label: 'Add Staffing Scenario',
    shortLabel: 'Add Capacity',
    description: 'Apply the persisted team-composer staffing scenario: focused FTE added to the target team from an existing scenario.',
    details: ['Applies the saved staffing scenario', 'Adds FTE to the target team', 'Improves capability coverage', 'Uses the persisted scenario changes'],
  },
  reallocate: {
    key: 'reallocate',
    label: 'Reallocate Internal Engineer',
    shortLabel: 'Reallocate',
    description: 'Move the best available internal engineer to the project for the window — including anyone with Payment Service knowledge — and simulate the source-team impact.',
    details: ['Selects the best available internal candidate', 'Prefers candidates with critical knowledge-area expertise', 'Simulates the source team afterwards', 'No incremental hiring cost'],
  },
  knowledge_transfer: {
    key: 'knowledge_transfer',
    label: 'Accelerate Knowledge Transfer',
    shortLabel: 'Knowledge Transfer',
    description: 'Execute the saved Payment Service transfer plan and prevention actions: backup promotion, pairing, and cross-training.',
    details: ['Applies the saved transfer plan', 'Promotes the backup to capable', 'Raises knowledge coverage toward the target', 'Lowers knowledge exposure'],
  },
};

// Delivery-exposure model (0-100). The computed exposure is what every option
// is measured against. Higher = worse.
//
// Capacity is weighted above risk and knowledge on purpose: for a short window
// the team's ability to actually ship (capacity × skill coverage) is the
// binding constraint, while knowledge de-risking mostly protects the post-cutover
// operations. Skill coverage uses the critical linked knowledge-area coverage
// (Payment Service at 38%), not raw capability-card coverage — the team already
// covers every generic skill card, so the real gap is domain knowledge.
export const EXPOSURE_WEIGHTS = { risk: 0.25, capacity: 0.3, skillGap: 0.2, knowledge: 0.25 };

// Each point of team pressure above sustainable capacity adds this to the
// exposure base. t-01 at 116% pressure → (116 - 100) * 2.5 = 40.
export const CAPACITY_PENALTY_PER_POINT = 2.5;

// The closer the target date, the harder the base exposure is pushed.
export const URGENCY_FACTORS = [
  { maxDays: 7, factor: 1.2 },
  { maxDays: 14, factor: 1.15 },
  { maxDays: 30, factor: 1.1 },
  { maxDays: Infinity, factor: 1.0 },
];

// Decision-score weights. Each dimension is on a 0-100 scale where higher is
// better, so the final score is a weighted average:
//   riskReduction         = 100 − risk score after the option
//   deliveryImprovement   = 100 − delivery exposure after the option
//   financial             = net planning impact, normalized so the best option
//                           scores 100 (₹0 whenever nothing is improved)
//   resourceEfficiency    = % capacity relief on the target team
//   organizationalImpact  = net target-gain vs source-damage (0-100)
export const DECISION_WEIGHTS = {
  riskReduction: 0.35,
  deliveryImprovement: 0.3,
  financial: 0.15,
  resourceEfficiency: 0.1,
  organizationalImpact: 0.1,
};

// How much a mitigation/transfer action reduces the probability of a
// knowledge-category risk when executed (Option D).
export const MITIGATION_EFFECTIVENESS = 0.55;

// Partial credit Option C gets on knowledge-category risks when the reallocated
// engineer brings genuine linked-area expertise onto the team.
export const REALLOCATION_KNOWLEDGE_MITIGATION = 0.35;

// Minimum sustainable capacity a source team must keep before we consider
// reallocating anyone from it.
export const MIN_SOURCE_SUSTAINABLE_FTE = 0.5;

// Candidate reallocation window: an engineer is lent at this fraction of their
// availability so the source team keeps running.
export const REALLOCATION_FTE_FACTOR = 0.6;

// Knowledge re-assessment constants (used by reallocate + knowledge transfer).
// Raising a level 'learning'/'capable' expert up adds this much coverage (cap
// at the target).
export const KNOWLEDGE_COVERAGE_GAIN = { learning: 12, capable: 27, primary: 27 };

// The share of ownership a newly added expert takes, scaled by their level.
export const KNOWLEDGE_SHARE_FROM_LEVEL = { learning: 13, capable: 20, primary: 27 };

export function daysBetween(fromIso, toIso) {
  const start = new Date(`${fromIso}T00:00:00Z`).getTime();
  const end = new Date(`${toIso}T00:00:00Z`).getTime();
  return Math.max(0, Math.round((end - start) / 86_400_000));
}