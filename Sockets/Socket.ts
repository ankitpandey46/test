import { Server, Socket } from 'socket.io';
import { verifyToken } from '../Utils/jwt';
import * as sessionService from '../Services/session';


const userSocketMap = new Map<number, string>();

export function initSocket(io: Server) {
  io.use(async (socket: Socket, next) => {
    try {
     
      const cookieHeader = socket.handshake.headers.cookie;
      if (!cookieHeader) return next(new Error('No cookies sent'));

      const tokenCookie = cookieHeader.split('; ').find((c) => c.startsWith('token='));
      if (!tokenCookie) return next(new Error('No token cookie found'));

      const token = tokenCookie.split('=')[1];
      if (!token) return next(new Error('Token is empty'));

      const payload = verifyToken(token);
      if (!payload) return next(new Error('Invalid token'));

      const session = await sessionService.findSessionByToken(token);
      if (!session || session.expiresAt < new Date()) {
        return next(new Error('Session expired or invalid'));
      }

      (socket as any).userId = payload.userId;

      const existingSocketId = userSocketMap.get(payload.userId);
      if (existingSocketId && existingSocketId !== socket.id) {
        const existingSocket = io.sockets.sockets.get(existingSocketId);
        existingSocket?.disconnect(true);
      }

      userSocketMap.set(payload.userId, socket.id);

      next();
    } catch (err) {
       next(err as Error);
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId;
    console.log(`User connected: ${userId} with socket id: ${socket.id}`);

    socket.on('message', (data) => {
      console.log(`Received message from user ${userId}:`, data);
      socket.emit('messageResponse', { success: true, data: data, userId:userId});
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId}`);
      userSocketMap.delete(userId);
    });
  });
}
