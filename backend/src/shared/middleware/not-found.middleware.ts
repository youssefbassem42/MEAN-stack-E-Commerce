import type { NextFunction, Request, Response } from 'express';
import { NotFoundError } from '../errors/not-found.error.js';

export const notFoundHandler = (
  _request: Request,
  _response: Response,
  next: NextFunction,
) => {
  next(new NotFoundError());
};
