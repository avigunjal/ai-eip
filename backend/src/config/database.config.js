import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from './env.config.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(currentDir, '../..');
const migrationDir = path.join(backendRoot, 'src/database/migrations');

function localDatabasePath() {
  if (!env.databaseUrl.startsWith('sqlite:')) {
    throw new Error('This local adapter accepts sqlite DATABASE_URL values only. Configure the PostgreSQL adapter before pointing DATABASE_URL at Supabase.');
  }
  const value = env.databaseUrl.slice('sqlite:'.length);
  return path.resolve(backendRoot, value);
}

function runMigrations(database) {
  database.exec('CREATE TABLE IF NOT EXISTS schema_migrations (id TEXT PRIMARY KEY, applied_at TEXT NOT NULL)');
  for (const file of fs.readdirSync(migrationDir).filter((name) => name.endsWith('.sql')).sort()) {
    const applied = database.prepare('SELECT 1 FROM schema_migrations WHERE id = ?').get(file);
    if (!applied) {
      database.exec(fs.readFileSync(path.join(migrationDir, file), 'utf8'));
      database.prepare('INSERT INTO schema_migrations (id, applied_at) VALUES (?, ?)').run(file, new Date().toISOString());
    }
  }
}

const databasePath = localDatabasePath();
fs.mkdirSync(path.dirname(databasePath), { recursive: true });
export const db = new Database(databasePath);
db.pragma('foreign_keys = ON');
runMigrations(db);

export function closeDatabase() {
  db.close();
}
