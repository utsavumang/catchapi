import express from 'express';
import { registerUser, loginUser } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validate.middleware';
import { registerSchema, loginSchema } from '@catchapi/shared';

const router = express.Router();

router.post('/register', validateRequest(registerSchema), registerUser);
router.post('/login', validateRequest(loginSchema), loginUser);

export default router;
