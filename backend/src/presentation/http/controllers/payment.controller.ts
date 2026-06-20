import type { Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import { stripe } from '../../../infrastructure/stripe/stripe.client.js';
import { env } from '../../../infrastructure/config/env.js';
import { CartModel } from '../../../infrastructure/database/models/cart.model.js';
import { OrderModel } from '../../../infrastructure/database/models/order.model.js';
import { PaymentModel } from '../../../infrastructure/database/models/payment.model.js';
import { ProductModel } from '../../../infrastructure/database/models/product.model.js';
import { InventoryLogModel } from '../../../infrastructure/database/models/inventory-log.model.js';
import { AppError } from '../../../shared/errors/app-error.js';
import type { AuthenticatedRequest } from '../../../shared/middleware/authenticate.middleware.js';

const calculateCartTotals = (cartDoc: any) => {
  let subtotal = 0;
  cartDoc.items.forEach((item: any) => {
    const product = item.productId;
    const price = product ? product.price : 0;
    subtotal += price * item.quantity;
  });

  const vat = subtotal * 0.15;
  const shipping = cartDoc.shippingMethod === 'COD' ? 50 : 0;
  const grandTotal = subtotal + vat + shipping;

  return {
    subtotal,
    vat,
    shipping,
    grandTotal,
  };
};

export const checkout = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const userId = (request as AuthenticatedRequest).user.userId;

    const cart = await CartModel.findOne({ userId }).populate('items.productId').exec();
    if (!cart || cart.items.length === 0) {
      throw new AppError('Your cart is empty.', 400);
    }

    // Calculate totals
    const totals = calculateCartTotals(cart);

    // Verify stock first
    for (const item of cart.items) {
      const product = item.productId as any;
      if (!product) {
        throw new AppError('One of the products in your cart no longer exists.', 400);
      }
      if (product.stock < item.quantity) {
        throw new AppError(`Cannot purchase unavailable stock. Only ${product.stock} units of ${product.title} are available.`, 400);
      }
    }

    // 1. Create Order
    const orderItems = cart.items.map((item) => ({
      productId: item.productId._id,
      quantity: item.quantity,
    }));

    const order = await OrderModel.create({
      userId,
      items: orderItems,
      shippingMethod: cart.shippingMethod,
      shipping: totals.shipping,
      subtotal: totals.subtotal,
      vat: totals.vat,
      grandTotal: totals.grandTotal,
      status: 'pending',
    });

    // Deduct stock and log inventory
    for (const item of cart.items) {
      const product = await ProductModel.findById(item.productId._id).exec();
      if (product) {
        product.stock -= item.quantity;
        await product.save();

        await InventoryLogModel.create({
          productId: product._id,
          quantity: -item.quantity,
          type: 'purchase',
          referenceId: order._id,
        });
      }
    }

    // 2. Create Stripe Payment Intent
    const amountInCents = Math.round(totals.grandTotal * 100);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'egp',
      metadata: {
        orderId: order._id.toString(),
        userId: userId,
      },
    });

    // 3. Create Payment Transaction Record
    await PaymentModel.create({
      orderId: order._id,
      paymentIntentId: paymentIntent.id,
      amount: totals.grandTotal,
      status: 'pending',
    });

    // 4. Clear User Cart
    cart.items = [] as any;
    await cart.save();

    return response.status(200).json({
      clientSecret: paymentIntent.client_secret,
      orderId: order._id,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    next(error);
  }
};

export const stripeWebhook = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const sig = request.headers['stripe-signature'];
    if (!sig) {
      throw new AppError('Missing Stripe signature header.', 400);
    }

    const rawBody = (request as any).rawBody || request.body;
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(rawBody, sig, env.stripeWebhookSecret);
    } catch (err: any) {
      throw new AppError(`Webhook signature verification failed: ${err.message}`, 400);
    }

    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    if (event.type === 'payment_intent.succeeded') {
      const payment = await PaymentModel.findOne({ paymentIntentId: paymentIntent.id }).exec();
      if (payment) {
        payment.status = 'succeeded';
        await payment.save();

        await OrderModel.findByIdAndUpdate(payment.orderId, { status: 'paid' }).exec();
      }
    } else if (event.type === 'payment_intent.payment_failed') {
      const payment = await PaymentModel.findOne({ paymentIntentId: paymentIntent.id }).exec();
      if (payment) {
        payment.status = 'failed';
        await payment.save();

        const order = await OrderModel.findById(payment.orderId).exec();
        if (order && order.status !== 'failed' && order.status !== 'cancelled') {
          order.status = 'failed';
          await order.save();

          // Restore stock since payment failed
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
      }
    }

    return response.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
};
