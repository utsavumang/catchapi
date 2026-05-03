import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { env } from './env';
import { logger } from '../utils/logger';
import { socketAuthMiddleware } from '../middleware/socketAuth.middleware';
import { SOCKET_EVENTS } from '@catchapi/shared';
import '../types/socket.types';

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

  io.use(socketAuthMiddleware);

  io.on('connection', (socket: Socket) => {
    logger.info(
      {
        socketId: socket.id,
        userId: socket.data.user._id,
        userName: socket.data.user.name,
      },
      'Socket client connected'
    );

    socket.on(SOCKET_EVENTS.JOIN_ENDPOINT, (urlId: string) => {
      const room = `endpoint:${urlId}`;

      // Client should watch only endpoint at a time
      const currentRooms = Array.from(socket.rooms).filter(
        (r) => r !== socket.id && r.startsWith('endpoint:')
      );
      currentRooms.forEach((r) => socket.leave(r));

      socket.join(room);

      socket.emit(SOCKET_EVENTS.JOINED, { room, urlId });

      logger.info(
        {
          socketId: socket.id,
          userId: socket.data.user._id,
          room,
        },
        'Socket client joined room'
      );
    });

    socket.on(SOCKET_EVENTS.LEAVE_ENDPOINT, (urlId: string) => {
      const room = `endpoint:${urlId}`;
      socket.leave(room);

      logger.info(
        {
          socketId: socket.id,
          userId: socket.data.user._id,
          room,
        },
        'Socket client left room'
      );
    });

    socket.on('disconnect', (reason: string) => {
      logger.info(
        {
          socketId: socket.id,
          userId: socket.data.user._id,
          reason,
        },
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
