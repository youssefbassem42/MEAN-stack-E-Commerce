import type { ProductEntity } from '../../domain/entities/product.entity.js';

export interface CreateProductInput {
  title: string;
  slug: string;
  price: number;
  stock: number;
  description: string;
  images: string[];
  categoryId: string;
  tags: string[];
}

export interface UpdateProductInput {
  title?: string;
  slug?: string;
  price?: number;
  stock?: number;
  description?: string;
  images?: string[];
  categoryId?: string;
  tags?: string[];
}

export interface ProductFilters {
  categoryId?: string;
  tag?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ProductListResult {
  data: ProductEntity[];
  total: number;
  page: number;
  limit: number;
}

export interface ProductSearchFilters {
  q?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface ProductRepository {
  findAll(filters: ProductFilters): Promise<ProductListResult>;
  findById(id: string): Promise<ProductEntity | null>;
  findBySlug(slug: string): Promise<ProductEntity | null>;
  create(input: CreateProductInput): Promise<ProductEntity>;
  updateById(id: string, updates: UpdateProductInput): Promise<ProductEntity | null>;
  deleteById(id: string): Promise<void>;
  search(filters: ProductSearchFilters): Promise<ProductListResult>;
}
