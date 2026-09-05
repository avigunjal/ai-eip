// Recognition / impact endpoints.

import { Router } from 'express';
import * as recognitionController from './recognition.controller.js';

const router = Router();

router.get('/', recognitionController.getFeed);
router.get('/feed', recognitionController.getFeed);
// Governance queue must be registered before the /:id routes.
router.get('/governance', recognitionController.getGovernanceQueue);
router.get('/:id/explanation', recognitionController.getRecognitionExplanation);
router.get('/:id', recognitionController.getRecognition);
router.post('/', recognitionController.createRecognition);
router.post('/:id/approve', recognitionController.approveRecognition);
router.post('/:id/reject', recognitionController.rejectRecognition);

export default router;