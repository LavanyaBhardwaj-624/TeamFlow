import { useEffect, useRef, useState } from 'react';
import { APP_CONFIG } from '@/config/constants';

/**
 * Socket.IO client interface contract.
 * Mirrors socket.io-client structure for future plug-and-play backend pairing.
 */
export interface SocketStub {
  connected: boolean;
  id: string | null;
  emit: (event: string, ...args: any[]) => void;
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string, callback?: (...args: any[]) => void) => void;
  connect: () => void;
  disconnect: () => void;
}

type EventListenerMap = Map<string, Set<(...args: any[]) => void>>;

class MockSocketClient implements SocketStub {
  connected: boolean = false;
  id: string | null = null;
  private listeners: EventListenerMap = new Map();

  connect() {
    if (!APP_CONFIG.enableSocketStub) {
      // In dormant mode until backend WebSocket server URL is configured
      return;
    }
    this.connected = true;
    this.id = `mock_socket_${Math.random().toString(36).substring(2, 9)}`;
    this.trigger('connect');
  }

  disconnect() {
    this.connected = false;
    this.id = null;
    this.trigger('disconnect');
  }

  emit(event: string, ...args: any[]) {
    // In production, transmits binary/JSON frame over WebSocket
    if (APP_CONFIG.enableSocketStub && process.env.NODE_ENV === 'development') {
      console.debug(`[Socket.IO Stub emit]: ${event}`, args);
    }
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }

  off(event: string, callback?: (...args: any[]) => void) {
    if (!callback) {
      this.listeners.delete(event);
      return;
    }
    this.listeners.get(event)?.delete(callback);
  }

  private trigger(event: string, ...args: any[]) {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach((fn) => fn(...args));
    }
  }
}

// Singleton instance
export const socket: SocketStub = new MockSocketClient();

/**
 * Hook to manage Socket.IO lifecycle and event subscriptions within components.
 */
export function useSocket(event?: string, callback?: (...args: any[]) => void) {
  const [isConnected, setIsConnected] = useState<boolean>(socket.connected);
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    let eventHandler: ((...args: any[]) => void) | null = null;
    if (event) {
      eventHandler = (...args: any[]) => {
        callbackRef.current?.(...args);
      };
      socket.on(event, eventHandler);
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      if (event && eventHandler) {
        socket.off(event, eventHandler);
      }
    };
  }, [event]);

  return {
    socket,
    isConnected,
    emit: (ev: string, ...payload: any[]) => socket.emit(ev, ...payload),
  };
}

