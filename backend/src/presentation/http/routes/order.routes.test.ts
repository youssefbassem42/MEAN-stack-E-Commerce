import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import mongoose from 'mongoose';
import { env } from '../../../infrastructure/config/env.js';
import { connectToDatabase } from '../../../infrastructure/database/mongoose.connection.js';
import { createApp } from '../app.js';
import { UserModel } from '../../../infrastructure/database/models/user.model.js';
import { ProductModel } from '../../../infrastructure/database/models/product.model.js';
import { CategoryModel } from '../../../infrastructure/database/models/category.model.js';
import { OrderModel } from '../../../infrastructure/database/models/order.model.js';
import { JwtTokenService } from '../../../infrastructure/security/jwt-token.service.js';

test('Order Lifecycle System Integration Test', async (t) => {
  try {
    // 1. Connect to Database
    await connectToDatabase(env.mongodbUri || 'mongodb://127.0.0.1:27017/ecommerce-order-test');

    // Clear test collections
    await UserModel.deleteMany({});
    await ProductModel.deleteMany({});
    await CategoryModel.deleteMany({});
    await OrderModel.deleteMany({});

    // Seed User A
    const userA = await UserModel.create({
      email: 'usera@example.com',
      passwordHash: 'hashedpassword',
      firstName: 'Alice',
      lastName: 'A',
      isEmailVerified: true,
    });

    // Seed User B
    const userB = await UserModel.create({
      email: 'userb@example.com',
      passwordHash: 'hashedpassword',
      firstName: 'Bob',
      lastName: 'B',
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

    // Generate tokens
    const tokenService = new JwtTokenService();
    const tokenA = tokenService.issueTokens({
      userId: userA.id,
      email: userA.email,
    }).accessToken;

    const tokenB = tokenService.issueTokens({
      userId: userB.id,
      email: userB.email,
    }).accessToken;

    // Create Order for User A
    const orderA = await OrderModel.create({
      userId: userA.id,
      items: [{ productId: product.id, quantity: 2 }],
      status: 'pending',
    });

    // Create Order for User B
    const orderB = await OrderModel.create({
      userId: userB.id,
      items: [{ productId: product.id, quantity: 1 }],
      status: 'pending',
    });

    const app = createApp();

    await t.test('GET /orders - returns own orders only', async () => {
      const res = await request(app)
        .get('/orders')
        .set('Authorization', `Bearer ${tokenA}`)
        .send();

      assert.equal(res.status, 200);
      assert.ok(Array.isArray(res.body));
      assert.equal(res.body.length, 1);
      assert.equal(res.body[0]._id, orderA.id);
    });

    await t.test('GET /orders/:id - user can view own order details', async () => {
      const res = await request(app)
        .get(`/orders/${orderA.id}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send();

      assert.equal(res.status, 200);
      assert.equal(res.body._id, orderA.id);
      assert.equal(res.body.userId, userA.id);
    });

    await t.test('GET /orders/:id - user cannot view others orders', async () => {
      const res = await request(app)
        .get(`/orders/${orderB.id}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send();

      assert.equal(res.status, 403);
      assert.equal(res.body.message, 'You are not authorized to view this order.');
    });

    await t.test('PUT /orders/:id/status - successfully updates order status', async () => {
      const res = await request(app)
        .put(`/orders/${orderA.id}/status`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ status: 'shipped' });

      assert.equal(res.status, 200);
      assert.equal(res.body.status, 'shipped');

      // Verify in DB
      const updatedOrder = await OrderModel.findById(orderA.id).exec();
      assert.equal(updatedOrder?.status, 'shipped');
    });

    await t.test('PUT /orders/:id/status - rejects invalid status', async () => {
      const res = await request(app)
        .put(`/orders/${orderA.id}/status`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ status: 'invalid_status_value' });

      assert.equal(res.status, 400);
    });

  } catch (err) {
    console.error('ORDER LIFECYCLE TEST ERROR:', err);
    throw err;
  } finally {
    await mongoose.connection.close();
  }
});
