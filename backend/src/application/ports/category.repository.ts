import type { CategoryEntity } from '../../domain/entities/category.entity.js';

export interface CreateCategoryInput {
  name: string;
  slug: string;
}

export interface UpdateCategoryInput {
  name?: string;
  slug?: string;
}

export interface CategoryRepository {
  findAll(): Promise<CategoryEntity[]>;
  findById(id: string): Promise<CategoryEntity | null>;
  findBySlug(slug: string): Promise<CategoryEntity | null>;
  create(input: CreateCategoryInput): Promise<CategoryEntity>;
  updateById(id: string, updates: UpdateCategoryInput): Promise<CategoryEntity | null>;
  deleteById(id: string): Promise<void>;
}
