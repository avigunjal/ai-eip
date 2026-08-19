// Knowledge area and transfer-plan endpoints.

import { asyncHandler } from '../../utils/async-handler.js';
import * as knowledgeService from './knowledge.service.js';
import * as transferPlanService from './transfer-plan.service.js';

export const listAreas = asyncHandler(async (_req, res) => {
  res.json({ areas: await knowledgeService.listAreas() });
});

export const getArea = asyncHandler(async (req, res) => {
  const area = await knowledgeService.getAreaById(req.params.areaId);
  if (!area) return res.status(404).json({ error: { message: 'Knowledge area not found' } });
  res.json({ area });
});

export const listTransferPlans = asyncHandler(async (_req, res) => {
  res.json({ plans: await transferPlanService.listPlans() });
});

export const createTransferPlan = asyncHandler(async (req, res) => {
  const plan = await transferPlanService.createPlan(req.body ?? {});
  res.status(201).json({ plan });
});

export const patchTransferPlan = asyncHandler(async (req, res) => {
  const { status } = req.body ?? {};
  if (!status) return res.status(400).json({ error: { message: 'A status value is required' } });
  const plan = await transferPlanService.updatePlanStatus(req.params.planId, status);
  if (!plan) return res.status(404).json({ error: { message: 'Transfer plan not found' } });
  res.json({ plan });
});