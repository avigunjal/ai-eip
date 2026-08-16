// AI handlers: deterministic insight generation and evidence retrieval.

import { asyncHandler } from '../../utils/async-handler.js';
import * as aiService from './ai.service.js';

export const generateInsights = asyncHandler(async (_req, res) => {
  res.json({ insights: await aiService.generateInsights() });
});

export const getEvidence = asyncHandler(async (req, res) => {
  const evidence = await aiService.findEvidence(req.params.entityId);
  res.json({ entityId: req.params.entityId, evidence });
});