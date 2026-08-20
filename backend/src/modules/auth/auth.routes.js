// Public auth routes: login + status. Everything else under /api is guarded
// by requireAuth (app.js), which is a no-op until AUTH_PASSWORD is configured.

import { Router } from 'express';
import * as authController from './auth.controller.js';

const router = Router();

router.post('/login', authController.login);
router.get('/status', authController.status);

export default router;