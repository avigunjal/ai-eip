// Server entry point: boots the Express app and starts listening.

import app from './app.js';
import { env } from './config/env.config.js';

app.listen(env.port, () => {
  console.log(`AI-EIP backend listening on http://localhost:${env.port} (${env.nodeEnv})`);
});
