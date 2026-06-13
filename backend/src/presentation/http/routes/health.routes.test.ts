import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../app.js';

test('GET /health returns 200', async () => {
  const response = await request(createApp()).get('/health');

  assert.equal(response.status, 200);
  assert.equal(response.body.status, 'ok');
  assert.equal(typeof response.body.timestamp, 'string');
});
