// Risk register endpoints.

import { asyncHandler } from '../../utils/async-handler.js';
import * as riskService from './risk.service.js';

const PATCHABLE_FIELDS = new Set(['status', 'severity', 'ownerId']);

export const listRisks = asyncHandler(async (_req, res) => {
  res.json({ risks: await riskService.listRisks() });
});

export const getRisk = asyncHandler(async (req, res) => {
  const risk = await riskService.getRiskById(req.params.riskId);
  if (!risk) return res.status(404).json({ error: { message: 'Risk not found' } });
  res.json({ risk });
});

export const patchRisk = asyncHandler(async (req, res) => {
  const patch = {};
  for (const [field, value] of Object.entries(req.body ?? {})) {
    if (PATCHABLE_FIELDS.has(field)) patch[field === 'ownerId' ? 'owner_person_id' : field] = value;
  }
  const risk = await riskService.updateRisk(req.params.riskId, patch);
  if (!risk) return res.status(404).json({ error: { message: 'Risk not found' } });
  res.json({ risk });
});