// End-to-end service tests against a freshly seeded database.
// Runs the canonical seed first so every assertion is deterministic.

import test from 'node:test';
import assert from 'node:assert/strict';
import { seed } from '../../src/database/seed/seed.js';
import { listAreas, getAreaById } from '../../src/modules/knowledge/knowledge.service.js';
import { createPlan, listPlans } from '../../src/modules/knowledge/transfer-plan.service.js';
import { db } from '../../src/config/database.config.js';
import { listPeople } from '../../src/modules/person/person.service.js';
import { composeForProject } from '../../src/modules/team-composer/team-composer.service.js';
import { getProjectById } from '../../src/modules/project/project.service.js';
import { listInsights } from '../../src/modules/insight/insight.service.js';
import { getFeed } from '../../src/modules/recognition/recognition.service.js';
import { analyzeProject, getProjectAssessment, explainInsights, explainInsight, getInsightExplanations, explainComposition, getCompositionAssessment, getSettings, updateSettings, regenerateInsightExplanation, regenerateCompositionExplanation, regenerateProjectAnalysis, ANALYSIS_CACHE_TTL_MS } from '../../src/modules/ai/ai.service.js';
import { isAiEnabled, setAiEnabled } from '../../src/modules/ai/ai.settings.js';
import { registerProvider, ProviderError } from '../../src/modules/ai/llm.provider.js';
import { env } from '../../src/config/env.config.js';

seed();

test('seeded data matches the demo narrative counts', () => {
  const counts = seed();
  assert.equal(counts.risks, 18);
  assert.equal(counts.knowledgeAreas, 16);
  assert.equal(counts.capabilities, 28);
  assert.equal(counts.projects, 10);
  assert.equal(counts.allocations, 28 * 12);
});

test('Payment Service (k-01) is a critical single-owner system', async () => {
  const area = await getAreaById('k-01');
  assert.equal(area.name, 'Payment Service');
  assert.equal(area.riskLevel, 'critical');
  assert.ok(area.riskScore >= 80);
  assert.equal(area.dominantExpertShare, 85);
  assert.equal(area.coverage, 38);
  assert.ok(area.linkedProjectIds.includes('pr-07'));
  assert.ok(area.transferPlanId === 'tp-01');
  assert.ok(area.evidence.length >= 2);
});

test('knowledge list exposes risk levels for every area', async () => {
  const areas = await listAreas();
  assert.equal(areas.length, 16);
  for (const area of areas) {
    assert.ok(['critical', 'high', 'medium', 'low'].includes(area.riskLevel));
    assert.ok(Number.isFinite(area.riskScore));
  }
});

test('creating a transfer plan persists a real plan row', async () => {
  const created = await createPlan({ areaId: 'k-02', backupOwnerId: 'p-02', dueDate: '2026-10-15' });
  assert.equal(created.areaId, 'k-02');
  assert.equal(created.backupOwnerId, 'p-02');
  assert.equal(created.status, 'in_progress');
  assert.equal(created.progress, 0);
  assert.ok(created.targetCoverage > 0 && created.targetCoverage <= 90);
  assert.ok(created.dueDate === '2026-10-15');
  const plans = await listPlans();
  assert.ok(plans.some((plan) => plan.id === created.id));
  const area = await getAreaById('k-02');
  assert.equal(area.transferPlanId, created.id);
  db.prepare('DELETE FROM knowledge_transfer_plans WHERE id = ?').run(created.id);
});

test('creating a transfer plan rejects invalid input', async () => {
  await assert.rejects(() => createPlan({ areaId: 'k-02', dueDate: '2026-10-15' }), /backup owner/i);
  await assert.rejects(() => createPlan({ areaId: 'missing', backupOwnerId: 'p-02', dueDate: '2026-10-15' }), /not found/i);
});

test('project detail includes joined teams, owners, areas, and enriched risks', async () => {
  const project = await getProjectById('pr-07');
  assert.equal(project.name, 'Payments 3.0');
  assert.equal(project.type, 'migration');
  assert.equal(project.phase, 'implementation');
  assert.ok(project.description.length > 0, 'project needs a description');
  assert.ok(project.teamIds.includes('t-01'));
  assert.equal(project.teamSize, 11, 'teamSize counts people across all linked teams');
  assert.ok(project.ownerIds.length >= 1);
  assert.ok(project.knowledgeAreas.some((area) => area.id === 'k-01'));
  assert.ok(project.aiMetadata.lastAnalyzedAt, 'AI metadata needs a lastAnalyzedAt');
  assert.ok(project.aiMetadata.signalsUsed.length >= 1, 'AI metadata needs signalsUsed');
  assert.ok(project.risks.length >= 2);
  const risk = project.risks.find((item) => item.id === 'r-02');
  assert.equal(risk.title, 'Single SME owns Payment Service knowledge');
  assert.ok(risk.signals.length >= 2, 'critical risks need supporting evidence');
  assert.ok(risk.actions.length >= 1, 'critical risks need a next action');
  assert.ok(risk.whyThisMatters.length > 0, 'risks expose whyThisMatters');
  assert.ok(risk.expectedImpact.length > 0, 'risks expose expectedImpact');
  assert.ok(risk.suggestedMitigation.length > 0, 'risks expose suggestedMitigation');
  assert.ok(risk.ownerName.length > 0, 'risks expose the owner name');
  const driver = project.risk.drivers.find((item) => item.riskId === 'r-02');
  assert.ok(driver, 'risk drivers are keyed by risk id');
  assert.ok(driver.evidence.length >= 1, 'risk drivers carry cited evidence');
});

test('composer recommends a coverage-matching team for pr-07', async () => {
  const recommendation = await composeForProject('pr-07');
  assert.equal(recommendation.project.id, 'pr-07');
  assert.ok(recommendation.recommendedTeam.length > 0);
  assert.ok(recommendation.assessment.coverageScore >= 50);
  assert.ok(recommendation.rationale.length > 0);
  assert.ok(recommendation.tradeOff.length > 0);
  assert.ok(Array.isArray(recommendation.alternatives));
  assert.ok(Array.isArray(recommendation.rejectedCandidates), 'composer explains why candidates were not selected');
  assert.ok(
    recommendation.rejectedCandidates.every((candidate) => candidate.rejectionReason.length > 0),
    'every rejected candidate carries a grounded rejection reason',
  );
});

test('composer persists a scenario with changes when asked', async () => {
  const recommendation = await composeForProject('pr-07', { persist: true });
  assert.ok(recommendation.scenarioId, 'a persisted scenario should have an id');
  const { getScenarioById } = await import('../../src/modules/team-composer/team-composer.service.js');
  const scenario = await getScenarioById(recommendation.scenarioId);
  assert.equal(scenario.project.id, 'pr-07');
  assert.ok(scenario.recommendedTeam.length > 0);
});

test('insights are grounded, templated, and cover the flagship narrative', async () => {
  const insights = await listInsights();
  assert.ok(insights.some((insight) => insight.id === 'knowledge-k-01'));
  const knowledge = insights.find((insight) => insight.id === 'knowledge-k-01');
  assert.match(knowledge.summary, /Payment Service/);
  assert.ok(knowledge.drivers.length >= 1);
  assert.ok(knowledge.recommendedActions.length >= 1);
  assert.ok(knowledge.evidence.length >= 1);
});

test('recognition feed returns only seeded contribution context', async () => {
  const feed = await getFeed();
  assert.ok(feed.length >= 15);
  const first = feed[0];
  assert.ok(first.person.name.length > 0);
  assert.ok(['public', 'private'].includes(first.visibility));
  assert.ok(Array.isArray(first.impact), 'recognition exposes AI detected impact');
  assert.ok(first.impact.every((line) => line.startsWith('+')), 'impact lines read as positive deltas');
});

test('people expose career, competency, and capacity detail', async () => {
  const people = await listPeople();
  assert.equal(people.length, 28);
  assert.ok(people.every((person) => Number.isInteger(person.yearsOfExperience) && person.yearsOfExperience > 0));
  const david = people.find((person) => person.id === 'p-12');
  assert.equal(david.yearsOfExperience, 9);
  assert.equal(david.role, 'Senior Engineer');
  assert.ok(david.capabilities.every((capability) => capability.name.length > 0 && capability.level.length > 0));
  assert.ok(david.capabilities.some((capability) => capability.name === 'Node.js' && capability.level === 'primary'));
  assert.ok(david.expertise.length > 0);
  assert.ok(david.availabilityFte > 0 && david.availabilityFte <= 1);
});

test('AI assessment GET serves the deterministic analysis without an AI call', async () => {
  setAiEnabled(false);
  const assessment = await getProjectAssessment('pr-07');
  assert.equal(assessment.deterministic.projectId, 'pr-07');
  assert.equal(assessment.deterministic.source, 'deterministic');
  assert.equal(assessment.deterministic.provider, null);
  assert.equal(assessment.deterministic.model, null);
  assert.ok(assessment.deterministic.summary.length > 0);
  assert.ok(assessment.deterministic.findings.length >= 1);
  assert.ok(Array.isArray(assessment.deterministic.recommendedActions));
  assert.equal(assessment.deterministic.confidence, null, 'the deterministic assessment has no AI grounding to self-assess');
  assert.ok(Array.isArray(assessment.deterministic.evidence), 'deterministic analysis cites evidence references');
  assert.ok(assessment.deterministic.evidence.length >= 1);
  assert.ok(assessment.deterministic.evidence.every((item) => item.id && item.type && item.summary));
  assert.equal(assessment.ai, null, 'no cached AI result when the LLM has never run');
});

test('AI analyze returns found:false for an unknown project', async () => {
  const result = await analyzeProject('nope');
  assert.equal(result.found, false);
  assert.equal(result.analysis, null);
});

test('AI assessment GET returns null for an unknown project', async () => {
  assert.equal(await getProjectAssessment('nope'), null);
});

test('AI explain insights returns deterministic explanations when AI is disabled', async () => {
  setAiEnabled(false);
  const result = await explainInsights();
  assert.equal(result.source, 'deterministic');
  assert.ok(result.insights.length >= 1);
  assert.ok(result.insights.every((insight) => insight.explanation?.reasoning));
});

test('AI explain composition returns a deterministic explanation when AI is disabled', async () => {
  setAiEnabled(false);
  const result = await explainComposition('pr-07');
  assert.equal(result.source, 'deterministic');
  assert.equal(result.recommendation.project.id, 'pr-07');
  assert.ok(result.explanation.whyThisTeam.length > 0);
  assert.equal(result.explanation.confidence, result.recommendation.assessment.confidence);
});

test('AI explain composition returns null for an unknown project', async () => {
  assert.equal(await explainComposition('nope'), null);
});

test('AI analyze returns null (no AI) when the provider fails instead of masking it', async () => {
  registerProvider('test-failing', () => ({
    name: 'test-failing',
    model: 'failing-model',
    async complete() {
      throw new ProviderError('boom', { code: 'HTTP', status: 500 });
    },
  }));
  const saved = { enabled: isAiEnabled(), provider: env.aiProvider, xKey: env.xaiApiKey };
  setAiEnabled(true);
  env.aiProvider = 'test-failing';
  env.xaiApiKey = 'test-key';
  try {
    const { found, analysis } = await analyzeProject('pr-01');
    assert.equal(found, true);
    assert.equal(analysis, null, 'a provider failure never produces a fake AI analysis');
  } finally {
    setAiEnabled(saved.enabled);
    Object.assign(env, { aiProvider: saved.provider, xaiApiKey: saved.xKey });
  }
});

test('AI analyze auto-retries transient provider failures up to the attempt limit', async () => {
  let calls = 0;
  registerProvider('test-retry', () => ({
    name: 'test-retry',
    model: 'retry-model',
    async complete() {
      calls += 1;
      throw new ProviderError('rate limited', { code: 'RATE_LIMITED', status: 429, retryAfter: '0' });
    },
  }));
  const saved = { enabled: isAiEnabled(), provider: env.aiProvider, xKey: env.xaiApiKey };
  setAiEnabled(true);
  env.aiProvider = 'test-retry';
  env.xaiApiKey = 'test-key';
  try {
    const { analysis } = await analyzeProject('pr-06');
    assert.equal(analysis, null, 'exhausted transient failures surface as no AI');
    assert.equal(calls, 3, 'transient failures are retried exactly up to the 3-attempt limit, then report no AI');
  } finally {
    setAiEnabled(saved.enabled);
    Object.assign(env, { aiProvider: saved.provider, xaiApiKey: saved.xKey });
  }
});

test('AI analyze dedupes concurrent requests for the same project', async () => {
  let calls = 0;
  registerProvider('test-dedupe', () => ({
    name: 'test-dedupe',
    model: 'dedupe-model',
    async complete() {
      calls += 1;
      await new Promise((resolve) => setTimeout(resolve, 20));
      return { content: { summary: 'S', findings: ['F'], recommendedActions: ['A'], confidence: 90 }, model: 'dedupe-model' };
    },
  }));
  const saved = { enabled: isAiEnabled(), provider: env.aiProvider, xKey: env.xaiApiKey };
  setAiEnabled(true);
  env.aiProvider = 'test-dedupe';
  env.xaiApiKey = 'test-key';
  try {
    const [first, second] = await Promise.all([analyzeProject('pr-02'), analyzeProject('pr-02')]);
    assert.equal(calls, 1, 'two concurrent calls must share one upstream request');
    assert.equal(first.analysis.source, 'llm');
    assert.equal(first.analysis.provider, 'test-dedupe');
    assert.equal(first.analysis.model, 'dedupe-model');
    assert.equal(first.analysis.confidence, 90, 'LLM output exposes grounding confidence, separate from delivery confidence');
    assert.equal(second.analysis.source, 'llm');
  } finally {
    setAiEnabled(saved.enabled);
    Object.assign(env, { aiProvider: saved.provider, xaiApiKey: saved.xKey });
  }
});

test('AI analyze flattens nested findings from the LLM', async () => {
  registerProvider('test-nested', () => ({
    name: 'test-nested',
    model: 'nested-model',
    async complete() {
      return {
        content: {
          summary: 'S',
          findings: [['a'], ['b']],
          recommendedActions: [['x'], 'y'],
          confidence: 70,
          evidence: [{ id: 'r-01', type: 'risk', summary: 'driver' }],
        },
        model: 'nested-model',
      };
    },
  }));
  const saved = { enabled: isAiEnabled(), provider: env.aiProvider, xKey: env.xaiApiKey };
  setAiEnabled(true);
  env.aiProvider = 'test-nested';
  env.xaiApiKey = 'test-key';
  try {
    const { analysis } = await analyzeProject('pr-03');
    assert.equal(analysis.source, 'llm');
    assert.deepEqual(analysis.findings, ['a', 'b'], 'nested arrays flatten to strings');
    assert.deepEqual(analysis.recommendedActions, ['x', 'y']);
    assert.equal(analysis.confidence, 70, 'LLM confidence is exposed as confidence');
    assert.equal(analysis.evidence.length, 1);
    assert.equal(analysis.evidence[0].id, 'r-01');
  } finally {
    setAiEnabled(saved.enabled);
    Object.assign(env, { aiProvider: saved.provider, xaiApiKey: saved.xKey });
  }
});

test('AI settings expose runtime state without API keys', async () => {
  setAiEnabled(false);
  const settings = getSettings();
  assert.deepEqual(Object.keys(settings).sort(), ['enabled', 'model', 'provider']);
  assert.equal(typeof settings.enabled, 'boolean');
  assert.equal(typeof settings.provider, 'string');
  assert.equal(typeof settings.model, 'string');
});

test('AI settings toggle drives LLM vs deterministic mode and clears cached results', async () => {
  registerProvider('test-toggle', () => ({
    name: 'test-toggle',
    model: 'toggle-model',
    async complete() {
      return { content: { summary: 'S', findings: ['F'], recommendedActions: ['A'], confidence: 88 }, model: 'toggle-model' };
    },
  }));
  const saved = { enabled: isAiEnabled(), provider: env.aiProvider, xKey: env.xaiApiKey };
  env.aiProvider = 'test-toggle';
  env.xaiApiKey = 'test-key';
  try {
    updateSettings({ enabled: false });
    const off = await analyzeProject('pr-04');
    assert.equal(off.found, true);
    assert.equal(off.analysis, null, 'AI off means no AI result (deterministic stays on the GET endpoint)');

    assert.equal(updateSettings({ enabled: true }).enabled, true);
    const llm = await analyzeProject('pr-05');
    assert.equal(llm.analysis.source, 'llm', 'AI on uses the LLM');

    const assessment = await getProjectAssessment('pr-05');
    assert.equal(assessment.ai.source, 'llm', 'GET surfaces the cached AI analysis for the revisit');

    updateSettings({ enabled: false });
    const offAgain = await analyzeProject('pr-05');
    assert.equal(offAgain.analysis, null, 'toggling off clears cached LLM results');
    const afterToggle = await getProjectAssessment('pr-05');
    assert.equal(afterToggle.ai, null, 'cached AI is gone after toggling off');
    assert.ok(afterToggle.deterministic.summary.length > 0, 'the deterministic assessment is always available');
  } finally {
    updateSettings({ enabled: saved.enabled });
    Object.assign(env, { aiProvider: saved.provider, xaiApiKey: saved.xKey });
  }
});

test('AI insight explanations drop evidence duplication and are cached per insight', async () => {
  let calls = 0;
  registerProvider('test-insights', () => ({
    name: 'test-insights',
    model: 'insights-model',
    async complete() {
      calls += 1;
      return {
        content: {
          explanations: [
            { insightId: 'risk-r-01', explanation: { reasoning: calls === 1 ? 'why this matters' : 'UNEXPECTED refresh', impact: 'delivery consequence' } },
          ],
        },
        model: 'insights-model',
      };
    },
  }));
  const saved = { enabled: isAiEnabled(), provider: env.aiProvider, xKey: env.xaiApiKey };
  setAiEnabled(true);
  env.aiProvider = 'test-insights';
  env.xaiApiKey = 'test-key';
  try {
    const first = await explainInsights();
    assert.equal(first.source, 'llm');
    const explained = first.insights.find((insight) => insight.id === 'risk-r-01');
    assert.deepEqual(Object.keys(explained.explanation).sort(), ['impact', 'reasoning'], 'explanation is reasoning+impact only');
    assert.equal(explained.explanationMeta.source, 'llm');
    assert.equal(explained.explanationMeta.model, 'insights-model');
    assert.ok(explained.explanationMeta.generatedAt);

    const second = await explainInsights();
    const cached = second.insights.find((insight) => insight.id === 'risk-r-01');
    assert.equal(cached.explanation.reasoning, 'why this matters', 'cached explanation is served, not regenerated');
    assert.equal(second.source, 'llm');
  } finally {
    setAiEnabled(saved.enabled);
    Object.assign(env, { aiProvider: saved.provider, xaiApiKey: saved.xKey });
  }
});

test('AI insight regenerate bypasses cache and replaces the explanation', async () => {
  let calls = 0;
  registerProvider('test-regen', () => ({
    name: 'test-regen',
    model: 'regen-model',
    async complete() {
      calls += 1;
      return {
        content: {
          explanations: [
            { insightId: 'risk-r-01', explanation: { reasoning: `generation ${calls}`, impact: 'impact' } },
          ],
        },
        model: 'regen-model',
      };
    },
  }));
  const saved = { enabled: isAiEnabled(), provider: env.aiProvider, xKey: env.xaiApiKey };
  setAiEnabled(true);
  env.aiProvider = 'test-regen';
  env.xaiApiKey = 'test-key';
  try {
    const first = await regenerateInsightExplanation('risk-r-01');
    assert.equal(first.insightId, 'risk-r-01');
    assert.equal(first.explanation.reasoning, 'generation 1');

    const second = await regenerateInsightExplanation('risk-r-01');
    assert.equal(second.explanation.reasoning, 'generation 2', 'regenerate always calls the LLM again');
    assert.equal(calls, 2);
  } finally {
    setAiEnabled(saved.enabled);
    Object.assign(env, { aiProvider: saved.provider, xaiApiKey: saved.xKey });
  }
});

test('AI insight regenerate failure keeps the previous explanation and errors', async () => {
  let fail = false;
  registerProvider('test-regen-fail', () => ({
    name: 'test-regen-fail',
    model: 'regen-model',
    async complete() {
      if (fail) throw new ProviderError('boom', { code: 'HTTP', status: 500 });
      return {
        content: {
          explanations: [
            { insightId: 'risk-r-01', explanation: { reasoning: 'previous good explanation', impact: 'impact' } },
          ],
        },
        model: 'regen-model',
      };
    },
  }));
  const saved = { enabled: isAiEnabled(), provider: env.aiProvider, xKey: env.xaiApiKey };
  setAiEnabled(true);
  env.aiProvider = 'test-regen-fail';
  env.xaiApiKey = 'test-key';
  try {
    const first = await regenerateInsightExplanation('risk-r-01');
    assert.equal(first.explanation.reasoning, 'previous good explanation');

    fail = true;
    await assert.rejects(
      () => regenerateInsightExplanation('risk-r-01'),
      (error) => {
        assert.equal(error.status, 502, 'regeneration failure surfaces as an error');
        return true;
      },
    );

    const batch = await explainInsights();
    const cached = batch.insights.find((insight) => insight.id === 'risk-r-01');
    assert.equal(cached.explanation.reasoning, 'previous good explanation', 'previous explanation is preserved');
    assert.equal(cached.explanationMeta.source, 'llm');
  } finally {
    setAiEnabled(saved.enabled);
    Object.assign(env, { aiProvider: saved.provider, xaiApiKey: saved.xKey });
  }
});

test('AI explain insight explains only the clicked insight and is cached per insight', async () => {
  let calls = 0;
  registerProvider('test-one-insight', () => ({
    name: 'test-one-insight',
    model: 'one-insight-model',
    async complete() {
      calls += 1;
      return {
        content: {
          explanations: [
            { insightId: 'risk-r-17', explanation: { reasoning: `why-${calls}`, impact: 'impact' } },
            { insightId: 'risk-r-02', explanation: { reasoning: `why-${calls}`, impact: 'impact' } },
          ],
        },
        model: 'one-insight-model',
      };
    },
  }));
  const saved = { enabled: isAiEnabled(), provider: env.aiProvider, xKey: env.xaiApiKey };
  setAiEnabled(true);
  env.aiProvider = 'test-one-insight';
  env.xaiApiKey = 'test-key';
  try {
    const first = await explainInsight('risk-r-17');
    assert.equal(first.insightId, 'risk-r-17');
    assert.equal(first.explanationMeta.source, 'llm');
    assert.equal(first.explanation.reasoning, 'why-1');
    assert.equal(calls, 1, 'one insight = one small LLM call, not the whole page');

    const cached = await explainInsight('risk-r-17');
    assert.equal(cached.explanation.reasoning, 'why-1', 'repeat clicks are served from the per-insight cache');
    assert.equal(calls, 1, 'cache hit — no second LLM call');

    const second = await explainInsight('risk-r-02');
    assert.equal(second.explanation.reasoning, 'why-2', 'a different insight triggers its own call');
    assert.equal(calls, 2);
  } finally {
    setAiEnabled(saved.enabled);
    Object.assign(env, { aiProvider: saved.provider, xaiApiKey: saved.xKey });
  }
});

test('AI explain insight falls back to a deterministic explanation when AI is disabled', async () => {
  const saved = { enabled: isAiEnabled(), provider: env.aiProvider, xKey: env.xaiApiKey };
  setAiEnabled(false);
  try {
    const result = await explainInsight('portfolio-delivery-pressure');
    assert.equal(result.insightId, 'portfolio-delivery-pressure');
    assert.equal(result.explanationMeta.source, 'deterministic');
    assert.ok(result.explanation.reasoning.length > 0, 'deterministic reasoning is always available');
  } finally {
    setAiEnabled(saved.enabled);
    Object.assign(env, { aiProvider: saved.provider, xaiApiKey: saved.xKey });
  }
});

test('AI insight explanations GET is cache-only and surfaces cached results on revisit', async () => {
  let calls = 0;
  registerProvider('test-ins-get', () => ({
    name: 'test-ins-get',
    model: 'ins-get-model',
    async complete() {
      calls += 1;
      return {
        content: {
          explanations: [
            { insightId: 'risk-r-17', explanation: { reasoning: 'cached why', impact: 'impact' } },
          ],
        },
        model: 'ins-get-model',
      };
    },
  }));
  const saved = { enabled: isAiEnabled(), provider: env.aiProvider, xKey: env.xaiApiKey };
  updateSettings({ enabled: true });
  env.aiProvider = 'test-ins-get';
  env.xaiApiKey = 'test-key';
  try {
    const before = await getInsightExplanations();
    const uncached = before.find((insight) => insight.insightId === 'risk-r-17');
    assert.equal(uncached.explanation, null, 'no explanation before any explain call');
    assert.equal(calls, 0, 'GET never triggers an LLM call');

    const explained = await explainInsight('risk-r-17');
    assert.equal(explained.explanation.reasoning, 'cached why');
    assert.equal(calls, 1);

    const after = await getInsightExplanations();
    const cached = after.find((insight) => insight.insightId === 'risk-r-17');
    assert.equal(cached.explanation.reasoning, 'cached why', 'a revisit surfaces the cached explanation');
    assert.equal(cached.explanationMeta.source, 'llm');
    assert.equal(calls, 1, 'GET is cache-only — it never triggers an LLM call');
  } finally {
    setAiEnabled(saved.enabled);
    Object.assign(env, { aiProvider: saved.provider, xaiApiKey: saved.xKey });
  }
});

test('AI analyze exposes LLM grounding confidence, not delivery confidence', async () => {
  registerProvider('test-confidence', () => ({
    name: 'test-confidence',
    model: 'confidence-model',
    async complete() {
      return {
        content: {
          summary: 'S',
          findings: ['F'],
          recommendedActions: ['A'],
          confidence: 85,
          evidence: [{ id: 'r-01', type: 'risk', summary: 'driver' }],
        },
        model: 'confidence-model',
      };
    },
  }));
  const saved = { enabled: isAiEnabled(), provider: env.aiProvider, xKey: env.xaiApiKey };
  setAiEnabled(true);
  env.aiProvider = 'test-confidence';
  env.xaiApiKey = 'test-key';
  try {
    const { analysis } = await analyzeProject('pr-08');
    assert.equal(analysis.source, 'llm');
    assert.equal(analysis.confidence, 85, 'LLM self-assessment surfaces as confidence');
    assert.equal(analysis.aiConfidence, undefined, 'aiConfidence is gone from the response shape');
    assert.equal(analysis.healthScore, undefined, 'healthScore stays deterministic-only');
    assert.equal(analysis.deliveryConfidence, undefined, 'delivery confidence never leaks into the analysis');
  } finally {
    setAiEnabled(saved.enabled);
    Object.assign(env, { aiProvider: saved.provider, xaiApiKey: saved.xKey });
  }
});

test('AI analyze treats aberrantly low confidence as n/a', async () => {
  registerProvider('test-low-conf', () => ({
    name: 'test-low-conf',
    model: 'low-conf-model',
    async complete() {
      return {
        content: { summary: 'S', findings: ['F'], recommendedActions: ['A'], confidence: 1 },
        model: 'low-conf-model',
      };
    },
  }));
  const saved = { enabled: isAiEnabled(), provider: env.aiProvider, xKey: env.xaiApiKey };
  setAiEnabled(true);
  env.aiProvider = 'test-low-conf';
  env.xaiApiKey = 'test-key';
  try {
    const { analysis } = await analyzeProject('pr-09');
    assert.equal(analysis.source, 'llm');
    assert.equal(analysis.confidence, null, 'an aberrantly low self-assessment is surfaced as n/a');
  } finally {
    setAiEnabled(saved.enabled);
    Object.assign(env, { aiProvider: saved.provider, xaiApiKey: saved.xKey });
  }
});

test('AI analyze caches project analyses for 30 minutes', async () => {
  let calls = 0;
  registerProvider('test-cache30', () => ({
    name: 'test-cache30',
    model: 'cache30-model',
    async complete() {
      calls += 1;
      return { content: { summary: 'S', findings: ['F'], recommendedActions: ['A'], confidence: 80 }, model: 'cache30-model' };
    },
  }));
  const saved = { enabled: isAiEnabled(), provider: env.aiProvider, xKey: env.xaiApiKey };
  updateSettings({ enabled: true });
  env.aiProvider = 'test-cache30';
  env.xaiApiKey = 'test-key';
  try {
    const { analysis: first } = await analyzeProject('pr-10');
    assert.equal(first.source, 'llm');
    assert.equal(calls, 1);
    const { analysis: second } = await analyzeProject('pr-10');
    assert.equal(second.source, 'llm');
    assert.equal(calls, 1, 'the second call is served from the 30-minute cache');
    assert.equal(ANALYSIS_CACHE_TTL_MS, 30 * 60 * 1000, 'project analyses are cached for 30 minutes');
  } finally {
    setAiEnabled(saved.enabled);
    Object.assign(env, { aiProvider: saved.provider, xaiApiKey: saved.xKey });
  }
});

test('AI assessment GET serves the cached AI analysis without calling the LLM', async () => {
  let calls = 0;
  registerProvider('test-get-cached', () => ({
    name: 'test-get-cached',
    model: 'get-cached-model',
    async complete() {
      calls += 1;
      return { content: { summary: 'S', findings: ['F'], recommendedActions: ['A'], confidence: 80 }, model: 'get-cached-model' };
    },
  }));
  const saved = { enabled: isAiEnabled(), provider: env.aiProvider, xKey: env.xaiApiKey };
  updateSettings({ enabled: true });
  env.aiProvider = 'test-get-cached';
  env.xaiApiKey = 'test-key';
  try {
    await analyzeProject('pr-01');
    assert.equal(calls, 1);
    const assessment = await getProjectAssessment('pr-01');
    assert.equal(assessment.ai.source, 'llm');
    assert.equal(assessment.ai.model, 'get-cached-model');
    assert.equal(assessment.ai.summary, 'S');
    assert.ok(assessment.deterministic.summary.length > 0, 'deterministic always accompanies the AI result');
    assert.equal(calls, 1, 'GET is cache-only — it never triggers an LLM call');
  } finally {
    setAiEnabled(saved.enabled);
    Object.assign(env, { aiProvider: saved.provider, xaiApiKey: saved.xKey });
  }
});

test('AI analyze regenerate bypasses the cache and replaces the analysis', async () => {
  let calls = 0;
  registerProvider('test-proj-regen', () => ({
    name: 'test-proj-regen',
    model: 'proj-regen-model',
    async complete() {
      calls += 1;
      return {
        content: { summary: `analysis ${calls}`, findings: ['F'], recommendedActions: ['A'], confidence: 80 },
        model: 'proj-regen-model',
      };
    },
  }));
  const saved = { enabled: isAiEnabled(), provider: env.aiProvider, xKey: env.xaiApiKey };
  updateSettings({ enabled: true });
  env.aiProvider = 'test-proj-regen';
  env.xaiApiKey = 'test-key';
  try {
    const { analysis: first } = await analyzeProject('pr-10');
    assert.equal(first.source, 'llm');
    assert.equal(first.summary, 'analysis 1');
    assert.equal(calls, 1);

    const regenerated = await regenerateProjectAnalysis('pr-10');
    assert.equal(regenerated.source, 'llm');
    assert.equal(regenerated.summary, 'analysis 2', 'regenerate bypasses the cache and calls the LLM again');
    assert.equal(calls, 2);
  } finally {
    setAiEnabled(saved.enabled);
    Object.assign(env, { aiProvider: saved.provider, xaiApiKey: saved.xKey });
  }
});

test('AI analyze regenerate failure keeps the previous analysis and errors', async () => {
  let fail = false;
  registerProvider('test-proj-regen-fail', () => ({
    name: 'test-proj-regen-fail',
    model: 'proj-regen-model',
    async complete() {
      if (fail) throw new ProviderError('boom', { code: 'HTTP', status: 500, retryAfter: '0' });
      return {
        content: { summary: 'original summary', findings: ['F'], recommendedActions: ['A'], confidence: 80 },
        model: 'proj-regen-model',
      };
    },
  }));
  const saved = { enabled: isAiEnabled(), provider: env.aiProvider, xKey: env.xaiApiKey };
  updateSettings({ enabled: true });
  env.aiProvider = 'test-proj-regen-fail';
  env.xaiApiKey = 'test-key';
  try {
    const { analysis: first } = await analyzeProject('pr-10');
    assert.equal(first.summary, 'original summary');

    fail = true;
    await assert.rejects(
      () => regenerateProjectAnalysis('pr-10'),
      (error) => {
        assert.equal(error.status, 502, 'regeneration failure surfaces as an error');
        return true;
      },
    );

    const { analysis: cached } = await analyzeProject('pr-10');
    assert.equal(cached.summary, 'original summary', 'the previous analysis is preserved after a failed regeneration');
    assert.equal(cached.source, 'llm');
  } finally {
    setAiEnabled(saved.enabled);
    Object.assign(env, { aiProvider: saved.provider, xaiApiKey: saved.xKey });
  }
});

test('AI analyze regenerate returns 503 when AI is disabled', async () => {
  const saved = { enabled: isAiEnabled(), provider: env.aiProvider, xKey: env.xaiApiKey };
  setAiEnabled(false);
  try {
    await assert.rejects(
      () => regenerateProjectAnalysis('pr-09'),
      (error) => {
        assert.equal(error.status, 503, 'nothing to regenerate when AI is off');
        assert.match(error.message, /AI is disabled/);
        return true;
      },
    );
  } finally {
    setAiEnabled(saved.enabled);
    Object.assign(env, { aiProvider: saved.provider, xaiApiKey: saved.xKey });
  }
});

test('AI composition assessment GET is cache-only and never calls the LLM', async () => {
  let calls = 0;
  registerProvider('test-comp-get', () => ({
    name: 'test-comp-get',
    model: 'comp-get-model',
    async complete() {
      calls += 1;
      return {
        content: {
          explanation: {
            whyThisTeam: 'why',
            tradeOffs: 'trade',
            expectedImpact: 'impact',
            confidence: 80,
          },
        },
        model: 'comp-get-model',
      };
    },
  }));
  const saved = { enabled: isAiEnabled(), provider: env.aiProvider, xKey: env.xaiApiKey };
  updateSettings({ enabled: true });
  env.aiProvider = 'test-comp-get';
  env.xaiApiKey = 'test-key';
  try {
    const empty = await getCompositionAssessment('pr-08');
    assert.equal(empty.ai, null, 'no AI explanation before any explain call');
    assert.equal(empty.deterministic.whyThisTeam.length > 0, true, 'deterministic explanation is always computed');
    assert.equal(calls, 0, 'GET never triggers an LLM call');

    await explainComposition('pr-08');
    assert.equal(calls, 1);

    const assessment = await getCompositionAssessment('pr-08');
    assert.equal(assessment.ai.source, 'llm');
    assert.equal(assessment.ai.model, 'comp-get-model');
    assert.equal(calls, 1, 'cached AI explanation is served without a second LLM call');
  } finally {
    setAiEnabled(saved.enabled);
    Object.assign(env, { aiProvider: saved.provider, xaiApiKey: saved.xKey });
  }
});

test('AI composition regenerate bypasses the cache and replaces the explanation', async () => {
  let calls = 0;
  registerProvider('test-comp-regen', () => ({
    name: 'test-comp-regen',
    model: 'comp-regen-model',
    async complete() {
      calls += 1;
      return {
        content: {
          explanation: {
            whyThisTeam: `why ${calls}`,
            tradeOffs: 'trade',
            expectedImpact: 'impact',
            confidence: 80,
          },
        },
        model: 'comp-regen-model',
      };
    },
  }));
  const saved = { enabled: isAiEnabled(), provider: env.aiProvider, xKey: env.xaiApiKey };
  updateSettings({ enabled: true });
  env.aiProvider = 'test-comp-regen';
  env.xaiApiKey = 'test-key';
  try {
    const first = await explainComposition('pr-08');
    assert.equal(first.explanation.whyThisTeam, 'why 1');
    assert.equal(calls, 1);

    const regenerated = await regenerateCompositionExplanation('pr-08');
    assert.equal(regenerated.source, 'llm');
    assert.equal(regenerated.explanation.whyThisTeam, 'why 2', 'regenerate bypasses the cache and calls the LLM again');
    assert.equal(calls, 2);
  } finally {
    setAiEnabled(saved.enabled);
    Object.assign(env, { aiProvider: saved.provider, xaiApiKey: saved.xKey });
  }
});

test('AI composition regenerate failure keeps the previous explanation and errors', async () => {
  let fail = false;
  registerProvider('test-comp-regen-fail', () => ({
    name: 'test-comp-regen-fail',
    model: 'comp-regen-model',
    async complete() {
      if (fail) throw new ProviderError('boom', { code: 'HTTP', status: 500, retryAfter: '0' });
      return {
        content: {
          explanation: {
            whyThisTeam: 'original why',
            tradeOffs: 'trade',
            expectedImpact: 'impact',
            confidence: 80,
          },
        },
        model: 'comp-regen-model',
      };
    },
  }));
  const saved = { enabled: isAiEnabled(), provider: env.aiProvider, xKey: env.xaiApiKey };
  updateSettings({ enabled: true });
  env.aiProvider = 'test-comp-regen-fail';
  env.xaiApiKey = 'test-key';
  try {
    const first = await explainComposition('pr-08');
    assert.equal(first.explanation.whyThisTeam, 'original why');

    fail = true;
    await assert.rejects(
      () => regenerateCompositionExplanation('pr-08'),
      (error) => {
        assert.equal(error.status, 502, 'regeneration failure surfaces as an error');
        return true;
      },
    );

    const cached = await explainComposition('pr-08');
    assert.equal(cached.explanation.whyThisTeam, 'original why', 'the previous explanation is preserved');
    assert.equal(cached.source, 'llm');
  } finally {
    setAiEnabled(saved.enabled);
    Object.assign(env, { aiProvider: saved.provider, xaiApiKey: saved.xKey });
  }
});

test('AI composition regenerate returns 503 when AI is disabled', async () => {
  const saved = { enabled: isAiEnabled(), provider: env.aiProvider, xKey: env.xaiApiKey };
  setAiEnabled(false);
  try {
    await assert.rejects(
      () => regenerateCompositionExplanation('pr-07'),
      (error) => {
        assert.equal(error.status, 503, 'nothing to regenerate when AI is off');
        assert.match(error.message, /AI is disabled/);
        return true;
      },
    );
  } finally {
    setAiEnabled(saved.enabled);
    Object.assign(env, { aiProvider: saved.provider, xaiApiKey: saved.xKey });
  }
});