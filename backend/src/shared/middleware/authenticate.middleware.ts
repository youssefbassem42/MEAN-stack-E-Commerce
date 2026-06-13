import type { NextFunction, Request, Response } from 'express';
import { JwtTokenService } from '../../infrastructure/security/jwt-token.service.js';
import { AppError } from '../errors/app-error.js';

const tokenService = new JwtTokenService();

export interface AuthenticatedRequest extends Request {
  user: { userId: string; email: string };
}

export const authenticate = (request: Request, _response: Response, next: NextFunction): void => {
  const authHeader = request.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AppError('Authentication required.', 401));
  }

  const token = authHeader.slice(7);

  try {
    const payload = tokenService.verifyAccessToken(token);
    (request as AuthenticatedRequest).user = payload;
    next();
  } catch {
    next(new AppError('Invalid or expired token.', 401));
  }
};
