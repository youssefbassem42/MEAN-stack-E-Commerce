import type { Request, Response } from 'express';
import type { CatalogService } from '../../../application/services/catalog.service.js';

export const createCatalogController = (catalogService: CatalogService) => ({
  // ── Categories ────────────────────────────────────────────────
  getCategories: async (_request: Request, response: Response) => {
    const result = await catalogService.getCategories();
    return response.status(200).json(result);
  },

  createCategory: async (request: Request, response: Response) => {
    const result = await catalogService.createCategory(request.body);
    return response.status(201).json(result);
  },

  updateCategory: async (request: Request, response: Response) => {
    const result = await catalogService.updateCategory(request.params['id'] as string, request.body);
    return response.status(200).json(result);
  },

  deleteCategory: async (request: Request, response: Response) => {
    const result = await catalogService.deleteCategory(request.params['id'] as string);
    return response.status(200).json(result);
  },

  // ── Products ──────────────────────────────────────────────────
  getProducts: async (request: Request, response: Response) => {
    const { categoryId, page, limit } = request.query as Record<string, string | undefined>;
    const result = await catalogService.getProducts({
      categoryId: categoryId || undefined,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
    return response.status(200).json(result);
  },

  searchProducts: async (request: Request, response: Response) => {
    const { q, category, minPrice, maxPrice, sort, page, limit } = request.query as Record<string, string | undefined>;
    const result = await catalogService.searchProducts({
      q: q || undefined,
      category: category || undefined,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      sort: sort || undefined,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
    return response.status(200).json(result);
  },

  getProductById: async (request: Request, response: Response) => {
    const result = await catalogService.getProductById(request.params['id'] as string);
    return response.status(200).json(result);
  },

  createProduct: async (request: Request, response: Response) => {
    const result = await catalogService.createProduct(request.body);
    return response.status(201).json(result);
  },

  updateProduct: async (request: Request, response: Response) => {
    const result = await catalogService.updateProduct(request.params['id'] as string, request.body);
    return response.status(200).json(result);
  },

  deleteProduct: async (request: Request, response: Response) => {
    const result = await catalogService.deleteProduct(request.params['id'] as string);
    return response.status(200).json(result);
  },
});
