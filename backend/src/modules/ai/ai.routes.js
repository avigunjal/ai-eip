// AI-powered endpoints: deterministic insights + evidence retrieval, plus the
// LLM-augmented analyze/explain flows (which fall back to deterministic output).

import { Router } from 'express';
import * as aiController from './ai.controller.js';

const router = Router();

router.post('/insights', aiController.generateInsights);
router.get('/evidence/:entityId', aiController.getEvidence);

router.get('/analyze/project/:projectId', aiController.getProjectAssessment);
router.post('/analyze/project/:projectId', aiController.analyzeProject);
router.post('/analyze/project/:projectId/regenerate', aiController.regenerateProjectAnalysis);
router.get('/explain/insights', aiController.getInsightExplanations);
router.post('/explain/insights', aiController.explainInsights);
router.post('/explain/insights/:insightId', aiController.explainInsight);
router.post('/explain/insights/:insightId/regenerate', aiController.regenerateInsightExplanation);
router.get('/explain/composition/:projectId', aiController.getCompositionAssessment);
router.post('/explain/composition', aiController.explainComposition);
router.post('/explain/composition/:projectId/regenerate', aiController.regenerateCompositionExplanation);

router.get('/settings', aiController.getSettings);
router.patch('/settings', aiController.updateSettings);

export default router;