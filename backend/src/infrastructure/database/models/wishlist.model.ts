import { Schema, model } from 'mongoose';

const wishlistSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  },
  { timestamps: true },
);

export const WishlistModel = model('Wishlist', wishlistSchema);
