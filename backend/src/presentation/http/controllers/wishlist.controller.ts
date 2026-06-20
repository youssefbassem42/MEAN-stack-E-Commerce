import type { Request, Response, NextFunction } from 'express';
import { WishlistModel } from '../../../infrastructure/database/models/wishlist.model.js';
import { ProductModel } from '../../../infrastructure/database/models/product.model.js';
import { CartModel } from '../../../infrastructure/database/models/cart.model.js';
import { AppError } from '../../../shared/errors/app-error.js';
import type { AuthenticatedRequest } from '../../../shared/middleware/authenticate.middleware.js';

export const getOrCreateWishlist = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const userId = (request as AuthenticatedRequest).user.userId;
    let wishlist = await WishlistModel.findOne({ userId }).populate('products').exec();

    if (!wishlist) {
      wishlist = await WishlistModel.create({ userId, products: [] });
    }

    return response.status(200).json(wishlist);
  } catch (error) {
    next(error);
  }
};

export const addToWishlist = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const userId = (request as AuthenticatedRequest).user.userId;
    const { productId } = request.body;

    if (!productId) {
      throw new AppError('productId is required.', 400);
    }

    const product = await ProductModel.findById(productId).exec();
    if (!product) {
      throw new AppError('Product not found.', 404);
    }

    let wishlist = await WishlistModel.findOne({ userId }).exec();
    if (!wishlist) {
      wishlist = new WishlistModel({ userId, products: [] });
    }

    if (!wishlist.products.includes(productId)) {
      wishlist.products.push(productId);
      await wishlist.save();
    }

    const populated = await wishlist.populate('products');
    return response.status(200).json(populated);
  } catch (error) {
    next(error);
  }
};

export const removeFromWishlist = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const userId = (request as AuthenticatedRequest).user.userId;
    const productId = request.params['id'] as string;

    const wishlist = await WishlistModel.findOne({ userId }).exec();
    if (!wishlist) {
      throw new AppError('Wishlist not found.', 404);
    }

    wishlist.products = wishlist.products.filter((id) => id.toString() !== productId);
    await wishlist.save();

    const populated = await wishlist.populate('products');
    return response.status(200).json(populated);
  } catch (error) {
    next(error);
  }
};

export const moveToCart = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const userId = (request as AuthenticatedRequest).user.userId;
    const { productId } = request.body;

    if (!productId) {
      throw new AppError('productId is required.', 400);
    }

    const product = await ProductModel.findById(productId).exec();
    if (!product) {
      throw new AppError('Product not found.', 404);
    }

    // 1. Add to Cart
    let cart = await CartModel.findOne({ userId }).exec();
    if (!cart) {
      cart = new CartModel({ userId, items: [], shippingMethod: 'COD' });
    }

    const existingItem = cart.items.find((item) => item.productId.toString() === productId);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.items.push({ productId, quantity: 1 });
    }
    await cart.save();

    // 2. Remove from Wishlist
    const wishlist = await WishlistModel.findOne({ userId }).exec();
    if (wishlist) {
      wishlist.products = wishlist.products.filter((id) => id.toString() !== productId);
      await wishlist.save();
    }

    const populatedWishlist = wishlist
      ? await wishlist.populate('products')
      : { userId, products: [] };

    return response.status(200).json(populatedWishlist);
  } catch (error) {
    next(error);
  }
};

export const moveAllToCart = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const userId = (request as AuthenticatedRequest).user.userId;

    const wishlist = await WishlistModel.findOne({ userId }).exec();
    if (!wishlist || wishlist.products.length === 0) {
      return response.status(200).json({ userId, products: [] });
    }

    // 1. Add all items to Cart
    let cart = await CartModel.findOne({ userId }).exec();
    if (!cart) {
      cart = new CartModel({ userId, items: [], shippingMethod: 'COD' });
    }

    for (const prodId of wishlist.products) {
      const existingItem = cart.items.find((item) => item.productId.toString() === prodId.toString());
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.items.push({ productId: prodId, quantity: 1 });
      }
    }
    await cart.save();

    // 2. Clear Wishlist
    wishlist.products = [];
    await wishlist.save();

    return response.status(200).json(wishlist);
  } catch (error) {
    next(error);
  }
};
