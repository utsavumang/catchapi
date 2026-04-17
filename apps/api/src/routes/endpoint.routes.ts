import express from 'express';
import {
  createEndpoint,
  getEndpoints,
  deleteEndpoint,
} from '../controllers/endpoint.controller';
import { protect } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { createEndpointSchema } from '@catchapi/shared'; // Imported directly from the monorepo

const router = express.Router();

router.post(
  '/',
  protect,
  validateRequest(createEndpointSchema),
  createEndpoint
);

router.get('/', protect, getEndpoints);

router.delete('/:id', protect, deleteEndpoint);

export default router;
