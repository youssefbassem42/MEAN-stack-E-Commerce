import type { CategoryRepository, CreateCategoryInput, UpdateCategoryInput } from '../../../application/ports/category.repository.js';
import type { CategoryEntity } from '../../../domain/entities/category.entity.js';
import { CategoryModel } from '../models/category.model.js';

type CategoryDoc = {
  _id: { toString(): string };
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
};

const toEntity = (doc: CategoryDoc): CategoryEntity => ({
  id: doc._id.toString(),
  name: doc.name,
  slug: doc.slug,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

export class MongooseCategoryRepository implements CategoryRepository {
  public async findAll(): Promise<CategoryEntity[]> {
    const docs = await CategoryModel.find().sort({ name: 1 }).exec();
    return docs.map(toEntity);
  }

  public async findById(id: string): Promise<CategoryEntity | null> {
    const doc = await CategoryModel.findById(id).exec();
    return doc ? toEntity(doc) : null;
  }

  public async findBySlug(slug: string): Promise<CategoryEntity | null> {
    const doc = await CategoryModel.findOne({ slug: slug.toLowerCase() }).exec();
    return doc ? toEntity(doc) : null;
  }

  public async create(input: CreateCategoryInput): Promise<CategoryEntity> {
    const doc = await CategoryModel.create(input);
    return toEntity(doc);
  }

  public async updateById(id: string, updates: UpdateCategoryInput): Promise<CategoryEntity | null> {
    const doc = await CategoryModel.findByIdAndUpdate(id, updates, { new: true }).exec();
    return doc ? toEntity(doc) : null;
  }

  public async deleteById(id: string): Promise<void> {
    await CategoryModel.findByIdAndDelete(id).exec();
  }
}
