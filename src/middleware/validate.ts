import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { Schema } from 'joi';
import { ApiError } from '../utils/ApiError';

export type ValidationSource = 'body' | 'query' | 'params';

/**
 * Returns an Express middleware that validates a part of the request
 * (body, query, or params) against the given Joi schema.
 */
function validate(schema: Schema, source: ValidationSource = 'body'): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const details = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      throw ApiError.badRequest('Validation failed', 'VALIDATION_ERROR', details);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (req as any)[source] = value;
    next();
  };
}

export default validate;
