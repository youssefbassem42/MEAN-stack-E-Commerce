import type { Request, Response } from 'express';
import type { AuthService } from '../../../application/services/auth.service.js';

export const createAuthController = (authService: AuthService) => ({
  register: async (request: Request, response: Response) => {
    const result = await authService.register(request.body);
    return response.status(201).json(result);
  },
  login: async (request: Request, response: Response) => {
    const result = await authService.login(request.body);
    return response.status(200).json(result);
  },
  logout: async (request: Request, response: Response) => {
    const { refreshToken } = request.body;
    const result = await authService.logout(refreshToken);
    return response.status(200).json(result);
  },
  verifyEmail: async (request: Request, response: Response) => {
    const result = await authService.verifyEmail(request.body.token);
    return response.status(200).json(result);
  },
  resendVerification: async (request: Request, response: Response) => {
    const result = await authService.resendVerificationEmail(request.body.email);
    return response.status(200).json(result);
  },
  forgotPassword: async (request: Request, response: Response) => {
    const result = await authService.forgotPassword(request.body.email);
    return response.status(200).json(result);
  },
  resetPassword: async (request: Request, response: Response) => {
    const result = await authService.resetPassword(request.body);
    return response.status(200).json(result);
  },
});
