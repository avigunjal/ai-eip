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
  };
}