import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import { config } from './config/env';
import { logger } from './utils/logger';
import { initDb } from './config/db';
import { setupSocketIO } from './sockets/trackingSocket';
import { seed } from './seed/seedData';

async function startServer() {
  try {
    // Initialize Database
    initDb();

    // Auto-seed database if fresh
    await seed();

    const server = http.createServer(app);

    // Initialize WebSockets
    const io = new Server(server, {
      cors: {
        origin: config.corsOrigin,
        methods: ['GET', 'POST'],
      },
    });

    setupSocketIO(io);

    server.listen(config.port, () => {
      logger.info(`==================================================`);
      logger.info(`🚀 CareLink Backend Server running in ${config.nodeEnv.toUpperCase()} mode`);
      logger.info(`🌐 Web Platform & API: http://localhost:${config.port}`);
      logger.info(`📡 REST API Endpoint: http://localhost:${config.port}/api/v1`);
      logger.info(`⚡ Socket.io Real-time tracking enabled`);
      logger.info(`==================================================`);
    });
  } catch (error: any) {
    logger.error('Failed to start CareLink server:', error);
    process.exit(1);
  }
}

startServer();
