// Canonical seed runner. Inserts the deterministic dataset from seedData.js
// into whatever database the configured adapter points at (SQLite today,
// Supabase tomorrow). Re-run for a clean demo state.

import { fileURLToPath } from 'node:url';
import { db, closeDatabase } from '../../config/database.config.js';
import {
  DEMO_TODAY,
  people, teams, teamMemberships, clients, projects, projectTeams, projectOwners,
  capabilities, teamCapabilityCoverage, projectRequirements,
  knowledgeAreas, knowledgeAreaProjects, knowledgeExpertise, transferPlans, transferActions,
  risks, preventionActions, evidence, staffingScenarios, scenarioChanges, recognitions,
} from './seedData.js';

// --- deterministic helpers --------------------------------------------------

// Risk score and severity thresholds (see docs/AI-EIP-backend-agent-context.md).
const SEVERITY_THRESHOLDS = [
  { min: 80, severity: 'critical' },
  { min: 60, severity: 'high' },
  { min: 40, severity: 'medium' },
  { min: 0, severity: 'low' },
];

export function severityFor(score) {
  return SEVERITY_THRESHOLDS.find((threshold) => score >= threshold.min).severity;
}

export function riskScore(probability, impact, urgency) {
  return Math.round(Math.min(100, probability * impact * urgency * 100));
}

// Twelve weekly allocation snapshots per person, deterministic from fixed
// inputs (no randomness, no clock). Runs before the demo today.
const ALLOCATION_WEEKS = 12;

function isoDateDaysAfter(base, days) {
  const date = new Date(`${base}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function buildAllocations() {
  const weekStarts = Array.from({ length: ALLOCATION_WEEKS }, (_, i) =>
    isoDateDaysAfter(DEMO_TODAY, -7 * (ALLOCATION_WEEKS - i) + 7));
  const rows = [];
  let seq = 1;
  for (const [personId, , , teamId, availabilityFte] of people) {
    weekStarts.forEach((weekStart, weekIndex) => {
      rows.push([
        `alloc-${String(seq).padStart(4, '0')}`,
        teamId,
        personId,
        weekStart,
        round2(availabilityFte * 0.7),
        round2(availabilityFte * 0.2),
        weekIndex % 3 === 0 ? 0.1 : 0,
      ]);
      seq += 1;
    });
  }
  return rows;
}

function round2(value) {
  return Math.round(value * 100) / 100;
}

// --- seed transaction -------------------------------------------------------

export function seed() {
  const allocations = buildAllocations();
  const personCapabilities = people.flatMap(([personId, , , , , , capabilities]) =>
    capabilities.map(([capabilityId, level]) => [personId, capabilityId, level, isoDateDaysAfter(DEMO_TODAY, -14)]));
  const run = db.transaction(() => {
    // Delete in foreign-key-safe order (children before parents).
    const tables = [
      'scenario_changes', 'staffing_scenarios', 'recognition', 'evidence',
      'prevention_actions', 'risks', 'transfer_actions', 'knowledge_transfer_plans',
      'knowledge_expertise', 'knowledge_area_projects', 'knowledge_areas',
      'allocations', 'project_requirements', 'team_capability_coverage',
      'person_capabilities', 'capabilities', 'project_owners', 'project_teams',
      'projects', 'clients', 'team_memberships', 'teams', 'people',
    ];
    for (const table of tables) db.prepare(`DELETE FROM ${table}`).run();

    insertRows('people', 6, people, (row) => [
      row[0], row[1], row[2], row[3], row[4], row[5],
    ]);
    insertRows('teams', 6, teams);
    insertRows('team_memberships', 2, teamMemberships);
    insertRows('clients', 2, clients);
    insertRows('projects', 11, projects);
    insertRows('project_teams', 2, projectTeams);
    insertRows('project_owners', 2, projectOwners);
    insertRows('capabilities', 3, capabilities);
    insertRows('person_capabilities', 4, personCapabilities);
    insertRows('team_capability_coverage', 3, teamCapabilityCoverage);
    insertRows('project_requirements', 3, projectRequirements);
    insertRows('allocations', 7, allocations);
    insertRows('knowledge_areas', 7, knowledgeAreas);
    insertRows('knowledge_area_projects', 2, knowledgeAreaProjects);
    insertRows('knowledge_expertise', 6, knowledgeExpertise);
    insertRows('knowledge_transfer_plans', 9, transferPlans);
    insertRows('transfer_actions', 7, transferActions);
    insertRows('risks', 13, risks.map(([id, projectId, title, category, probability, impact, urgency, confidence, trend, status, ownerPersonId]) => [
      id, projectId, title, category, probability, impact, urgency,
      riskScore(probability, impact, urgency),
      severityFor(riskScore(probability, impact, urgency)),
      confidence, trend, status, ownerPersonId,
    ]));
    insertRows('prevention_actions', 7, preventionActions);
    insertRows('evidence', 7, evidence);
    insertRows('staffing_scenarios', 8, staffingScenarios);
    insertRows('scenario_changes', 6, scenarioChanges);
    insertRows('recognition', 9, recognitions);
  });
  run();
  return {
    people: people.length,
    teams: teams.length,
    projects: projects.length,
    capabilities: capabilities.length,
    knowledgeAreas: knowledgeAreas.length,
    risks: risks.length,
    recognition: recognitions.length,
    allocations: allocations.length,
  };
}

// Inserts many rows with a positional statement, deriving the placeholder count
// from the first row. Pass an optional mapper to transform each source row.
function insertRows(table, placeholderCount, rows, mapper = (row) => row) {
  const placeholders = Array.from({ length: placeholderCount }, () => '?').join(', ');
  const statement = db.prepare(`INSERT INTO ${table} VALUES (${placeholders})`);
  for (const row of rows) statement.run(...mapper(row));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('Seeded AI-EIP demo data:', seed());
  closeDatabase();
}