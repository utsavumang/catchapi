import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { AppError } from '../utils/AppError';
import { catchAsync } from '../utils/catchAsync';
import { env } from '../config/env';
import { Types } from 'mongoose';
export interface AuthRequest extends Request {
  user?: {
    _id: Types.ObjectId;
    name: string;
    email: string;
  };
}

interface DecodedToken {
  userId: string;
  iat: number;
  exp: number;
}

export const protect = catchAsync(
  async (req: AuthRequest, res: Response, next: NextFunction) => {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AppError(
        'Not authorized to access this route. No token provided.',
        401
      );
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as DecodedToken;

      const currentUser = await User.findById(decoded.userId).select(
        '-password'
      );

      if (!currentUser) {
        throw new AppError(
          'The user belonging to this token no longer exists.',
          401
        );
      }

      req.user = currentUser;

      next();
    } catch {
      throw new AppError('Not authorized. Token failed or expired.', 401);
    }
  }
);
