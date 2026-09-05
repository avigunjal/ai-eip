-- Human-in-the-loop governance for recognition awards.
-- New recognitions default to 'recommended'; seeded showcase recognitions are
-- pre-approved. Managers approve or reject via the recognition API.

ALTER TABLE recognition ADD COLUMN approval_status TEXT NOT NULL DEFAULT 'recommended'
  CHECK (approval_status IN ('recommended', 'approved', 'rejected'));
ALTER TABLE recognition ADD COLUMN approved_at TEXT;
ALTER TABLE recognition ADD COLUMN approved_by TEXT;