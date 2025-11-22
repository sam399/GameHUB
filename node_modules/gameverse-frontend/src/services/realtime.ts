/// <reference types="vite/client" />

import { io, Socket } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

let socket: Socket | null = null;

export function connectRealtime(token?: string): Socket {
  if (socket) return socket;
  const authToken = token || localStorage.getItem('token') || undefined;
  socket = io(BACKEND_URL, { transports: ['websocket', 'polling'], auth: { token: authToken } }) as Socket;
  socket.on('connect', () => console.log('Realtime connected', socket?.id));
  socket.on('disconnect', () => console.log('Realtime disconnected'));
  return socket;
}

export function on(event: string, cb: (...args: any[]) => void) {
  const s = connectRealtime();
  if (!s) return;
  s.on(event, cb);
}

export function off(event: string, cb?: (...args: any[]) => void) {
  if (!socket) return;
  if (cb) socket.off(event, cb);
  else socket.removeAllListeners(event);
}

export function emit(event: string, data?: any) {
  const s = socket || connectRealtime();
  s.emit(event, data);
}

export function disconnectRealtime() {
  if (!socket) return;
  socket.disconnect();
  socket = null;
}

export default { connectRealtime, on, off, emit, disconnectRealtime };
