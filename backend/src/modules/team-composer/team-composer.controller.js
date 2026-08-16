// Team composition / staffing endpoints.

import { asyncHandler } from '../../utils/async-handler.js';
import * as composerService from './team-composer.service.js';
import * as teamService from '../team/team.service.js';

export const listTeams = asyncHandler(async (_req, res) => {
  res.json({ teams: await teamService.listTeams() });
});

export const getRecommendations = asyncHandler(async (req, res) => {
  const recommendation = await composerService.composeForProject(req.query.projectId || 'pr-07');
  if (!recommendation) return res.status(404).json({ error: { message: 'Project not found' } });
  res.json({ recommendation });
});

export const compose = asyncHandler(async (req, res) => {
  const recommendation = await composerService.composeForProject(req.body?.projectId || 'pr-07', { persist: true });
  if (!recommendation) return res.status(404).json({ error: { message: 'Project not found' } });
  res.status(201).json({ recommendation });
});

export const getScenario = asyncHandler(async (req, res) => {
  const scenario = await composerService.getScenarioById(req.params.scenarioId);
  if (!scenario) return res.status(404).json({ error: { message: 'Scenario not found' } });
  res.json({ scenario });
});