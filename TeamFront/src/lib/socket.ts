import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '@/lib/api';

export type SocketPayload = Record<string, unknown>;
export const socket: Socket = io(API_BASE_URL, { autoConnect: false, withCredentials: true });

export function connectSocket(token: string): void { 
  socket.auth = { token }; if (!socket.connected) socket.connect(); }
export function disconnectSocket(): void { if (socket.connected) socket.disconnect(); }
export function useSocket(event?: string, callback?: (payload: SocketPayload) => void) {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const callbackRef = useRef(callback); callbackRef.current = callback;
  useEffect(() => { const onConnect = () => setIsConnected(true); const onDisconnect = () => setIsConnected(false); 
    socket.on('connect', onConnect); 
    socket.on('disconnect', onDisconnect);
     const handler = (payload: SocketPayload) => callbackRef.current?.(payload);
      if (event) socket.on(event, handler); return () => { socket.off('connect', onConnect);
         socket.off('disconnect', onDisconnect);
          if (event) socket.off(event, handler); }; }, [event]);
  return {
     socket, isConnected, emit: (name: string, payload: unknown) => socket.emit(name, payload) 
    };
}
