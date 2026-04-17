import { Request, Response } from 'express';
import { Endpoint } from '../models/endpoint.model';
import { Payload } from '../models/payload.model';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';
import { AuthRequest } from '../middleware/auth.middleware';

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

// @desc    Get all payloads for a specific endpoint
// @route   GET /api/v1/endpoints/:endpointId/payloads
// @access  Private
export const getPayloads = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { endpointId } = req.params;

    const endpoint = await Endpoint.findOne({
      _id: endpointId,
      userId: req.user!._id,
    });

    if (!endpoint) {
      throw new AppError('Endpoint not found or unauthorized', 404);
    }

    const payloads = await Payload.find({ endpointId })
      .sort({ createdAt: -1 })
      .limit(100); // hard-limit to 100 to prevent an Out-Of-Memory (OOM) crash

    res.status(200).json({
      status: 'success',
      results: payloads.length,
      data: payloads,
    });
  }
);
