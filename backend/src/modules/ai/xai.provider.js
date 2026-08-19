// xAI Grok provider — optional/secondary provider. Uses the Responses API.
//
// Privacy: `store: false` is hard-coded on every request. xAI otherwise stores
// requests/responses server-side for 30 days, and AI-EIP sends engineering
// intelligence. There is no server-side conversation state (no
// previous_response_id); every request is independently grounded.

import { ProviderError, parseStructuredJson } from './llm.provider.js';

const ENDPOINT = 'https://api.x.ai/v1/responses';
const DEFAULT_TIMEOUT_MS = 20_000;
// Grok reasons by default; leave headroom above the JSON answer itself.
const DEFAULT_MAX_TOKENS = 2048;

export function createXaiProvider({ apiKey, model, timeoutMs = DEFAULT_TIMEOUT_MS }) {
  return {
    name: 'xai',
    model,
    async complete(system, user, { maxTokens = DEFAULT_MAX_TOKENS, schema } = {}) {
      const controller = new AbortController();
      let timer;
      // Time out the WHOLE call, not just the request phase (see openrouter
      // provider for why a plain AbortController.signal is not enough).
      const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => {
          controller.abort();
          reject(new ProviderError('LLM request timed out', { code: 'TIMEOUT' }));
        }, timeoutMs);
      });

      const run = async () => {
        let response;
        try {
          response = await fetch(ENDPOINT, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model,
              store: false,
              input: [
                { role: 'system', content: system },
                { role: 'user', content: user },
              ],
              max_output_tokens: maxTokens,
              text: schema
                ? { format: { type: 'json_schema', name: 'structured_output', schema, strict: true } }
                : undefined,
            }),
            signal: controller.signal,
          });
        } catch (error) {
          if (controller.signal.aborted) {
            throw new ProviderError('LLM request timed out', { code: 'TIMEOUT', cause: error });
          }
          throw new ProviderError('LLM request failed', { code: 'NETWORK', cause: error });
        }

        if (!response.ok) {
          throw new ProviderError(`LLM provider responded ${response.status}`, {
            code: response.status === 429 ? 'RATE_LIMITED' : 'HTTP',
            status: response.status,
            retryAfter: response.headers.get('retry-after') || undefined,
          });
        }

        let payload;
        try {
          payload = await response.json();
        } catch (error) {
          throw new ProviderError('LLM response was not JSON', { code: 'MALFORMED_RESPONSE', cause: error });
        }

        const text = payload?.output?.[0]?.content?.[0]?.text;
        if (typeof text !== 'string' || !text.trim()) {
          throw new ProviderError('LLM response missing output content', { code: 'MALFORMED_RESPONSE' });
        }
        return { content: parseStructuredJson(text), model: payload?.model || model };
      };

      try {
        return await Promise.race([run(), timeout]);
      } finally {
        clearTimeout(timer);
      }
    },
  };
}