// Decision Impact Simulator routes.

import { Router } from 'express';
import * as decisionController from './decision.controller.js';

const router = Router();

router.get('/', decisionController.getScenarios);
router.get('/assumptions', decisionController.getAssumptions);
router.patch('/assumptions/:id', decisionController.patchAssumption);
router.get('/projects/:projectId', decisionController.getContext);
router.get('/projects/:projectId/options', decisionController.getOptionDescriptors);
router.post('/projects/:projectId/simulate', decisionController.simulate);
router.post('/projects/:projectId/compare', decisionController.compare);
router.post('/explain', decisionController.explain);

export default router;