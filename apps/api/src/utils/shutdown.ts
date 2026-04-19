import { Server } from 'http';
import mongoose from 'mongoose';
import { logger } from './logger';
import { AppError } from './AppError';

const SHUTDOWN_TIMEOUT_MS = 10_000;

const closeHttpServer = (server: Server): Promise<void> => {
  return new Promise((resolve, reject) => {
    server.close((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

export const setupGracefulShutdown = (server: Server): void => {
  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`${signal} received. Starting graceful shutdown...`);

    const forceExit = setTimeout(() => {
      logger.fatal('Graceful shutdown timed out. Forcing exit.');
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);

    forceExit.unref();

    try {
      await closeHttpServer(server);
      logger.info('HTTP server closed.');

      await mongoose.connection.close();
      logger.info('MongoDB connection closed.');

      logger.info('Graceful shutdown complete.');
      process.exit(0);
    } catch (err) {
      logger.fatal({ err }, 'Error during graceful shutdown.');
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    logger.fatal({ reason }, 'Unhandled Promise rejection detected.');

    if (reason instanceof AppError && reason.isOperational) {
      logger.error(
        'Operational error reached unhandledRejection. Investigate the missing catch.'
      );
    } else {
      shutdown('unhandledRejection');
    }
  });

  process.on('uncaughtException', (err) => {
    logger.fatal({ err }, 'Uncaught exception detected. Shutting down.');
    shutdown('uncaughtException');
  });
};
