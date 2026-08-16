// Knowledge transfer plans domain service.

import { toActions } from '../../utils/mappers.js';
import * as repository from './transfer-plan.repository.js';
import { findById as findAreaById } from './knowledge.repository.js';
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
    backupOwnerId: backup?.personId ?? null,
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