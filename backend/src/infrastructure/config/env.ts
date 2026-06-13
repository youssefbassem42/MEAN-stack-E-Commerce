import dotenv from 'dotenv';

dotenv.config();

const toNumber = (value: string | undefined, fallback: number) => {
  if (!value) {
    return fallback;
  }

  const parsedValue = Number(value);
  return Number.isNaN(parsedValue) ? fallback : parsedValue;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: toNumber(process.env.PORT, 3000),
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:4200',
  mongodbUri: process.env.MONGODB_URI ?? '',
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET ?? 'development-access-secret',
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET ?? 'development-refresh-secret',
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL ?? '15m',
  refreshTokenTtl: process.env.REFRESH_TOKEN_TTL ?? '7d',
  emailVerificationTtlMinutes: toNumber(process.env.EMAIL_VERIFICATION_TTL_MINUTES, 60),
  passwordResetTtlMinutes: toNumber(process.env.PASSWORD_RESET_TTL_MINUTES, 30),
  brevoApiKey: process.env.BREVO_API_KEY ?? '',
  brevoSenderEmail: process.env.BREVO_SENDER_EMAIL ?? 'no-reply@example.com',
  brevoSenderName: process.env.BREVO_SENDER_NAME ?? 'E-Commerce Platform',
};
