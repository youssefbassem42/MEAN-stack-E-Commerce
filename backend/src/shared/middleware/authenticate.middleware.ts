import type { NextFunction, Request, Response } from 'express';
import { JwtTokenService } from '../../infrastructure/security/jwt-token.service.js';
import { UserModel } from '../../infrastructure/database/models/user.model.js';
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

export const adminOnly = async (request: Request, _response: Response, next: NextFunction): Promise<void> => {
  const authReq = request as AuthenticatedRequest;
  if (!authReq.user) {
    return next(new AppError('Authentication required.', 401));
  }

  try {
    const user = await UserModel.findById(authReq.user.userId).exec();
    if (!user || user.role !== 'admin') {
      return next(new AppError('Forbidden: Admin access only.', 403));
    }
    next();
  } catch (error) {
    next(error);
  }
};
