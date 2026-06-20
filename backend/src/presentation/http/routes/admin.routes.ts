import { Router } from 'express';
import { param, body } from 'express-validator';
import {
  getAdminStats,
  getAdminUsers,
  updateUserRole,
  getAdminOrders,
  getAdminInventoryLogs
} from '../controllers/admin.controller.js';
import { authenticate, adminOnly } from '../../../shared/middleware/authenticate.middleware.js';
import { validateRequest } from '../../../shared/middleware/validate-request.middleware.js';

const router = Router();

router.use(authenticate);
router.use(adminOnly);

router.get('/stats', getAdminStats);
router.get('/users', getAdminUsers);
router.put(
  '/users/:id/role',
  [
    param('id').isMongoId().withMessage('Valid user ID is required.'),
    body('role').isString().notEmpty().withMessage('Role is required.'),
  ],
  validateRequest,
  updateUserRole
);
router.get('/orders', getAdminOrders);
router.get('/inventory-logs', getAdminInventoryLogs);

export const createAdminRouter = () => router;
