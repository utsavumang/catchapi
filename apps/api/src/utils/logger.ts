import pino from 'pino';
import { env } from '../config/env';

// In production - highly compressed JSON.
// In development - pipes the output through pino-pretty for human readability.
export const logger = pino({
  level: env.NODE_ENV === 'development' ? 'debug' : 'info',
  transport:
    env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname', // Keeps the terminal clean
          },
        }
      : undefined,
});
