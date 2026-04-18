import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';

import { env } from './config/env';
import { RegisterInput } from '@catchapi/shared';
import { connectDB } from './config/db';
import { logger } from './utils/logger';

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
  catcherRoutes
);

app.use('/api', apiLimiter, cors({ origin: env.FRONTEND_URL }), express.json());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/endpoints', endpointRoutes);

app.get('/health', (req: Request, res: Response) => {
  const dummyUser: RegisterInput = {
    email: 'test@catchapi.com',
    password: 'securepassword',
    name: 'Admin',
  };

  res.status(200).json({
    status: 'ok',
    message: 'CatchAPI Backend is running',
    userTest: dummyUser,
  });
});

app.use(errorHandler);

const PORT = env.PORT;
app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
});
