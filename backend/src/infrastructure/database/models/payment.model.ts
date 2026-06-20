import { Schema, model } from 'mongoose';

const paymentSchema = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    paymentIntentId: { type: String, required: true, unique: true, index: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'succeeded', 'failed'], default: 'pending', index: true },
  },
  { timestamps: true },
);

export const PaymentModel = model('Payment', paymentSchema);
