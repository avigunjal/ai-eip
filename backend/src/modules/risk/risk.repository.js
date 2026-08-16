// Risks data access layer.

import { db } from '../../config/database.config.js';
import * as evidenceRepository from '../evidence/evidence.repository.js';

export async function findAll() {
  return db.prepare(`SELECT r.*, p.name AS project_name FROM risks r
    LEFT JOIN projects p ON p.id = r.project_id ORDER BY r.score DESC`).all();
}

export async function findById(id) {
  return db.prepare(`SELECT r.*, p.name AS project_name FROM risks r
    LEFT JOIN projects p ON p.id = r.project_id WHERE r.id = ?`).get(id);
}

export async function findEvidence(riskId) {
  return evidenceRepository.findByEntity('risk', riskId);
}

export async function findActions(riskId) {
  return db.prepare('SELECT * FROM prevention_actions WHERE risk_id = ? ORDER BY due_date ASC').all(riskId);
}

// Local state updates only (review/status/owner). Returns the updated row.
export async function update(id, patch) {
  const allowed = new Set(['status', 'severity', 'owner_person_id']);
  const columns = Object.entries(patch).filter(([column]) => allowed.has(column));
  if (!columns.length) return findById(id);
  const assignments = columns.map(([column]) => `${column} = ?`).join(', ');
  const values = columns.map(([, value]) => value);
  db.prepare(`UPDATE risks SET ${assignments} WHERE id = ?`).run(...values, id);
  return findById(id);
}