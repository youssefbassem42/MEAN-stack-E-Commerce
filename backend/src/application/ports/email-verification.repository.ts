import type { EmailVerificationEntity } from '../../domain/entities/email-verification.entity.js';

export interface CreateEmailVerificationInput {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}

export interface EmailVerificationRepository {
  create(input: CreateEmailVerificationInput): Promise<EmailVerificationEntity>;
  deleteByUserId(userId: string): Promise<void>;
  findByTokenHash(tokenHash: string): Promise<EmailVerificationEntity | null>;
  markAsUsed(id: string, usedAt: Date): Promise<void>;
}
