import { Router } from 'express';
import { body, param, query } from 'express-validator';
import type { CatalogService } from '../../../application/services/catalog.service.js';
import { validateRequest } from '../../../shared/middleware/validate-request.middleware.js';
import { createCatalogController } from '../controllers/catalog.controller.js';

const mongoId = (field: string) =>
  param(field).isMongoId().withMessage(`Invalid ${field}.`);

const slugValidation = body('slug')
  .optional()
  .isString()
  .trim()
  .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  .withMessage('Slug must be lowercase letters, numbers, and hyphens only.');

export const createCatalogRouter = (catalogService: CatalogService) => {
  const router = Router();
  const controller = createCatalogController(catalogService);

  // ── Categories ────────────────────────────────────────────────
  router.get('/categories', controller.getCategories);

  router.post(
    '/categories',
    [
      body('name').isString().trim().isLength({ min: 1 }).withMessage('Category name is required.'),
      slugValidation,
    ],
    validateRequest,
    controller.createCategory,
  );

  router.put(
    '/categories/:id',
    [
      mongoId('id'),
      body('name').optional().isString().trim().isLength({ min: 1 }),
      slugValidation,
    ],
    validateRequest,
    controller.updateCategory,
  );

  router.delete('/categories/:id', mongoId('id'), validateRequest, controller.deleteCategory);

  // ── Products ──────────────────────────────────────────────────
  router.get(
    '/products/search',
    [
      query('q').optional().isString().trim(),
      query('category').optional().isString().trim(),
      query('minPrice').optional().isFloat({ min: 0 }).withMessage('minPrice must be non-negative.'),
      query('maxPrice').optional().isFloat({ min: 0 }).withMessage('maxPrice must be non-negative.'),
      query('sort').optional().isString().trim(),
      query('page').optional().isInt({ min: 1 }),
      query('limit').optional().isInt({ min: 1, max: 100 }),
    ],
    validateRequest,
    controller.searchProducts,
  );

  router.get(
    '/products',
    [
      query('categoryId').optional().isMongoId().withMessage('Invalid categoryId.'),
      query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer.'),
      query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be 1–100.'),
    ],
    validateRequest,
    controller.getProducts,
  );

  router.get('/products/:id', mongoId('id'), validateRequest, controller.getProductById);

  router.post(
    '/products',
    [
      body('title').isString().trim().isLength({ min: 1 }).withMessage('Title is required.'),
      slugValidation,
      body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number.'),
      body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer.'),
      body('description').isString().trim().isLength({ min: 1 }).withMessage('Description is required.'),
      body('images').optional().isArray(),
      body('images.*').optional().isURL().withMessage('Each image must be a valid URL.'),
      body('categoryId').isMongoId().withMessage('A valid categoryId is required.'),
      body('tags').optional().isArray(),
      body('tags.*').optional().isString().trim(),
    ],
    validateRequest,
    controller.createProduct,
  );

  router.put(
    '/products/:id',
    [
      mongoId('id'),
      body('title').optional().isString().trim().isLength({ min: 1 }),
      slugValidation,
      body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a non-negative number.'),
      body('stock').optional().isInt({ min: 0 }),
      body('description').optional().isString().trim().isLength({ min: 1 }),
      body('images').optional().isArray(),
      body('images.*').optional().isURL(),
      body('categoryId').optional().isMongoId().withMessage('Invalid categoryId.'),
      body('tags').optional().isArray(),
      body('tags.*').optional().isString().trim(),
    ],
    validateRequest,
    controller.updateProduct,
  );

  router.delete('/products/:id', mongoId('id'), validateRequest, controller.deleteProduct);

  return router;
};
