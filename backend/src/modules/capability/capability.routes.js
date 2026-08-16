// Capabilities endpoints.

import { Router } from 'express';
import * as capabilityController from './capability.controller.js';

const router = Router();

router.get('/', capabilityController.listCapabilities);
router.get('/:capabilityId', capabilityController.getCapability);

export default router;