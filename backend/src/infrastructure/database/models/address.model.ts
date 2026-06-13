import { Schema, model } from 'mongoose';

const addressSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    city: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    building: { type: String, required: true, trim: true },
    apartment: { type: String, required: true, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const AddressModel = model('Address', addressSchema);
