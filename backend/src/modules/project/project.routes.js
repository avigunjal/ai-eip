// Projects portfolio + project detail endpoints.

import { Router } from 'express';
import * as projectController from './project.controller.js';

const router = Router();

router.get('/', projectController.listProjects);
router.get('/:projectId', projectController.getProject);
router.get('/:projectId/risks', projectController.getProjectRisks);

export default router;