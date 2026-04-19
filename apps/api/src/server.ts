import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import mongoSanitize from 'express-mongo-sanitize';

import { env } from './config/env';
import { connectDB } from './config/db';
import { setupSwagger } from './config/swagger';

import { logger } from './utils/logger';
import { setupGracefulShutdown } from './utils/shutdown';

import { errorHandler } from './middleware/error.middleware';
import {
  apiLimiter,
  webhookLimiter,
} from './middleware/rateLimiter.middleware';

import authRoutes from './routes/auth.routes';
import endpointRoutes from './routes/endpoint.routes';
import catcherRoutes from './routes/catcher.routes';

connectDB();

const app = express();

app.use(helmet());
app.use(
  pinoHttp({
    logger,
    // Only log errors for the /w route.
    autoLogging: {
      ignore: (req) => (req.url ? req.url.startsWith('/w/') : false),
    },
  })
);

app.use(
  '/w',
  webhookLimiter,
  cors({ origin: '*' }),
  [
    express.json({ limit: '512kb' }),
    express.urlencoded({ extended: true, limit: '512kb' }),
    express.text({ type: ['text/*', 'application/xml'], limit: '512kb' }),
    express.raw({ type: '*/*', limit: '512kb' }),
  ],
  mongoSanitize({ replaceWith: '_' }),
  catcherRoutes
);

app.use(
  '/api',
  apiLimiter,
  cors({ origin: env.FRONTEND_URL }),
  express.json(),
  mongoSanitize()
);

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/endpoints', endpointRoutes);

setupSwagger(app);

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use(errorHandler);

const PORT = env.PORT;
const server = app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
});

setupGracefulShutdown(server);
