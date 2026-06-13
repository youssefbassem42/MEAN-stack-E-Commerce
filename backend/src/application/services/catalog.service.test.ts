import { test } from 'node:test';
import assert from 'node:assert';
import { CatalogService } from './catalog.service.js';
import type { CategoryRepository, CreateCategoryInput, UpdateCategoryInput } from '../ports/category.repository.js';
import type { ProductRepository, CreateProductInput, UpdateProductInput, ProductFilters, ProductSearchFilters, ProductListResult } from '../ports/product.repository.js';
import type { CategoryEntity } from '../../domain/entities/category.entity.js';
import type { ProductEntity } from '../../domain/entities/product.entity.js';

// In-Memory Mocks for Ports
class InMemoryCategoryRepository implements CategoryRepository {
  private categories: CategoryEntity[] = [];

  async findAll(): Promise<CategoryEntity[]> {
    return [...this.categories].sort((a, b) => a.name.localeCompare(b.name));
  }

  async findById(id: string): Promise<CategoryEntity | null> {
    return this.categories.find(c => c.id === id) || null;
  }

  async findBySlug(slug: string): Promise<CategoryEntity | null> {
    return this.categories.find(c => c.slug === slug.toLowerCase()) || null;
  }

  async create(input: CreateCategoryInput): Promise<CategoryEntity> {
    const category: CategoryEntity = {
      id: Math.random().toString(36).substring(7),
      name: input.name,
      slug: input.slug,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.categories.push(category);
    return category;
  }

  async updateById(id: string, updates: UpdateCategoryInput): Promise<CategoryEntity | null> {
    const category = this.categories.find(c => c.id === id);
    if (!category) return null;
    if (updates.name !== undefined) category.name = updates.name;
    if (updates.slug !== undefined) category.slug = updates.slug;
    category.updatedAt = new Date();
    return category;
  }

  async deleteById(id: string): Promise<void> {
    this.categories = this.categories.filter(c => c.id !== id);
  }
}

class InMemoryProductRepository implements ProductRepository {
  private products: ProductEntity[] = [];

  async findAll(filters: ProductFilters): Promise<ProductListResult> {
    let data = [...this.products];
    if (filters.categoryId) {
      data = data.filter(p => p.categoryId === filters.categoryId);
    }
    if (filters.tag) {
      data = data.filter(p => p.tags.includes(filters.tag!));
    }
    return { data, total: data.length, page: filters.page || 1, limit: filters.limit || 20 };
  }

  async findById(id: string): Promise<ProductEntity | null> {
    return this.products.find(p => p.id === id) || null;
  }

  async findBySlug(slug: string): Promise<ProductEntity | null> {
    return this.products.find(p => p.slug === slug.toLowerCase()) || null;
  }

  async create(input: CreateProductInput): Promise<ProductEntity> {
    const product: ProductEntity = {
      id: Math.random().toString(36).substring(7),
      title: input.title,
      slug: input.slug,
      price: input.price,
      stock: input.stock,
      description: input.description,
      images: input.images,
      categoryId: input.categoryId,
      tags: input.tags,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.products.push(product);
    return product;
  }

  async updateById(id: string, updates: UpdateProductInput): Promise<ProductEntity | null> {
    const product = this.products.find(p => p.id === id);
    if (!product) return null;
    if (updates.title !== undefined) product.title = updates.title;
    if (updates.slug !== undefined) product.slug = updates.slug;
    if (updates.price !== undefined) product.price = updates.price;
    if (updates.stock !== undefined) product.stock = updates.stock;
    if (updates.description !== undefined) product.description = updates.description;
    if (updates.images !== undefined) product.images = updates.images;
    if (updates.categoryId !== undefined) product.categoryId = updates.categoryId;
    if (updates.tags !== undefined) product.tags = updates.tags;
    product.updatedAt = new Date();
    return product;
  }

  async deleteById(id: string): Promise<void> {
    this.products = this.products.filter(p => p.id !== id);
  }

  async search(filters: ProductSearchFilters): Promise<ProductListResult> {
    let data = [...this.products];

    if (filters.q) {
      const qLower = filters.q.toLowerCase();
      data = data.filter(p => p.title.toLowerCase().includes(qLower) || p.description.toLowerCase().includes(qLower));
    }

    if (filters.categoryId) {
      data = data.filter(p => p.categoryId === filters.categoryId);
    }

    if (filters.minPrice !== undefined) {
      data = data.filter(p => p.price >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined) {
      data = data.filter(p => p.price <= filters.maxPrice!);
    }

    if (filters.sort === 'price_asc') {
      data.sort((a, b) => a.price - b.price);
    } else if (filters.sort === 'price_desc') {
      data.sort((a, b) => b.price - a.price);
    } else {
      data.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    return { data, total: data.length, page: filters.page || 1, limit: filters.limit || 20 };
  }
}

test('CatalogService - category operations', async (t) => {
  const catRepo = new InMemoryCategoryRepository();
  const prodRepo = new InMemoryProductRepository();
  const service = new CatalogService(catRepo, prodRepo);

  await t.test('creates category and auto-slugifies name', async () => {
    const cat = await service.createCategory({ name: 'Smart Home Gear' });
    assert.strictEqual(cat.name, 'Smart Home Gear');
    assert.strictEqual(cat.slug, 'smart-home-gear');
  });

  await t.test('rejects duplicate category slugs', async () => {
    await assert.rejects(
      service.createCategory({ name: 'Smart Home Gear' }),
      /already exists/
    );
  });
});

test('CatalogService - product search operations', async (t) => {
  const catRepo = new InMemoryCategoryRepository();
  const prodRepo = new InMemoryProductRepository();
  const service = new CatalogService(catRepo, prodRepo);

  const cat1 = await service.createCategory({ name: 'Electronics' });
  const cat2 = await service.createCategory({ name: 'Apparel' });

  const p1 = await service.createProduct({
    title: 'Alpha Wireless Headphone',
    price: 199.99,
    description: 'Noise cancelling overhead gear',
    categoryId: cat1.id,
    stock: 10
  });

  const p2 = await service.createProduct({
    title: 'Beta Sport T-Shirt',
    price: 29.99,
    description: 'Dry fit active clothing',
    categoryId: cat2.id,
    stock: 50
  });

  const p3 = await service.createProduct({
    title: 'Gamma Smart Watch',
    price: 299.99,
    description: 'Track workouts and heart rate',
    categoryId: cat1.id,
    stock: 5
  });

  await t.test('search filters by search query term q', async () => {
    const res = await service.searchProducts({ q: 'Wireless' });
    assert.strictEqual(res.data.length, 1);
    assert.strictEqual(res.data[0]?.title, 'Alpha Wireless Headphone');
  });

  await t.test('search filters by category slug or category ID', async () => {
    const res = await service.searchProducts({ category: 'electronics' });
    assert.strictEqual(res.data.length, 2);
    assert.ok(res.data.some(p => p.id === p1.id));
    assert.ok(res.data.some(p => p.id === p3.id));
  });

  await t.test('search filters by minPrice and maxPrice range', async () => {
    const res = await service.searchProducts({ minPrice: 50, maxPrice: 250 });
    assert.strictEqual(res.data.length, 1);
    assert.strictEqual(res.data[0]?.title, 'Alpha Wireless Headphone');
  });

  await t.test('search sorts products ascending and descending', async () => {
    const resAsc = await service.searchProducts({ sort: 'price_asc' });
    assert.strictEqual(resAsc.data[0]?.title, 'Beta Sport T-Shirt');

    const resDesc = await service.searchProducts({ sort: 'price_desc' });
    assert.strictEqual(resDesc.data[0]?.title, 'Gamma Smart Watch');
  });
});
