import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';
import logger from '../utils/logger';
import config from '../config/env';

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`, 'ROUTE_NOT_FOUND'));
}

interface KnownDriverError extends Error {
  code?: string;
  type?: string;
}

function normalizeError(err: unknown): ApiError {
  if (err instanceof ApiError) return err;

  const driverError = err as KnownDriverError;

  // PostgreSQL unique violation
  if (driverError.code === '23505') {
    return ApiError.conflict('A record with this value already exists', 'DUPLICATE_RECORD');
  }
  // PostgreSQL foreign key violation
  if (driverError.code === '23503') {
    return ApiError.badRequest('Referenced record does not exist', 'INVALID_REFERENCE');
  }
  // PostgreSQL check constraint violation
  if (driverError.code === '23514') {
    return ApiError.badRequest('Value violates a database constraint', 'CONSTRAINT_VIOLATION');
  }
  // JSON body parse error
  if (driverError.type === 'entity.parse.failed') {
    return ApiError.badRequest('Malformed JSON in request body', 'INVALID_JSON');
  }

  const message = err instanceof Error ? err.message : 'Internal server error';
  return ApiError.internal(config.isProduction ? 'Internal server error' : message);
}


export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  const apiError = normalizeError(err);
  const originalError = err instanceof Error ? err : undefined;

  if (apiError.statusCode >= 500) {
    logger.error(originalError?.stack || apiError.message);
  } else {
    logger.warn(`${apiError.statusCode} ${apiError.errorCode}: ${apiError.message}`);
  }

  const response: {
    success: false;
    error: {
      code: string;
      message: string;
      details?: ApiError['details'];
      stack?: string;
    };
  } = {
    success: false,
    error: {
      code: apiError.errorCode,
      message: apiError.message,
    },
  };

  if (apiError.details) {
    response.error.details = apiError.details;
  }

  if (!config.isProduction && apiError.statusCode >= 500) {
    response.error.stack = originalError?.stack;
  }

  res.status(apiError.statusCode).json(response);
}

export default { errorHandler, notFoundHandler };
