import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import { connectDB } from './config/db';
import { connectRedis } from './config/redis';
import { setupSocketIO } from './socket/handler';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './middleware/logger';
import commentaryRoutes from './routes/commentary';
import deviceRoutes from './routes/devices';
import analyticsRoutes from './routes/analytics';
import syncRoutes from './routes/sync';
import clipRoutes from './routes/clips';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

// ── Middleware ─────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000', credentials: true }));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Health Check ──────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ── Routes ────────────────────────────────────────────────────
app.use('/api/commentary', commentaryRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/clips', clipRoutes);

// ── Error Handler ─────────────────────────────────────────────
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────────
async function start() {
  try {
    await connectDB();
    logger.info('MongoDB connected');

    await connectRedis();
    logger.info('Redis connected');

    setupSocketIO(server);
    logger.info('Socket.IO initialized');

    server.listen(PORT, () => {
      logger.info(`🏏 Cricket Commentary AI Backend running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

export default app;
