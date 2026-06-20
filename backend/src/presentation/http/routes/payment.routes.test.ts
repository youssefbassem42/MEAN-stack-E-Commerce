import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import Stripe from 'stripe';
import { env } from '../../../infrastructure/config/env.js';
import { connectToDatabase } from '../../../infrastructure/database/mongoose.connection.js';
import { createApp } from '../app.js';
import { UserModel } from '../../../infrastructure/database/models/user.model.js';
import { ProductModel } from '../../../infrastructure/database/models/product.model.js';
import { CategoryModel } from '../../../infrastructure/database/models/category.model.js';
import { CartModel } from '../../../infrastructure/database/models/cart.model.js';
import { OrderModel } from '../../../infrastructure/database/models/order.model.js';
import { PaymentModel } from '../../../infrastructure/database/models/payment.model.js';
import { JwtTokenService } from '../../../infrastructure/security/jwt-token.service.js';

import { stripe } from '../../../infrastructure/stripe/stripe.client.js';

// Stub Stripe paymentIntents.create
stripe.paymentIntents = {
  create: async (params: any) => {
    return {
      id: 'pi_mock_123',
      client_secret: 'pi_mock_secret_123',
      amount: params.amount,
      currency: params.currency,
      metadata: params.metadata,
    };
  },
} as any;

const stripeWebhookHelper = new Stripe(env.stripeSecretKey);

test('Stripe Payment & Webhook Integration Test', async (t) => {
  try {
    // 1. Setup Database Connection
    await connectToDatabase(env.mongodbUri || 'mongodb://127.0.0.1:27017/ecommerce-payment-test');

    // Clear test collections
    await UserModel.deleteMany({});
    await ProductModel.deleteMany({});
    await CategoryModel.deleteMany({});
    await CartModel.deleteMany({});
    await OrderModel.deleteMany({});
    await PaymentModel.deleteMany({});

    // Seed test data
    const user = await UserModel.create({
      email: 'payuser@example.com',
      passwordHash: 'hashedpassword',
      firstName: 'Bob',
      lastName: 'Pay',
      isEmailVerified: true,
    });

    const category = await CategoryModel.create({
      name: 'Smart Watches',
      slug: 'smart-watches',
    });

    const product = await ProductModel.create({
      title: 'FitWatch Pro',
      slug: 'fitwatch-pro',
      price: 150.0,
      stock: 10,
      description: 'Fitness smartwatch.',
      categoryId: category.id,
    });

    // Add product to user cart
    await CartModel.create({
      userId: user.id,
      items: [{ productId: product.id, quantity: 2 }],
      shippingMethod: 'CARD', // Free shipping
    });

    // Generate token
    const tokenService = new JwtTokenService();
    const token = tokenService.issueTokens({
      userId: user.id,
      email: user.email,
    }).accessToken;

    const app = createApp();

    let orderId: string = '';
    let paymentIntentId: string = 'pi_mock_123';

    await t.test('POST /checkout - creates order & payment intent, clears cart', async () => {
      const res = await request(app)
        .post('/checkout')
        .set('Authorization', `Bearer ${token}`)
        .send();

      assert.equal(res.status, 200);
      assert.ok(res.body.clientSecret);
      assert.ok(res.body.orderId);
      assert.equal(res.body.paymentIntentId, 'pi_mock_123');

      orderId = res.body.orderId;

      // Verify cart is now empty
      const cart = await CartModel.findOne({ userId: user.id }).exec();
      assert.equal(cart?.items.length, 0);

      // Verify order exists and status is pending
      const order = await OrderModel.findById(orderId).exec();
      assert.equal(order?.status, 'pending');

      // Verify payment record is pending
      const payment = await PaymentModel.findOne({ orderId }).exec();
      assert.equal(payment?.status, 'pending');
    });

    await t.test('POST /webhooks/stripe - handles payment_intent.succeeded webhook', async () => {
      const payload = JSON.stringify({
        id: 'evt_test_success',
        object: 'event',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: paymentIntentId,
            object: 'payment_intent',
            amount: 34500, // (150*2)*1.15 = 345 EGP * 100 = 34500 cents
            currency: 'egp',
            status: 'succeeded',
          },
        },
      });

      const header = stripeWebhookHelper.webhooks.generateTestHeaderString({
        payload,
        secret: env.stripeWebhookSecret,
      });

      const res = await request(app)
        .post('/webhooks/stripe')
        .set('Stripe-Signature', header)
        .set('Content-Type', 'application/json')
        .send(payload);

      assert.equal(res.status, 200);
      assert.equal(res.body.received, true);

      // Verify order status updated to paid
      const order = await OrderModel.findById(orderId).exec();
      assert.equal(order?.status, 'paid');

      // Verify payment status updated to succeeded
      const payment = await PaymentModel.findOne({ orderId }).exec();
      assert.equal(payment?.status, 'succeeded');
    });

    await t.test('POST /webhooks/stripe - handles payment_intent.payment_failed webhook', async () => {
      // Re-create a new pending order and payment intent to test failure
      const failOrder = await OrderModel.create({
        userId: user.id,
        items: [{ productId: product.id, quantity: 1 }],
        status: 'pending',
      });

      const failPaymentIntentId = 'pi_mock_fail_456';
      await PaymentModel.create({
        orderId: failOrder._id,
        paymentIntentId: failPaymentIntentId,
        amount: 150.0,
        status: 'pending',
      });

      const payload = JSON.stringify({
        id: 'evt_test_failed',
        object: 'event',
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: failPaymentIntentId,
            object: 'payment_intent',
            amount: 15000,
            currency: 'egp',
            status: 'requires_payment_method',
          },
        },
      });

      const header = stripeWebhookHelper.webhooks.generateTestHeaderString({
        payload,
        secret: env.stripeWebhookSecret,
      });

      const res = await request(app)
        .post('/webhooks/stripe')
        .set('Stripe-Signature', header)
        .set('Content-Type', 'application/json')
        .send(payload);

      assert.equal(res.status, 200);
      assert.equal(res.body.received, true);

      // Verify order status updated to failed
      const order = await OrderModel.findById(failOrder._id).exec();
      assert.equal(order?.status, 'failed');

      // Verify payment status updated to failed
      const payment = await PaymentModel.findOne({ orderId: failOrder._id }).exec();
      assert.equal(payment?.status, 'failed');
    });

  } catch (err) {
    console.error('PAYMENT INTEGRATION TEST ERROR:', err);
    throw err;
  } finally {
    await mongoose.connection.close();
  }
});
