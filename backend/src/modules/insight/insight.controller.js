// Insights endpoint.

import { asyncHandler } from '../../utils/async-handler.js';
import { listInsights } from './insight.service.js';

export const getInsights = asyncHandler(async (_req, res) => {
  res.json({ insights: await listInsights() });
});