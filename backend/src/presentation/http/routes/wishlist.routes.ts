import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getOrCreateWishlist,
  addToWishlist,
  removeFromWishlist,
  moveToCart,
  moveAllToCart,
} from '../controllers/wishlist.controller.js';
import { authenticate } from '../../../shared/middleware/authenticate.middleware.js';
import { validateRequest } from '../../../shared/middleware/validate-request.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', getOrCreateWishlist);

router.post(
  '/',
  [body('productId').isMongoId().withMessage('Valid productId is required.')],
  validateRequest,
  addToWishlist,
);

router.delete(
  '/:id',
  [param('id').isMongoId().withMessage('Valid product ID is required.')],
  validateRequest,
  removeFromWishlist,
);

router.post(
  '/move-to-cart',
  [body('productId').isMongoId().withMessage('Valid productId is required.')],
  validateRequest,
  moveToCart,
);

router.post('/move-all', moveAllToCart);

export const createWishlistRouter = () => router;
