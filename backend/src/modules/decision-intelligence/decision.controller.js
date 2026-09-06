// Decision Impact Simulator endpoints.

import { asyncHandler } from '../../utils/async-handler.js';
import { explainDecision } from '../ai/ai.service.js';
import {
  listScenarios,
  getProjectContext,
  getOptions,
  simulateDecision,
  compareDecisions,
  listAssumptions,
  updateAssumption,
} from './decision.service.js';

export const getScenarios = asyncHandler(async (_req, res) => {
  res.json({ scenarios: await listScenarios() });
});

export const getContext = asyncHandler(async (req, res) => {
  const context = await getProjectContext(req.params.projectId);
  if (!context) return res.status(404).json({ error: 'Project not found' });
  res.json(context);
});

export const getOptionDescriptors = asyncHandler(async (req, res) => {
  res.json({ options: getOptions(req.params.projectId) });
});

export const simulate = asyncHandler(async (req, res) => {
  const projectId = req.params.projectId;
  const optionKey = req.body?.option ?? req.query.option;
  if (!optionKey) return res.status(400).json({ error: 'An option key is required (' + ['continue', 'staffing', 'reallocate', 'knowledge_transfer'].join(', ') + ')' });
  const result = await simulateDecision(projectId, optionKey);
  if (!result) return res.status(404).json({ error: 'Project not found' });
  res.json(result);
});

export const compare = asyncHandler(async (req, res) => {
  const result = await compareDecisions(req.params.projectId);
  if (!result) return res.status(404).json({ error: 'Project not found' });
  res.json(result);
});

// Explain the ALREADY COMPLETED deterministic comparison. The body is validated
// (400 on malformed input) but the winner, scores, and currency values are a
// pure echo — they can never change here. AI disabled/failure ⇒ ai: null, still 200.
export const explain = asyncHandler(async (req, res) => {
  const result = await explainDecision(req.body ?? {});
  if (!result.ok) return res.status(400).json({ error: result.error });
  res.json({ deterministic: result.deterministic, ai: result.ai });
});

export const getAssumptions = asyncHandler(async (_req, res) => {
  res.json({ assumptions: listAssumptions() });
});

export const patchAssumption = asyncHandler(async (req, res) => {
  const result = updateAssumption(req.params.id, req.body ?? {});
  if (!result) return res.status(404).json({ error: 'Assumption not found' });
  res.json({ assumption: result });
});