import rateLimit from 'express-rate-limit';

// Management API Limiter (Strict)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    status: 'error',
    statusCode: 429,
    message:
      'Too many requests from this IP, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Ingestion API Limiter (High Capacity)
export const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 1000,
  message: '429 Too Many Requests',
  standardHeaders: true,
  legacyHeaders: false,
});
