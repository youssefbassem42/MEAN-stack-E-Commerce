export interface EmailVerificationEntity {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
  usedAt?: Date | null;
}
