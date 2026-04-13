import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { RegisterInput } from '@catchapi/shared'; // Importing from your monorepo!

import { connectDB } from './config/db';

dotenv.config();

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json());

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
