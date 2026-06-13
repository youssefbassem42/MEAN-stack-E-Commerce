import { Router } from 'express';
import { body, param } from 'express-validator';
import type { ProfileService } from '../../../application/services/profile.service.js';
import { authenticate } from '../../../shared/middleware/authenticate.middleware.js';
import { validateRequest } from '../../../shared/middleware/validate-request.middleware.js';
import { createProfileController } from '../controllers/profile.controller.js';

const nameField = (field: string) =>
  body(field).optional().isString().trim().isLength({ min: 1 }).withMessage(`${field} must not be empty.`);

const addressBodyValidation = [
  body('city').isString().trim().isLength({ min: 1 }).withMessage('City is required.'),
  body('street').isString().trim().isLength({ min: 1 }).withMessage('Street is required.'),
  body('building').isString().trim().isLength({ min: 1 }).withMessage('Building is required.'),
  body('apartment').isString().trim().isLength({ min: 1 }).withMessage('Apartment is required.'),
  body('isDefault').optional().isBoolean(),
];

const addressUpdateValidation = [
  body('city').optional().isString().trim().isLength({ min: 1 }),
  body('street').optional().isString().trim().isLength({ min: 1 }),
  body('building').optional().isString().trim().isLength({ min: 1 }),
  body('apartment').optional().isString().trim().isLength({ min: 1 }),
  body('isDefault').optional().isBoolean(),
];

export const createProfileRouter = (profileService: ProfileService) => {
  const router = Router();
  const controller = createProfileController(profileService);

  router.get('/profile', authenticate, controller.getProfile);

  router.put(
    '/profile',
    authenticate,
    [nameField('firstName'), nameField('lastName')],
    validateRequest,
    controller.updateProfile,
  );

  router.put(
    '/profile/change-password',
    authenticate,
    [
      body('currentPassword').isString().notEmpty().withMessage('Current password is required.'),
      body('newPassword').isString().isLength({ min: 8 }).withMessage('New password must be at least 8 characters.'),
    ],
    validateRequest,
    controller.changePassword,
  );

  router.get('/addresses', authenticate, controller.getAddresses);

  router.post('/addresses', authenticate, addressBodyValidation, validateRequest, controller.createAddress);

  router.put(
    '/addresses/:id',
    authenticate,
    [param('id').isMongoId().withMessage('Invalid address ID.'), ...addressUpdateValidation],
    validateRequest,
    controller.updateAddress,
  );

  router.delete(
    '/addresses/:id',
    authenticate,
    [param('id').isMongoId().withMessage('Invalid address ID.')],
    validateRequest,
    controller.deleteAddress,
  );

  return router;
};
