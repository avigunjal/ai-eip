/**
 * Backend insight DTO → frontend view-model adapter.
 *
 * The backend keeps a domain/API intelligence model
 * (level, score, summary, confidence, evidence, drivers,
 * recommendedActions, assumptions). The UI contract InsightCard expects is
 * different (severity, confidence, evidenceCount, why{...}). This module is
 * the only place that mapping lives — backend and UI stay decoupled.
 */

const SEVERITY_ASSESSMENT = {
  critical: { assessment: 'High Risk', tone: 'error' },
  high: { assessment: 'High Risk', tone: 'error' },
  medium: { assessment: 'Medium Risk', tone: 'warning' },
  low: { assessment: 'Positive', tone: 'success' },
};

const SOURCE_LABELS = {
  github: 'GitHub',
  gitlab: 'GitLab',
  jira: 'Jira',
  docs: 'Docs',
  confluence: 'Confluence',
  slack: 'Slack',
  pagerduty: 'PagerDuty',
  datadog: 'Datadog',
  incident: 'Incidents',
  planning: 'Planning',
};
const SOURCE_KEYS = Object.keys(SOURCE_LABELS);

/**
 * Signal-source coverage for the AI Analysis Engine card, derived from the
 * insight evidence actually in view (counts stay honest, never fabricated).
 *
 * @param {{ why: { evidence: string[] } }[]} insights - insight view models.
 * @returns {{ name: string; count: number }[]}
 */
export function collectSources(insights) {
  const counts = new Map();
  for (const ins of insights) {
    for (const item of ins.why.evidence) {
      const lower = item.toLowerCase();
      for (const key of SOURCE_KEYS) {
        if (lower.includes(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => ({ name: SOURCE_LABELS[key], count }));
}

/**
 * Map a backend insight DTO to the contract InsightCard expects.
 * The backend has no `title` / `why` / `assessmentTone`; they are derived
 * deterministically so every card stays explainable.
 *
 * @param {{
 *   id: string;
 *   level: string;
 *   score: number;
 *   summary: string;
 *   confidence: number;
 *   evidence?: string[];
 *   drivers?: string[];
 *   recommendedActions?: string[];
 * }} insight
 * @returns {{
 *   id: string;
 *   title: string;
 *   summary: string;
 *   severity: string;
 *   confidence: number;
 *   evidenceCount: number;
 *   why: { evidence: string[]; reasoning: string; impact: string; assessment: string; assessmentTone: string };
 * }}
 */
export function mapInsightToViewModel(insight) {
  const tone = SEVERITY_ASSESSMENT[insight?.level] ?? SEVERITY_ASSESSMENT.medium;
  return {
    id: insight.id,
    title: insight.summary,
    summary: insight.summary,
    severity: insight.level,
    confidence: insight.confidence,
    evidenceCount: insight.evidence?.length ?? 0,
    why: {
      evidence: insight.evidence ?? [],
      reasoning: insight.drivers?.join('. ') ?? '',
      impact: insight.recommendedActions?.join('. ') ?? '',
      assessment: tone.assessment,
      assessmentTone: tone.tone,
    },
    // Optional AI layer from the explain/regenerate endpoints:
    // explanation = { reasoning, impact } (advisory only; deterministic
    // evidence/scores are untouched), explanationMeta = { source, provider,
    // model, generatedAt } for attribution ("AI · model · Generated X ago").
    aiExplanation: insight.explanation ?? null,
    aiMeta: insight.explanationMeta ?? null,
  };
}