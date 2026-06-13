import type { PasswordResetRepository } from '../../../application/ports/password-reset.repository.js';
import type { PasswordResetEntity } from '../../../domain/entities/password-reset.entity.js';
import { PasswordResetModel } from '../models/password-reset.model.js';

type PasswordResetDocument = {
  _id: { toString(): string };
  userId: { toString(): string };
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
  usedAt?: Date | null;
};

const toEntity = (document: PasswordResetDocument): PasswordResetEntity => ({
  id: document._id.toString(),
  userId: document.userId.toString(),
  tokenHash: document.tokenHash,
  expiresAt: document.expiresAt,
  createdAt: document.createdAt,
  usedAt: document.usedAt ?? null,
});

export class MongoosePasswordResetRepository implements PasswordResetRepository {
  public async create(input: { userId: string; tokenHash: string; expiresAt: Date }) {
    const created = await PasswordResetModel.create(input);
    return toEntity(created);
  }

  public async deleteByUserId(userId: string) {
    await PasswordResetModel.deleteMany({ userId }).exec();
  }

  public async findByTokenHash(tokenHash: string) {
    const reset = await PasswordResetModel.findOne({ tokenHash }).exec();
    return reset ? toEntity(reset) : null;
  }

  public async markAsUsed(id: string, usedAt: Date) {
    await PasswordResetModel.findByIdAndUpdate(id, { usedAt }, { new: true }).exec();
  }
}
