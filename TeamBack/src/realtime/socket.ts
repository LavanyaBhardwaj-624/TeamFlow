import { Server } from 'socket.io';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import type { Server as HttpServer } from 'node:http';
import { db } from '../prisma/db.ts';

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
    socket.join(`user:${socket.data.userId}`);
    socket.on('workspace:join', async (workspaceId: string) => {
       if (typeof workspaceId === 'string' && workspaceId && await isWorkspaceMember(workspaceId, socket.data.userId))
        socket.join(`ws:${workspaceId}`);
       });
    socket.on('workspace:leave', (workspaceId: string) => { 
      if (typeof workspaceId === 'string') void
       socket.leave(`ws:${workspaceId}`); });
    socket.on('channel:join', async (channelId: string) => {
      if (typeof channelId !== 'string') return;
      const member = await db.orm.public.ChannelMember.where({ channelId, memberId: socket.data.userId }).first();
      if (member) socket.join(`ch:${channelId}`);
    });
    socket.on('channel:leave', (channelId: string) => {
      if (typeof channelId === 'string') void socket.leave(`ch:${channelId}`);
    });
  });
  return io;
};

export const emitWorkspaceEvent = (workspaceId: string, event: string, payload: unknown): void => {
   io?.to(`ws:${workspaceId}`).emit(event, payload); 
  };

export const emitChannelEvent = (channelId: string, event: string, payload: unknown): void => {
  io?.to(`ch:${channelId}`).emit(event, payload);
};

export const emitUserEvent = (userId: string, event: string, payload: unknown): void => {
  io?.to(`user:${userId}`).emit(event, payload);
};

async function isWorkspaceMember(workspaceId: string, userId: string): Promise<boolean> {
  return Boolean(await db.orm.public.WorkspaceMember.where({ workspaceId, userId }).first());
}
