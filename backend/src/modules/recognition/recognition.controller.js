// Recognition / impact endpoints.

import { asyncHandler } from '../../utils/async-handler.js';
import * as recognitionService from './recognition.service.js';

export const getFeed = asyncHandler(async (_req, res) => {
  res.json({ feed: await recognitionService.getFeed() });
});

export const createRecognition = asyncHandler(async (req, res) => {
  const recognition = await recognitionService.createRecognition(req.body ?? {});
  res.status(201).json({ recognition });
});