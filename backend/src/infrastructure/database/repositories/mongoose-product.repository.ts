import type {
  ProductRepository,
  CreateProductInput,
  UpdateProductInput,
  ProductFilters,
  ProductListResult,
  ProductSearchFilters,
} from '../../../application/ports/product.repository.js';
import type { ProductEntity } from '../../../domain/entities/product.entity.js';
import { ProductModel } from '../models/product.model.js';

type ProductDoc = {
  _id: { toString(): string };
  title: string;
  slug: string;
  price: number;
  stock: number;
  description: string;
  images: string[];
  categoryId: { toString(): string };
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
};

const toEntity = (doc: ProductDoc): ProductEntity => ({
  id: doc._id.toString(),
  title: doc.title,
  slug: doc.slug,
  price: doc.price,
  stock: doc.stock,
  description: doc.description,
  images: doc.images,
  categoryId: doc.categoryId.toString(),
  tags: doc.tags,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

export class MongooseProductRepository implements ProductRepository {
  public async findAll(filters: ProductFilters): Promise<ProductListResult> {
    const { categoryId, tag, sortBy, sortOrder = 'desc', page = 1, limit = 20 } = filters;
    const query: Record<string, unknown> = {};
    if (categoryId) query['categoryId'] = categoryId;
    if (tag) query['tags'] = tag;

    const sortDir = sortOrder === 'asc' ? 1 : -1;
    const sortOption: Record<string, 1 | -1> = {};
    if (sortBy) {
      sortOption[sortBy] = sortDir;
    } else {
      sortOption['createdAt'] = -1;
    }

    const skip = (page - 1) * limit;
    const [docs, total] = await Promise.all([
      ProductModel.find(query).sort(sortOption).skip(skip).limit(limit).exec(),
      ProductModel.countDocuments(query).exec(),
    ]);

    return { data: docs.map(toEntity), total, page, limit };
  }

  public async findById(id: string): Promise<ProductEntity | null> {
    const doc = await ProductModel.findById(id).exec();
    return doc ? toEntity(doc) : null;
  }

  public async findBySlug(slug: string): Promise<ProductEntity | null> {
    const doc = await ProductModel.findOne({ slug: slug.toLowerCase() }).exec();
    return doc ? toEntity(doc) : null;
  }

  public async create(input: CreateProductInput): Promise<ProductEntity> {
    const doc = await ProductModel.create(input);
    return toEntity(doc);
  }

  public async updateById(id: string, updates: UpdateProductInput): Promise<ProductEntity | null> {
    const doc = await ProductModel.findByIdAndUpdate(id, updates, { new: true }).exec();
    return doc ? toEntity(doc) : null;
  }

  public async deleteById(id: string): Promise<void> {
    await ProductModel.findByIdAndDelete(id).exec();
  }

  public async search(filters: ProductSearchFilters): Promise<ProductListResult> {
    const { q, categoryId, minPrice, maxPrice, sort, page = 1, limit = 20 } = filters;
    const query: Record<string, any> = {};

    if (q) {
      query['$text'] = { $search: q };
    }

    if (categoryId) {
      query['categoryId'] = categoryId;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      const priceQuery: Record<string, any> = {};
      if (minPrice !== undefined) priceQuery['$gte'] = minPrice;
      if (maxPrice !== undefined) priceQuery['$lte'] = maxPrice;
      query['price'] = priceQuery;
    }

    let sortOption: any = {};
    let projection: any = null;

    if (sort === 'price_asc') {
      sortOption = { price: 1 };
    } else if (sort === 'price_desc') {
      sortOption = { price: -1 };
    } else if (sort === 'newest') {
      sortOption = { createdAt: -1 };
    } else if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'relevance' && q) {
      sortOption = { score: { $meta: 'textScore' } };
      projection = { score: { $meta: 'textScore' } };
    } else {
      sortOption = { createdAt: -1 };
    }

    const skip = (page - 1) * limit;

    const findQuery = ProductModel.find(query);
    if (projection) {
      findQuery.select(projection);
    }

    const [docs, total] = await Promise.all([
      findQuery.sort(sortOption).skip(skip).limit(limit).exec(),
      ProductModel.countDocuments(query).exec(),
    ]);

    return { data: docs.map(toEntity), total, page, limit };
  }
}
