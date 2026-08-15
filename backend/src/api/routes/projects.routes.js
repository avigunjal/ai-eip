// Projects portfolio + project detail endpoints.

import { Router } from 'express';
import * as projectsController from '../controllers/projects.controller.js';

const router = Router();

router.get('/', projectsController.listProjects);
router.get('/:projectId', projectsController.getProject);
router.get('/:projectId/risks', projectsController.getProjectRisks);

export default router;
