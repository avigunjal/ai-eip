// Dashboard handlers: executive overview + insights.

import { asyncHandler } from '../../utils/async-handler.js';
import * as dashboardService from './dashboard.service.js';

export const getOverview = asyncHandler(async (_req, res) => {
  res.json(await dashboardService.getOverview());
});

export const getInsights = asyncHandler(async (_req, res) => {
  res.json({ insights: await dashboardService.getInsights() });
});