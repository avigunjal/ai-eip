// People endpoints.

import { Router } from 'express';
import * as personController from './person.controller.js';

const router = Router();

router.get('/', personController.listPeople);
router.get('/:personId', personController.getPerson);

export default router;