// Teams data access layer.

import { db } from '../../config/database.config.js';

export async function findAll() {
  return db.prepare('SELECT * FROM teams ORDER BY name').all();
}

export async function findById(id) {
  return db.prepare('SELECT * FROM teams WHERE id = ?').get(id);
}

export async function findMemberIds(teamId) {
  return db.prepare('SELECT person_id FROM team_memberships WHERE team_id = ?').all(teamId).map((row) => row.person_id);
}

export async function findProjects(teamId) {
  return db.prepare(`SELECT p.* FROM projects p JOIN project_teams pt ON pt.project_id = p.id
    WHERE pt.team_id = ?`).all(teamId);
}

// Open critical/high risks across every project the team is staffing.
export async function findRiskExposure(teamId) {
  const row = db.prepare(`SELECT COUNT(*) AS count FROM risks r
    JOIN project_teams pt ON pt.project_id = r.project_id
    WHERE pt.team_id = ? AND r.severity IN ('critical', 'high') AND r.status = 'open'`).get(teamId);
  return Number(row?.count ?? 0);
}