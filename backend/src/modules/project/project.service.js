// Projects domain service. Returns frontend-shaped project records with a
// deterministic health trend, an explainable risk roll-up, and AI metadata.

import { scoreProjectRisk } from '../analytics/project-risk/project-risk.service.js';
import { deterministicSeries } from '../../utils/deterministic-random.js';
import { severityFor, DEMO_TODAY } from '../../shared/constants/index.js';
import { enrichRisk } from '../risk/risk.service.js';
import * as evidenceRepository from '../evidence/evidence.repository.js';
import * as repository from './project.repository.js';

// Driver category → AI signal used to score the project.
const SIGNAL_BY_CATEGORY = {
  dependency: 'technical_dependency',
  knowledge: 'knowledge_dependency',
  capacity: 'team_capacity',
  quality: 'delivery_history',
  schedule: 'delivery_history',
};

async function toProject(row) {
  const [teamIds, ownerIds, risks, teams, owners, areas, teamSize] = await Promise.all([
    repository.findTeamIds(row.id),
    repository.findOwnerIds(row.id),
    repository.findRisks(row.id),
    repository.findTeams(row.id),
    repository.findOwners(row.id),
    repository.findAreas(row.id),
    repository.findTeamSize(row.id),
  ]);
  const riskSummary = scoreProjectRisk(row, risks);
  const drivers = await Promise.all(riskSummary.drivers.map(async (driver) => {
    const evidence = (await evidenceRepository.findByEntity('risk', driver.riskId))
      .map((item) => item.statement)
      .slice(0, 3);
    return { ...driver, evidence };
  }));
  const topDriver = drivers[0]?.title ?? null;
  const signalsUsed = [...new Set(drivers.map((driver) => SIGNAL_BY_CATEGORY[driver.category]).filter(Boolean))];
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    type: row.type,
    phase: row.phase,
    clientId: row.client_id ?? null,
    clientName: row.client_name ?? null,
    status: row.status,
    healthScore: Number(row.health_score),
    healthDelta: Number(row.health_delta),
    deliveryConfidence: Number(row.delivery_confidence),
    targetDate: row.target_date,
    teamIds,
    teamSize,
    ownerIds,
    teams,
    owners,
    knowledgeAreas: areas.map((area) => ({ id: area.id, name: area.name })),
    topDriver,
    trend: deterministicSeries(hashSeed(row.id), Number(row.health_score)).map((score, index) => ({
      date: weekLabel(row.target_date, index),
      score,
    })),
    risk: {
      score: riskSummary.score,
      severity: severityFor(riskSummary.score),
      confidence: riskSummary.confidence,
      drivers,
    },
    aiMetadata: {
      lastAnalyzedAt: DEMO_TODAY,
      confidence: riskSummary.confidence || Number(row.delivery_confidence),
      signalsUsed: signalsUsed.length ? signalsUsed : ['delivery_history'],
    },
  };
}

// Deterministic numeric seed from a string id.
function hashSeed(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash || 1;
}

// Week labels going backwards from the project target date.
function weekLabel(targetDate, index) {
  const date = new Date(`${targetDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - 7 * index);
  return date.toISOString().slice(0, 10);
}

export async function listProjects(filters = {}) {
  const rows = await repository.findAll(filters);
  return Promise.all(rows.map(toProject));
}

export async function getProjectById(id) {
  const row = await repository.findById(id);
  if (!row) return null;
  const [project, riskRows] = await Promise.all([toProject(row), repository.findRisks(id)]);
  return { ...project, risks: await Promise.all(riskRows.map(enrichRisk)) };
}

export async function getProjectRisks(id) {
  const row = await repository.findById(id);
  if (!row) return null;
  const riskRows = await repository.findRisks(id);
  return Promise.all(riskRows.map(enrichRisk));
}