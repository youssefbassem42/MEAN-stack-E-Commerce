import type { AddressRepository, CreateAddressInput, UpdateAddressInput } from '../../../application/ports/address.repository.js';
import type { AddressEntity } from '../../../domain/entities/address.entity.js';
import { AddressModel } from '../models/address.model.js';

type AddressDocument = {
  _id: { toString(): string };
  userId: { toString(): string };
  city: string;
  street: string;
  building: string;
  apartment: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const toEntity = (doc: AddressDocument): AddressEntity => ({
  id: doc._id.toString(),
  userId: doc.userId.toString(),
  city: doc.city,
  street: doc.street,
  building: doc.building,
  apartment: doc.apartment,
  isDefault: doc.isDefault,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

export class MongooseAddressRepository implements AddressRepository {
  public async findAllByUserId(userId: string): Promise<AddressEntity[]> {
    const docs = await AddressModel.find({ userId }).sort({ isDefault: -1, createdAt: -1 }).exec();
    return docs.map(toEntity);
  }

  public async findById(id: string): Promise<AddressEntity | null> {
    const doc = await AddressModel.findById(id).exec();
    return doc ? toEntity(doc) : null;
  }

  public async create(input: CreateAddressInput): Promise<AddressEntity> {
    const doc = await AddressModel.create(input);
    return toEntity(doc);
  }

  public async updateById(id: string, updates: UpdateAddressInput): Promise<AddressEntity | null> {
    const doc = await AddressModel.findByIdAndUpdate(id, updates, { new: true }).exec();
    return doc ? toEntity(doc) : null;
  }

  public async deleteById(id: string): Promise<void> {
    await AddressModel.findByIdAndDelete(id).exec();
  }

  public async clearDefaultForUser(userId: string): Promise<void> {
    await AddressModel.updateMany({ userId, isDefault: true }, { isDefault: false }).exec();
  }
}
