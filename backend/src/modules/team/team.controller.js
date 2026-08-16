// Teams endpoints.

import { asyncHandler } from '../../utils/async-handler.js';
import * as teamService from './team.service.js';

export const listTeams = asyncHandler(async (_req, res) => {
  res.json({ teams: await teamService.listTeams() });
});

export const getTeam = asyncHandler(async (req, res) => {
  const team = await teamService.getTeamById(req.params.teamId);
  if (!team) return res.status(404).json({ error: { message: 'Team not found' } });
  res.json({ team });
});