-- Optional nomination context captured by the Recognition composer:
-- the project/system the contribution touches and a related work reference
-- (Jira ticket, PR, document or incident), so AI-EIP can validate the
-- nomination against the relevant engineering evidence.

ALTER TABLE recognition ADD COLUMN related_work TEXT;