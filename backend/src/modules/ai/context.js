// Compact LLM context builders. The LLM is only ever shown a tight, relevant
// summary of deterministic results — never the full database/project objects,
// never secrets, never the provider API keys.

const PROJECT_STATUS_LABEL = {
  on_track: 'on track',
  at_risk: 'at risk',
  on_hold: 'on hold',
  completed: 'complete',
};

// --- System prompts ----------------------------------------------------------

const JSON_INSTRUCTION = 'Respond with a single JSON object only. No prose before or after.';

// Every prompt must keep AI-EIP evidence-backed: the LLM reasons over supplied
// deterministic facts, never invents new ones.
const GROUNDING_RULE = [
  'GROUNDING: Only cite facts present in the supplied context. Never invent dates,',
  'percentages, people, incidents, ticket numbers, metrics, or time windows (e.g.',
  '"within 48 hours"). If a metric is not in the context, do not add one.',
  'Separate observations (facts from the context) from recommendations (your',
  'suggestions). Recommended actions must start with an action verb.',
].join(' ');

export const SYSTEM_ANALYZE = `You are an expert engineering delivery analyst for an AI Engineering Intelligence Platform.
You receive deterministic signals: project health, risk drivers with cited evidence, knowledge risks, and team state.
Write a concise human-readable analysis of the project.
${GROUNDING_RULE}
Use the evidence array to list the specific deterministic signals you reasoned from (id, type, summary).
${JSON_INSTRUCTION}
Schema: {"summary":"string","findings":["string"],"recommendedActions":["string"],"confidence":number,"evidence":[{"id":"string","type":"string","summary":"string"}]}`;

export const SYSTEM_INSIGHTS = `You are an expert engineering intelligence explainer.
You receive deterministic insight findings with their evidence and drivers.
For each insight id, write two concise fields:
- reasoning: WHY the evidence creates this risk or situation (the mechanism behind it).
- impact: the practical engineering/delivery consequence if it is not addressed.
Do NOT restate the deterministic summary; explain the underlying cause and consequence instead.
Keep each field to 1-2 short sentences.
Do not change scores, severity, or evidence.
${GROUNDING_RULE}
${JSON_INSTRUCTION}
Schema: {"explanations":[{"insightId":"string","explanation":{"reasoning":"string","impact":"string"}}]}`;

export const SYSTEM_COMPOSITION = `You are an expert team composition advisor.
You receive a deterministic recommended team with coverage assessment, rationale, trade-offs, and impact.
Explain why this team was chosen, the trade-offs, and the expected impact.
Do not change the recommended team or scores.
${GROUNDING_RULE}
${JSON_INSTRUCTION}
Schema: {"explanation":{"whyThisTeam":"string","tradeOffs":"string","expectedImpact":"string","confidence":number}}`;

// --- Compact context builders -----------------------------------------------

/** Compact, deterministic project context for the LLM. */
export function projectContext(project) {
  const drivers = (project.risk?.drivers ?? []).slice(0, 3)
    .map((driver) => {
      const evidence = (driver.evidence ?? []).slice(0, 2);
      return `- ${driver.title} (${driver.category})${evidence.length ? `; evidence: ${evidence.join('; ')}` : ''}`;
    })
    .join('\n');

  const risks = (project.risks ?? []).slice(0, 3)
    .map((risk) => `- ${risk.title} (${risk.severity}, score ${risk.score})`)
    .join('\n');

  return [
    `Project: ${project.name} (${project.type}, ${project.phase})`,
    `Status: ${PROJECT_STATUS_LABEL[project.status] ?? project.status}`,
    `Health: ${project.healthScore}/100 | Delivery confidence: ${project.deliveryConfidence}% | Target: ${project.targetDate}`,
    `Team size: ${project.teamSize ?? 'unknown'} | Knowledge areas in scope: ${(project.knowledgeAreas ?? []).slice(0, 3).map((area) => area.name).join(', ') || 'none'}`,
    '',
    'Top risk drivers:',
    drivers || 'none',
    '',
    'Highest project risks:',
    risks || 'none',
  ].join('\n');
}

/** Compact, deterministic insight list for the LLM. */
export function insightsContext(insights) {
  return insights
    .slice(0, 5)
    .map((insight) => [
      `ID: ${insight.id}`,
      `Level: ${insight.level} | Score: ${insight.score} | Confidence: ${insight.confidence}`,
      `Summary: ${insight.summary}`,
      `Drivers: ${(insight.drivers ?? []).slice(0, 3).join('; ')}`,
      `Evidence: ${(insight.evidence ?? []).slice(0, 2).join('; ')}`,
    ].join('\n'))
    .join('\n\n');
}

/** Compact, deterministic composition recommendation for the LLM. */
export function compositionContext(composition) {
  const team = (composition.recommendedTeam ?? [])
    .map((person) => `${person.name} (${person.role}) — fit ${person.fitScore}, coverage ${(person.coverage ?? {}).length ?? person.coverage}`)
    .join('\n');
  return [
    `Project: ${composition.project?.name} (${composition.project?.id})`,
    `Required skills: ${(composition.requiredSkills ?? []).join(', ')}`,
    '',
    'Recommended team:',
    team || 'none',
    '',
    `Coverage score: ${composition.assessment?.coverageScore} | Missing skills: ${(composition.assessment?.missingSkills ?? []).join(', ') || 'none'} | Confidence: ${composition.assessment?.confidence}`,
    `Rationale: ${composition.rationale}`,
    `Trade-off: ${composition.tradeOff}`,
    `Impact: ${composition.impact}`,
    `Alternatives: ${(composition.alternatives ?? []).map((alternative) => alternative.name).join(' | ') || 'none'}`,
  ].join('\n');
}