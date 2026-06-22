import 'express-async-errors'; 

import express, { type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import config from './config/env';
import logger from './utils/logger';
import apiRoutes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(cors());

// Gzip compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// HTTP request logging (skip in test to keep test output clean)
if (!config.isTest) {
  app.use(
    morgan(config.isProduction ? 'combined' : 'dev', {
      stream: {
        write: (message: string) => (logger.http ? logger.http(message.trim()) : logger.info(message.trim())),
      },
    })
  );
}

// Rate limiting (applies to all /api routes)
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests, please try again later.' },
  },
});
app.use('/api', limiter);

// Routes
app.use('/api', apiRoutes);

// Root
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Property Rental Management System API',
    docs: '/api/health',
  });
});

// 404 + error handlers (must be registered last)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
