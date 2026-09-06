-- Decision Impact Simulator — planning assumptions layer.
-- There is no real financial data in the platform, so the simulator values
-- exposure using an explicit, editable set of planning assumptions. No value
-- here is ever presented as an actual financial record, salary, margin, or
-- revenue figure.

CREATE TABLE IF NOT EXISTS financial_assumptions (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL,
  annual_cost_per_fte REAL NOT NULL,
  billing_target_per_fte REAL NOT NULL,
  working_days_per_year INTEGER NOT NULL DEFAULT 220,
  recovery_rate REAL NOT NULL DEFAULT 0.35,
  effective_from TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT ''
);