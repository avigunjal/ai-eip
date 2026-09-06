import { formatCurrency } from '../config/currency.js';

/**
 * Decision recommendation engine — runs completely offline from the decision's
 * own data. The pipeline is deliberately transparent:
 *
 *   signals → option outcomes → composite score → rank → recommendation
 *                                                            ↓
 *                                                 evidence-grounded explanation
 *
 * Nothing here is static UI copy: the ranked "why" points are rebuilt from the
 * actual evidence values and the option deltas every time `explain()` runs.
 *
 * Provider architecture: `recommendationService` owns a provider interface so
 * Screen 2 components never know which engine produced a recommendation. The
 * deterministic provider is active today because no existing AI endpoint
 * accepts a generic decision context (all backend /ai/explain endpoints are
 * purpose-built for their own resources) — wiring this page to those would
 * fake an architectural coupling. A future real provider registers here and
 * the UI stays unchanged.
 */

/** Composite-score weights (each metric drives the rank independently). */
const WEIGHT = { capacity: 0.25, skill: 0.25, confidence: 0.25, value: 0.15, risk: 0.1 };

/** Normalize an option's outcome into contribution points (0–100 each). */
function credit(option) {
  const o = option.outcomes;
  return {
    // Lower operating load is better for teams working above sustainable limits.
    capacity: Math.max(0, 100 - o.capacity),
    skill: o.skill,
    confidence: o.confidence,
    value: Number(o.value?.value ?? 0),
    risk: (2 - o.riskScore) * 50,
    cost: Number(o.cost?.value ?? 0),
  };
}

/** Composite score for every option, highest first. Pure function of the data. */
export function scoreOptions(options) {
  const maxValue = Math.max(...options.map((o) => Number(o.outcomes.value?.value ?? 0)));
  const maxCost = Math.max(...options.map((o) => Number(o.outcomes.cost?.value ?? 0)));
  return options
    .map((option) => {
      const c = credit(option);
      const score =
        WEIGHT.capacity * c.capacity +
        WEIGHT.skill * c.skill +
        WEIGHT.confidence * c.confidence +
        WEIGHT.value * (c.value / maxValue) * 100 +
        WEIGHT.risk * c.risk -
        (maxCost > 0 ? (c.cost / maxCost) * 5 : 0);
      return { optionId: option.id, score };
    })
    .sort((a, b) => b.score - a.score);
}

/** Deterministic confidence: signal completeness + decision severity. */
function confidence(detail, evidenceCount) {
  const base = 86 + Math.min(Math.max(evidenceCount - 3, 0), 4) * 2;
  return Math.min(93, Math.max(75, base + (detail.severity === 'critical' ? 1 : 0)));
}

/** Evidence-led reasons, derived from the decision's own signals and deltas. */
function buildReasons(detail, recommended, maxRiskReduction, maxImprovement) {
  const reasons = [];
  for (const item of detail.evidence) {
    if (reasons.length >= 4) break;
    switch (item.key) {
      case 'capacity':
        reasons.push(
          item.bar > 100
            ? `Capacity is currently at ${item.value}, above sustainable limits.`
            : `The team is currently operating at ${item.value} of sustainable capacity.`,
        );
        break;
      case 'skill': {
        const num = Number.parseInt(item.value, 10);
        reasons.push(
          Number.isFinite(num) && num < 90
            ? `Critical skill coverage is only ${item.value}, below the required threshold.`
            : `Skill coverage sits at ${item.value}.`,
        );
        break;
      }
      case 'docs':
        reasons.push(`Documentation coverage is only ${item.value}, below the required threshold.`);
        break;
      case 'owner':
        reasons.push('Knowledge is concentrated with a single primary owner.');
        break;
      case 'backup':
        reasons.push('No confirmed backup can independently support the service.');
        break;
      case 'risks': {
        const count = Number.parseInt(item.value, 10);
        if (count > 0) {
          reasons.push(`There ${count === 1 ? 'is' : 'are'} ${count} open delivery ${count === 1 ? 'risk' : 'risks'} on the critical path.`);
        }
        break;
      }
      case 'dependency': {
        const count = Number.parseInt(item.value, 10);
        if (count > 0) reasons.push(`${count} critical ${count === 1 ? 'dependency is' : 'dependencies are'} delaying delivery.`);
        break;
      }
      case 'confidence':
        reasons.push(`Delivery confidence is only ${item.value}, below the required threshold.`);
        break;
      case 'trend':
        reasons.push('Delivery pressure has increased over the last 30 days.');
        break;
      default:
        break;
    }
  }
  if (reasons.length === 0) {
    reasons.push(`The decision is driven by the recorded signals for ${detail.context}.`);
  }
  reasons.push(`Provides the highest risk reduction (${recommended.outcomes.riskReduction}%)${recommended.outcomes.riskReduction < maxRiskReduction ? ' among the options compared' : ''}.`);
  reasons.push(`Produces the strongest capacity improvement (${recommended.outcomes.improvement}%)${recommended.outcomes.improvement < maxImprovement ? ' among the options compared' : ''}.`);
  return reasons.map((text) => ({ text }));
}

/** Business-impact summary derived from the recommended option's outcomes. */
function buildImpact(reason) {
  return [
    { arrow: 'down', value: `${reason.outcomes.riskReduction}%`, label: 'Potential risk reduction' },
    { arrow: 'up', value: `${reason.outcomes.improvement}%`, label: 'Capacity improvement' },
    { arrow: null, value: formatCurrency(reason.outcomes.value), label: 'Value protected' },
    { arrow: 'up', value: `${reason.outcomes.confidence}%`, label: 'Delivery confidence' },
  ];
}

/** One-line summary — grounded in the recommended option and its rank. */
function buildSummary(detail, recommended) {
  return `AI-EIP recommends ${recommended.name}. This option addresses the current signals for ${detail.context} directly and provides the strongest balance between risk reduction, delivery confidence and expected business value.`;
}

/** Deterministic provider — fully evidence-driven, runs locally (sync). */
const deterministicProvider = {
  source: 'signals',
  provider: 'engineering-signals-engine',
  generate(detail) {
    const scores = scoreOptions(detail.options);
    const recommended = detail.options.find((o) => o.id === scores[0].optionId);
    const maxRiskReduction = Math.max(...detail.options.map((o) => o.outcomes.riskReduction));
    const maxImprovement = Math.max(...detail.options.map((o) => o.outcomes.improvement));
    const evidenceCount = detail.evidence.length;
    return {
      recommendedOptionId: recommended.id,
      optionScores: scores,
      summary: buildSummary(detail, recommended),
      whyRecommended: buildReasons(detail, recommended, maxRiskReduction, maxImprovement),
      tradeoffs: recommended.tradeOffs.map((text) => ({ text })),
      leadershipConsiderations: [
        `Outcomes are projected from ${evidenceCount} recorded engineering signals and should be re-evaluated if those signals change.`,
      ],
      confidence: confidence(detail, evidenceCount),
      impact: buildImpact(recommended),
      source: this.source,
      provider: this.provider,
      model: null,
      generatedAt: new Date().toISOString(),
    };
  },
};

/**
 * Future real-LLM provider slot. Not active: no existing AI capability accepts
 * a generic decision context (the simulator /ai/explain endpoint only
 * understands its own project model), so leaving it dormant avoids a fake
 * integration. A real provider registers here and the workspace UI is
 * untouched — it only ever calls recommendationService.explain().
 */
const aiProvider = {
  source: 'llm',
  provider: null,
  model: null,
  async generate() {
    throw new Error('No compatible real-AI provider is registered for decision context.');
  },
};

const PROVIDERS = {
  ai: aiProvider,
  deterministic: deterministicProvider,
};

/** Active provider. Swap inside this function; components never change. */
function resolveProvider() {
  return PROVIDERS.deterministic;
}

/**
 * Decision recommendation service. Callers (workspace components and the page)
 * never know which provider generated the result.
 *
 * Today the deterministic provider returns synchronously. A future async
 * provider changes this to return a Promise and the page migrates to the
 * async `useRecommendation` hook — the provider abstraction stays intact.
 */
export const recommendationService = {
  explain(detail) {
    return resolveProvider().generate(detail);
  },
};