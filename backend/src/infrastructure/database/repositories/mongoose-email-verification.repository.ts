import type { EmailVerificationRepository } from '../../../application/ports/email-verification.repository.js';
import type { EmailVerificationEntity } from '../../../domain/entities/email-verification.entity.js';
import { EmailVerificationModel } from '../models/email-verification.model.js';

type EmailVerificationDocument = {
  _id: { toString(): string };
  userId: { toString(): string };
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
  usedAt?: Date | null;
};

const toEntity = (document: EmailVerificationDocument): EmailVerificationEntity => ({
  id: document._id.toString(),
  userId: document.userId.toString(),
  tokenHash: document.tokenHash,
  expiresAt: document.expiresAt,
  createdAt: document.createdAt,
  usedAt: document.usedAt ?? null,
});

export class MongooseEmailVerificationRepository implements EmailVerificationRepository {
  public async create(input: { userId: string; tokenHash: string; expiresAt: Date }) {
    const created = await EmailVerificationModel.create(input);
    return toEntity(created);
  }

  public async deleteByUserId(userId: string) {
    await EmailVerificationModel.deleteMany({ userId }).exec();
  }

  public async findByTokenHash(tokenHash: string) {
    const verification = await EmailVerificationModel.findOne({ tokenHash }).exec();
    return verification ? toEntity(verification) : null;
  }

  public async markAsUsed(id: string, usedAt: Date) {
    await EmailVerificationModel.findByIdAndUpdate(id, { usedAt }, { new: true }).exec();
  }
}
