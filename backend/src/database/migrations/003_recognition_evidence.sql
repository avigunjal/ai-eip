-- Recognition ↔ evidence join table.
-- Links each recognition to the evidence that supports it. Roles:
--   primary    — person-attributed evidence (the recognition's core proof)
--   supporting — context evidence (knowledge area / risk / project signals)
-- The polymorphic `evidence` table stays the single source of truth; one
-- evidence row can support many recognitions, risks and areas.

CREATE TABLE recognition_evidence (
  recognition_id TEXT NOT NULL REFERENCES recognition(id),
  evidence_id    TEXT NOT NULL REFERENCES evidence(id),
  role           TEXT NOT NULL CHECK (role IN ('primary', 'supporting')),
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (recognition_id, evidence_id)
);

CREATE INDEX idx_recognition_evidence_recognition ON recognition_evidence(recognition_id);
CREATE INDEX idx_recognition_evidence_evidence ON recognition_evidence(evidence_id);