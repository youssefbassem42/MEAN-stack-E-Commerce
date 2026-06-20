import type { Request, Response, NextFunction } from 'express';
import { OrderModel } from '../../../infrastructure/database/models/order.model.js';
import { ProductModel } from '../../../infrastructure/database/models/product.model.js';
import { InventoryLogModel } from '../../../infrastructure/database/models/inventory-log.model.js';
import { AppError } from '../../../shared/errors/app-error.js';
import type { AuthenticatedRequest } from '../../../shared/middleware/authenticate.middleware.js';

export const getOrders = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const userId = (request as AuthenticatedRequest).user.userId;
    const orders = await OrderModel.find({ userId })
      .populate('items.productId')
      .sort({ createdAt: -1 })
      .exec();

    return response.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const userId = (request as AuthenticatedRequest).user.userId;
    const orderId = request.params['id'] as string;

    const order = await OrderModel.findById(orderId).populate('items.productId').exec();
    if (!order) {
      throw new AppError('Order not found.', 404);
    }

    if (order.userId.toString() !== userId) {
      throw new AppError('You are not authorized to view this order.', 403);
    }

    return response.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const orderId = request.params['id'] as string;
    const { status } = request.body;

    const validStatuses = ['pending', 'paid', 'packed', 'shipped', 'delivered', 'cancelled', 'failed'];
    if (!validStatuses.includes(status)) {
      throw new AppError('Invalid order status.', 400);
    }

    const order = await OrderModel.findById(orderId).exec();
    if (!order) {
      throw new AppError('Order not found.', 404);
    }

    const oldStatus = order.status;
    const isNewStatusCancelOrFailed = ['cancelled', 'failed'].includes(status);
    const isOldStatusCancelOrFailed = ['cancelled', 'failed'].includes(oldStatus);

    order.status = status;
    await order.save();

    if (isNewStatusCancelOrFailed && !isOldStatusCancelOrFailed) {
      // Restore stock
      for (const item of order.items) {
        const product = await ProductModel.findById(item.productId).exec();
        if (product) {
          product.stock += item.quantity;
          await product.save();

          await InventoryLogModel.create({
            productId: product._id,
            quantity: item.quantity,
            type: 'cancel',
            referenceId: order._id,
          });
        }
      }
    }

    const populatedOrder = await OrderModel.findById(order._id).populate('items.productId').exec();
    return response.status(200).json(populatedOrder);
  } catch (error) {
    next(error);
  }
};
