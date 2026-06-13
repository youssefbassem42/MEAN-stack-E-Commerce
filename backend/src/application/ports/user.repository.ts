import type { UserEntity } from '../../domain/entities/user.entity.js';

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
}

export interface UserRepository {
  create(input: CreateUserInput): Promise<UserEntity>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findById(id: string): Promise<UserEntity | null>;
  updateById(
    id: string,
    updates: Partial<Pick<UserEntity, 'isEmailVerified' | 'passwordHash' | 'refreshTokenHash' | 'firstName' | 'lastName'>>,
  ): Promise<UserEntity | null>;
}
