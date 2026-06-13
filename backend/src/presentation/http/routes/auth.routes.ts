import { Router } from 'express';
import { body } from 'express-validator';
import type { AuthService } from '../../../application/services/auth.service.js';
import { validateRequest } from '../../../shared/middleware/validate-request.middleware.js';
import {
  loginLimiter,
  passwordRecoveryLimiter,
  registerLimiter,
} from '../middleware/auth-rate-limiters.js';
import { createAuthController } from '../controllers/auth.controller.js';

const emailValidation = body('email').isEmail().withMessage('A valid email is required.');
const passwordValidation = body('password')
  .isString()
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters.');

export const createAuthRouter = (authService: AuthService) => {
  const router = Router();
  const controller = createAuthController(authService);

  router.post(
    '/register',
    registerLimiter,
    [
      body('firstName').isString().trim().isLength({ min: 1 }).withMessage('First name is required.'),
      body('lastName').isString().trim().isLength({ min: 1 }).withMessage('Last name is required.'),
      emailValidation,
      passwordValidation,
    ],
    validateRequest,
    controller.register,
  );

  router.post('/login', loginLimiter, [emailValidation, passwordValidation], validateRequest, controller.login);

  router.post(
    '/logout',
    [body('refreshToken').isString().notEmpty().withMessage('Refresh token is required.')],
    validateRequest,
    controller.logout,
  );

  router.post('/verify-email', [body('token').isString().notEmpty().withMessage('Token is required.')], validateRequest, controller.verifyEmail);

  router.post('/resend-verification', [emailValidation], validateRequest, controller.resendVerification);

  router.post('/forgot-password', passwordRecoveryLimiter, [emailValidation], validateRequest, controller.forgotPassword);

  router.post(
    '/reset-password',
    passwordRecoveryLimiter,
    [body('token').isString().notEmpty().withMessage('Token is required.'), passwordValidation],
    validateRequest,
    controller.resetPassword,
  );

  return router;
};
