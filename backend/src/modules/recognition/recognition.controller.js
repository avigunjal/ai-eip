// Recognition / impact endpoints.

import { asyncHandler } from '../../utils/async-handler.js';
import { getRecognitionExplanation as explainRecognition } from '../ai/ai.service.js';
import * as recognitionService from './recognition.service.js';

export const getFeed = asyncHandler(async (_req, res) => {
  res.json({ feed: await recognitionService.getFeed() });
});

export const getRecognition = asyncHandler(async (req, res) => {
  const recognition = await recognitionService.getRecognition(req.params.id);
  if (!recognition) {
    res.status(404).json({ error: 'Recognition not found' });
    return;
  }
  res.json({ recognition });
});

export const getRecognitionExplanation = asyncHandler(async (req, res) => {
  const grounding = await recognitionService.getRecognitionDetail(req.params.id);
  if (!grounding) {
    res.status(404).json({ error: 'Recognition not found' });
    return;
  }
  const explanation = await explainRecognition(grounding);
  res.json({ id: grounding.id, ...explanation });
});

export const createRecognition = asyncHandler(async (req, res) => {
  const recognition = await recognitionService.createRecognition(req.body ?? {});
  res.status(201).json({ recognition });
});

export const approveRecognition = asyncHandler(async (req, res) => {
  const actor = req.user?.sub ?? 'admin';
  const status = req.body?.status ?? 'approved';
  const result = await recognitionService.approveRecognition(req.params.id, status, actor);
  res.json({ recognition: result });
});