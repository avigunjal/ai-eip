// AI-powered endpoints (insights, evidence retrieval, LLM calls).

import { Router } from 'express';
import * as aiController from '../controllers/ai.controller.js';

const router = Router();

router.post('/insights', aiController.generateInsights);
router.get('/evidence/:entityId', aiController.getEvidence);

export default router;
