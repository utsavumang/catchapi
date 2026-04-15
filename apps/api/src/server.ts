import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { env } from './config/env';
import { RegisterInput } from '@catchapi/shared';
import { connectDB } from './config/db';

import authRoutes from './routes/auth.routes';

connectDB();

const app = express();
const PORT = env.PORT;

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/api/v1/auth', authRoutes);

app.get('/health', (req: Request, res: Response) => {
  const dummyUser: RegisterInput = {
    email: 'test@catchapi.com',
    password: 'securepassword',
    name: 'Admin',
  };

  res.status(200).json({
    status: 'ok',
    message: 'CatchAPI Backend is running',
    userTest: dummyUser,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
