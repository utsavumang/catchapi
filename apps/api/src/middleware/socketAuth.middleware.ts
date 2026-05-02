import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { env } from '../config/env';
import { logger } from '../utils/logger';

interface DecodedToken {
  userId: string;
  iat: number;
  exp: number;
}

type SocketNext = (err?: Error) => void;

export const socketAuthMiddleware = async (
  socket: Socket,
  next: SocketNext
): Promise<void> => {
  try {
    const token = socket.handshake.auth?.token as string | undefined;

    if (!token) {
      logger.warn(
        { socketId: socket.id },
        'Socket connection rejected — no token provided'
      );
      return next(new Error('Authentication required'));
    }

    let decoded: DecodedToken;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET) as DecodedToken;
    } catch {
      logger.warn(
        { socketId: socket.id },
        'Socket connection rejected — invalid or expired token'
      );
      return next(new Error('Invalid or expired token'));
    }

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      logger.warn(
        { socketId: socket.id },
        'Socket connection rejected — user no longer exists'
      );
      return next(new Error('User not found'));
    }

    socket.data.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
    };

    logger.info(
      { socketId: socket.id, userId: user._id },
      'Socket client authenticated'
    );

    next();
  } catch (err) {
    logger.error({ err }, 'Unexpected error in socket auth middleware');
    next(new Error('Authentication failed'));
  }
};
