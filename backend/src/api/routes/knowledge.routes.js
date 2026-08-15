// Knowledge concentration / coverage endpoints.

import { Router } from 'express';
import * as knowledgeController from '../controllers/knowledge.controller.js';

const router = Router();

router.get('/areas', knowledgeController.listAreas);
router.get('/systems/:systemId', knowledgeController.getSystem);

export default router;
