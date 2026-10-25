import { describe, test, before, after } from 'node:test';
import assert from 'node:assert/strict';

const TEST_URI = process.env.MONGO_URI_TEST;
process.env.JWT_SECRET = 'test-secret';

const { connectDB, disconnectDB } = await import('../config/db.js');
const { seedDatabase } = await import('../seed.js');
const { createApp } = await import('../app.js');

let server;
let baseUrl;
let token;

async function api(method, url, body, auth = true) {
  const res = await fetch(baseUrl + url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, body: await res.json() };
}

describe('ShopDesk API', { skip: !TEST_URI && 'set MONGO_URI_TEST to run the API tests' }, () => {
  before(async () => {
    await connectDB(TEST_URI);
    await seedDatabase();
    server = createApp().listen(0);
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  after(async () => {
    server.close();
    await disconnectDB();
  });

  test('login fails with a wrong password', async () => {
    const res = await api('POST', '/api/auth/login', { email: 'admin@shopdesk.dev', password: 'nope' }, false);
    assert.equal(res.status, 401);
    assert.equal(res.body.message, 'Invalid email or password');
  });

  test('login validates the email', async () => {
    const res = await api('POST', '/api/auth/login', { email: 'not-an-email', password: 'x' }, false);
    assert.equal(res.status, 400);
    assert.ok(res.body.errors.email);
  });

  test('login works with the demo user and returns a token', async () => {
    const res = await api('POST', '/api/auth/login', { email: 'admin@shopdesk.dev', password: 'Admin@123' }, false);
    assert.equal(res.status, 200);
    assert.ok(res.body.token);
    assert.equal(res.body.user.passwordHash, undefined);
    token = res.body.token;
  });

  test('protected routes need a token', async () => {
    const res = await api('GET', '/api/products', null, false);
    assert.equal(res.status, 401);
  });

  test('GET /api/auth/me returns the user', async () => {
    const res = await api('GET', '/api/auth/me');
    assert.equal(res.status, 200);
    assert.equal(res.body.user.email, 'admin@shopdesk.dev');
  });

  test('seed created 30 products in 4 categories and 50 orders', async () => {
    const products = await api('GET', '/api/products?limit=100');
    assert.equal(products.body.total, 30);
    assert.equal(new Set(products.body.items.map((p) => p.category)).size, 4);

    const orders = await api('GET', '/api/orders?limit=1000');
    assert.equal(orders.body.total, 50);
  });

  test('products are paginated 10 per page, with search and category filter', async () => {
    const page1 = await api('GET', '/api/products?page=1');
    assert.equal(page1.body.items.length, 10);
    assert.equal(page1.body.totalPages, 3);

    const search = await api('GET', '/api/products?search=yoga');
    assert.equal(search.body.total, 1);

    const sports = await api('GET', '/api/products?category=Sports');
    assert.ok(sports.body.items.every((p) => p.category === 'Sports'));
  });

  test('product create, update and delete', async () => {
    const bad = await api('POST', '/api/products', { name: '', category: 'Nope', price: 0, stock: 1.5 });
    assert.equal(bad.status, 400);
    assert.deepEqual(Object.keys(bad.body.errors).sort(), ['category', 'name', 'price', 'stock']);

    const created = await api('POST', '/api/products', { name: 'Test Lamp', category: 'Home & Kitchen', price: 999, stock: 5 });
    assert.equal(created.status, 201);
    const id = created.body.product.id;

    const updated = await api('PUT', `/api/products/${id}`, { name: 'Test Lamp 2', category: 'Home & Kitchen', price: 1099, stock: 6 });
    assert.equal(updated.body.product.name, 'Test Lamp 2');

    const deleted = await api('DELETE', `/api/products/${id}`);
    assert.equal(deleted.status, 200);

    const missing = await api('DELETE', `/api/products/${id}`);
    assert.equal(missing.status, 404);

    const badId = await api('PUT', '/api/products/not-an-id', { name: 'x', category: 'Sports', price: 1, stock: 1 });
    assert.equal(badId.status, 404);
  });

  test('orders filter by status and status can be changed', async () => {
    const pending = await api('GET', '/api/orders?status=Pending&limit=1000');
    assert.ok(pending.body.items.every((o) => o.status === 'Pending'));

    const invalid = await api('GET', '/api/orders?status=Lost');
    assert.equal(invalid.status, 400);

    const first = (await api('GET', '/api/orders')).body.items[0];
    const changed = await api('PATCH', `/api/orders/${first.id}/status`, { status: 'Delivered' });
    assert.equal(changed.body.order.status, 'Delivered');

    const badStatus = await api('PATCH', `/api/orders/${first.id}/status`, { status: 'Lost' });
    assert.equal(badStatus.status, 400);
  });

  test('stats return 4 cards, 14 chart days and 5 recent orders', async () => {
    const res = await api('GET', '/api/stats');
    assert.equal(res.status, 200);
    assert.equal(res.body.cards.totalProducts, 30);
    assert.equal(res.body.cards.totalOrders, 50);
    assert.equal(res.body.ordersPerDay.length, 14);
    assert.equal(res.body.ordersPerDay.reduce((s, d) => s + d.orders, 0), 50);
    assert.equal(res.body.recentOrders.length, 5);
  });

  test('profile update: name, and password needs the current password', async () => {
    const renamed = await api('PUT', '/api/users/me', { name: 'Shop Owner' });
    assert.equal(renamed.body.user.name, 'Shop Owner');

    const wrong = await api('PUT', '/api/users/me', { currentPassword: 'wrong', newPassword: 'NewPass@123' });
    assert.equal(wrong.status, 400);
    assert.ok(wrong.body.errors.currentPassword);

    const ok = await api('PUT', '/api/users/me', { currentPassword: 'Admin@123', newPassword: 'NewPass@123' });
    assert.equal(ok.status, 200);

    const login = await api('POST', '/api/auth/login', { email: 'admin@shopdesk.dev', password: 'NewPass@123' }, false);
    assert.equal(login.status, 200);
  });
});
