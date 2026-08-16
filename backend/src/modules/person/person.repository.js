// People data access layer.

import { db } from '../../config/database.config.js';

export async function findAll() {
  return db.prepare('SELECT * FROM people ORDER BY name').all();
}

export async function findById(id) {
  return db.prepare('SELECT * FROM people WHERE id = ?').get(id);
}

export async function findCapabilities(personId) {
  return db.prepare(`SELECT c.id, c.name, c.criticality, pc.level, pc.last_used_at
    FROM person_capabilities pc JOIN capabilities c ON c.id = pc.capability_id
    WHERE pc.person_id = ? ORDER BY c.criticality DESC`).all(personId);
}

export async function findExpertise(personId) {
  return db.prepare(`SELECT k.id AS knowledge_area_id, k.name AS knowledge_area_name, ke.level, ke.last_contributed_at
    FROM knowledge_expertise ke JOIN knowledge_areas k ON k.id = ke.knowledge_area_id
    WHERE ke.person_id = ? ORDER BY ke.share_pct DESC`).all(personId);
}

export async function findByTeam(teamId) {
  return db.prepare(`SELECT p.* FROM people p JOIN team_memberships m ON m.person_id = p.id
    WHERE m.team_id = ? ORDER BY p.name`).all(teamId);
}