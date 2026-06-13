import rateLimit from 'express-rate-limit';

const commonRateLimitOptions = {
  standardHeaders: true,
  legacyHeaders: false,
};

export const registerLimiter = rateLimit({
  ...commonRateLimitOptions,
  windowMs: 15 * 60 * 1000,
  limit: 10,
});

export const loginLimiter = rateLimit({
  ...commonRateLimitOptions,
  windowMs: 15 * 60 * 1000,
  limit: 20,
});

export const passwordRecoveryLimiter = rateLimit({
  ...commonRateLimitOptions,
  windowMs: 15 * 60 * 1000,
  limit: 10,
});
