import type { AddressRepository } from '../ports/address.repository.js';
import type { UserRepository } from '../ports/user.repository.js';
import { AppError } from '../../shared/errors/app-error.js';

interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
}

interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

interface CreateAddressPayload {
  city: string;
  street: string;
  building: string;
  apartment: string;
  isDefault?: boolean;
}

interface UpdateAddressPayload {
  city?: string;
  street?: string;
  building?: string;
  apartment?: string;
  isDefault?: boolean;
}

export class ProfileService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly addressRepository: AddressRepository,
  ) {}

  public async getProfile(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new AppError('User not found.', 404);
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: user.createdAt,
    };
  }

  public async updateProfile(userId: string, payload: UpdateProfilePayload) {
    const updates: { firstName?: string; lastName?: string } = {};
    if (payload.firstName !== undefined) updates.firstName = payload.firstName.trim();
    if (payload.lastName !== undefined) updates.lastName = payload.lastName.trim();

    const updated = await this.userRepository.updateById(userId, updates);
    if (!updated) throw new AppError('User not found.', 404);

    return {
      id: updated.id,
      email: updated.email,
      firstName: updated.firstName,
      lastName: updated.lastName,
    };
  }

  public async changePassword(userId: string, payload: ChangePasswordPayload) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new AppError('User not found.', 404);

    const bcrypt = await import('bcryptjs');
    const matches = await bcrypt.compare(payload.currentPassword, user.passwordHash);
    if (!matches) throw new AppError('Current password is incorrect.', 400);

    const newHash = await bcrypt.hash(payload.newPassword, 12);
    await this.userRepository.updateById(userId, {
      passwordHash: newHash,
      refreshTokenHash: null,
    });

    return { message: 'Password changed successfully. Please log in again.' };
  }

  public async getAddresses(userId: string) {
    return this.addressRepository.findAllByUserId(userId);
  }

  public async createAddress(userId: string, payload: CreateAddressPayload) {
    if (payload.isDefault) {
      await this.addressRepository.clearDefaultForUser(userId);
    }
    return this.addressRepository.create({ userId, ...payload, isDefault: payload.isDefault ?? false });
  }

  public async updateAddress(userId: string, addressId: string, payload: UpdateAddressPayload) {
    const address = await this.addressRepository.findById(addressId);
    if (!address) throw new AppError('Address not found.', 404);
    if (address.userId !== userId) throw new AppError('Forbidden.', 403);

    if (payload.isDefault) {
      await this.addressRepository.clearDefaultForUser(userId);
    }

    const updated = await this.addressRepository.updateById(addressId, payload);
    if (!updated) throw new AppError('Address not found.', 404);
    return updated;
  }

  public async deleteAddress(userId: string, addressId: string) {
    const address = await this.addressRepository.findById(addressId);
    if (!address) throw new AppError('Address not found.', 404);
    if (address.userId !== userId) throw new AppError('Forbidden.', 403);

    await this.addressRepository.deleteById(addressId);
    return { message: 'Address deleted.' };
  }
}
