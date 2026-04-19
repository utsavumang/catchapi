import { Request, Response } from 'express';
import { Endpoint } from '../models/endpoint.model';
import { Payload } from '../models/payload.model';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';
import { AuthRequest } from '../middleware/auth.middleware';
import { getPayloadsQuerySchema } from '@catchapi/shared';

// @desc    Catch incoming webhooks from external services
// @route   ALL /w/:urlId
// @access  Public
export const catchWebhook = catchAsync(async (req: Request, res: Response) => {
  const { urlId } = req.params;

  const endpoint = await Endpoint.findOne({ urlId });
  if (!endpoint) {
    throw new AppError('Webhook endpoint not found', 404);
  }

  const method = req.method;
  const headers = req.headers as Record<string, unknown>;
  const query = req.query as Record<string, unknown>;
  const body = req.body as Record<string, unknown> | string;

  await Payload.create({
    endpointId: endpoint._id,
    method,
    headers,
    query,
    body,
  });

  res.status(200).send('ok');
});

// @desc    Get paginated payloads for a specific endpoint
// @route   GET /api/v1/endpoints/:endpointId/payloads
// @access  Private
export const getPayloads = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { endpointId } = req.params;

    const queryResult = getPayloadsQuerySchema.safeParse(req.query);
    if (!queryResult.success) {
      throw new AppError('Invalid query parameters', 400);
    }

    const { limit, cursor, method } = queryResult.data;

    const endpoint = await Endpoint.findOne({
      _id: endpointId,
      userId: req.user!._id,
    });

    if (!endpoint) {
      throw new AppError('Endpoint not found or unauthorized', 404);
    }

    // Sanitized Input Query Builder
    interface PayloadQuery {
      endpointId: string;
      method?: string;
      _id?: { $lt: string };
    }

    const dbQuery: PayloadQuery = { endpointId: endpointId as string };

    if (method) {
      dbQuery.method = method as string;
    }

    if (cursor) {
      dbQuery._id = { $lt: cursor as string };
    }

    const payloads = await Payload.find(dbQuery)
      .sort({ createdAt: -1 }) // Newest first
      .limit(limit + 1);

    const hasMore = payloads.length > limit;

    if (hasMore) {
      payloads.pop();
    }

    const nextCursor =
      payloads.length > 0 ? payloads[payloads.length - 1]._id : null;

    res.status(200).json({
      status: 'success',
      results: payloads.length,
      data: payloads,
      nextCursor: hasMore ? nextCursor : null,
      hasMore,
    });
  }
);
