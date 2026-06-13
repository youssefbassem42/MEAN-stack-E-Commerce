import type { AddressEntity } from '../../domain/entities/address.entity.js';

export interface CreateAddressInput {
  userId: string;
  city: string;
  street: string;
  building: string;
  apartment: string;
  isDefault: boolean;
}

export interface UpdateAddressInput {
  city?: string;
  street?: string;
  building?: string;
  apartment?: string;
  isDefault?: boolean;
}

export interface AddressRepository {
  findAllByUserId(userId: string): Promise<AddressEntity[]>;
  findById(id: string): Promise<AddressEntity | null>;
  create(input: CreateAddressInput): Promise<AddressEntity>;
  updateById(id: string, updates: UpdateAddressInput): Promise<AddressEntity | null>;
  deleteById(id: string): Promise<void>;
  clearDefaultForUser(userId: string): Promise<void>;
}
