// Express app assembly: middleware, routes, error handling.
// Central place to wire up the whole HTTP layer.

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import { env } from './config/env.js';
import dashboardRoutes from './api/routes/dashboard.routes.js';
import projectsRoutes from './api/routes/projects.routes.js';
import knowledgeRoutes from './api/routes/knowledge.routes.js';
import teamComposerRoutes from './api/routes/team-composer.routes.js';
import recognitionRoutes from './api/routes/recognition.routes.js';
import aiRoutes from './api/routes/ai.routes.js';
import { notFoundHandler, errorHandler } from './api/middleware/error.middleware.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientOrigin }));
app.use(express.json());
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// Feature routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/team-composer', teamComposerRoutes);
app.use('/api/recognition', recognitionRoutes);
app.use('/api/ai', aiRoutes);

// Fallbacks
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
