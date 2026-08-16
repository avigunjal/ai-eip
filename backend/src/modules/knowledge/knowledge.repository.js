// Knowledge areas data access layer.

import { db } from '../../config/database.config.js';
import * as evidenceRepository from '../evidence/evidence.repository.js';

export async function findById(id) {
  return db.prepare('SELECT * FROM knowledge_areas WHERE id = ?').get(id);
}

export async function findAllAreas() {
  return db.prepare('SELECT * FROM knowledge_areas ORDER BY criticality DESC').all();
}

export async function findExpertise(areaId) {
  return db.prepare(`SELECT ke.*, p.name, p.role FROM knowledge_expertise ke
    JOIN people p ON p.id = ke.person_id WHERE ke.knowledge_area_id = ? ORDER BY ke.share_pct DESC`).all(areaId);
}

export async function findLinkedProjectIds(areaId) {
  return db.prepare('SELECT project_id FROM knowledge_area_projects WHERE knowledge_area_id = ?').all(areaId).map((row) => row.project_id);
}

export async function findEvidence(areaId) {
  return evidenceRepository.findByEntity('knowledge_area', areaId);
}

export async function findTransferPlan(areaId) {
  return db.prepare('SELECT * FROM knowledge_transfer_plans WHERE knowledge_area_id = ?').get(areaId);
}