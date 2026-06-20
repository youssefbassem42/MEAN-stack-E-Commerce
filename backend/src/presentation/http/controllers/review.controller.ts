import type { Request, Response, NextFunction } from 'express';
import { ReviewModel } from '../../../infrastructure/database/models/review.model.js';
import { OrderModel } from '../../../infrastructure/database/models/order.model.js';
import { ProductModel } from '../../../infrastructure/database/models/product.model.js';
import { AppError } from '../../../shared/errors/app-error.js';
import type { AuthenticatedRequest } from '../../../shared/middleware/authenticate.middleware.js';

export const createReview = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const authReq = request as AuthenticatedRequest;
    const userId = authReq.user.userId;
    const { productId, rating, comment } = request.body;

    if (!productId || !rating || !comment) {
      throw new AppError('productId, rating, and comment are required.', 400);
    }

    if (rating < 1 || rating > 5) {
      throw new AppError('Rating must be between 1 and 5.', 400);
    }

    const productExists = await ProductModel.findById(productId).exec();
    if (!productExists) {
      throw new AppError('Product not found.', 404);
    }

    // Verify buyer check: must have an order with this product that is delivered or paid
    const purchase = await OrderModel.findOne({
      userId,
      'items.productId': productId,
      status: { $in: ['delivered', 'paid'] },
    }).exec();

    if (!purchase) {
      throw new AppError('Only verified buyers can review this product.', 403);
    }

    // Optional: check if they already reviewed it
    const existingReview = await ReviewModel.findOne({ productId, userId }).exec();
    if (existingReview) {
      throw new AppError('You have already reviewed this product.', 409);
    }

    const review = await ReviewModel.create({
      productId,
      userId,
      rating,
      comment: comment.trim(),
    });

    return response.status(201).json(review);
  } catch (error) {
    next(error);
  }
};

export const getReviewsByProductId = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { productId } = request.params;

    if (!productId) {
      throw new AppError('productId parameter is required.', 400);
    }

    const reviews = await ReviewModel.find({ productId })
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .exec();

    return response.status(200).json(reviews);
  } catch (error) {
    next(error);
  }
};
