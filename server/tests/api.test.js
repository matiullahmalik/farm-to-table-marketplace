process.env.JWT_SECRET = 'test-secret';
const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const Product = require('../src/models/Product');
const Slot = require('../src/models/Slot');

let mongod;
beforeAll(async () => { mongod = await MongoMemoryServer.create(); await mongoose.connect(mongod.getUri()); });
afterAll(async () => { await mongoose.disconnect(); await mongod.stop(); });

const reg = async (role, n) =>
  (await request(app).post('/api/auth/register').send({ name: 'U' + n, email: `${role}${n}@t.com`, password: 'password123', role })).body;
const days = (d) => new Date(Date.now() + d * 864e5);
const bearer = (t) => ({ Authorization: 'Bearer ' + t });

async function setup(stock, capacity, tag) {
  const f = await reg('farmer', tag);
  const p = (await request(app).post('/api/products').set(bearer(f.token))
    .send({ name: 'Tomato', price: 2, unit: 'kg', stock, seasonStart: days(-1), seasonEnd: days(30) })).body;
  const slot = (await request(app).post('/api/slots').set(bearer(f.token))
    .send({ date: `2099-01-0${tag}`, window: 'Morning', capacity })).body;
  return { f, p, slot };
}
const order = (token, p, slot, qty = 3) =>
  request(app).post('/api/orders').set(bearer(token)).send({ items: [{ productId: p._id, qty }], slotId: slot._id, address: '1 Farm Rd' });

test('registration rejects short passwords and admin role', async () => {
  const a = await request(app).post('/api/auth/register').send({ name: 'x', email: 'a@t.com', password: 'short', role: 'buyer' });
  const b = await request(app).post('/api/auth/register').send({ name: 'x', email: 'b@t.com', password: 'password123', role: 'admin' });
  expect([a.status, b.status]).toEqual([400, 400]);
});

test('login works and wrong password fails', async () => {
  await reg('buyer', 90);
  const ok = await request(app).post('/api/auth/login').send({ email: 'buyer90@t.com', password: 'password123' });
  const bad = await request(app).post('/api/auth/login').send({ email: 'buyer90@t.com', password: 'wrongpass1' });
  expect(ok.status).toBe(200); expect(ok.body.token).toBeDefined(); expect(bad.status).toBe(401);
});

test('buyer cannot create products (role-based access)', async () => {
  const b = await reg('buyer', 91);
  const r = await request(app).post('/api/products').set(bearer(b.token)).send({ name: 'x' });
  expect(r.status).toBe(403);
});

test('in-season filter hides out-of-season products', async () => {
  const f = await reg('farmer', 92);
  await request(app).post('/api/products').set(bearer(f.token))
    .send({ name: 'Winter Kale', price: 1, unit: 'kg', stock: 5, seasonStart: days(100), seasonEnd: days(200) });
  const r = await request(app).get('/api/products?inSeason=true');
  expect(r.body.find((p) => p.name === 'Winter Kale')).toBeUndefined();
});

test('CONCURRENCY: two buyers racing for the last stock -> exactly one succeeds', async () => {
  const { p, slot } = await setup(5, 10, 1);
  const b1 = await reg('buyer', 1), b2 = await reg('buyer', 2);
  const [r1, r2] = await Promise.all([order(b1.token, p, slot), order(b2.token, p, slot)]);
  console.log('Concurrency result statuses:', r1.status, r2.status);
  expect([r1.status, r2.status].sort()).toEqual([201, 409]);
  expect((await Product.findById(p._id)).stock).toBe(2);
});

test('full slot is rejected and stock is restored', async () => {
  const { p, slot } = await setup(10, 1, 2);
  const b1 = await reg('buyer', 3), b2 = await reg('buyer', 4);
  expect((await order(b1.token, p, slot, 2)).status).toBe(201);
  expect((await order(b2.token, p, slot, 2)).status).toBe(409);
  expect((await Product.findById(p._id)).stock).toBe(8); // only the first order kept its stock
  expect((await Slot.findById(slot._id)).booked).toBe(1);
});

test('farmer advances order status in sequence', async () => {
  const { f, p, slot } = await setup(10, 5, 3);
  const b = await reg('buyer', 5);
  const o = (await order(b.token, p, slot, 1)).body;
  const r = await request(app).patch(`/api/orders/${o._id}/status`).set(bearer(f.token));
  expect(r.body.status).toBe('Confirmed');
});
