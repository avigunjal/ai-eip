// Recognition data access layer.

import { db } from '../../config/database.config.js';

export async function findAll() {
  return db.prepare(`SELECT r.*, p.name AS person_name, pr.name AS project_name, k.name AS knowledge_area_name
    FROM recognition r JOIN people p ON p.id = r.person_id
    LEFT JOIN projects pr ON pr.id = r.project_id
    LEFT JOIN knowledge_areas k ON k.id = r.knowledge_area_id
    ORDER BY r.occurred_at DESC`).all();
}

export async function findById(id) {
  return db.prepare(`SELECT r.*, p.name AS person_name, pr.name AS project_name, k.name AS knowledge_area_name
    FROM recognition r JOIN people p ON p.id = r.person_id
    LEFT JOIN projects pr ON pr.id = r.project_id
    LEFT JOIN knowledge_areas k ON k.id = r.knowledge_area_id
    WHERE r.id = ?`).get(id ?? null);
}

export async function findByApprovalStatus(status) {
  return db.prepare(`SELECT r.*, p.name AS person_name, pr.name AS project_name, k.name AS knowledge_area_name
    FROM recognition r JOIN people p ON p.id = r.person_id
    LEFT JOIN projects pr ON pr.id = r.project_id
    LEFT JOIN knowledge_areas k ON k.id = r.knowledge_area_id
    WHERE r.approval_status = ?
    ORDER BY r.occurred_at DESC`).all(status ?? null);
}

export async function findByPerson(personId) {
  return db.prepare(`SELECT r.*, p.name AS person_name, pr.name AS project_name, k.name AS knowledge_area_name
    FROM recognition r JOIN people p ON p.id = r.person_id
    LEFT JOIN projects pr ON pr.id = r.project_id
    LEFT JOIN knowledge_areas k ON k.id = r.knowledge_area_id
    WHERE r.person_id = ?
    ORDER BY r.occurred_at DESC`).all(personId ?? null);
}

// Linked evidence for a recognition, primary first, newest first.
export async function findEvidenceForRecognition(recognitionId) {
  return db.prepare(`SELECT e.*, re.role FROM recognition_evidence re
    JOIN evidence e ON e.id = re.evidence_id
    WHERE re.recognition_id = ?
    ORDER BY CASE WHEN re.role = 'primary' THEN 0 ELSE 1 END, e.occurred_at DESC`).all(recognitionId);
}

export function setApproval(id, status, approvedAt, approvedBy) {
  db.prepare('UPDATE recognition SET approval_status = ?, approved_at = ?, approved_by = ? WHERE id = ?')
    .run(status, approvedAt, approvedBy, id);
}

export function setRejection(id, reviewer, reason, rejectedAt) {
  db.prepare(`UPDATE recognition
    SET approval_status = 'rejected', rejected_at = ?, rejected_by = ?, rejected_reason = ?,
        approved_at = NULL, approved_by = NULL
    WHERE id = ?`).run(rejectedAt, reviewer, reason, id);
}

export async function insert(recognition) {
  db.prepare(`INSERT INTO recognition (id, person_id, project_id, knowledge_area_id, contribution_type, summary, occurred_at, visibility, impact, related_work)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    recognition.id,
    recognition.personId,
    recognition.projectId ?? null,
    recognition.knowledgeAreaId ?? null,
    recognition.type,
    recognition.summary,
    recognition.occurredAt,
    recognition.visibility ?? 'public',
    recognition.impact ? JSON.stringify(recognition.impact) : null,
    recognition.relatedWork ?? null,
  );
}