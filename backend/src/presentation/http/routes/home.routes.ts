import { Router, type Request, type Response } from 'express';
import type { CatalogService } from '../../../application/services/catalog.service.js';

export const createHomeRouter = (catalogService: CatalogService) => {
  const router = Router();

  router.get('/featured', async (request: Request, response: Response) => {
    const limit = request.query['limit'] ? parseInt(request.query['limit'] as string, 10) : 8;
    const result = await catalogService.getFeaturedProducts(limit);
    return response.status(200).json(result);
  });

  router.get('/new-arrivals', async (request: Request, response: Response) => {
    const limit = request.query['limit'] ? parseInt(request.query['limit'] as string, 10) : 8;
    const result = await catalogService.getNewArrivals(limit);
    return response.status(200).json(result);
  });

  router.get('/best-sellers', async (request: Request, response: Response) => {
    const limit = request.query['limit'] ? parseInt(request.query['limit'] as string, 10) : 8;
    const result = await catalogService.getBestSellers(limit);
    return response.status(200).json(result);
  });

  router.get('/trending', async (request: Request, response: Response) => {
    const limit = request.query['limit'] ? parseInt(request.query['limit'] as string, 10) : 8;
    const result = await catalogService.getTrendingProducts(limit);
    return response.status(200).json(result);
  });

  return router;
};
