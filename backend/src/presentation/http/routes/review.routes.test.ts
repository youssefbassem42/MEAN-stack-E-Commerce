import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createServer } from 'node:http';
import { io as ClientIo } from 'socket.io-client';
import mongoose from 'mongoose';
import { env } from '../../../infrastructure/config/env.js';
import { connectToDatabase } from '../../../infrastructure/database/mongoose.connection.js';
import { createApp } from '../app.js';
import { initSocket } from '../../socket/socket.server.js';
import { UserModel } from '../../../infrastructure/database/models/user.model.js';
import { ProductModel } from '../../../infrastructure/database/models/product.model.js';
import { CategoryModel } from '../../../infrastructure/database/models/category.model.js';
import { OrderModel } from '../../../infrastructure/database/models/order.model.js';
import { ReviewModel } from '../../../infrastructure/database/models/review.model.js';
import { JwtTokenService } from '../../../infrastructure/security/jwt-token.service.js';

test('Reviews & Real-Time Viewer Count System Integration Test', async (t) => {
  try {
    // 1. Setup Database Connection
    await connectToDatabase(env.mongodbUri || 'mongodb://127.0.0.1:27017/ecommerce-review-test');

    // Clear test DB collections
    await UserModel.deleteMany({});
    await ProductModel.deleteMany({});
    await CategoryModel.deleteMany({});
    await OrderModel.deleteMany({});
    await ReviewModel.deleteMany({});

    // Seed test data
    const buyerUser = await UserModel.create({
      email: 'buyer@example.com',
      passwordHash: 'hashedpassword',
      firstName: 'John',
      lastName: 'Buyer',
      isEmailVerified: true,
    });

    const nonBuyerUser = await UserModel.create({
      email: 'nonbuyer@example.com',
      passwordHash: 'hashedpassword',
      firstName: 'Jane',
      lastName: 'Visitor',
      isEmailVerified: true,
    });

    const category = await CategoryModel.create({
      name: 'Smart Devices',
      slug: 'smart-devices',
    });

    const product = await ProductModel.create({
      title: 'Super Smart Gadget',
      slug: 'super-smart-gadget',
      price: 49.99,
      stock: 20,
      description: 'A revolutionary device.',
      categoryId: category.id,
    });

    // Create delivered order for buyer
    await OrderModel.create({
      userId: buyerUser.id,
      items: [{ productId: product.id, quantity: 1 }],
      status: 'delivered',
    });

    // Generate tokens
    const tokenService = new JwtTokenService();
    const buyerTokens = tokenService.issueTokens({
      userId: buyerUser.id,
      email: buyerUser.email,
    });
    const buyerToken = buyerTokens.accessToken;

    const nonBuyerTokens = tokenService.issueTokens({
      userId: nonBuyerUser.id,
      email: nonBuyerUser.email,
    });
    const nonBuyerToken = nonBuyerTokens.accessToken;

    // Create Express App
    const app = createApp();

    await t.test('POST /reviews - buyer can review product', async () => {
      const res = await request(app)
        .post('/reviews')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          productId: product.id,
          rating: 5,
          comment: 'This smart gadget is amazing!',
        });

      assert.equal(res.status, 201);
      assert.equal(res.body.rating, 5);
      assert.equal(res.body.comment, 'This smart gadget is amazing!');
    });

    await t.test('POST /reviews - non-buyer review is rejected', async () => {
      const res = await request(app)
        .post('/reviews')
        .set('Authorization', `Bearer ${nonBuyerToken}`)
        .send({
          productId: product.id,
          rating: 4,
          comment: 'Can I review this?',
        });

      assert.equal(res.status, 403);
      assert.match(res.body.message || '', /Only verified buyers/);
    });

    await t.test('GET /reviews/:productId - returns all product reviews', async () => {
      const res = await request(app).get(`/reviews/${product.id}`);

      assert.equal(res.status, 200);
      assert.equal(res.body.length, 1);
      assert.equal(res.body[0].rating, 5);
      assert.equal(res.body[0].userId.firstName, 'John');
    });

    await t.test('Real-time Viewer Count (Socket.io)', async () => {
      // Spin up Socket.io server on a free port
      const testServer = createServer(app);
      const io = initSocket(testServer);

      await new Promise<void>((resolve) => {
        testServer.listen(0, resolve);
      });

      const address = testServer.address();
      const port = typeof address === 'string' ? 0 : address?.port || 0;
      const socketUrl = `http://127.0.0.1:${port}`;

      const productId = product.id.toString();

      // Connect Client 1
      const client1 = ClientIo(socketUrl, { forceNew: true });
      
      // Connect Client 2
      const client2 = ClientIo(socketUrl, { forceNew: true });

      // Helper to wait for client connection
      const waitConnect = (client: any) => new Promise<void>((resolve) => client.on('connect', resolve));
      await Promise.all([waitConnect(client1), waitConnect(client2)]);

      // Check Viewer count increases
      const viewerCountPromise = new Promise<number>((resolve) => {
        client1.on('viewer-count-changed', (data: any) => {
          if (data.productId === productId && data.count === 1) {
            resolve(data.count);
          }
        });
      });

      client1.emit('join-product', productId);
      const count1 = await viewerCountPromise;
      assert.equal(count1, 1);

      // Join Client 2
      const viewerCount2Promise = new Promise<number>((resolve) => {
        client2.on('viewer-count-changed', (data: any) => {
          if (data.productId === productId && data.count === 2) {
            resolve(data.count);
          }
        });
      });

      client2.emit('join-product', productId);
      const count2 = await viewerCount2Promise;
      assert.equal(count2, 2);

      // Leave/Disconnect Client 2
      const viewerCountLeavePromise = new Promise<number>((resolve) => {
        client1.on('viewer-count-changed', (data: any) => {
          if (data.productId === productId && data.count === 1) {
            resolve(data.count);
          }
        });
      });

      client2.emit('leave-product', productId);
      const count3 = await viewerCountLeavePromise;
      assert.equal(count3, 1);

      // Cleanup clients & server
      client1.close();
      client2.close();
      io.close();
      await new Promise<void>((resolve) => testServer.close(() => resolve()));
    });
  } catch (err) {
    console.error('CRITICAL TEST ERROR:', err);
    throw err;
  } finally {
    // Teardown DB Connection
    await mongoose.connection.close();
  }
});
