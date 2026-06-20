import { Schema, model } from 'mongoose';

const productViewSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, unique: true, index: true },
    count: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const ProductViewModel = model('ProductView', productViewSchema);
