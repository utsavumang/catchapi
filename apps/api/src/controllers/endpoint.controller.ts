import { Response } from 'express';
import { Endpoint } from '../models/endpoint.model';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';
import { AuthRequest } from '../middleware/auth.middleware';

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
      data: {
        _id: endpoint._id,
        urlId: endpoint.urlId,
        fullUrl,
        name: endpoint.name,
        description: endpoint.description,
        userId: endpoint.userId,
        createdAt: endpoint.createdAt,
      },
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

    const formattedEndpoints = endpoints.map((ep) => ({
      _id: ep._id,
      urlId: ep.urlId,
      fullUrl: `${req.protocol}://${req.get('host')}/w/${ep.urlId}`,
      name: ep.name,
      description: ep.description,
      userId: ep.userId,
      createdAt: ep.createdAt,
    }));

    res.status(200).json({
      status: 'success',
      results: formattedEndpoints.length,
      data: formattedEndpoints,
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
