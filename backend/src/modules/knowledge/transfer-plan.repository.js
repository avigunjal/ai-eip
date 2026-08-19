// Knowledge transfer plans data access layer.

import { db } from '../../config/database.config.js';

export async function findAll() {
  return db.prepare('SELECT * FROM knowledge_transfer_plans ORDER BY due_date').all();
}

export async function findById(id) {
  return db.prepare('SELECT * FROM knowledge_transfer_plans WHERE id = ?').get(id);
}

export async function findActions(planId) {
  return db.prepare('SELECT * FROM transfer_actions WHERE plan_id = ? ORDER BY due_date ASC').all(planId);
}

export async function updateStatus(id, status) {
  db.prepare('UPDATE knowledge_transfer_plans SET status = ? WHERE id = ?').run(status, id);
  return findById(id);
}

export async function insert(plan) {
  db.prepare(`INSERT INTO knowledge_transfer_plans
    (id, knowledge_area_id, owner_person_id, backup_person_id, target_coverage, due_date, status, progress, next_session_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    plan.id,
    plan.knowledgeAreaId,
    plan.ownerPersonId,
    plan.backupPersonId ?? null,
    plan.targetCoverage,
    plan.dueDate,
    plan.status,
    plan.progress ?? 0,
    plan.nextSessionAt ?? null,
  );
}