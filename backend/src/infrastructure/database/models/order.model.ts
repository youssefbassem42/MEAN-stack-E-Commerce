import { Schema, model } from 'mongoose';

const orderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'paid', 'packed', 'shipped', 'delivered', 'cancelled', 'failed'],
      default: 'pending',
      index: true,
    },
    shippingMethod: {
      type: String,
      enum: ['COD', 'CARD'],
      default: 'COD',
    },
    shipping: { type: Number, default: 0 },
    subtotal: { type: Number, default: 0 },
    vat: { type: Number, default: 0 },
    grandTotal: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const OrderModel = model('Order', orderSchema);
