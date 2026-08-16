-- Initial relational schema for AI-EIP.
-- Portable DDL: text/UUID ids, ISO-8601 timestamps, numeric scores.
-- Kept in one canonical migration so SQLite today and Supabase tomorrow share
-- the same logical model.

-- People and teams -----------------------------------------------------------

CREATE TABLE IF NOT EXISTS people (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  team_id TEXT,
  availability_fte REAL NOT NULL DEFAULT 1,
  years_of_experience INTEGER NOT NULL DEFAULT 5
);

CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  manager_person_id TEXT,
  sustainable_capacity_fte REAL NOT NULL,
  committed_fte REAL NOT NULL,
  unplanned_fte REAL NOT NULL DEFAULT 0,
  FOREIGN KEY (manager_person_id) REFERENCES people(id)
);

CREATE TABLE IF NOT EXISTS team_memberships (
  team_id TEXT NOT NULL,
  person_id TEXT NOT NULL,
  PRIMARY KEY (team_id, person_id),
  FOREIGN KEY (team_id) REFERENCES teams(id),
  FOREIGN KEY (person_id) REFERENCES people(id)
);

-- Clients and projects --------------------------------------------------------

CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'new_feature',
  phase TEXT NOT NULL DEFAULT 'planning',
  status TEXT NOT NULL,
  target_date TEXT NOT NULL,
  health_score REAL NOT NULL,
  health_delta REAL NOT NULL,
  delivery_confidence REAL NOT NULL,
  client_id TEXT,
  FOREIGN KEY (client_id) REFERENCES clients(id)
);

CREATE TABLE IF NOT EXISTS project_teams (
  project_id TEXT NOT NULL,
  team_id TEXT NOT NULL,
  PRIMARY KEY (project_id, team_id),
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (team_id) REFERENCES teams(id)
);

CREATE TABLE IF NOT EXISTS project_owners (
  project_id TEXT NOT NULL,
  person_id TEXT NOT NULL,
  PRIMARY KEY (project_id, person_id),
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (person_id) REFERENCES people(id)
);

-- Capabilities ---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS capabilities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  criticality REAL NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS person_capabilities (
  person_id TEXT NOT NULL,
  capability_id TEXT NOT NULL,
  level TEXT NOT NULL,
  last_used_at TEXT,
  PRIMARY KEY (person_id, capability_id),
  FOREIGN KEY (person_id) REFERENCES people(id),
  FOREIGN KEY (capability_id) REFERENCES capabilities(id)
);

CREATE TABLE IF NOT EXISTS team_capability_coverage (
  team_id TEXT NOT NULL,
  capability_id TEXT NOT NULL,
  coverage_score REAL NOT NULL,
  PRIMARY KEY (team_id, capability_id),
  FOREIGN KEY (team_id) REFERENCES teams(id),
  FOREIGN KEY (capability_id) REFERENCES capabilities(id)
);

-- A project's skill needs. Keeps the team-composer data-driven instead of
-- hard-coded per project id.
CREATE TABLE IF NOT EXISTS project_requirements (
  project_id TEXT NOT NULL,
  capability_id TEXT NOT NULL,
  weight REAL NOT NULL DEFAULT 1,
  PRIMARY KEY (project_id, capability_id),
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (capability_id) REFERENCES capabilities(id)
);

-- Allocations ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS allocations (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  person_id TEXT NOT NULL,
  week_start TEXT NOT NULL,
  roadmap_fte REAL NOT NULL DEFAULT 0,
  operational_fte REAL NOT NULL DEFAULT 0,
  unplanned_fte REAL NOT NULL DEFAULT 0,
  FOREIGN KEY (team_id) REFERENCES teams(id),
  FOREIGN KEY (person_id) REFERENCES people(id)
);

-- Knowledge ------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS knowledge_areas (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  criticality REAL NOT NULL,
  coverage_score REAL NOT NULL,
  documentation_freshness_days INTEGER NOT NULL,
  documentation_completeness REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS knowledge_area_projects (
  knowledge_area_id TEXT NOT NULL,
  project_id TEXT NOT NULL,
  PRIMARY KEY (knowledge_area_id, project_id),
  FOREIGN KEY (knowledge_area_id) REFERENCES knowledge_areas(id),
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE TABLE IF NOT EXISTS knowledge_expertise (
  knowledge_area_id TEXT NOT NULL,
  person_id TEXT NOT NULL,
  level TEXT NOT NULL,
  share_pct REAL NOT NULL,
  last_contributed_at TEXT NOT NULL,
  is_backup INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (knowledge_area_id, person_id),
  FOREIGN KEY (knowledge_area_id) REFERENCES knowledge_areas(id),
  FOREIGN KEY (person_id) REFERENCES people(id)
);

CREATE TABLE IF NOT EXISTS knowledge_transfer_plans (
  id TEXT PRIMARY KEY,
  knowledge_area_id TEXT NOT NULL,
  owner_person_id TEXT NOT NULL,
  target_coverage REAL NOT NULL,
  due_date TEXT NOT NULL,
  status TEXT NOT NULL,
  progress REAL NOT NULL DEFAULT 0,
  next_session_at TEXT,
  FOREIGN KEY (knowledge_area_id) REFERENCES knowledge_areas(id),
  FOREIGN KEY (owner_person_id) REFERENCES people(id)
);

CREATE TABLE IF NOT EXISTS transfer_actions (
  id TEXT PRIMARY KEY,
  plan_id TEXT NOT NULL,
  title TEXT NOT NULL,
  owner_person_id TEXT NOT NULL,
  due_date TEXT NOT NULL,
  status TEXT NOT NULL,
  expected_outcome TEXT NOT NULL,
  FOREIGN KEY (plan_id) REFERENCES knowledge_transfer_plans(id),
  FOREIGN KEY (owner_person_id) REFERENCES people(id)
);

-- Risk -----------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS risks (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  probability REAL NOT NULL,
  impact REAL NOT NULL,
  urgency REAL NOT NULL,
  score REAL NOT NULL,
  severity TEXT NOT NULL,
  confidence REAL NOT NULL,
  trend TEXT NOT NULL,
  status TEXT NOT NULL,
  owner_person_id TEXT,
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (owner_person_id) REFERENCES people(id)
);

CREATE TABLE IF NOT EXISTS prevention_actions (
  id TEXT PRIMARY KEY,
  risk_id TEXT NOT NULL,
  title TEXT NOT NULL,
  owner_person_id TEXT,
  due_date TEXT NOT NULL,
  status TEXT NOT NULL,
  expected_outcome TEXT NOT NULL,
  FOREIGN KEY (risk_id) REFERENCES risks(id),
  FOREIGN KEY (owner_person_id) REFERENCES people(id)
);

CREATE TABLE IF NOT EXISTS evidence (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  source TEXT NOT NULL,
  statement TEXT NOT NULL,
  occurred_at TEXT NOT NULL,
  source_url TEXT
);

-- Staffing scenarios ----------------------------------------------------------

CREATE TABLE IF NOT EXISTS staffing_scenarios (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  project_id TEXT NOT NULL,
  team_id TEXT,
  capacity_delta_fte REAL NOT NULL DEFAULT 0,
  capability_delta TEXT NOT NULL DEFAULT '',
  trade_off TEXT NOT NULL DEFAULT '',
  confidence REAL NOT NULL DEFAULT 0,
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (team_id) REFERENCES teams(id)
);

CREATE TABLE IF NOT EXISTS scenario_changes (
  id TEXT PRIMARY KEY,
  scenario_id TEXT NOT NULL,
  person_id TEXT NOT NULL,
  change_type TEXT NOT NULL,
  allocation_delta_fte REAL NOT NULL DEFAULT 0,
  rationale TEXT NOT NULL DEFAULT '',
  FOREIGN KEY (scenario_id) REFERENCES staffing_scenarios(id),
  FOREIGN KEY (person_id) REFERENCES people(id)
);

-- Recognition ----------------------------------------------------------------

CREATE TABLE IF NOT EXISTS recognition (
  id TEXT PRIMARY KEY,
  person_id TEXT NOT NULL,
  project_id TEXT,
  knowledge_area_id TEXT,
  contribution_type TEXT NOT NULL,
  summary TEXT NOT NULL,
  occurred_at TEXT NOT NULL,
  visibility TEXT NOT NULL DEFAULT 'public',
  FOREIGN KEY (person_id) REFERENCES people(id),
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (knowledge_area_id) REFERENCES knowledge_areas(id)
);

-- Hot-path indexes -------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_evidence_entity ON evidence(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_risks_project ON risks(project_id);
CREATE INDEX IF NOT EXISTS idx_allocations_person ON allocations(person_id);
CREATE INDEX IF NOT EXISTS idx_allocations_team ON allocations(team_id);