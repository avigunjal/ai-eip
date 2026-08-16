// Risk register endpoints.

import { Router } from 'express';
import * as riskController from './risk.controller.js';

const router = Router();

router.get('/', riskController.listRisks);
router.get('/:riskId', riskController.getRisk);
router.patch('/:riskId', riskController.patchRisk);

export default router;