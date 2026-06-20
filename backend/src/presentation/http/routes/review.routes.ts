import { Router } from 'express';
import { body, param } from 'express-validator';
import { createReview, getReviewsByProductId } from '../controllers/review.controller.js';
import { authenticate } from '../../../shared/middleware/authenticate.middleware.js';
import { validateRequest } from '../../../shared/middleware/validate-request.middleware.js';

const router = Router();

router.post(
  '/',
  authenticate,
  [
    body('productId').isMongoId().withMessage('Valid productId is required.'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5.'),
    body('comment').isString().trim().isLength({ min: 1 }).withMessage('Comment must not be empty.'),
  ],
  validateRequest,
  createReview,
);

router.get(
  '/:productId',
  [param('productId').isMongoId().withMessage('Valid productId is required.')],
  validateRequest,
  getReviewsByProductId,
);

export const createReviewRouter = () => router;
