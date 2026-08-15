// Project data access layer.
// TODO: replace with real DB queries (src/config/database.js).

import { db } from '../../config/database.js';

export async function findById(id) {
  // return db.query('SELECT * FROM projects WHERE id = $1', [id]);
  return { id };
}

export async function findAll(filters = {}) {
  return [];
}
