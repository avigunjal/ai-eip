// Backend environment config.
// Loads .env, exposes typed-ish config object for the rest of the app.

import dotenv from 'dotenv';

dotenv.config();

/** Parse comma-separated origins, filter empties. */
function parseOrigins(value) {
  if (!value) return ['http://localhost:5173'];
  return value.split(',').map((s) => s.trim()).filter(Boolean);
}

export const env = {
  port: Number(process.env.PORT) || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientOrigins: parseOrigins(process.env.CLIENT_ORIGINS || process.env.CLIENT_ORIGIN),
  // Local default. Tomorrow, set DATABASE_URL to the Supabase connection string
  // and replace the adapter without changing HTTP routes or service contracts.
  databaseUrl: process.env.DATABASE_URL || 'sqlite:./data/ai-eip.db',
  // AI provider layer. AI_ENABLED=false (or a missing key) keeps the app fully
  // deterministic and offline. OpenRouter is the default (free models); xAI Grok
  // is an optional provider. Provider APIs are separately billed where applicable.
  aiEnabled: (process.env.AI_ENABLED || 'false').toLowerCase() === 'true',
  aiProvider: process.env.AI_PROVIDER || 'openrouter',
  openrouterApiKey: process.env.OPENROUTER_API_KEY || '',
  openrouterModel: process.env.OPENROUTER_MODEL || 'openrouter/free',
  xaiApiKey: process.env.XAI_API_KEY || '',
  xaiModel: process.env.XAI_MODEL || 'grok-4.5',
};
