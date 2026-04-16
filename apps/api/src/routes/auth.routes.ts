import express from 'express';
import { registerUser, loginUser, getMe } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validate.middleware';
import { protect } from '../middleware/auth.middleware';
import { registerSchema, loginSchema } from '@catchapi/shared';

const router = express.Router();

router.post('/register', validateRequest(registerSchema), registerUser);
router.post('/login', validateRequest(loginSchema), loginUser);

router.get('/me', protect, getMe);

export default router;
