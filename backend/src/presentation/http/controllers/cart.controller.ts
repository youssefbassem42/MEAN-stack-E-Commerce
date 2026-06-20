import type { Request, Response, NextFunction } from 'express';
import { CartModel } from '../../../infrastructure/database/models/cart.model.js';
import { ProductModel } from '../../../infrastructure/database/models/product.model.js';
import { AppError } from '../../../shared/errors/app-error.js';
import type { AuthenticatedRequest } from '../../../shared/middleware/authenticate.middleware.js';

const calculateCartTotals = (cartDoc: any) => {
  let subtotal = 0;
  const items = cartDoc.items.map((item: any) => {
    const product = item.productId;
    const price = product ? product.price : 0;
    subtotal += price * item.quantity;
    return {
      productId: product,
      quantity: item.quantity,
      _id: item._id,
    };
  });

  const vat = subtotal * 0.15;
  const shipping = cartDoc.shippingMethod === 'COD' ? 50 : 0;
  const grandTotal = subtotal + vat + shipping;

  return {
    _id: cartDoc._id,
    userId: cartDoc.userId,
    items,
    shippingMethod: cartDoc.shippingMethod,
    subtotal: parseFloat(subtotal.toFixed(2)),
    vat: parseFloat(vat.toFixed(2)),
    shipping,
    grandTotal: parseFloat(grandTotal.toFixed(2)),
    createdAt: cartDoc.createdAt,
    updatedAt: cartDoc.updatedAt,
  };
};

export const getOrCreateCart = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const userId = (request as AuthenticatedRequest).user.userId;
    let cart = await CartModel.findOne({ userId }).populate('items.productId').exec();

    if (!cart) {
      cart = await CartModel.create({ userId, items: [], shippingMethod: 'COD' });
    }

    return response.status(200).json(calculateCartTotals(cart));
  } catch (error) {
    next(error);
  }
};

export const addItemToCart = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const userId = (request as AuthenticatedRequest).user.userId;
    const { productId, quantity = 1 } = request.body;

    if (!productId) {
      throw new AppError('productId is required.', 400);
    }

    const product = await ProductModel.findById(productId).exec();
    if (!product) {
      throw new AppError('Product not found.', 404);
    }

    if (product.stock < quantity) {
      throw new AppError(`Insufficient stock. Only ${product.stock} units available.`, 400);
    }

    let cart = await CartModel.findOne({ userId }).exec();
    if (!cart) {
      cart = new CartModel({ userId, items: [], shippingMethod: 'COD' });
    }

    const existingItem = cart.items.find((item) => item.productId.toString() === productId);
    if (existingItem) {
      if (product.stock < existingItem.quantity + quantity) {
        throw new AppError(`Insufficient stock. Cannot add more than ${product.stock} units.`, 400);
      }
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    await cart.save();
    const populated = await cart.populate('items.productId');
    return response.status(200).json(calculateCartTotals(populated));
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const userId = (request as AuthenticatedRequest).user.userId;
    const productId = request.params['id'] as string;
    const { quantity } = request.body;

    if (quantity === undefined || quantity < 1) {
      throw new AppError('Quantity must be at least 1.', 400);
    }

    const product = await ProductModel.findById(productId).exec();
    if (!product) {
      throw new AppError('Product not found.', 404);
    }

    if (product.stock < quantity) {
      throw new AppError(`Insufficient stock. Only ${product.stock} units available.`, 400);
    }

    const cart = await CartModel.findOne({ userId }).exec();
    if (!cart) {
      throw new AppError('Cart not found.', 404);
    }

    const item = cart.items.find((item) => item.productId.toString() === productId);
    if (!item) {
      throw new AppError('Product not in cart.', 404);
    }

    item.quantity = quantity;
    await cart.save();

    const populated = await cart.populate('items.productId');
    return response.status(200).json(calculateCartTotals(populated));
  } catch (error) {
    next(error);
  }
};

export const deleteCartItem = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const userId = (request as AuthenticatedRequest).user.userId;
    const productId = request.params['id'] as string;

    const cart = await CartModel.findOne({ userId }).exec();
    if (!cart) {
      throw new AppError('Cart not found.', 404);
    }

    cart.items = cart.items.filter((item) => item.productId.toString() !== productId) as any;
    await cart.save();

    const populated = await cart.populate('items.productId');
    return response.status(200).json(calculateCartTotals(populated));
  } catch (error) {
    next(error);
  }
};

export const updateShippingMethod = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const userId = (request as AuthenticatedRequest).user.userId;
    const { shippingMethod } = request.body;

    if (!shippingMethod || !['COD', 'CARD'].includes(shippingMethod)) {
      throw new AppError('shippingMethod must be COD or CARD.', 400);
    }

    let cart = await CartModel.findOne({ userId }).exec();
    if (!cart) {
      cart = new CartModel({ userId, items: [], shippingMethod: 'COD' });
    }

    cart.shippingMethod = shippingMethod;
    await cart.save();

    const populated = await cart.populate('items.productId');
    return response.status(200).json(calculateCartTotals(populated));
  } catch (error) {
    next(error);
  }
};
