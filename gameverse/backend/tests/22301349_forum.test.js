const request = require('supertest');
const { setupTestApp, teardownTestApp, getAuthTokenForNewUser, getAuthTokenForNewAdmin, appGetter } = require('./helpers');

let app;
let userToken;
let adminToken;

describe('Feature: Forum (ID: 22301349)', () => {
  beforeAll(async () => {
    app = await setupTestApp();
    userToken = (await getAuthTokenForNewUser()).token;
    adminToken = (await getAuthTokenForNewAdmin()).token;
  });

  afterAll(async () => {
    await teardownTestApp();
  });

  it('lists forum categories (public)', async () => {
    const res = await request(appGetter()).get('/api/forum/categories');
    expect(res.statusCode).toBe(200);
  });

  it('searches threads (public)', async () => {
    const res = await request(appGetter()).get('/api/forum/search?q=test');
    expect(res.statusCode).toBe(200);
  });

  it('returns 401 when creating thread without token', async () => {
    const res = await request(appGetter())
      .post('/api/forum/categories/000000000000000000000000/threads')
      .send({ title: 'Test' });
    expect(res.statusCode).toBe(401);
  });

  it('rejects posting without token', async () => {
    const res = await request(appGetter())
      .post('/api/forum/threads/000000000000000000000000/posts')
      .send({ content: 'Test' });
    expect(res.statusCode).toBe(401);
  });
});
