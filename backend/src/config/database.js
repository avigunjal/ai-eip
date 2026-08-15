// Database connection + client.
// Starting point: Postgres via pg Pool. Swap for Prisma/Drizzle/Knex when decided.

// TODO: install 'pg' and uncomment when DB is available
// import pg from 'pg';
// import { env } from './env.js';

// export const pool = new pg.Pool({ connectionString: env.databaseUrl });

// Simple placeholder export so the app boots without a DB for now.
export const db = {
  // Wrap queries here later, e.g. query(text, params) => pool.query(text, params)
  query: async () => {
    throw new Error('Database not configured yet. See src/config/database.js');
  },
};
