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

export const SYSTEM_RECOGNITION_EXPLANATION = `You are a recognition explainer for an AI Engineering Intelligence Platform.
Explain WHY a person was recognized, grounding every claim in the supplied verified evidence and the deterministic scores.
Award eligibility is already decided deterministically from that evidence — you only explain it, never re-decide it, never suggest a different tier.
Write 3-6 warm, professional sentences that read as one narrative.
${JSON_INSTRUCTION}
Schema: {"narrative":"string"}`;

export const SYSTEM_DECISION_EXPLANATION = `You are a delivery decision explainer for an AI Engineering Intelligence Platform.
You receive an already-completed deterministic comparison of four decision options for one project, including the computed
winner and the winner's deterministic rationale and trade-offs.
Explain the comparison for a delivery leader. Your explanation must:
- stay purely explanatory: the winner is already computed deterministically, so never re-decide it, never recalculate or
  second-guess any score or currency value, and never introduce a new option;
- ground every claim in the supplied facts: use the deterministic rationale and trade-offs as the factual basis for your
  phrasing (you may paraphrase, never contradict);
- weigh the organizational trade-offs honestly (source-team strain, cost, knowledge risk, window);
- only invent what a human would say, never a fact: no new metrics, dates, people, percent signs, or time windows.
Explain the supplied facts; you cannot change them.
${GROUNDING_RULE}
${JSON_INSTRUCTION}
Schema: {"summary":"string","whyRecommended":["string"],"tradeoffs":["string"],"leadershipConsiderations":["string"]}`;

/** Compact, fully evidence-sourceable recognition context for the LLM. */
export function recognitionExplanationContext(grounding) {
  const evidenceLines = (grounding.evidence ?? []).map((item) =>
    `- [${item.role}] ${item.entityType}:${item.entityId} (${item.source}, ${item.occurredAt}) "${item.statement}"`);
  const int = grounding.intelligence ?? {};
  const award = grounding.award ?? {};
  return [
    `Person: ${grounding.person?.name ?? 'unknown'}`,
    `Recognized for: ${grounding.summary ?? ''} (${grounding.type ?? 'contribution'})`,
    `Stored impact notes: ${(grounding.impact ?? []).join(' | ') || 'none'}`,
    '',
    'Verified evidence:',
    evidenceLines.join('\n') || 'none',
    '',
    `Deterministic scores: evidence ${int.evidenceStrength ?? ''}/100, impact ${int.impact ?? ''}/100, scope ${int.scope ?? ''}/100, consistency ${int.consistency ?? ''}/100`,
    `Award tier: ${award.highestQualifiedLevel ?? 'none'} | qualified levels: ${(award.qualifiedLevels ?? []).join(', ') || 'none'}`,
  ].join('\n');
}

// --- Decision Impact Simulator explanation -----------------------------------

function exposureOf(signals) {
  return signals?.exposure ? `${signals.exposure.score} (${signals.exposure.label})` : 'n/a';
}

function inr(value) {
  return Number(value ?? 0).toLocaleString('en-IN');
}

function optionFacts(option) {
  const after = option.after ?? {};
  const fin = option.financial ?? {};
  const facts = [
    `${option.option} — "${option.label}": score ${option.score}/100`,
    `  After: exposure ${exposureOf(after)}, risk ${after.risk?.score ?? 'n/a'}, coverage ${after.coverage?.score ?? 'n/a'}, knowledge concentration ${after.knowledge?.concentration ?? 'n/a'}`,
    `  Financial: net ₹${inr(fin.netPlanningImpact)} (avoided ₹${inr(fin.avoidedExposure)}, cost ₹${inr(fin.staffingCost)})`,
  ];
  if (option.sourceImpact) {
    const s = option.sourceImpact;
    facts.push(`  Source team impact: ${s.teamName} ${s.pressureBefore}% → ${s.pressureAfter}% while ${s.personName} (${s.fte} FTE) is reallocated`);
  }
  return facts.join('\n');
}

/**
 * Compact, fact-only context built from the ALREADY COMPLETED comparison
 * result. The deterministic recommendation rationale and trade-offs are passed
 * through verbatim — the LLM explains these facts, it never reconstructs them.
 */
export function decisionComparisonResultContext(result) {
  const project = result.project ?? {};
  const signals = result.currentSignals ?? {};
  const options = Array.isArray(result.options) ? result.options.slice(0, 4) : [];
  const recommended = result.recommended ?? {};

  const lines = [
    `Project: ${project.name} (${project.id}) | Phase: ${project.phase ?? 'n/a'} | Status: ${project.status ?? 'n/a'}`,
    `Target date: ${project.targetDate ?? 'n/a'} | Window: ${signalDays(signals)} days to target (as of ${result.demoToday ?? 'today'})`,
    `Current signals: risk ${signals.risk?.score ?? 'n/a'} (${signals.risk?.severity ?? 'n/a'}), delivery exposure ${exposureOf(signals)}, capability coverage ${signals.coverage?.score ?? 'n/a'}%, knowledge concentration ${signals.knowledge?.concentration ?? 'n/a'} (single-owner: ${signals.knowledge?.singleOwner ?? 'n/a'})`,
    '',
    'Decision options (fixed table):',
    options.map(optionFacts).join('\n') || 'none',
    '',
    `Recommended option: ${recommended.option} — "${recommended.label}" (score ${recommended.score}/100)`,
    '',
    'Deterministic rationale (facts supplied by the engine):',
    ...(recommended.reasons ?? []).map((reason) => `- ${typeof reason === 'string' ? reason : reason?.text ?? ''}`),
    '',
    'Deterministic trade-offs (facts supplied by the engine):',
    ...(recommended.tradeOffs ?? []).map((tradeOff) => `- ${typeof tradeOff === 'string' ? tradeOff : tradeOff?.text ?? ''}`),
  ];
  return lines.join('\n');
}

function signalDays(signals) {
  return signals?.exposure?.remainingDays ?? signals?.exposure?.windowDays ?? 'n/a';
}