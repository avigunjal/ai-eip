// Project risk scoring engine.
// TODO: combine signals (delayed PRs, blocked tickets, coverage) into a risk score.

export function scoreProjectRisk(project, signals) {
  // Returns { score, confidence, drivers }
  return { score: 0, confidence: 0, drivers: [] };
}
