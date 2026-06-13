import { Schema, model } from 'mongoose';

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    isEmailVerified: { type: Boolean, default: false },
    refreshTokenHash: { type: String, default: null },
  },
  {
    timestamps: true,
  },
);

export const UserModel = model('User', userSchema);
