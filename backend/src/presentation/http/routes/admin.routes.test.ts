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

test('Admin Access & Dashboard Statistics Integration Test', async (t) => {
  try {
    await connectToDatabase(env.mongodbUri || 'mongodb://127.0.0.1:27017/ecommerce-admin-test');

    // Clear test collections
    await UserModel.deleteMany({});
    await ProductModel.deleteMany({});
    await CategoryModel.deleteMany({});
    await OrderModel.deleteMany({});

    // Seed data
    const adminUser = await UserModel.create({
      email: 'admin@example.com',
      passwordHash: 'hashedpassword',
      firstName: 'Super',
      lastName: 'Admin',
      role: 'admin',
      isEmailVerified: true,
    });

    const normalUser = await UserModel.create({
      email: 'user@example.com',
      passwordHash: 'hashedpassword',
      firstName: 'Normal',
      lastName: 'User',
      role: 'user',
      isEmailVerified: true,
    });

    const category = await CategoryModel.create({
      name: 'Appliances',
      slug: 'appliances',
    });

    // 1 low stock product, 1 normal stock product
    const lowStockProduct = await ProductModel.create({
      title: 'Toaster',
      slug: 'toaster',
      price: 20.0,
      stock: 2, // <= 5 (low stock)
      description: 'Bread toaster.',
      categoryId: category.id,
    });

    const normalStockProduct = await ProductModel.create({
      title: 'Fridge',
      slug: 'fridge',
      price: 500.0,
      stock: 10,
      description: 'Smart Fridge.',
      categoryId: category.id,
    });

    // 1 paid order (revenue), 1 pending order (not revenue yet)
    await OrderModel.create({
      userId: normalUser.id,
      items: [{ productId: lowStockProduct.id, quantity: 1 }],
      status: 'paid',
      grandTotal: 23.0, // Subtotal + vat etc.
    });

    await OrderModel.create({
      userId: normalUser.id,
      items: [{ productId: normalStockProduct.id, quantity: 1 }],
      status: 'pending',
      grandTotal: 575.0,
    });

    const tokenService = new JwtTokenService();
    const adminToken = tokenService.issueTokens({
      userId: adminUser.id,
      email: adminUser.email,
    }).accessToken;

    const normalToken = tokenService.issueTokens({
      userId: normalUser.id,
      email: normalUser.email,
    }).accessToken;

    const app = createApp();

    await t.test('User access is blocked (returns 403)', async () => {
      const res = await request(app)
        .get('/admin/stats')
        .set('Authorization', `Bearer ${normalToken}`)
        .send();

      assert.equal(res.status, 403);
      assert.match(res.body.message, /Forbidden: Admin access only/);
    });

    await t.test('Admin access is allowed (returns 200) and stats are accurate', async () => {
      const res = await request(app)
        .get('/admin/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .send();

      assert.equal(res.status, 200);
      assert.equal(res.body.totalUsers, 2);
      assert.equal(res.body.totalOrders, 2);
      assert.equal(res.body.revenue, 23.0); // Only paid order counted
      assert.equal(res.body.lowStock, 1); // Only toaster has <= 5 stock
    });

    await t.test('Admin can list users', async () => {
      const res = await request(app)
        .get('/admin/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send();

      assert.equal(res.status, 200);
      assert.equal(res.body.length, 2);
    });

    await t.test('Admin can update user role', async () => {
      const res = await request(app)
        .put(`/admin/users/${normalUser._id}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role: 'admin' });

      assert.equal(res.status, 200);
      assert.equal(res.body.role, 'admin');

      // Verify in DB
      const updatedUser = await UserModel.findById(normalUser._id).exec();
      assert.equal(updatedUser?.role, 'admin');
    });

  } catch (err) {
    console.error('ADMIN INTEGRATION TEST ERROR:', err);
    throw err;
  } finally {
    await mongoose.connection.close();
  }
});
