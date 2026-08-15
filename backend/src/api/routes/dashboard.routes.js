// Overview / executive health endpoints.

import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller.js';

const router = Router();

// GET /api/dashboard/overview - engineering health snapshot
router.get('/overview', dashboardController.getOverview);

// GET /api/dashboard/insights - AI insight feed
router.get('/insights', dashboardController.getInsights);

export default router;
