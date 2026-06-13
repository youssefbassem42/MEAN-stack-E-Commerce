import type { Request, Response } from 'express';
import type { ProfileService } from '../../../application/services/profile.service.js';
import type { AuthenticatedRequest } from '../../../shared/middleware/authenticate.middleware.js';

const asAuth = (req: Request) => req as AuthenticatedRequest;

export const createProfileController = (profileService: ProfileService) => ({
  getProfile: async (request: Request, response: Response) => {
    const result = await profileService.getProfile(asAuth(request).user.userId);
    return response.status(200).json(result);
  },

  updateProfile: async (request: Request, response: Response) => {
    const result = await profileService.updateProfile(asAuth(request).user.userId, request.body);
    return response.status(200).json(result);
  },

  changePassword: async (request: Request, response: Response) => {
    const result = await profileService.changePassword(asAuth(request).user.userId, request.body);
    return response.status(200).json(result);
  },

  getAddresses: async (request: Request, response: Response) => {
    const result = await profileService.getAddresses(asAuth(request).user.userId);
    return response.status(200).json(result);
  },

  createAddress: async (request: Request, response: Response) => {
    const result = await profileService.createAddress(asAuth(request).user.userId, request.body);
    return response.status(201).json(result);
  },

  updateAddress: async (request: Request, response: Response) => {
    const result = await profileService.updateAddress(asAuth(request).user.userId, request.params['id'] as string, request.body);
    return response.status(200).json(result);
  },

  deleteAddress: async (request: Request, response: Response) => {
    const result = await profileService.deleteAddress(asAuth(request).user.userId, request.params['id'] as string);
    return response.status(200).json(result);
  },
});

