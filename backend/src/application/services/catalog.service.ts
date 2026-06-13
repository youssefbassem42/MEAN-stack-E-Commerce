import type { CategoryRepository } from '../ports/category.repository.js';
import type { ProductRepository, ProductFilters } from '../ports/product.repository.js';
import { AppError } from '../../shared/errors/app-error.js';

const slugify = (text: string) =>
  text
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');

interface CreateCategoryPayload {
  name: string;
  slug?: string;
}

interface UpdateCategoryPayload {
  name?: string;
  slug?: string;
}

interface CreateProductPayload {
  title: string;
  slug?: string;
  price: number;
  stock?: number;
  description: string;
  images?: string[];
  categoryId: string;
  tags?: string[];
}

interface UpdateProductPayload {
  title?: string;
  slug?: string;
  price?: number;
  stock?: number;
  description?: string;
  images?: string[];
  categoryId?: string;
  tags?: string[];
}

export class CatalogService {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  // ── Categories ───────────────────────────────────────────────

  public async getCategories() {
    return this.categoryRepository.findAll();
  }

  public async createCategory(payload: CreateCategoryPayload) {
    const slug = payload.slug ? payload.slug.toLowerCase().trim() : slugify(payload.name);
    const existing = await this.categoryRepository.findBySlug(slug);
    if (existing) throw new AppError('A category with this slug already exists.', 409);

    return this.categoryRepository.create({ name: payload.name.trim(), slug });
  }

  public async updateCategory(id: string, payload: UpdateCategoryPayload) {
    const category = await this.categoryRepository.findById(id);
    if (!category) throw new AppError('Category not found.', 404);

    const updates: { name?: string; slug?: string } = {};
    if (payload.name) updates.name = payload.name.trim();
    if (payload.slug) {
      const slug = payload.slug.toLowerCase().trim();
      const conflict = await this.categoryRepository.findBySlug(slug);
      if (conflict && conflict.id !== id) throw new AppError('A category with this slug already exists.', 409);
      updates.slug = slug;
    }

    const updated = await this.categoryRepository.updateById(id, updates);
    if (!updated) throw new AppError('Category not found.', 404);
    return updated;
  }

  public async deleteCategory(id: string) {
    const category = await this.categoryRepository.findById(id);
    if (!category) throw new AppError('Category not found.', 404);
    await this.categoryRepository.deleteById(id);
    return { message: 'Category deleted.' };
  }

  // ── Products ─────────────────────────────────────────────────

  public async getProducts(filters: ProductFilters) {
    return this.productRepository.findAll(filters);
  }

  public async getProductById(id: string) {
    const product = await this.productRepository.findById(id);
    if (!product) throw new AppError('Product not found.', 404);
    return product;
  }

  public async createProduct(payload: CreateProductPayload) {
    const slug = payload.slug ? payload.slug.toLowerCase().trim() : slugify(payload.title);
    const existing = await this.productRepository.findBySlug(slug);
    if (existing) throw new AppError('A product with this slug already exists.', 409);

    const category = await this.categoryRepository.findById(payload.categoryId);
    if (!category) throw new AppError('Category not found.', 404);

    return this.productRepository.create({
      title: payload.title.trim(),
      slug,
      price: payload.price,
      stock: payload.stock ?? 0,
      description: payload.description.trim(),
      images: payload.images ?? [],
      categoryId: payload.categoryId,
      tags: payload.tags ?? [],
    });
  }

  public async updateProduct(id: string, payload: UpdateProductPayload) {
    const product = await this.productRepository.findById(id);
    if (!product) throw new AppError('Product not found.', 404);

    if (payload.slug) {
      const slug = payload.slug.toLowerCase().trim();
      const conflict = await this.productRepository.findBySlug(slug);
      if (conflict && conflict.id !== id) throw new AppError('A product with this slug already exists.', 409);
      payload.slug = slug;
    }

    if (payload.categoryId) {
      const category = await this.categoryRepository.findById(payload.categoryId);
      if (!category) throw new AppError('Category not found.', 404);
    }

    const updated = await this.productRepository.updateById(id, payload);
    if (!updated) throw new AppError('Product not found.', 404);
    return updated;
  }

  public async deleteProduct(id: string) {
    const product = await this.productRepository.findById(id);
    if (!product) throw new AppError('Product not found.', 404);
    await this.productRepository.deleteById(id);
    return { message: 'Product deleted.' };
  }

  public async getFeaturedProducts(limit = 8) {
    const result = await this.productRepository.findAll({ tag: 'featured', limit });
    if (result.data.length > 0) return result.data;
    const fallback = await this.productRepository.findAll({ limit });
    return fallback.data;
  }

  public async getNewArrivals(limit = 8) {
    const result = await this.productRepository.findAll({ sortBy: 'createdAt', sortOrder: 'desc', limit });
    return result.data;
  }

  public async getBestSellers(limit = 8) {
    const result = await this.productRepository.findAll({ tag: 'best-seller', limit });
    if (result.data.length > 0) return result.data;
    const fallback = await this.productRepository.findAll({ sortBy: 'stock', sortOrder: 'desc', limit });
    return fallback.data;
  }

  public async getTrendingProducts(limit = 8) {
    const result = await this.productRepository.findAll({ tag: 'trending', limit });
    if (result.data.length > 0) return result.data;
    const fallback = await this.productRepository.findAll({ limit });
    return fallback.data;
  }

  public async searchProducts(filters: {
    q?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    page?: number;
    limit?: number;
  }) {
    let categoryId: string | undefined = undefined;

    if (filters.category) {
      const trimmedCat = filters.category.trim();
      let category = await this.categoryRepository.findBySlug(trimmedCat);
      if (!category && trimmedCat.match(/^[0-9a-fA-F]{24}$/)) {
        category = await this.categoryRepository.findById(trimmedCat);
      }

      if (category) {
        categoryId = category.id;
      } else {
        return { data: [], total: 0, page: filters.page || 1, limit: filters.limit || 20 };
      }
    }

    return this.productRepository.search({
      q: filters.q,
      categoryId,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      sort: filters.sort,
      page: filters.page,
      limit: filters.limit,
    });
  }
}
