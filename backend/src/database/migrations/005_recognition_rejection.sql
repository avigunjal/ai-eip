-- Rejection trail for the human approval workflow.
-- Rejected recognitions are never public; the fields below preserve the
-- review decision for audit purposes only.

ALTER TABLE recognition ADD COLUMN rejected_at TEXT;
ALTER TABLE recognition ADD COLUMN rejected_by TEXT;
ALTER TABLE recognition ADD COLUMN rejected_reason TEXT;