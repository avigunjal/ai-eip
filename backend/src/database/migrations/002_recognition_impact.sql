-- Recognition impact: a grounded list of impact statements ("AI detected
-- impact") attached to each recognition entry. Stored as JSON text; parsed
-- by the service into an array.

ALTER TABLE recognition ADD COLUMN impact TEXT;