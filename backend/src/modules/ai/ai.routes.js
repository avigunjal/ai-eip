// AI-powered endpoints (deterministic insights + evidence retrieval).

import { Router } from 'express';
import * as aiController from './ai.controller.js';

const router = Router();

router.post('/insights', aiController.generateInsights);
router.get('/evidence/:entityId', aiController.getEvidence);

export default router;