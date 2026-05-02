import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { env } from './env';
import { logger } from '../utils/logger';

let io: Server;

export const initSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: env.FRONTEND_URL,
      credentials: true,
    },
    pingTimeout: 20000,
    pingInterval: 25000,
  });

  io.on('connection', (socket: Socket) => {
    logger.info({ socketId: socket.id }, 'Socket client connected');

    socket.on('disconnect', (reason: string) => {
      logger.info(
        { socketId: socket.id, reason },
        'Socket client disconnected'
      );
    });
  });

  logger.info('Socket.io server initialised');
  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error(
      'Socket.io has not been initialised. Call initSocket first.'
    );
  }
  return io;
};
