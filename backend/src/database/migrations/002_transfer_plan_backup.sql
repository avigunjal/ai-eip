-- Persist the backup owner chosen when a transfer plan is created.
-- (Kept separate from knowledge_expertise.is_backup so the risk assessment
-- and insight signals are not mutated by the UI action.)
ALTER TABLE knowledge_transfer_plans ADD COLUMN backup_person_id TEXT;