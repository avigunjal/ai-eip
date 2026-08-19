// OpenRouter provider — primary provider for AI-EIP. OpenAI-compatible
// chat completions; `openrouter/free` routes to a zero-cost free model that
// supports the requested features (including structured outputs).
//
// Free-tier rate limits (50 req/day, 20 req/min without credits) are handled
// by falling back to deterministic output on 429.

import { ProviderError, parseStructuredJson } from './llm.provider.js';

const ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
// Free reasoning models burn a lot of chain-of-thought before the JSON answer;
// 60s gives them room to finish (retries are handled in the AI service).
const DEFAULT_TIMEOUT_MS = 60_000;
// Leave generous headroom above the JSON answer itself.
const DEFAULT_MAX_TOKENS = 2048;

export function createOpenRouterProvider({ apiKey, model, timeoutMs = DEFAULT_TIMEOUT_MS }) {
  return {
    name: 'openrouter',
    model,
    async complete(system, user, { maxTokens = DEFAULT_MAX_TOKENS } = {}) {
      const controller = new AbortController();
      let timer;
      // Time out the WHOLE call, not just the request phase: once OpenRouter
      // sends headers it streams the body slowly while the model reasons, and a
      // plain AbortController.signal does not cancel that body read. Racing the
      // full work against a rejection timer closes that gap.
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
              'HTTP-Referer': 'https://ai-eip.local',
              'X-Title': 'AI-EIP',
            },
            body: JSON.stringify({
              model,
              messages: [
                { role: 'system', content: system },
                { role: 'user', content: user },
              ],
              max_tokens: maxTokens,
              temperature: 0.2,
              response_format: { type: 'json_object' },
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

        const text = payload?.choices?.[0]?.message?.content;
        if (typeof text !== 'string' || !text.trim()) {
          throw new ProviderError('LLM response missing content', { code: 'MALFORMED_RESPONSE' });
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