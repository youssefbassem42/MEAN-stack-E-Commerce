import { Router } from 'express';
import { param, body } from 'express-validator';
import { getOrders, getOrderById, updateOrderStatus } from '../controllers/order.controller.js';
import { authenticate } from '../../../shared/middleware/authenticate.middleware.js';
import { validateRequest } from '../../../shared/middleware/validate-request.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', getOrders);

router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Valid order ID is required.')],
  validateRequest,
  getOrderById,
);

router.put(
  '/:id/status',
  [
    param('id').isMongoId().withMessage('Valid order ID is required.'),
    body('status').isString().notEmpty().withMessage('Status is required.'),
  ],
  validateRequest,
  updateOrderStatus,
);

export const createOrderRouter = () => router;
