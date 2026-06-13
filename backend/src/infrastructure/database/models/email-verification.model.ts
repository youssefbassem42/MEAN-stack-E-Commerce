import { Schema, model } from 'mongoose';

const emailVerificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true, index: true },
    usedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  },
);

export const EmailVerificationModel = model('EmailVerification', emailVerificationSchema);
