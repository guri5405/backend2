import jwt from 'jsonwebtoken';
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import config from '../config/env';
import { ApiError } from '../utils/ApiError';
import UserModel from '../models/userModel';
import type { UserRole } from '../types/models';

interface AccessTokenPayload {
  sub: number;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw ApiError.unauthorized('Missing or malformed Authorization header', 'NO_TOKEN');
  }

  let payload: AccessTokenPayload;
  try {
    payload = jwt.verify(token, config.jwt.secret) as unknown as AccessTokenPayload;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw ApiError.unauthorized('Token has expired', 'TOKEN_EXPIRED');
    }
    throw ApiError.unauthorized('Invalid token', 'INVALID_TOKEN');
  }

  const user = await UserModel.findById(Number(payload.sub));
  if (!user) {
    throw ApiError.unauthorized('User belonging to this token no longer exists', 'USER_NOT_FOUND');
  }

  req.user = user; // { id, name, email, role, created_at, updated_at }
  next();
}

export function authorize(...allowedRoles: UserRole[]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required');
    }
    if (!allowedRoles.includes(req.user.role)) {
      throw ApiError.forbidden(
        `Access denied. Required role(s): ${allowedRoles.join(', ')}`,
        'INSUFFICIENT_ROLE'
      );
    }
    next();
  };
}

export default { authenticate, authorize };
