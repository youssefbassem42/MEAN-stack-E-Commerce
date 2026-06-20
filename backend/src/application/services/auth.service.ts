import { createHash } from 'node:crypto';
import type { EmailVerificationRepository } from '../ports/email-verification.repository.js';
import type { PasswordResetRepository } from '../ports/password-reset.repository.js';
import type { EmailService } from '../ports/email.service.js';
import type { TokenService } from '../ports/token.service.js';
import type { UserRepository } from '../ports/user.repository.js';
import { AppError } from '../../shared/errors/app-error.js';

interface AuthPayload {
  email: string;
  password: string;
}

interface RegisterPayload extends AuthPayload {
  firstName: string;
  lastName: string;
}

interface ResetPasswordPayload {
  token: string;
  password: string;
}

interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

const normalizeEmail = (email: string) => email.trim().toLowerCase();

const serializeUser = (user: { id: string; email: string; firstName: string; lastName: string; role?: string }) => ({
  id: user.id,
  email: user.email,
  firstName: user.firstName,
  lastName: user.lastName,
  role: user.role || 'user',
});

export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailVerificationRepository: EmailVerificationRepository,
    private readonly passwordResetRepository: PasswordResetRepository,
    private readonly tokenService: TokenService,
    private readonly emailService: EmailService,
    private readonly config: {
      emailVerificationTtlMinutes: number;
      passwordResetTtlMinutes: number;
    },
  ) {}

  public async register(payload: RegisterPayload) {
    const email = normalizeEmail(payload.email);

    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new AppError('Email already in use.', 409);
    }

    const passwordHash = await this.hashPassword(payload.password);
    const user = await this.userRepository.create({
      email,
      passwordHash,
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
    });

    const token = this.tokenService.generateRandomToken();
    await this.emailVerificationRepository.deleteByUserId(user.id);
    await this.emailVerificationRepository.create({
      userId: user.id,
      tokenHash: this.tokenService.hashToken(token),
      expiresAt: new Date(Date.now() + this.config.emailVerificationTtlMinutes * 60 * 1000),
    });
    await this.emailService.sendVerificationEmail({
      to: user.email,
      firstName: user.firstName,
      token,
    });

    return {
      message: 'Registration successful. Verification email sent.',
      user: serializeUser(user),
    };
  }

  public async login(payload: AuthPayload): Promise<LoginResult> {
    const email = normalizeEmail(payload.email);
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new AppError('Invalid email or password.', 401);
    }

    if (!user.isEmailVerified) {
      throw new AppError('Email must be verified before login.', 403);
    }

    const passwordMatches = await this.verifyPassword(payload.password, user.passwordHash);
    if (!passwordMatches) {
      throw new AppError('Invalid email or password.', 401);
    }

    const tokens = this.tokenService.issueTokens({ userId: user.id, email: user.email });
    await this.userRepository.updateById(user.id, {
      refreshTokenHash: this.tokenService.hashToken(tokens.refreshToken),
    });

    return {
      ...tokens,
      user: serializeUser(user),
    };
  }

  public async logout(refreshToken: string) {
    const payload = this.tokenService.verifyRefreshToken(refreshToken);
    const user = await this.userRepository.findById(payload.userId);

    if (!user) {
      throw new AppError('Invalid session.', 401);
    }

    await this.userRepository.updateById(user.id, { refreshTokenHash: null });

    return { message: 'Logged out successfully.' };
  }

  public async verifyEmail(token: string) {
    const tokenHash = this.tokenService.hashToken(token);
    const verification = await this.emailVerificationRepository.findByTokenHash(tokenHash);

    if (!verification || verification.usedAt || verification.expiresAt.getTime() < Date.now()) {
      throw new AppError('Verification token is invalid or expired.', 400);
    }

    await this.userRepository.updateById(verification.userId, { isEmailVerified: true });
    await this.emailVerificationRepository.markAsUsed(verification.id, new Date());

    return { message: 'Email verified successfully.' };
  }

  public async resendVerificationEmail(email: string) {
    const user = await this.userRepository.findByEmail(normalizeEmail(email));
    if (!user) {
      throw new AppError('User not found.', 404);
    }

    if (user.isEmailVerified) {
      throw new AppError('Email is already verified.', 400);
    }

    const token = this.tokenService.generateRandomToken();
    await this.emailVerificationRepository.deleteByUserId(user.id);
    await this.emailVerificationRepository.create({
      userId: user.id,
      tokenHash: this.tokenService.hashToken(token),
      expiresAt: new Date(Date.now() + this.config.emailVerificationTtlMinutes * 60 * 1000),
    });
    await this.emailService.sendVerificationEmail({
      to: user.email,
      firstName: user.firstName,
      token,
    });

    return { message: 'Verification email resent.' };
  }

  public async forgotPassword(email: string) {
    const user = await this.userRepository.findByEmail(normalizeEmail(email));
    if (!user) {
      return { message: 'If the account exists, a reset email has been sent.' };
    }

    const token = this.tokenService.generateRandomToken();
    await this.passwordResetRepository.deleteByUserId(user.id);
    await this.passwordResetRepository.create({
      userId: user.id,
      tokenHash: this.tokenService.hashToken(token),
      expiresAt: new Date(Date.now() + this.config.passwordResetTtlMinutes * 60 * 1000),
    });
    await this.emailService.sendPasswordResetEmail({
      to: user.email,
      firstName: user.firstName,
      token,
    });

    return { message: 'If the account exists, a reset email has been sent.' };
  }

  public async resetPassword(payload: ResetPasswordPayload) {
    const tokenHash = this.tokenService.hashToken(payload.token);
    const resetRecord = await this.passwordResetRepository.findByTokenHash(tokenHash);

    if (!resetRecord || resetRecord.usedAt || resetRecord.expiresAt.getTime() < Date.now()) {
      throw new AppError('Reset token is invalid or expired.', 400);
    }

    const user = await this.userRepository.findById(resetRecord.userId);
    if (!user) {
      throw new AppError('User not found.', 404);
    }

    const passwordHash = await this.hashPassword(payload.password);
    await this.userRepository.updateById(user.id, { passwordHash, refreshTokenHash: null });
    await this.passwordResetRepository.markAsUsed(resetRecord.id, new Date());

    return { message: 'Password reset successfully.' };
  }

  private async hashPassword(password: string) {
    const bcrypt = await import('bcryptjs');
    return bcrypt.hash(password, 12);
  }

  private async verifyPassword(password: string, hash: string) {
    const bcrypt = await import('bcryptjs');
    return bcrypt.compare(password, hash);
  }
}

export const hashEmailAddress = (email: string) =>
  createHash('sha256').update(email.trim().toLowerCase()).digest('hex');
