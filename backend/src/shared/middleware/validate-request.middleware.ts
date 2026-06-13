import type { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { AppError } from '../errors/app-error.js';

export const validateRequest = (
  request: Request,
  _response: Response,
  next: NextFunction,
) => {
  const result = validationResult(request);

  if (!result.isEmpty()) {
    return next(new AppError('Validation failed.', 422, result.mapped()));
  }

  return next();
};
