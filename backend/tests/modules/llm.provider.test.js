// Unit tests for the LLM provider layer: registry, selection, request
// construction, response parsing, and failure handling. No database needed —
// providers are exercised directly with a stubbed global fetch.

import test from 'node:test';
import assert from 'node:assert/strict';
import { registerProvider, getLLMProvider, isAIEnabled, ProviderError, parseStructuredJson } from '../../src/modules/ai/llm.provider.js';
import { isAiEnabled, setAiEnabled } from '../../src/modules/ai/ai.settings.js';
import { createOpenRouterProvider } from '../../src/modules/ai/openrouter.provider.js';
import { createXaiProvider } from '../../src/modules/ai/xai.provider.js';
import { env } from '../../src/config/env.config.js';

test('registry selects the configured provider', () => {
  registerProvider('openrouter', () => createOpenRouterProvider({ apiKey: 'k', model: 'openrouter/free' }));
  const saved = { provider: env.aiProvider };
  try {
    env.aiProvider = 'openrouter';
    const provider = getLLMProvider();
    assert.ok(provider);
    assert.equal(provider.name, 'openrouter');
    assert.equal(provider.model, 'openrouter/free');
    env.aiProvider = 'not-registered';
    assert.equal(getLLMProvider(), null);
  } finally {
    env.aiProvider = saved.provider;
  }
});

test('isAIEnabled requires the switch, a registered provider, and an API key', () => {
  registerProvider('openrouter', () => createOpenRouterProvider({ apiKey: 'k', model: 'm' }));
  registerProvider('xai', () => createXaiProvider({ apiKey: 'k', model: 'm' }));
  const saved = { enabled: isAiEnabled(), provider: env.aiProvider, orKey: env.openrouterApiKey, xKey: env.xaiApiKey };
  try {
    setAiEnabled(true);
    env.aiProvider = 'openrouter';
    env.openrouterApiKey = '';
    assert.equal(isAIEnabled(), false, 'missing key → disabled');
    env.openrouterApiKey = 'k';
    assert.equal(isAIEnabled(), true, 'configured → enabled');
    setAiEnabled(false);
    assert.equal(isAIEnabled(), false, 'switch off → disabled');
    setAiEnabled(true);
    env.aiProvider = 'unknown';
    assert.equal(isAIEnabled(), false, 'unknown provider → disabled');
    env.aiProvider = 'xai';
    env.xaiApiKey = '';
    assert.equal(isAIEnabled(), false, 'xai without key → disabled');
    env.xaiApiKey = 'k';
    assert.equal(isAIEnabled(), true, 'xai configured → enabled');
  } finally {
    setAiEnabled(saved.enabled);
    Object.assign(env, { aiProvider: saved.provider, openrouterApiKey: saved.orKey, xaiApiKey: saved.xKey });
  }
});

test('openrouter provider builds a chat completion request and parses the response', async () => {
  const originalFetch = globalThis.fetch;
  let requestBody;
  globalThis.fetch = async (_url, options) => {
    requestBody = JSON.parse(options.body);
    return new Response(JSON.stringify({
      model: 'openai/gpt-oss-120b:free',
      choices: [{ message: { role: 'assistant', content: '{"summary":"S","findings":["F"],"recommendedActions":["A"],"confidence":88}' } }],
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };
  try {
    const provider = createOpenRouterProvider({ apiKey: 'sk-test', model: 'openrouter/free' });
    const { content, model } = await provider.complete('sys', 'user', { maxTokens: 200 });
    assert.equal(model, 'openai/gpt-oss-120b:free');
    assert.equal(content.summary, 'S');
    assert.equal(requestBody.model, 'openrouter/free');
    assert.equal(requestBody.messages[0].role, 'system');
    assert.equal(requestBody.messages[1].content, 'user');
    assert.equal(requestBody.max_tokens, 200);
    assert.deepEqual(requestBody.response_format, { type: 'json_object' });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('openrouter provider throws on 429 with retry-after', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response('{}', { status: 429, headers: { 'retry-after': '60' } });
  try {
    const provider = createOpenRouterProvider({ apiKey: 'sk', model: 'm' });
    await assert.rejects(() => provider.complete('s', 'u'), (error) => {
      assert.ok(error instanceof ProviderError);
      assert.equal(error.code, 'RATE_LIMITED');
      assert.equal(error.status, 429);
      assert.equal(error.retryAfter, '60');
      return true;
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('openrouter provider throws on malformed JSON content', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(
    JSON.stringify({ choices: [{ message: { content: 'not-json' } }] }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
  try {
    const provider = createOpenRouterProvider({ apiKey: 'sk', model: 'm' });
    await assert.rejects(() => provider.complete('s', 'u'), (error) => {
      assert.ok(error instanceof ProviderError);
      assert.equal(error.code, 'MALFORMED_RESPONSE');
      return true;
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('openrouter provider times out and reports TIMEOUT', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (_url, options) => new Promise((_resolve, reject) => {
    options.signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
  });
  try {
    const provider = createOpenRouterProvider({ apiKey: 'sk', model: 'm', timeoutMs: 50 });
    await assert.rejects(() => provider.complete('s', 'u'), (error) => {
      assert.ok(error instanceof ProviderError);
      assert.equal(error.code, 'TIMEOUT');
      return true;
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('xai provider uses the Responses API with store:false and parses output text', async () => {
  const originalFetch = globalThis.fetch;
  let requestBody;
  globalThis.fetch = async (_url, options) => {
    requestBody = JSON.parse(options.body);
    return new Response(JSON.stringify({
      model: 'grok-4.5',
      output: [{ content: [{ type: 'output_text', text: '{"summary":"S","findings":["F"],"recommendedActions":["A"],"confidence":90}' }] }],
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };
  try {
    const provider = createXaiProvider({ apiKey: 'sk-test', model: 'grok-4.5' });
    const { content, model } = await provider.complete('sys', 'user', { maxTokens: 200, schema: {} });
    assert.equal(requestBody.store, false, 'store must be hard-coded false');
    assert.ok(Array.isArray(requestBody.input), 'Responses API uses input, not messages');
    assert.ok(!('messages' in requestBody));
    assert.equal(requestBody.input[0].role, 'system');
    assert.equal(requestBody.max_output_tokens, 200);
    assert.equal(requestBody.text.format.type, 'json_schema');
    assert.equal(requestBody.text.format.strict, true);
    assert.equal(model, 'grok-4.5');
    assert.equal(content.summary, 'S');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('xai provider throws when output content is missing', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(
    JSON.stringify({ model: 'grok-4.5', output: [] }),
    { status: 200, headers: { 'Content-Type': 'application/json' } },
  );
  try {
    const provider = createXaiProvider({ apiKey: 'sk', model: 'grok-4.5' });
    await assert.rejects(() => provider.complete('s', 'u'), (error) => {
      assert.ok(error instanceof ProviderError);
      assert.equal(error.code, 'MALFORMED_RESPONSE');
      return true;
    });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('parseStructuredJson unwraps double-wrapped and prose-padded JSON', () => {
  assert.deepEqual(parseStructuredJson('{\n{\n  "summary": "S",\n  "findings": ["F"]\n}\n}'), {
    summary: 'S',
    findings: ['F'],
  });
  assert.deepEqual(parseStructuredJson('```json\n{"summary":"S"}\n```'), { summary: 'S' });
  assert.deepEqual(parseStructuredJson('Sure, here you go:\n{"summary":"S"}'), { summary: 'S' });
  assert.throws(() => parseStructuredJson('not json at all'), (error) => {
    assert.ok(error instanceof ProviderError);
    assert.equal(error.code, 'MALFORMED_RESPONSE');
    return true;
  });
});