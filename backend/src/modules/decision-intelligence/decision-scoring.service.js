// Decision scoring. Pure, deterministic, and shared by every response so the
// same numbers always select the same winner. The LLM never participates.
//
// Dimensions (all 0-100, higher is better):
//   riskReduction         = 100 − risk score after the option
//   deliveryImprovement   = 100 − delivery exposure after the option
//   financial             = net planning impact, normalized so the best option
//                           scores 100 (₹0 whenever nothing is improved)
//   resourceEfficiency    = % delivery-pressure relief on the target team
//   organizationalImpact  = net target-gain vs source-damage from the option
//
// Winner = argmax of the weighted score; ties break on organizational impact.

import { DECISION_WEIGHTS } from './decision.config.js';

function pctReduction(before, after) {
  if (Number(before) <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round(((Number(before) - Number(after)) / Number(before)) * 100)));
}

export function scoreOptions(baselineSignals, results) {
  const maxNet = Math.max(0, ...results.map((result) => result.financial.netPlanningImpact));
  const scored = results.map((result) => {
    const riskReduction = Math.max(0, 100 - result.after.risk.score);
    const deliveryImprovement = Math.max(0, 100 - result.after.exposure.score);
    const financial = maxNet > 0 ? Math.round((result.financial.netPlanningImpact / maxNet) * 100) : 0;
    const resourceEfficiency = pctReduction(baselineSignals.capacity.pressure, result.after.capacity.pressure);
    const organizationalImpact = Math.max(0, Math.min(100, Math.round(result.org?.netOrgImpact ?? 0)));
    const score = Math.round(
      DECISION_WEIGHTS.riskReduction * riskReduction
      + DECISION_WEIGHTS.deliveryImprovement * deliveryImprovement
      + DECISION_WEIGHTS.financial * financial
      + DECISION_WEIGHTS.resourceEfficiency * resourceEfficiency
      + DECISION_WEIGHTS.organizationalImpact * organizationalImpact,
    );
    return {
      ...result,
      score,
      scoreBreakdown: { riskReduction, deliveryImprovement, financial, resourceEfficiency, organizationalImpact },
    };
  });

  const winner = scored.reduce((leading, challenger) => {
    if (challenger.score > leading.score) return challenger;
    if (challenger.score === leading.score) {
      const leadingNet = leading.org?.netOrgImpact ?? 0;
      const challengerNet = challenger.org?.netOrgImpact ?? 0;
      return challengerNet > leadingNet ? challenger : leading;
    }
    return leading;
  }, scored[0]);

  return { scored, winner, maxNet };
}