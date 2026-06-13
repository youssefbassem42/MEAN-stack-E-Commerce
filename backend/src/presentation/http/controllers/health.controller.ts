import type { Request, Response } from 'express';
import { checkHealth } from '../../../application/use-cases/check-health.use-case.js';

export const getHealth = (_request: Request, response: Response) => {
  return response.status(200).json(checkHealth());
};
