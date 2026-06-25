import { Request, Response } from 'express';
import { Endpoint } from '../models/endpoint.model';
import { Payload } from '../models/payload.model';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';
import { AuthRequest } from '../middleware/auth.middleware';
import { getPayloadsQuerySchema } from '@catchapi/shared';
import { SOCKET_EVENTS } from '@catchapi/shared';
import { getIO } from '../config/socket';

// @route   ALL /w/:urlId
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

  const savedPayload = await Payload.create({
    endpointId: endpoint._id,
    method,
    headers,
    query,
    body,
  });

  await Endpoint.findByIdAndUpdate(endpoint._id, {
    $inc: { payloadCount: 1 },
    $set: { lastReceivedAt: new Date() },
  });

  try {
    const io = getIO();
    const room = `endpoint:${urlId}`;
    io.to(room).emit(SOCKET_EVENTS.PAYLOAD_NEW, {
      _id: savedPayload._id,
      endpointId: savedPayload.endpointId,
      method: savedPayload.method,
      headers: savedPayload.headers,
      query: savedPayload.query,
      body: savedPayload.body,
      createdAt: savedPayload.createdAt,
    });
  } catch (err) {
    const logger = (await import('../utils/logger')).logger;
    logger.error({ err }, 'Failed to broadcast payload via Socket.io');
  }

  res.status(200).send('ok');
});

// @route   GET /api/v1/endpoints/:endpointId/payloads
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

// @route   POST /api/v1/endpoints/:endpointId/payloads/:payloadId/replay
export const replayPayload = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { endpointId, payloadId } = req.params;
    const { targetUrl } = req.body as { targetUrl: string };

    const endpoint = await Endpoint.findOne({
      _id: endpointId,
      userId: req.user!._id,
    });
    if (!endpoint) {
      throw new AppError('Endpoint not found or unauthorized', 404);
    }

    const payload = await Payload.findOne({
      _id: payloadId,
      endpointId,
    });
    if (!payload) {
      throw new AppError('Payload not found', 404);
    }

    const SKIP_HEADERS = new Set([
      'host',
      'content-length',
      'transfer-encoding',
      'connection',
      'x-forwarded-for',
      'x-forwarded-host',
      'x-forwarded-proto',
      'x-real-ip',
      'x-request-start',
      'x-railway-edge',
      'x-railway-request-id',
    ]);

    const forwardedHeaders: Record<string, string> = {};
    for (const [key, value] of Object.entries(
      payload.headers as Record<string, string>
    )) {
      if (!SKIP_HEADERS.has(key.toLowerCase())) {
        forwardedHeaders[key] = value;
      }
    }

    const NO_BODY_METHODS = new Set(['GET', 'HEAD']);
    let body: string | undefined;

    if (!NO_BODY_METHODS.has(payload.method)) {
      if (
        payload.body &&
        typeof payload.body === 'object' &&
        Object.keys(payload.body as object).length > 0
      ) {
        body = JSON.stringify(payload.body);
        if (!forwardedHeaders['content-type']) {
          forwardedHeaders['content-type'] = 'application/json';
        }
      } else if (typeof payload.body === 'string' && payload.body.length > 0) {
        body = payload.body;
      }
    }

    try {
      const response = await fetch(targetUrl, {
        method: payload.method,
        headers: forwardedHeaders,
        body,
      });

      res.status(200).json({
        status: 'success',
        data: {
          statusCode: response.status,
          statusText: response.statusText,
          ok: response.ok,
        },
      });
    } catch {
      throw new AppError(
        'Could not reach the target URL. Verify it is accessible.',
        502
      );
    }
  }
);
