import { Server } from 'socket.io';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import type { Server as HttpServer } from 'node:http';

let io: Server | null = null;

export const initRealtime = (server: HttpServer): Server => {
  io = new Server(server, { cors: { origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true } });
  io.use((socket, next) => {
    const token = typeof socket.handshake.auth?.token === 'string' ? socket.handshake.auth.token : '';
    try {
       const payload = jwt.verify(token, process.env.ACCESS_KEY as string) as JwtPayload; 
       socket.data.userId = payload.Id; 
       next(); 
      } 
      catch { 
        next(new Error('Unauthorized')); 
      }
  });
  io.on('connection', (socket) => {
    socket.on('workspace:join', (workspaceId: string) => {
       if (typeof workspaceId === 'string' && workspaceId) 
        socket.join(`workspace:${workspaceId}`);
       });
    socket.on('workspace:leave', (workspaceId: string) => { 
      if (typeof workspaceId === 'string') void
       socket.leave(`workspace:${workspaceId}`); });
  });
  return io;
};

export const emitWorkspaceEvent = (workspaceId: string, event: string, payload: unknown): void => {
   io?.to(`workspace:${workspaceId}`).emit(event, payload); 
  };
