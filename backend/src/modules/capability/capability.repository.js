// Capabilities data access layer.

import { db } from '../../config/database.config.js';

export async function findAll() {
  return db.prepare('SELECT * FROM capabilities ORDER BY criticality DESC, name').all();
}

export async function findById(id) {
  return db.prepare('SELECT * FROM capabilities WHERE id = ?').get(id);
}

export async function findTeamCoverage(capabilityId) {
  return db.prepare(`SELECT tcc.*, t.name AS team_name FROM team_capability_coverage tcc
    JOIN teams t ON t.id = tcc.team_id WHERE tcc.capability_id = ? ORDER BY tcc.coverage_score DESC`).all(capabilityId);
}