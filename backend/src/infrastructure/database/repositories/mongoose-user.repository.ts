import type { UserRepository } from '../../../application/ports/user.repository.js';
import type { UserEntity } from '../../../domain/entities/user.entity.js';
import { UserModel } from '../models/user.model.js';

type UserDocument = {
  _id: { toString(): string };
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role?: string;
  isEmailVerified: boolean;
  refreshTokenHash?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const toEntity = (document: UserDocument): UserEntity => ({
  id: document._id.toString(),
  email: document.email,
  passwordHash: document.passwordHash,
  firstName: document.firstName,
  lastName: document.lastName,
  role: document.role,
  isEmailVerified: document.isEmailVerified,
  refreshTokenHash: document.refreshTokenHash ?? null,
  createdAt: document.createdAt,
  updatedAt: document.updatedAt,
});

export class MongooseUserRepository implements UserRepository {
  public async create(input: { email: string; passwordHash: string; firstName: string; lastName: string }) {
    const createdUser = await UserModel.create({
      ...input,
      isEmailVerified: false,
    });

    return toEntity(createdUser);
  }

  public async findByEmail(email: string) {
    const user = await UserModel.findOne({ email }).exec();
    return user ? toEntity(user) : null;
  }

  public async findById(id: string) {
    const user = await UserModel.findById(id).exec();
    return user ? toEntity(user) : null;
  }

  public async updateById(id: string, updates: Partial<Pick<UserEntity, 'isEmailVerified' | 'passwordHash' | 'refreshTokenHash'>>) {
    const updated = await UserModel.findByIdAndUpdate(id, updates, { new: true }).exec();
    return updated ? toEntity(updated) : null;
  }
}
