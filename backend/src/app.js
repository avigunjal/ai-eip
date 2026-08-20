// Express app assembly: middleware, routes, error handling.
// Central place to wire up the whole HTTP layer.

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { env } from './config/env.config.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import projectRoutes from './modules/project/project.routes.js';
import riskRoutes from './modules/risk/risk.routes.js';
import teamRoutes from './modules/team/team.routes.js';
import personRoutes from './modules/person/person.routes.js';
import capabilityRoutes from './modules/capability/capability.routes.js';
import knowledgeRoutes from './modules/knowledge/knowledge.routes.js';
import teamComposerRoutes from './modules/team-composer/team-composer.routes.js';
import recognitionRoutes from './modules/recognition/recognition.routes.js';
import insightRoutes from './modules/insight/insight.routes.js';
import aiRoutes from './modules/ai/ai.routes.js';
import authRoutes from './modules/auth/auth.routes.js';
import { requireAuth } from './modules/auth/auth.middleware.js';
import { notFoundHandler, errorHandler } from './middleware/error.middleware.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientOrigins, credentials: true }));
app.use(express.json());
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

// Health check (always public)
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// Auth (login + status are public; everything after requireAuth is guarded)
app.use('/api/auth', authRoutes);
app.use('/api', requireAuth);

// Feature routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/risks', riskRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/people', personRoutes);
app.use('/api/capabilities', capabilityRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/team-composer', teamComposerRoutes);
app.use('/api/recognition', recognitionRoutes);
app.use('/api/insights', insightRoutes);
app.use('/api/ai', aiRoutes);

// Fallbacks
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
