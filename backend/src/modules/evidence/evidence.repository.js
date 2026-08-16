// Shared evidence data access. Evidence is a cross-cutting entity referenced
// by risks, knowledge areas, and (in the future) other entity types.

import { db } from '../../config/database.config.js';

export function findByEntity(entityType, entityId) {
  return db.prepare('SELECT * FROM evidence WHERE entity_type = ? AND entity_id = ? ORDER BY occurred_at DESC')
    .all(entityType, entityId);
}

export function findByEntityId(entityId) {
  return db.prepare('SELECT * FROM evidence WHERE entity_id = ? ORDER BY occurred_at DESC').all(entityId);
}