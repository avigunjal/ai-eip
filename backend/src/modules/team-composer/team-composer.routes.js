// Team composition / staffing endpoints.

import { Router } from 'express';
import * as teamComposerController from './team-composer.controller.js';

const router = Router();

router.get('/teams', teamComposerController.listTeams);
router.get('/recommendations', teamComposerController.getRecommendations);
router.get('/:scenarioId', teamComposerController.getScenario);
router.post('/', teamComposerController.compose);

export default router;