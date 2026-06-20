import { Router } from 'express';
import type { AuthService } from '../../../application/services/auth.service.js';
import type { CatalogService } from '../../../application/services/catalog.service.js';
import type { ProfileService } from '../../../application/services/profile.service.js';
import { createAuthRouter } from './auth.routes.js';
import { createCatalogRouter } from './catalog.routes.js';
import { healthRouter } from './health.routes.js';
import { createProfileRouter } from './profile.routes.js';
import { createHomeRouter } from './home.routes.js';
import { createReviewRouter } from './review.routes.js';
import { createCartRouter } from './cart.routes.js';
import { createWishlistRouter } from './wishlist.routes.js';
import { createPaymentRouter } from './payment.routes.js';
import { createOrderRouter } from './order.routes.js';
import { createAdminRouter } from './admin.routes.js';

export const createApiRouter = (
  authService: AuthService,
  profileService: ProfileService,
  catalogService: CatalogService,
) => {
  const router = Router();

  router.use('/health', healthRouter);
  router.use('/auth', createAuthRouter(authService));
  router.use(createProfileRouter(profileService));
  router.use(createCatalogRouter(catalogService));
  router.use('/home', createHomeRouter(catalogService));
  router.use('/reviews', createReviewRouter());
  router.use('/cart', createCartRouter());
  router.use('/wishlist', createWishlistRouter());
  router.use(createPaymentRouter());
  router.use('/orders', createOrderRouter());
  router.use('/admin', createAdminRouter());

  return router;
};
