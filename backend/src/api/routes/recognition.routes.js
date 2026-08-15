// Recognition / impact endpoints.

import { Router } from 'express';
import * as recognitionController from '../controllers/recognition.controller.js';

const router = Router();

router.get('/feed', recognitionController.getFeed);
router.post('/recognition', recognitionController.sendRecognition);

export default router;
