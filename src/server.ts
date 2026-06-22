import type { Server } from 'http';
import app from './app';
import config from './config/env';
import db from './config/db';
import logger from './utils/logger';

let server: Server | undefined;

async function start(): Promise<void> {
  try {
    // Verify DB connectivity before accepting traffic
    await db.raw('SELECT 1');
    logger.info('Database connection established successfully.');

    server = app.listen(config.port, () => {
      logger.info(`Server running in ${config.env} mode on port ${config.port}`);
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error(`Failed to start server: ${message}`);
    process.exit(1);
  }
}

async function shutdown(signal: string): Promise<void> {
  logger.info(`${signal} received. Shutting down gracefully...`);
  if (server) {
    server.close(() => {
      logger.info('HTTP server closed.');
    });
  }
  try {
    await db.destroy();
    logger.info('Database connections closed.');
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error(`Error closing database connections: ${message}`);
  } finally {
    process.exit(0);
  }
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));

process.on('unhandledRejection', (reason: unknown) => {
  logger.error(`Unhandled Rejection: ${String(reason)}`);
});

process.on('uncaughtException', (err: Error) => {
  logger.error(`Uncaught Exception: ${err.stack || err.message}`);
  process.exit(1);
});

start();
