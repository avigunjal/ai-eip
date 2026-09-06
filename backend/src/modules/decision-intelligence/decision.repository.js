// Decision Impact Simulator data access layer.

import { db } from '../../config/database.config.js';

// --- financial assumptions ---------------------------------------------------

export function listAssumptions() {
  return db.prepare(`SELECT * FROM financial_assumptions
    ORDER BY (role = 'default') ASC, role ASC`).all();
}

export function findAssumptionById(id) {
  return db.prepare('SELECT * FROM financial_assumptions WHERE id = ?').get(id);
}

export function findAssumptionByRole(role) {
  return db.prepare('SELECT * FROM financial_assumptions WHERE role = ?').get(role);
}

const UPDATABLE_ASSEMPTION_COLUMNS = ['annual_cost_per_fte', 'billing_target_per_fte', 'working_days_per_year', 'recovery_rate', 'notes'];

export function updateAssumption(id, patch) {
  const current = findAssumptionById(id);
  if (!current) return null;
  const entries = Object.entries(patch ?? {}).filter(([column]) => UPDATABLE_ASSEMPTION_COLUMNS.includes(column));
  if (entries.length) {
    const assignments = entries.map(([column]) => `${column} = ?`).join(', ');
    db.prepare(`UPDATE financial_assumptions SET ${assignments} WHERE id = ?`).run(...entries.map(([, value]) => value), id);
  }
  return findAssumptionById(id);
}

// --- signal data -------------------------------------------------------------

export function findScenarioForProject(projectId) {
  return db.prepare('SELECT * FROM staffing_scenarios WHERE project_id = ? LIMIT 1').get(projectId);
}

export function findScenarioChanges(scenarioId) {
  return db.prepare('SELECT * FROM scenario_changes WHERE scenario_id = ?').all(scenarioId);
}

// People serving on any of the project's teams, with their capability cards.
export function findProjectMemberCards(projectId) {
  const members = db.prepare(`SELECT DISTINCT p.*, tm.team_id
    FROM team_memberships tm
    JOIN people p ON p.id = tm.person_id
    JOIN project_teams pt ON pt.team_id = tm.team_id AND pt.project_id = ?
    ORDER BY p.name`).all(projectId);
  const cards = db.prepare('SELECT person_id, capability_id, level FROM person_capabilities').all();
  const byPerson = new Map();
  for (const card of cards) {
    if (!byPerson.has(card.person_id)) byPerson.set(card.person_id, []);
    byPerson.get(card.person_id).push(card);
  }
  return members.map((member) => ({ ...member, capabilities: byPerson.get(member.id) ?? [] }));
}

// Raw knowledge_areas linked to the project (kept raw so concentration can be
// re-assessed from the same fields the existing engine reads).
export function findLinkedAreas(projectId) {
  return db.prepare(`SELECT ka.* FROM knowledge_area_projects kap
    JOIN knowledge_areas ka ON ka.id = kap.knowledge_area_id
    WHERE kap.project_id = ?`).all(projectId);
}

export function findProjectRisks(projectId) {
  return db.prepare(`SELECT r.*, p.name AS project_name FROM risks r
    JOIN projects p ON p.id = r.project_id
    WHERE r.project_id = ?`).all(projectId);
}

// Open risks owned by a person on projects they do not serve.
export function findOpenRiskOwnership(personId) {
  return db.prepare(`SELECT r.id AS risk_id, r.title, r.project_id, pj.name AS project_name, r.score
    FROM risks r JOIN projects pj ON pj.id = r.project_id
    WHERE r.owner_person_id = ? AND r.status != 'mitigated'
    ORDER BY r.score DESC`).all(personId);
}