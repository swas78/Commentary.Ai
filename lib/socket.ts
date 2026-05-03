import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initSocket = (roomCode: string, deviceName: string) => {
  if (socket) return socket;

  const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';
  
  socket = io(`${SOCKET_URL}/commentary`, {
    transports: ['websocket'],
    autoConnect: true,
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket?.id);
    socket?.emit('join-session', { roomCode, deviceName });
  });

  socket.on('disconnect', () => {
    console.log('[Socket] Disconnected');
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.emit('leave-session');
    socket.disconnect();
    socket = null;
  }
};
