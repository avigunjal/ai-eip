// Projects portfolio + project detail endpoints.

import { asyncHandler } from '../../utils/async-handler.js';
import * as projectService from './project.service.js';

export const listProjects = asyncHandler(async (req, res) => {
  const projects = await projectService.listProjects({ status: req.query.status, teamId: req.query.teamId });
  res.json({ projects });
});

export const getProject = asyncHandler(async (req, res) => {
  const project = await projectService.getProjectById(req.params.projectId);
  if (!project) return res.status(404).json({ error: { message: 'Project not found' } });
  res.json({ project });
});

export const getProjectRisks = asyncHandler(async (req, res) => {
  const risks = await projectService.getProjectRisks(req.params.projectId);
  if (!risks) return res.status(404).json({ error: { message: 'Project not found' } });
  res.json({ projectId: req.params.projectId, risks });
});