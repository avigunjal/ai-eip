// Projects data access layer.

import { db } from '../../config/database.config.js';

export async function findById(id) {
  return db.prepare(`SELECT p.*, c.name AS client_name FROM projects p
    LEFT JOIN clients c ON c.id = p.client_id WHERE p.id = ?`).get(id);
}

export async function findAll(filters = {}) {
  const clauses = [];
  const values = [];
  if (filters.status) { clauses.push('p.status = ?'); values.push(filters.status); }
  if (filters.teamId) { clauses.push('EXISTS (SELECT 1 FROM project_teams pt WHERE pt.project_id = p.id AND pt.team_id = ?)'); values.push(filters.teamId); }
  const where = clauses.length ? ` WHERE ${clauses.join(' AND ')}` : '';
  return db.prepare(`SELECT p.*, c.name AS client_name FROM projects p
    LEFT JOIN clients c ON c.id = p.client_id${where}
    ORDER BY p.health_score ASC, p.target_date ASC`).all(...values);
}

export async function findTeamIds(projectId) {
  return db.prepare('SELECT team_id FROM project_teams WHERE project_id = ?').all(projectId).map((row) => row.team_id);
}

export async function findOwnerIds(projectId) {
  return db.prepare('SELECT person_id FROM project_owners WHERE project_id = ?').all(projectId).map((row) => row.person_id);
}

export async function findRisks(projectId) {
  return db.prepare(`SELECT r.*, po.name AS owner_name FROM risks r
    LEFT JOIN people po ON po.id = r.owner_person_id
    WHERE r.project_id = ? ORDER BY r.score DESC`).all(projectId);
}

export async function findAreas(projectId) {
  return db.prepare(`SELECT k.* FROM knowledge_areas k
    JOIN knowledge_area_projects kap ON kap.knowledge_area_id = k.id
    WHERE kap.project_id = ? ORDER BY k.criticality DESC`).all(projectId);
}

export async function findCapabilities(projectId) {
  return db.prepare(`SELECT c.id, c.name FROM capabilities c
    JOIN project_requirements pr ON pr.capability_id = c.id
    WHERE pr.project_id = ?
    ORDER BY pr.weight DESC, c.name ASC`).all(projectId);
}

export async function findTeams(projectId) {
  return db.prepare(`SELECT t.id, t.name FROM project_teams pt JOIN teams t ON t.id = pt.team_id
    WHERE pt.project_id = ?`).all(projectId);
}

export async function findTeamSize(projectId) {
  const row = db.prepare(`SELECT COUNT(DISTINCT m.person_id) AS team_size
    FROM project_teams pt JOIN team_memberships m ON m.team_id = pt.team_id
    WHERE pt.project_id = ?`).get(projectId);
  return Number(row?.team_size ?? 0);
}

export async function findOwners(projectId) {
  return db.prepare(`SELECT p.id, p.name FROM project_owners po JOIN people p ON p.id = po.person_id
    WHERE po.project_id = ?`).all(projectId);
}