import type { Request, Response, NextFunction } from 'express';
import { UserModel } from '../../../infrastructure/database/models/user.model.js';
import { OrderModel } from '../../../infrastructure/database/models/order.model.js';
import { ProductModel } from '../../../infrastructure/database/models/product.model.js';
import { InventoryLogModel } from '../../../infrastructure/database/models/inventory-log.model.js';
import { AppError } from '../../../shared/errors/app-error.js';

export const getAdminStats = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const totalUsers = await UserModel.countDocuments().exec();
    const totalOrders = await OrderModel.countDocuments().exec();
    
    // Revenue is sum of grandTotal for completed/paid orders
    const paidOrders = await OrderModel.find({
      status: { $in: ['paid', 'packed', 'shipped', 'delivered'] }
    }).exec();
    const revenue = paidOrders.reduce((sum, order) => sum + (order.grandTotal || 0), 0);

    // Low stock are products with stock <= 5
    const lowStock = await ProductModel.countDocuments({ stock: { $lte: 5 } }).exec();

    return response.status(200).json({
      totalUsers,
      totalOrders,
      revenue,
      lowStock,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminUsers = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const users = await UserModel.find({}).sort({ createdAt: -1 }).exec();
    return response.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { id } = request.params;
    const { role } = request.body;

    if (!['user', 'admin'].includes(role)) {
      throw new AppError('Invalid role.', 400);
    }

    const user = await UserModel.findByIdAndUpdate(id, { role }, { new: true }).exec();
    if (!user) {
      throw new AppError('User not found.', 404);
    }

    return response.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const getAdminOrders = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const orders = await OrderModel.find({})
      .populate('userId', 'email firstName lastName')
      .populate('items.productId')
      .sort({ createdAt: -1 })
      .exec();
    return response.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

export const getAdminInventoryLogs = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const logs = await InventoryLogModel.find({})
      .populate('productId', 'title price stock')
      .populate('referenceId', 'grandTotal status')
      .sort({ createdAt: -1 })
      .exec();
    return response.status(200).json(logs);
  } catch (error) {
    next(error);
  }
};
