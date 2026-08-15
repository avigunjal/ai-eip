// Team composition / staffing endpoints.

import { Router } from 'express';
import * as teamComposerController from '../controllers/team-composer.controller.js';

const router = Router();

router.get('/teams', teamComposerController.listTeams);
router.get('/recommendations', teamComposerController.getRecommendations);

export default router;
