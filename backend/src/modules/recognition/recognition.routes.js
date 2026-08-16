// Recognition / impact endpoints.

import { Router } from 'express';
import * as recognitionController from './recognition.controller.js';

const router = Router();

router.get('/', recognitionController.getFeed);
router.get('/feed', recognitionController.getFeed);
router.post('/', recognitionController.createRecognition);

export default router;