import { Schema, model } from 'mongoose';

const inventoryLogSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    quantity: { type: Number, required: true },
    type: {
      type: String,
      enum: ['purchase', 'cancel', 'restock', 'adjustment'],
      required: true,
    },
    referenceId: { type: Schema.Types.ObjectId, ref: 'Order', index: true },
  },
  { timestamps: true },
);

export const InventoryLogModel = model('InventoryLog', inventoryLogSchema);
