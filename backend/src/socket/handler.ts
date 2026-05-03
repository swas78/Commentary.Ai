import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import { logger } from '../middleware/logger';

let io: Server | null = null;

// Track events per connection for rate limiting
const eventCounts = new Map<string, { count: number; resetAt: number }>();

function checkSocketRate(socketId: string): boolean {
  const now = Date.now();
  const entry = eventCounts.get(socketId);

  if (!entry || now > entry.resetAt) {
    eventCounts.set(socketId, { count: 1, resetAt: now + 60000 });
    return true;
  }

  if (entry.count >= 50) return false; // 50 events/minute
  entry.count++;
  return true;
}

export function setupSocketIO(server: HTTPServer): Server {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // ── /commentary namespace ────────────────────────────────
  const commentaryNs = io.of('/commentary');
  commentaryNs.on('connection', (socket: Socket) => {
    logger.info(`[Commentary] Client connected: ${socket.id}`);

    socket.on('join-session', (data: { roomCode: string; deviceName: string }) => {
      if (!checkSocketRate(socket.id)) { socket.emit('error', { message: 'Rate limit exceeded' }); return; }
      socket.join(data.roomCode);
      socket.to(data.roomCode).emit('device-update', {
        deviceId: socket.id, name: data.deviceName, type: 'web', status: 'connected',
      });
      socket.emit('session-joined', { sessionId: data.roomCode, roomCode: data.roomCode });
      logger.info(`[Commentary] ${data.deviceName} joined room ${data.roomCode}`);
    });

    socket.on('leave-session', () => {
      const rooms = Array.from(socket.rooms);
      rooms.forEach((room) => {
        if (room !== socket.id) {
          socket.to(room).emit('device-update', { deviceId: socket.id, name: '', type: 'web', status: 'disconnected' });
          socket.leave(room);
        }
      });
    });

    socket.on('new-commentary', (data) => {
      if (!checkSocketRate(socket.id)) return;
      const rooms = Array.from(socket.rooms);
      rooms.forEach((room) => {
        if (room !== socket.id) {
          socket.to(room).emit('new-commentary', {
            ...data, id: Date.now().toString(), timestamp: new Date().toISOString(),
          });
        }
      });
    });

    socket.on('sync-state', (data) => {
      if (!checkSocketRate(socket.id)) return;
      const rooms = Array.from(socket.rooms);
      rooms.forEach((room) => {
        if (room !== socket.id) socket.to(room).emit('sync-state', data);
      });
    });

    socket.on('disconnect', () => {
      eventCounts.delete(socket.id);
      logger.info(`[Commentary] Client disconnected: ${socket.id}`);
    });
  });

  // ── /devices namespace ───────────────────────────────────
  const devicesNs = io.of('/devices');
  devicesNs.on('connection', (socket: Socket) => {
    logger.info(`[Devices] Client connected: ${socket.id}`);
    socket.on('device-update', (data) => {
      socket.broadcast.emit('device-update', data);
    });
    socket.on('disconnect', () => logger.info(`[Devices] Disconnected: ${socket.id}`));
  });

  // ── /analytics namespace ─────────────────────────────────
  const analyticsNs = io.of('/analytics');
  analyticsNs.on('connection', (socket: Socket) => {
    logger.info(`[Analytics] Client connected: ${socket.id}`);
    socket.on('disconnect', () => logger.info(`[Analytics] Disconnected: ${socket.id}`));
  });

  logger.info('Socket.IO namespaces initialized: /commentary, /devices, /analytics');
  return io;
}

export function getIO(): Server {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
}
