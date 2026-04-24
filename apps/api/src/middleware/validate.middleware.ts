import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodIssue } from 'zod';
import { AppError } from '../utils/AppError';
import { sanitizeObject } from '../utils/sanitize';

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const sanitizedBody = sanitizeObject(req.body as Record<string, unknown>);

    const result = schema.safeParse(sanitizedBody);
    if (!result.success) {
      const errorMessages = result.error.issues
        .map((issue: ZodIssue) => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ');
      return next(new AppError(`Validation failed - ${errorMessages}`, 400));
    }

    req.body = result.data;
    next();
  };
};
