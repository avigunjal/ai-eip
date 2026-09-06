// Decision explanation tests: the LLM must explain an ALREADY COMPLETED
// deterministic comparison, never recompute it. The deterministic echo comes
// straight from the input (mirror, never a recompute), so the winner, scores,
// and currency values can never change under any LLM output. Provider failure
// or malformed output must degrade to ai:null, never to an error.

import test from 'node:test';
import assert from 'node:assert/strict';
import { seed } from '../../src/database/seed/seed.js';
import { compareDecisions } from '../../src/modules/decision-intelligence/decision.service.js';
import { explainDecision, validateComparisonResult, updateSettings } from '../../src/modules/ai/ai.service.js';
import { isAiEnabled, setAiEnabled } from '../../src/modules/ai/ai.settings.js';
import { registerProvider, ProviderError } from '../../src/modules/ai/llm.provider.js';
import { env } from '../../src/config/env.config.js';
import { decisionComparisonResultContext } from '../../src/modules/ai/context.js';

seed();

const VALID_AI_RESULT = {
  summary: 'The reallocation is the strongest lever right now.',
  whyRecommended: ['It reduces delivery risk fastest.', 'It costs nothing extra.'],
  tradeoffs: ['The source team takes on more load.'],
  leadershipConsiderations: ['Time-box the assignment.'],
};

// Save/restore the runtime AI wiring and clear the explanation cache around
// every provider test (the cache key is derived from the deterministic echo,
// so identical results share a key across tests).
function sandbox() {
  const saved = { enabled: isAiEnabled(), provider: env.aiProvider, xKey: env.xaiApiKey };
  updateSettings({ enabled: saved.enabled });
  return {
    restore() {
      env.aiProvider = saved.provider;
      env.xaiApiKey = saved.xKey;
      setAiEnabled(saved.enabled);
      updateSettings({ enabled: saved.enabled });
    },
  };
}

test('shape guard accepts a completed comparison result and rejects anything else', async () => {
  const cmp = await compareDecisions('pr-07');
  assert.equal(validateComparisonResult(cmp), true);
  assert.equal(validateComparisonResult(null), false);
  assert.equal(validateComparisonResult({}), false);
  assert.equal(validateComparisonResult({ project: { id: 'p' } }), false);
  assert.equal(validateComparisonResult({ ...cmp, options: [] }), false);
  assert.equal(validateComparisonResult({ ...cmp, recommended: { option: 'x' } }), false);
});

test('malformed input is a 400-class ok:false, never an explanation attempt', async () => {
  const result = await explainDecision({ project: { id: 'pr-07' }, options: [], recommended: {} });
  assert.equal(result.ok, false);
  assert.ok(result.error);
});

test('AI disabled: deterministic echo is returned and ai is null', async () => {
  const box = sandbox();
  setAiEnabled(false);
  try {
    const cmp = await compareDecisions('pr-07');
    const result = await explainDecision(cmp);
    assert.equal(result.ok, true);
    assert.equal(result.ai, null);
    assert.deepEqual(result.deterministic.recommendedOption, cmp.recommended.option);
    assert.deepEqual(result.deterministic.winnerScore, cmp.recommended.score);
    assert.equal(result.deterministic.options.length, cmp.options.length);
  } finally {
    box.restore();
  }
});

test('a valid LLM response produces the four contract fields plus provenance', async () => {
  const box = sandbox();
  const captured = [];
  registerProvider('dec-ok', () => ({
    name: 'dec-ok',
    model: 'dec-model',
    async complete(system, _user, _options) {
      captured.push({ system, user: _user });
      return { content: VALID_AI_RESULT, model: 'dec-model' };
    },
  }));
  env.aiProvider = 'dec-ok';
  env.xaiApiKey = 'test-key';
  setAiEnabled(true);
  try {
    const cmp = await compareDecisions('pr-07');
    const result = await explainDecision(cmp);

    assert.equal(result.ok, true);
    assert.equal(result.ai.summary, VALID_AI_RESULT.summary);
    assert.deepEqual(result.ai.whyRecommended, VALID_AI_RESULT.whyRecommended);
    assert.deepEqual(result.ai.tradeoffs, VALID_AI_RESULT.tradeoffs);
    assert.deepEqual(result.ai.leadershipConsiderations, VALID_AI_RESULT.leadershipConsiderations);
    assert.equal(result.ai.provider, 'dec-ok');
    assert.equal(result.ai.model, 'dec-model');
    assert.equal(result.ai.source, 'llm');
    assert.ok(typeof result.ai.generatedAt === 'string');

    assert.deepEqual(result.deterministic.recommendedOption, cmp.recommended.option);
    assert.deepEqual(result.deterministic.winnerScore, cmp.recommended.score);

    assert.equal(captured.length, 1);
    const user = captured[0].user;
    assert.ok(user.includes('Recommended option: reallocate'), 'context names the deterministic winner');
    assert.ok(user.includes('Reduces knowledge concentration from 81 to 69'), 'engine rationale is passed through verbatim');
    assert.ok(user.includes('time-box the assignment'), 'engine trade-offs are passed through verbatim');
  } finally {
    box.restore();
  }
});

test('provider failure degrades to ai:null and keeps the identical deterministic echo', async () => {
  const box = sandbox();
  registerProvider('dec-fail', () => ({
    name: 'dec-fail',
    model: 'dec-model',
    async complete() {
      throw new ProviderError('boom', { code: 'HTTP', status: 500 });
    },
  }));
  env.aiProvider = 'dec-fail';
  env.xaiApiKey = 'test-key';
  setAiEnabled(true);
  try {
    const cmp = await compareDecisions('pr-07');
    const withOff = await (async () => {
      setAiEnabled(false);
      try {
        return await explainDecision(cmp);
      } finally {
        setAiEnabled(true);
      }
    })();
    const withFail = await explainDecision(cmp);

    assert.equal(withFail.ok, true);
    assert.equal(withFail.ai, null);
    assert.deepEqual(withFail.deterministic, withOff.deterministic, 'failure must not change the deterministic echo');
  } finally {
    box.restore();
  }
});

test('malformed LLM output degrades to ai:null with an intact deterministic echo', async () => {
  const box = sandbox();
  registerProvider('dec-garbage', () => ({
    name: 'dec-garbage',
    model: 'dec-model',
    async complete() {
      return { content: { summary: '', whyRecommended: [] }, model: 'dec-model' };
    },
  }));
  env.aiProvider = 'dec-garbage';
  env.xaiApiKey = 'test-key';
  setAiEnabled(true);
  try {
    const cmp = await compareDecisions('pr-07');
    const result = await explainDecision(cmp);
    assert.equal(result.ok, true);
    assert.equal(result.ai, null);
    assert.equal(result.deterministic.winnerScore, cmp.recommended.score);
  } finally {
    box.restore();
  }
});

test('explanations are cached: the second call does not hit the provider again', async () => {
  const box = sandbox();
  let calls = 0;
  registerProvider('dec-cache', () => ({
    name: 'dec-cache',
    model: 'dec-model',
    async complete() {
      calls += 1;
      return { content: VALID_AI_RESULT, model: 'dec-model' };
    },
  }));
  env.aiProvider = 'dec-cache';
  env.xaiApiKey = 'test-key';
  setAiEnabled(true);
  try {
    const cmp = await compareDecisions('pr-07');
    const first = await explainDecision(cmp);
    const second = await explainDecision(cmp);
    assert.equal(first.ok, true);
    assert.equal(second.ok, true);
    assert.deepEqual(second.deterministic, first.deterministic);
    assert.deepEqual(second.ai.summary, first.ai.summary);
    assert.equal(calls, 1, 'the second call must be served from cache');
  } finally {
    box.restore();
  }
});

test('the cache key changes when meaningful deterministic facts change', async () => {
  const box = sandbox();
  let calls = 0;
  registerProvider('dec-bump', () => ({
    name: 'dec-bump',
    model: 'dec-model',
    async complete() {
      calls += 1;
      return { content: VALID_AI_RESULT, model: 'dec-model' };
    },
  }));
  env.aiProvider = 'dec-bump';
  env.xaiApiKey = 'test-key';
  setAiEnabled(true);
  try {
    const original = await explainDecision(await compareDecisions('pr-07'));

    const { updateAssumption } = await import('../../src/modules/decision-intelligence/decision.service.js');
    updateAssumption('fin-99', { billing_target_per_fte: 4_000_000 });
    const bumped = await explainDecision(await compareDecisions('pr-07'));

    assert.equal(original.ok, true);
    assert.equal(bumped.ok, true);
    assert.notDeepEqual(bumped.deterministic, original.deterministic, 'new financial facts must change the echo');
    assert.equal(calls, 2, 'a changed deterministic result must cause a fresh LLM call');

    updateAssumption('fin-99', { billing_target_per_fte: 3_900_000 });
  } finally {
    box.restore();
  }
});

test('the deterministic echo is identical regardless of what the LLM returns', async () => {
  const box = sandbox();
  const cmp = await compareDecisions('pr-07');
  const echoWithAi = await (async () => {
    registerProvider('dec-echo-a', () => ({
      name: 'dec-echo-a',
      model: 'dec-model',
      async complete() {
        return { content: VALID_AI_RESULT, model: 'dec-model' };
      },
    }));
    env.aiProvider = 'dec-echo-a';
    env.xaiApiKey = 'test-key';
    setAiEnabled(true);
    try {
      return (await explainDecision(cmp)).deterministic;
    } finally {
      box.restore();
    }
  })();

  setAiEnabled(false);
  try {
    const echoWithoutAi = (await explainDecision(cmp)).deterministic;
    assert.deepEqual(echoWithoutAi, echoWithAi, 'LLM output must never leak into the deterministic response');
  } finally {
    setAiEnabled(true);
  }
});

test('the context builder includes the deterministic signals the LLM must explain', async () => {
  const cmp = await compareDecisions('pr-07');
  const context = decisionComparisonResultContext(cmp);
  assert.ok(context.includes('Payments 3.0 (pr-07)'));
  assert.ok(context.includes('risk 69'));
  assert.ok(context.includes('delivery exposure 68 (high)'));
  assert.ok(context.includes('Recommended option: reallocate'));
  assert.ok(context.includes('score 53/100'));
  assert.ok(context.includes('net ₹32,822'));
  assert.ok(context.includes('Reduces project risk score from 69 to 50.'));
  assert.ok(context.includes('Cloud & Infrastructure 68% → 86%'));
});