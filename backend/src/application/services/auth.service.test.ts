import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash, randomUUID } from 'node:crypto';
import { AuthService } from './auth.service.js';
import type { EmailVerificationRepository } from '../ports/email-verification.repository.js';
import type { PasswordResetRepository } from '../ports/password-reset.repository.js';
import type { EmailService } from '../ports/email.service.js';
import type { TokenService } from '../ports/token.service.js';
import type { UserRepository } from '../ports/user.repository.js';
import { AppError } from '../../shared/errors/app-error.js';

type StoredUser = {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  isEmailVerified: boolean;
  refreshTokenHash?: string | null;
};

type StoredTokenRecord = {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
  usedAt?: Date | null;
};

class InMemoryUserRepository implements UserRepository {
  private readonly users = new Map<string, StoredUser>();

  public async create(input: { email: string; passwordHash: string; firstName: string; lastName: string }) {
    const user: StoredUser = {
      id: randomUUID(),
      email: input.email,
      passwordHash: input.passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      isEmailVerified: false,
      refreshTokenHash: null,
    };

    this.users.set(user.id, user);
    return { ...user, createdAt: new Date(), updatedAt: new Date() };
  }

  public async findByEmail(email: string) {
    const user = [...this.users.values()].find((entry) => entry.email === email);
    return user ? { ...user, createdAt: new Date(), updatedAt: new Date() } : null;
  }

  public async findById(id: string) {
    const user = this.users.get(id);
    return user ? { ...user, createdAt: new Date(), updatedAt: new Date() } : null;
  }

  public async updateById(id: string, updates: Partial<Pick<StoredUser, 'isEmailVerified' | 'passwordHash' | 'refreshTokenHash' | 'firstName' | 'lastName'>>) {
    const user = this.users.get(id);
    if (!user) {
      return null;
    }

    Object.assign(user, updates);
    return { ...user, createdAt: new Date(), updatedAt: new Date() };
  }
}

class InMemoryEmailVerificationRepository implements EmailVerificationRepository {
  private readonly records: StoredTokenRecord[] = [];

  public async create(input: { userId: string; tokenHash: string; expiresAt: Date }) {
    const record = {
      id: randomUUID(),
      userId: input.userId,
      tokenHash: input.tokenHash,
      expiresAt: input.expiresAt,
      createdAt: new Date(),
      usedAt: null,
    };
    this.records.push(record);
    return record;
  }

  public async deleteByUserId(userId: string) {
    this.records.splice(0, this.records.length, ...this.records.filter((record) => record.userId !== userId));
  }

  public async findByTokenHash(tokenHash: string) {
    const record = this.records.find((entry) => entry.tokenHash === tokenHash);
    return record ?? null;
  }

  public async markAsUsed(id: string, usedAt: Date) {
    const record = this.records.find((entry) => entry.id === id);
    if (record) {
      record.usedAt = usedAt;
    }
  }
}

class InMemoryPasswordResetRepository implements PasswordResetRepository {
  private readonly records: StoredTokenRecord[] = [];

  public async create(input: { userId: string; tokenHash: string; expiresAt: Date }) {
    const record = {
      id: randomUUID(),
      userId: input.userId,
      tokenHash: input.tokenHash,
      expiresAt: input.expiresAt,
      createdAt: new Date(),
      usedAt: null,
    };
    this.records.push(record);
    return record;
  }

  public async deleteByUserId(userId: string) {
    this.records.splice(0, this.records.length, ...this.records.filter((record) => record.userId !== userId));
  }

  public async findByTokenHash(tokenHash: string) {
    const record = this.records.find((entry) => entry.tokenHash === tokenHash);
    return record ?? null;
  }

  public async markAsUsed(id: string, usedAt: Date) {
    const record = this.records.find((entry) => entry.id === id);
    if (record) {
      record.usedAt = usedAt;
    }
  }
}

class InMemoryTokenService implements TokenService {
  public issueTokens(payload: { userId: string; email: string }) {
    return {
      accessToken: `access:${payload.userId}:${payload.email}`,
      refreshToken: `refresh:${payload.userId}:${payload.email}`,
    };
  }

  public verifyAccessToken(token: string) {
    const [, userId, email] = token.split(':');
    return { userId, email };
  }

  public verifyRefreshToken(token: string) {
    const [, userId, email] = token.split(':');
    return { userId, email };
  }

  public hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  public compareTokenHash(token: string, hash: string) {
    return this.hashToken(token) === hash;
  }

  public generateRandomToken() {
    return randomUUID();
  }
}

class InMemoryEmailService implements EmailService {
  public readonly verificationEmails: Array<{ to: string; firstName: string; token: string }> = [];
  public readonly passwordResetEmails: Array<{ to: string; firstName: string; token: string }> = [];

  public async sendVerificationEmail(payload: { to: string; firstName: string; token: string }) {
    this.verificationEmails.push(payload);
  }

  public async sendPasswordResetEmail(payload: { to: string; firstName: string; token: string }) {
    this.passwordResetEmails.push(payload);
  }
}

const buildService = () => {
  const userRepository = new InMemoryUserRepository();
  const emailVerificationRepository = new InMemoryEmailVerificationRepository();
  const passwordResetRepository = new InMemoryPasswordResetRepository();
  const tokenService = new InMemoryTokenService();
  const emailService = new InMemoryEmailService();

  return {
    service: new AuthService(
      userRepository,
      emailVerificationRepository,
      passwordResetRepository,
      tokenService,
      emailService,
      {
        emailVerificationTtlMinutes: 60,
        passwordResetTtlMinutes: 30,
      },
    ),
    userRepository,
    emailVerificationRepository,
    passwordResetRepository,
    tokenService,
    emailService,
  };
};

test('register creates user and verification email', async () => {
  const { service, emailService } = buildService();

  const result = await service.register({
    email: 'Customer@example.com',
    password: 'Password123!',
    firstName: 'Ada',
    lastName: 'Lovelace',
  });

  assert.equal(result.user.email, 'customer@example.com');
  assert.equal(result.user.firstName, 'Ada');
  assert.equal(emailService.verificationEmails.length, 1);
});

test('duplicate email is rejected', async () => {
  const { service } = buildService();

  await service.register({
    email: 'customer@example.com',
    password: 'Password123!',
    firstName: 'Ada',
    lastName: 'Lovelace',
  });

  await assert.rejects(
    () =>
      service.register({
        email: 'customer@example.com',
        password: 'Password123!',
        firstName: 'Ada',
        lastName: 'Lovelace',
      }),
    (error: unknown) => error instanceof AppError && error.statusCode === 409,
  );
});

test('login returns token pair for verified user', async () => {
  const { service, userRepository } = buildService();

  const registration = await service.register({
    email: 'verified@example.com',
    password: 'Password123!',
    firstName: 'Ada',
    lastName: 'Lovelace',
  });

  await userRepository.updateById(registration.user.id, { isEmailVerified: true });

  const result = await service.login({
    email: 'verified@example.com',
    password: 'Password123!',
  });

  assert.ok(result.accessToken.startsWith('access:'));
  assert.ok(result.refreshToken.startsWith('refresh:'));
});

test('unverified user is blocked from login', async () => {
  const { service } = buildService();

  await service.register({
    email: 'pending@example.com',
    password: 'Password123!',
    firstName: 'Ada',
    lastName: 'Lovelace',
  });

  await assert.rejects(
    () =>
      service.login({
        email: 'pending@example.com',
        password: 'Password123!',
      }),
    (error: unknown) => error instanceof AppError && error.statusCode === 403,
  );
});

test('verify email activates account', async () => {
  const { service, emailService, userRepository, emailVerificationRepository, tokenService } = buildService();

  const registration = await service.register({
    email: 'verify@example.com',
    password: 'Password123!',
    firstName: 'Ada',
    lastName: 'Lovelace',
  });

  const token = emailService.verificationEmails[0].token;
  const verification = await emailVerificationRepository.findByTokenHash(tokenService.hashToken(token));
  assert.ok(verification);

  const result = await service.verifyEmail(token);
  const user = await userRepository.findById(registration.user.id);

  assert.equal(result.message, 'Email verified successfully.');
  assert.equal(user?.isEmailVerified, true);
});

test('forgot password sends reset email', async () => {
  const { service, userRepository, emailService } = buildService();

  const registration = await service.register({
    email: 'reset@example.com',
    password: 'Password123!',
    firstName: 'Ada',
    lastName: 'Lovelace',
  });
  await userRepository.updateById(registration.user.id, { isEmailVerified: true });

  const result = await service.forgotPassword('reset@example.com');

  assert.equal(result.message, 'If the account exists, a reset email has been sent.');
  assert.equal(emailService.passwordResetEmails.length, 1);
});

test('reset password changes password and clears refresh token', async () => {
  const { service, userRepository, emailService } = buildService();

  const registration = await service.register({
    email: 'reset-change@example.com',
    password: 'Password123!',
    firstName: 'Ada',
    lastName: 'Lovelace',
  });
  await userRepository.updateById(registration.user.id, { isEmailVerified: true });
  const login = await service.login({
    email: 'reset-change@example.com',
    password: 'Password123!',
  });

  await service.forgotPassword('reset-change@example.com');
  const token = emailService.passwordResetEmails[0].token;
  const result = await service.resetPassword({
    token,
    password: 'NewPassword123!',
  });
  const user = await userRepository.findById(registration.user.id);

  assert.equal(result.message, 'Password reset successfully.');
  assert.equal(user?.refreshTokenHash, null);
  await assert.rejects(
    () =>
      service.login({
        email: 'reset-change@example.com',
        password: 'Password123!',
      }),
    (error: unknown) => error instanceof AppError && error.statusCode === 401,
  );
});

test('logout clears refresh token state', async () => {
  const { service, userRepository } = buildService();

  const registration = await service.register({
    email: 'logout@example.com',
    password: 'Password123!',
    firstName: 'Ada',
    lastName: 'Lovelace',
  });
  await userRepository.updateById(registration.user.id, { isEmailVerified: true });
  const login = await service.login({
    email: 'logout@example.com',
    password: 'Password123!',
  });

  const result = await service.logout(login.refreshToken);
  const user = await userRepository.findById(registration.user.id);

  assert.equal(result.message, 'Logged out successfully.');
  assert.equal(user?.refreshTokenHash, null);
});
