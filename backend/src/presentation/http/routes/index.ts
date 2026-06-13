import { Router } from 'express';
import type { AuthService } from '../../../application/services/auth.service.js';
import type { CatalogService } from '../../../application/services/catalog.service.js';
import type { ProfileService } from '../../../application/services/profile.service.js';
import { createAuthRouter } from './auth.routes.js';
import { createCatalogRouter } from './catalog.routes.js';
import { healthRouter } from './health.routes.js';
import { createProfileRouter } from './profile.routes.js';
import { createHomeRouter } from './home.routes.js';

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

  return router;
};
