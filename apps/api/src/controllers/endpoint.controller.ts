import { Response } from 'express';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';
import { AuthRequest } from '../middleware/auth.middleware';
import { Endpoint, IEndpoint } from '../models/endpoint.model';

// Helper - formats an endpoint document into the API response shape
// Used by createEndpoint, getEndpoints, and getEndpoint
const formatEndpoint = (endpoint: IEndpoint, fullUrl: string) => ({
  _id: endpoint._id,
  urlId: endpoint.urlId,
  fullUrl,
  name: endpoint.name,
  description: endpoint.description,
  userId: endpoint.userId,
  payloadCount: endpoint.payloadCount,
  lastReceivedAt: endpoint.lastReceivedAt,
  createdAt: endpoint.createdAt,
});

// @desc    Create a new webhook endpoint
// @route   POST /api/v1/endpoints
// @access  Private
export const createEndpoint = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { name, description } = req.body;

    const endpoint = await Endpoint.create({
      userId: req.user!._id, // '!' tells TS we know user exists because of the auth guard
      name: name || 'Untitled Endpoint',
      description,
    });

    const fullUrl = `${req.protocol}://${req.get('host')}/w/${endpoint.urlId}`;

    res.status(201).json({
      status: 'success',
      data: formatEndpoint(endpoint, fullUrl),
    });
  }
);

// @desc    Get all endpoints for the logged-in user
// @route   GET /api/v1/endpoints
// @access  Private
export const getEndpoints = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const endpoints = await Endpoint.find({ userId: req.user!._id }).sort({
      createdAt: -1,
    });

    const formattedEndpoints = endpoints.map((ep) =>
      formatEndpoint(ep, `${req.protocol}://${req.get('host')}/w/${ep.urlId}`)
    );
    res.status(200).json({
      status: 'success',
      results: formattedEndpoints.length,
      data: formattedEndpoints,
    });
  }
);

// @desc    Get a single endpoint by ID
// @route   GET /api/v1/endpoints/:id
// @access  Private
export const getEndpoint = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const endpoint = await Endpoint.findOne({
      urlId: req.params.id,
      userId: req.user!._id,
    });

    if (!endpoint) {
      throw new AppError('Endpoint not found or unauthorized', 404);
    }

    const fullUrl = `${req.protocol}://${req.get('host')}/w/${endpoint.urlId}`;
    res.status(200).json({
      status: 'success',
      data: formatEndpoint(endpoint, fullUrl),
    });
  }
);

// @desc    Delete an endpoint
// @route   DELETE /api/v1/endpoints/:id
// @access  Private
export const deleteEndpoint = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const endpoint = await Endpoint.findOneAndDelete({
      _id: req.params.id,
      userId: req.user!._id,
    });

    if (!endpoint) {
      throw new AppError(
        'Endpoint not found or you do not have permission to delete it',
        404
      );
    }

    // Cascading logic through mongoose hooks

    res.status(204).json({
      status: 'success',
      data: null,
    });
  }
);
