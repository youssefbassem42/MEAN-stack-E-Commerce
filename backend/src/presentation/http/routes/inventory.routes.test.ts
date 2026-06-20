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
import { CartModel } from '../../../infrastructure/database/models/cart.model.js';
import { OrderModel } from '../../../infrastructure/database/models/order.model.js';
import { InventoryLogModel } from '../../../infrastructure/database/models/inventory-log.model.js';
import { JwtTokenService } from '../../../infrastructure/security/jwt-token.service.js';

test('Inventory Stock Tracking Integration Test', async (t) => {
  try {
    await connectToDatabase(env.mongodbUri || 'mongodb://127.0.0.1:27017/ecommerce-inventory-test');

    // Clear test collections
    await UserModel.deleteMany({});
    await ProductModel.deleteMany({});
    await CategoryModel.deleteMany({});
    await CartModel.deleteMany({});
    await OrderModel.deleteMany({});
    await InventoryLogModel.deleteMany({});

    // Seed test data
    const user = await UserModel.create({
      email: 'inventoryuser@example.com',
      passwordHash: 'hashedpassword',
      firstName: 'Alice',
      lastName: 'Inv',
      isEmailVerified: true,
    });

    const category = await CategoryModel.create({
      name: 'Electronics',
      slug: 'electronics',
    });

    const product = await ProductModel.create({
      title: 'PowerBank Pro',
      slug: 'powerbank-pro',
      price: 50.0,
      stock: 5,
      description: 'High capacity powerbank.',
      categoryId: category.id,
    });

    const tokenService = new JwtTokenService();
    const token = tokenService.issueTokens({
      userId: user.id,
      email: user.email,
    }).accessToken;

    const app = createApp();

    await t.test('Cannot purchase unavailable stock', async () => {
      // Set cart quantity to 6 (exceeding stock of 5)
      await CartModel.create({
        userId: user.id,
        items: [{ productId: product.id, quantity: 6 }],
        shippingMethod: 'COD',
      });

      const res = await request(app)
        .post('/checkout')
        .set('Authorization', `Bearer ${token}`)
        .send();

      assert.equal(res.status, 400);
      assert.match(res.body.message, /Cannot purchase unavailable stock/);

      // Verify product stock is still 5
      const currentProduct = await ProductModel.findById(product.id).exec();
      assert.equal(currentProduct?.stock, 5);
    });

    await t.test('Stock decreases on successful purchase', async () => {
      // Set cart quantity to valid amount: 2
      await CartModel.findOneAndUpdate(
        { userId: user.id },
        { items: [{ productId: product.id, quantity: 2 }] }
      ).exec();

      const res = await request(app)
        .post('/checkout')
        .set('Authorization', `Bearer ${token}`)
        .send();

      assert.equal(res.status, 200);

      // Verify stock decreased by 2 (5 - 2 = 3)
      const currentProduct = await ProductModel.findById(product.id).exec();
      assert.equal(currentProduct?.stock, 3);

      // Verify InventoryLog was created
      const logs = await InventoryLogModel.find({ productId: product.id }).exec();
      assert.equal(logs.length, 1);
      assert.equal(logs[0].quantity, -2);
      assert.equal(logs[0].type, 'purchase');
    });

    await t.test('Stock restores on order cancellation', async () => {
      // Get the order created in previous step
      const order = await OrderModel.findOne({ userId: user.id }).exec();
      assert.ok(order);

      // Cancel the order via status update route
      const res = await request(app)
        .put(`/orders/${order._id}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'cancelled' });

      assert.equal(res.status, 200);

      // Verify stock restored back to 5 (3 + 2 = 5)
      const currentProduct = await ProductModel.findById(product.id).exec();
      assert.equal(currentProduct?.stock, 5);

      // Verify InventoryLog was created for cancel
      const logs = await InventoryLogModel.find({ productId: product.id }).exec();
      assert.equal(logs.length, 2);
      
      const cancelLog = logs.find(log => log.type === 'cancel');
      assert.ok(cancelLog);
      assert.equal(cancelLog?.quantity, 2);
    });

  } catch (err) {
    console.error('INVENTORY INTEGRATION TEST ERROR:', err);
    throw err;
  } finally {
    await mongoose.connection.close();
  }
});
