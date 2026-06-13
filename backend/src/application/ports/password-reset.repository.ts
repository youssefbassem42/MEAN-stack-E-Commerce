import type { PasswordResetEntity } from '../../domain/entities/password-reset.entity.js';

export interface CreatePasswordResetInput {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}

export interface PasswordResetRepository {
  create(input: CreatePasswordResetInput): Promise<PasswordResetEntity>;
  deleteByUserId(userId: string): Promise<void>;
  findByTokenHash(tokenHash: string): Promise<PasswordResetEntity | null>;
  markAsUsed(id: string, usedAt: Date): Promise<void>;
}
