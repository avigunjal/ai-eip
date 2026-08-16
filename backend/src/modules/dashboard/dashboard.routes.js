// Overview / executive health endpoints.

import { Router } from 'express';
import * as dashboardController from './dashboard.controller.js';

const router = Router();

router.get('/', dashboardController.getOverview);
router.get('/overview', dashboardController.getOverview);
router.get('/insights', dashboardController.getInsights);

export default router;