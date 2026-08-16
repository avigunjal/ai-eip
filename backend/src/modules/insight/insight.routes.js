// Insights endpoint.

import { Router } from 'express';
import * as insightController from './insight.controller.js';

const router = Router();

router.get('/', insightController.getInsights);

export default router;