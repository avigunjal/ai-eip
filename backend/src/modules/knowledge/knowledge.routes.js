// Knowledge area and transfer-plan endpoints.

import { Router } from 'express';
import * as knowledgeController from './knowledge.controller.js';

const router = Router();

router.get('/', knowledgeController.listAreas);
router.get('/areas', knowledgeController.listAreas);
router.get('/transfer-plans', knowledgeController.listTransferPlans);
router.post('/transfer-plans', knowledgeController.createTransferPlan);
router.patch('/transfer-plans/:planId', knowledgeController.patchTransferPlan);
router.get('/:areaId', knowledgeController.getArea);

export default router;