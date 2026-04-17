import express from 'express';
import { catchWebhook } from '../controllers/payload.controller';

const router = express.Router();

// No validateRequest or protect. This is the wild west.
router.all('/:urlId', catchWebhook);

export default router;
