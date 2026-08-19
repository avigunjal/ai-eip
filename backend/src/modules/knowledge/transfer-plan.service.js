// Knowledge transfer plans domain service.

import { toActions } from '../../utils/mappers.js';
import * as repository from './transfer-plan.repository.js';
import { findById as findAreaById, findExpertise } from './knowledge.repository.js';
import { findById as findPersonById } from '../person/person.repository.js';
import { toArea } from './knowledge.service.js';

async function toPlan(row) {
  const area = await toArea(await findAreaById(row.knowledge_area_id));
  const backup = area.expertise.find((person) => person.backupOwner || person.level === 'capable');
  return {
    id: row.id,
    title: `Raise coverage for ${area.name}`,
    areaId: area.id,
    riskLevel: area.riskLevel,
    ownerId: row.owner_person_id,
    backupOwnerId: row.backup_person_id ?? backup?.personId ?? null,
    nextSessionAt: row.next_session_at ?? null,
    dueDate: row.due_date,
    status: row.status,
    progress: Number(row.progress),
    fromCoverage: area.coverage,
    targetCoverage: Number(row.target_coverage),
    actions: toActions(await repository.findActions(row.id)),
  };
}

export async function listPlans() {
  return Promise.all((await repository.findAll()).map(toPlan));
}

export async function getPlanById(id) {
  const row = await repository.findById(id);
  if (!row) return null;
  return toPlan(row);
}

export async function updatePlanStatus(id, status) {
  const row = await repository.updateStatus(id, status);
  return toPlan(row);
}

export async function createPlan(payload) {
  const { areaId, backupOwnerId, dueDate } = payload ?? {};
  if (!areaId) {
    const error = new Error('A knowledge area id is required');
    error.status = 400;
    throw error;
  }
  if (!backupOwnerId) {
    const error = new Error('A backup owner is required');
    error.status = 400;
    throw error;
  }
  if (!dueDate) {
    const error = new Error('A target date is required');
    error.status = 400;
    throw error;
  }
  const area = await findAreaById(areaId);
  if (!area) {
    const error = new Error('Knowledge area not found');
    error.status = 404;
    throw error;
  }
  const backup = await findPersonById(backupOwnerId);
  if (!backup) {
    const error = new Error('Backup owner not found');
    error.status = 400;
    throw error;
  }

  const expertise = await findExpertise(areaId);
  const owner = expertise.find((person) => person.level === 'primary') ?? expertise[0];
  const plan = {
    id: `tp-${Date.now()}`,
    knowledgeAreaId: areaId,
    ownerPersonId: owner?.person_id ?? backupOwnerId,
    backupPersonId: backupOwnerId,
    targetCoverage: Math.min(90, Number(area.coverage_score) + 27),
    dueDate,
    status: 'in_progress',
    progress: 0,
    nextSessionAt: null,
  };
  repository.insert(plan);
  return toPlan(await repository.findById(plan.id));
}