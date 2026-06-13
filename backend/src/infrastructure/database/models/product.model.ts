import { Schema, model } from 'mongoose';

const productSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true, index: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    description: { type: String, required: true, trim: true },
    images: [{ type: String }],
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true },
);

productSchema.index({ title: 'text', description: 'text' });
productSchema.index({ price: 1 });

export const ProductModel = model('Product', productSchema);
