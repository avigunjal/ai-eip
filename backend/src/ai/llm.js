// LLM provider wrapper.
// TODO: wire real provider (OpenAI etc.) using env config.

import { env } from '../config/env.js';

export async function generateInsight(_prompt) {
  if (!env.openaiApiKey) {
    // Stub response until an API key is configured.
    return { text: 'AI not configured.', confidence: 0, evidenceCount: 0 };
  }
  // TODO: call provider SDK
  throw new Error('LLM provider not wired up yet');
}
