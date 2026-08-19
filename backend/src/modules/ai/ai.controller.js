// AI handlers: deterministic insight generation, evidence retrieval, and the
// LLM-augmented analyze/explain endpoints.

import { asyncHandler } from '../../utils/async-handler.js';
import { AppError } from '../../shared/errors/app.error.js';
import * as aiService from './ai.service.js';

export const generateInsights = asyncHandler(async (_req, res) => {
  res.json({ insights: await aiService.generateInsights() });
});

export const getEvidence = asyncHandler(async (req, res) => {
  const evidence = await aiService.findEvidence(req.params.entityId);
  res.json({ entityId: req.params.entityId, evidence });
});

export const getProjectAssessment = asyncHandler(async (req, res) => {
  const assessment = await aiService.getProjectAssessment(req.params.projectId);
  if (!assessment) return res.status(404).json({ error: { message: 'Project not found' } });
  res.json(assessment);
});

export const analyzeProject = asyncHandler(async (req, res) => {
  const { found, analysis } = await aiService.analyzeProject(req.params.projectId);
  if (!found) return res.status(404).json({ error: { message: 'Project not found' } });
  res.json({ analysis });
});

export const regenerateProjectAnalysis = asyncHandler(async (req, res) => {
  const analysis = await aiService.regenerateProjectAnalysis(req.params.projectId);
  if (!analysis) return res.status(404).json({ error: { message: 'Project not found' } });
  res.json({ analysis });
});

export const explainInsights = asyncHandler(async (_req, res) => {
  res.json(await aiService.explainInsights());
});

export const explainInsight = asyncHandler(async (req, res) => {
  const result = await aiService.explainInsight(req.params.insightId);
  if (!result) return res.status(404).json({ error: { message: 'Insight not found' } });
  res.json(result);
});

export const getInsightExplanations = asyncHandler(async (_req, res) => {
  res.json(await aiService.getInsightExplanations());
});

export const regenerateInsightExplanation = asyncHandler(async (req, res) => {
  const result = await aiService.regenerateInsightExplanation(req.params.insightId);
  if (!result) return res.status(404).json({ error: { message: 'Insight not found' } });
  res.json(result);
});

export const explainComposition = asyncHandler(async (req, res) => {
  const result = await aiService.explainComposition(req.body?.projectId);
  if (!result) return res.status(404).json({ error: { message: 'Project not found' } });
  res.json(result);
});

export const getCompositionAssessment = asyncHandler(async (req, res) => {
  const assessment = await aiService.getCompositionAssessment(req.params.projectId);
  if (!assessment) return res.status(404).json({ error: { message: 'Project not found' } });
  res.json(assessment);
});

export const regenerateCompositionExplanation = asyncHandler(async (req, res) => {
  const result = await aiService.regenerateCompositionExplanation(req.params.projectId);
  if (!result) return res.status(404).json({ error: { message: 'Project not found' } });
  res.json(result);
});

export const getSettings = asyncHandler(async (_req, res) => {
  res.json(aiService.getSettings());
});

export const updateSettings = asyncHandler(async (req, res) => {
  const { enabled } = req.body ?? {};
  if (typeof enabled !== 'boolean') {
    throw new AppError(400, 'The "enabled" field must be a boolean.');
  }
  res.json(aiService.updateSettings({ enabled }));
});