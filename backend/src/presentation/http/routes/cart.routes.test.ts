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
import { JwtTokenService } from '../../../infrastructure/security/jwt-token.service.js';

test('Shopping Cart System Integration Test', async (t) => {
  try {
    // 1. Setup Database Connection
    await connectToDatabase(env.mongodbUri || 'mongodb://127.0.0.1:27017/ecommerce-cart-test');

    // Clear test collections
    await UserModel.deleteMany({});
    await ProductModel.deleteMany({});
    await CategoryModel.deleteMany({});
    await CartModel.deleteMany({});

    // Seed test data
    const user = await UserModel.create({
      email: 'cartuser@example.com',
      passwordHash: 'hashedpassword',
      firstName: 'Alice',
      lastName: 'Cart',
      isEmailVerified: true,
    });

    const category = await CategoryModel.create({
      name: 'Mobile Devices',
      slug: 'mobile-devices',
    });

    const product1 = await ProductModel.create({
      title: 'Smart Phone X',
      slug: 'smart-phone-x',
      price: 100.0,
      stock: 10,
      description: 'Flagship phone.',
      categoryId: category.id,
    });

    const product2 = await ProductModel.create({
      title: 'Phone Case Pro',
      slug: 'phone-case-pro',
      price: 20.0,
      stock: 5,
      description: 'Rugged protection.',
      categoryId: category.id,
    });

    // Generate token
    const tokenService = new JwtTokenService();
    const token = tokenService.issueTokens({
      userId: user.id,
      email: user.email,
    }).accessToken;

    const app = createApp();

    await t.test('POST /cart/items - adds item to cart & calculates VAT & COD shipping', async () => {
      const res = await request(app)
        .post('/cart/items')
        .set('Authorization', `Bearer ${token}`)
        .send({
          productId: product1.id,
          quantity: 2,
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.items.length, 1);
      assert.equal(res.body.items[0].productId._id.toString(), product1.id.toString());
      assert.equal(res.body.items[0].quantity, 2);

      // Calculations check:
      // subtotal = 2 * 100 = 200
      // vat = 200 * 0.15 = 30
      // shipping = COD is default = 50
      // grandTotal = 200 + 30 + 50 = 280
      assert.equal(res.body.subtotal, 200.0);
      assert.equal(res.body.vat, 30.0);
      assert.equal(res.body.shipping, 50);
      assert.equal(res.body.grandTotal, 280.0);
    });

    await t.test('PUT /cart/items/:id - increases item quantity & updates totals', async () => {
      const res = await request(app)
        .put(`/cart/items/${product1.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          quantity: 3,
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.items[0].quantity, 3);

      // Calculations check:
      // subtotal = 3 * 100 = 300
      // vat = 300 * 0.15 = 45
      // shipping = 50
      // grandTotal = 300 + 45 + 50 = 395
      assert.equal(res.body.subtotal, 300.0);
      assert.equal(res.body.vat, 45.0);
      assert.equal(res.body.grandTotal, 395.0);
    });

    await t.test('PUT /cart/shipping - changes shipping method to CARD & removes COD fee', async () => {
      const res = await request(app)
        .put('/cart/shipping')
        .set('Authorization', `Bearer ${token}`)
        .send({
          shippingMethod: 'CARD',
        });

      assert.equal(res.status, 200);
      assert.equal(res.body.shippingMethod, 'CARD');
      assert.equal(res.body.shipping, 0);

      // Calculations check:
      // subtotal = 300
      // vat = 45
      // shipping = 0
      // grandTotal = 300 + 45 + 0 = 345
      assert.equal(res.body.grandTotal, 345.0);
    });

    await t.test('DELETE /cart/items/:id - removes item from cart', async () => {
      // Add product2 first
      await request(app)
        .post('/cart/items')
        .set('Authorization', `Bearer ${token}`)
        .send({
          productId: product2.id,
          quantity: 1,
        });

      // Remove product1
      const res = await request(app)
        .delete(`/cart/items/${product1.id}`)
        .set('Authorization', `Bearer ${token}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.items.length, 1);
      assert.equal(res.body.items[0].productId._id.toString(), product2.id.toString());

      // Calculations check:
      // subtotal = 1 * 20 = 20
      // vat = 20 * 0.15 = 3
      // shipping = CARD is currently set in cart = 0
      // grandTotal = 20 + 3 + 0 = 23
      assert.equal(res.body.subtotal, 20.0);
      assert.equal(res.body.vat, 3.0);
      assert.equal(res.body.grandTotal, 23.0);
    });

  } catch (err) {
    console.error('CART INTEGRATION TEST ERROR:', err);
    throw err;
  } finally {
    await mongoose.connection.close();
  }
});
