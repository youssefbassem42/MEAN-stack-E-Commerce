import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getOrCreateCart,
  addItemToCart,
  updateCartItem,
  deleteCartItem,
  updateShippingMethod,
} from '../controllers/cart.controller.js';
import { authenticate } from '../../../shared/middleware/authenticate.middleware.js';
import { validateRequest } from '../../../shared/middleware/validate-request.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', getOrCreateCart);

router.post(
  '/items',
  [
    body('productId').isMongoId().withMessage('Valid productId is required.'),
    body('quantity').optional().isInt({ min: 1 }).withMessage('Quantity must be a positive integer.'),
  ],
  validateRequest,
  addItemToCart,
);

router.put(
  '/items/:id',
  [
    param('id').isMongoId().withMessage('Valid product ID is required.'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1.'),
  ],
  validateRequest,
  updateCartItem,
);

router.delete(
  '/items/:id',
  [param('id').isMongoId().withMessage('Valid product ID is required.')],
  validateRequest,
  deleteCartItem,
);

router.put(
  '/shipping',
  [body('shippingMethod').isIn(['COD', 'CARD']).withMessage('shippingMethod must be COD or CARD.')],
  validateRequest,
  updateShippingMethod,
);

export const createCartRouter = () => router;
