import { Router } from 'express';
import { checkout, stripeWebhook } from '../controllers/payment.controller.js';
import { authenticate } from '../../../shared/middleware/authenticate.middleware.js';

const router = Router();

// Checkout is private/protected
router.post('/checkout', authenticate, checkout);

// Webhook is public (called by Stripe with signature verification)
router.post('/webhooks/stripe', stripeWebhook);

export const createPaymentRouter = () => router;
