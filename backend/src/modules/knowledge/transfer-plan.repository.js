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