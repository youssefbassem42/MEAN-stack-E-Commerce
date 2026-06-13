import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { AuthService } from '../../application/services/auth.service.js';
import { CatalogService } from '../../application/services/catalog.service.js';
import { ProfileService } from '../../application/services/profile.service.js';
import { BrevoEmailService } from '../../infrastructure/email/brevo-email.service.js';
import { env } from '../../infrastructure/config/env.js';
import { createApiRouter } from './routes/index.js';
import { JwtTokenService } from '../../infrastructure/security/jwt-token.service.js';
import { MongooseAddressRepository } from '../../infrastructure/database/repositories/mongoose-address.repository.js';
import { MongooseCategoryRepository } from '../../infrastructure/database/repositories/mongoose-category.repository.js';
import { MongooseEmailVerificationRepository } from '../../infrastructure/database/repositories/mongoose-email-verification.repository.js';
import { MongoosePasswordResetRepository } from '../../infrastructure/database/repositories/mongoose-password-reset.repository.js';
import { MongooseProductRepository } from '../../infrastructure/database/repositories/mongoose-product.repository.js';
import { MongooseUserRepository } from '../../infrastructure/database/repositories/mongoose-user.repository.js';
import { errorHandler } from '../../shared/middleware/error-handler.middleware.js';
import { notFoundHandler } from '../../shared/middleware/not-found.middleware.js';

const createDefaultServices = () => {
  const userRepository = new MongooseUserRepository();
  const addressRepository = new MongooseAddressRepository();
  const categoryRepository = new MongooseCategoryRepository();
  const productRepository = new MongooseProductRepository();

  const authService = new AuthService(
    userRepository,
    new MongooseEmailVerificationRepository(),
    new MongoosePasswordResetRepository(),
    new JwtTokenService(),
    new BrevoEmailService(),
    {
      emailVerificationTtlMinutes: env.emailVerificationTtlMinutes,
      passwordResetTtlMinutes: env.passwordResetTtlMinutes,
    },
  );

  const profileService = new ProfileService(userRepository, addressRepository);
  const catalogService = new CatalogService(categoryRepository, productRepository);

  return { authService, profileService, catalogService };
};

export const createApp = (options?: {
  authService?: AuthService;
  profileService?: ProfileService;
  catalogService?: CatalogService;
}) => {
  const app = express();
  const services = options?.authService
    ? {
        authService: options.authService,
        profileService:
          options.profileService ??
          new ProfileService(new MongooseUserRepository(), new MongooseAddressRepository()),
        catalogService:
          options.catalogService ??
          new CatalogService(new MongooseCategoryRepository(), new MongooseProductRepository()),
      }
    : createDefaultServices();

  app.use(cors({ origin: env.clientOrigin, credentials: true }));
  app.use(helmet());
  app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
  app.use(express.json());

  app.use(createApiRouter(services.authService, services.profileService, services.catalogService));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
