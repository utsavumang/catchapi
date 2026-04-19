import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let isOperational = false;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
  }

  if ((err as Error & { code?: number }).code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
    isOperational = true;
  }

  if (!isOperational) {
    logger.fatal(
      {
        err: {
          message: err.message,
          stack: err.stack,
        },
        request: {
          method: req.method,
          path: req.originalUrl,
          body: req.body,
        },
      },
      'Programming error detected — non-operational error reached error handler'
    );
  } else if (env.NODE_ENV === 'development') {
    logger.warn(
      {
        message: err.message,
        stack: err.stack,
        path: req.originalUrl,
      },
      'Operational error'
    );
  }

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message: isOperational ? message : 'Internal Server Error',
    ...(env.NODE_ENV === 'development' && {
      stack: err.stack,
      isOperational,
    }),
  });

  if (!isOperational) {
    process.emit('uncaughtException', err);
  }
};
