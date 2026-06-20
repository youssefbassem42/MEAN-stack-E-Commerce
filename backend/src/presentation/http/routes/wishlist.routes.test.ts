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
import { WishlistModel } from '../../../infrastructure/database/models/wishlist.model.js';
import { JwtTokenService } from '../../../infrastructure/security/jwt-token.service.js';

test('Wishlist System Integration Test', async (t) => {
  try {
    // 1. Setup Database Connection
    await connectToDatabase(env.mongodbUri || 'mongodb://127.0.0.1:27017/ecommerce-wishlist-test');

    // Clear test collections
    await UserModel.deleteMany({});
    await ProductModel.deleteMany({});
    await CategoryModel.deleteMany({});
    await CartModel.deleteMany({});
    await WishlistModel.deleteMany({});

    // Seed test data
    const user = await UserModel.create({
      email: 'wishuser@example.com',
      passwordHash: 'hashedpassword',
      firstName: 'Alice',
      lastName: 'Wish',
      isEmailVerified: true,
    });

    const category = await CategoryModel.create({
      name: 'Mobile Devices',
      slug: 'mobile-devices',
    });

    const product1 = await ProductModel.create({
      title: 'Smart Phone Y',
      slug: 'smart-phone-y',
      price: 150.0,
      stock: 10,
      description: 'Better phone.',
      categoryId: category.id,
    });

    const product2 = await ProductModel.create({
      title: 'Phone Case Lite',
      slug: 'phone-case-lite',
      price: 15.0,
      stock: 5,
      description: 'Thin protection.',
      categoryId: category.id,
    });

    // Generate token
    const tokenService = new JwtTokenService();
    const token = tokenService.issueTokens({
      userId: user.id,
      email: user.email,
    }).accessToken;

    const app = createApp();

    await t.test('POST /wishlist - adds product to wishlist', async () => {
      const res = await request(app)
        .post('/wishlist')
        .set('Authorization', `Bearer ${token}`)
        .send({
          productId: product1.id,
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.products.length, 1);
      assert.equal(res.body.products[0]._id.toString(), product1.id.toString());
    });

    await t.test('DELETE /wishlist/:id - removes product from wishlist', async () => {
      // Add product2
      await request(app)
        .post('/wishlist')
        .set('Authorization', `Bearer ${token}`)
        .send({
          productId: product2.id,
        });

      // Remove product1
      const res = await request(app)
        .delete(`/wishlist/${product1.id}`)
        .set('Authorization', `Bearer ${token}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.products.length, 1);
      assert.equal(res.body.products[0]._id.toString(), product2.id.toString());
    });

    await t.test('POST /wishlist/move-to-cart - moves product from wishlist to cart', async () => {
      const res = await request(app)
        .post('/wishlist/move-to-cart')
        .set('Authorization', `Bearer ${token}`)
        .send({
          productId: product2.id,
        });

      assert.equal(res.status, 200);
      // Product 2 should be removed from wishlist
      assert.equal(res.body.products.length, 0);

      // Verify cart contains product 2
      const cartRes = await request(app)
        .get('/cart')
        .set('Authorization', `Bearer ${token}`);
      
      assert.equal(cartRes.status, 200);
      assert.equal(cartRes.body.items.length, 1);
      assert.equal(cartRes.body.items[0].productId._id.toString(), product2.id.toString());
    });

  } catch (err) {
    console.error('WISHLIST INTEGRATION TEST ERROR:', err);
    throw err;
  } finally {
    await mongoose.connection.close();
  }
});
