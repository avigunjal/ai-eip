// Backend environment config.
// Loads .env, exposes typed-ish config object for the rest of the app.

import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT) || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  // Local default. Tomorrow, set DATABASE_URL to the Supabase connection string
  // and replace the adapter without changing HTTP routes or service contracts.
  databaseUrl: process.env.DATABASE_URL || 'sqlite:./data/ai-eip.db',
};
