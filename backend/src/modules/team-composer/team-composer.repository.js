// Team composer data access layer.

import { db } from '../../config/database.config.js';

export function findProject(projectId) {
  return db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
}

export function findRequirements(projectId) {
  return db.prepare(`SELECT pr.capability_id, c.name, pr.weight, c.criticality
    FROM project_requirements pr JOIN capabilities c ON c.id = pr.capability_id
    WHERE pr.project_id = ? ORDER BY pr.weight DESC`).all(projectId);
}

export function findPrimaryTeamId(projectId) {
  const row = db.prepare('SELECT team_id FROM project_teams WHERE project_id = ?').get(projectId);
  return row?.team_id ?? null;
}

export function findTeam(teamId) {
  return db.prepare('SELECT * FROM teams WHERE id = ?').get(teamId);
}

// All people with their capability cards, grouped in JS to avoid N+1 queries.
export function findCandidates() {
  const people = db.prepare('SELECT * FROM people ORDER BY name').all();
  const cards = db.prepare('SELECT person_id, capability_id, level FROM person_capabilities').all();
  const cardsByPerson = new Map();
  for (const card of cards) {
    if (!cardsByPerson.has(card.person_id)) cardsByPerson.set(card.person_id, []);
    cardsByPerson.get(card.person_id).push(card);
  }
  return people.map((person) => ({ ...person, capabilities: cardsByPerson.get(person.id) ?? [] }));
}

export function countScenarios() {
  return db.prepare('SELECT COUNT(*) AS count FROM staffing_scenarios').get().count;
}

export function insertScenario(scenario) {
  db.prepare(`INSERT INTO staffing_scenarios (id, name, project_id, team_id, capacity_delta_fte, capability_delta, trade_off, confidence)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
    scenario.id, scenario.name, scenario.projectId, scenario.teamId,
    scenario.capacityDeltaFte, scenario.capabilityDelta, scenario.tradeOff, scenario.confidence,
  );
}

export function insertChanges(changes) {
  const statement = db.prepare(`INSERT INTO scenario_changes (id, scenario_id, person_id, change_type, allocation_delta_fte, rationale)
    VALUES (?, ?, ?, ?, ?, ?)`);
  for (const change of changes) statement.run(...change);
}

export function findScenarioById(id) {
  return db.prepare('SELECT * FROM staffing_scenarios WHERE id = ?').get(id);
}

export function findChangesByScenario(id) {
  return db.prepare('SELECT * FROM scenario_changes WHERE scenario_id = ?').all(id);
}