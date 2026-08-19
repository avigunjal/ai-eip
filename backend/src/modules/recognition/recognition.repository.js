// Recognition data access layer.

import { db } from '../../config/database.config.js';

export async function findAll() {
  return db.prepare(`SELECT r.*, p.name AS person_name, pr.name AS project_name, k.name AS knowledge_area_name
    FROM recognition r JOIN people p ON p.id = r.person_id
    LEFT JOIN projects pr ON pr.id = r.project_id
    LEFT JOIN knowledge_areas k ON k.id = r.knowledge_area_id
    ORDER BY r.occurred_at DESC`).all();
}

export async function insert(recognition) {
  db.prepare(`INSERT INTO recognition (id, person_id, project_id, knowledge_area_id, contribution_type, summary, occurred_at, visibility, impact)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    recognition.id,
    recognition.personId,
    recognition.projectId ?? null,
    recognition.knowledgeAreaId ?? null,
    recognition.type,
    recognition.summary,
    recognition.occurredAt,
    recognition.visibility ?? 'public',
    recognition.impact ? JSON.stringify(recognition.impact) : null,
  );
}