import { useAiEnabled } from '../store/aiStore.js';

/**
 * Terminology for the AI reasoning layer vs the deterministic engineering
 * intelligence underneath. When AI is disabled the UI keeps the sparkle icon
 * (already greyed out via SparkleIcon) but swaps the wording so nothing
 * claims AI where there is none. `t(key)` returns the phrase for the current
 * mode.
 */
const TERMS = {
  enabled: {
    analysisEngine: 'AI Analysis Engine',
    insight: 'AI insight',
    insights: 'AI insights',
    confidence: 'AI confidence',
    detected: 'AI detected',
    detectedConcentration: 'AI detected knowledge concentration from',
    explain: 'Explain with AI',
    recommendation: 'AI recommendation',
    whyRecommended: 'Why AI recommended this team',
    assessment: 'AI Project Assessment',
    prioritized: 'AI prioritized projects',
    generateTeam: 'Generate AI Team',
    analyzedCount: 'AI analyzed',
    viewAssessment: 'View AI Assessment',
    generatedAnalysis: 'AI-generated analysis',
    subtitleProjects: 'AI-assisted delivery risk and health assessment across the portfolio.',
    subtitleRisks: 'Cross-project risk register, AI-derived from engineering signals.',
    subtitleKnowledge: 'AI-detected systems that depend on too few people.',
    subtitleComposer: 'AI creates staffing recommendations based on project risks and required skills.',
  },
  disabled: {
    analysisEngine: 'Engineering Analysis Engine',
    insight: 'Engineering insight',
    insights: 'Engineering insights',
    confidence: 'Analysis confidence',
    detected: 'Detected',
    detectedConcentration: 'Knowledge concentration detected from',
    explain: 'View Analysis',
    recommendation: 'Recommended action',
    whyRecommended: 'Why this team was recommended',
    assessment: 'Engineering Project Assessment',
    prioritized: 'Prioritized projects',
    generateTeam: 'Generate Team',
    analyzedCount: 'Analyzed',
    viewAssessment: 'View Assessment',
    generatedAnalysis: 'Generated analysis',
    subtitleProjects: 'Engineering-assisted delivery risk and health assessment across the portfolio.',
    subtitleRisks: 'Cross-project risk register derived from engineering signals.',
    subtitleKnowledge: 'Systems that depend on too few people.',
    subtitleComposer: 'Creates staffing recommendations based on project risks and required skills.',
  },
};

export const useAiTerms = () => {
  const aiEnabled = useAiEnabled();
  const mode = TERMS[aiEnabled ? 'enabled' : 'disabled'];
  return { aiEnabled, t: (key) => mode[key] ?? key };
};
