// Teams endpoints.

import { Router } from 'express';
import * as teamController from './team.controller.js';

const router = Router();

router.get('/', teamController.listTeams);
router.get('/:teamId', teamController.getTeam);

export default router;