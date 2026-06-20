import { Schema, model } from 'mongoose';

const cartItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const cartSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    items: [cartItemSchema],
    shippingMethod: { type: String, enum: ['COD', 'CARD'], default: 'COD' },
  },
  { timestamps: true },
);

export const CartModel = model('Cart', cartSchema);
