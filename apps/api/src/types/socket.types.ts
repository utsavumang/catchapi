import { Types } from 'mongoose';

declare module 'socket.io' {
  interface SocketData {
    user: {
      _id: Types.ObjectId;
      name: string;
      email: string;
    };
  }
}
