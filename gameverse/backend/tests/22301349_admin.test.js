const request = require('supertest');
const { setupTestApp, teardownTestApp, getAuthTokenForNewUser, getAuthTokenForNewAdmin, appGetter } = require('./helpers');

let app;
let userToken;
let adminToken;

describe('Feature: Admin (ID: 22301349)', () => {
  beforeAll(async () => {
    app = await setupTestApp();
    userToken = (await getAuthTokenForNewUser()).token;
    adminToken = (await getAuthTokenForNewAdmin()).token;
  });

  afterAll(async () => {
    await teardownTestApp();
  });

  it('returns 403 when normal user accesses dashboard', async () => {
    const res = await request(appGetter()).get('/api/admin/dashboard').set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(403);
  });

  it('admin can access dashboard', async () => {
    const res = await request(appGetter()).get('/api/admin/dashboard').set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
  });

  it('admin can get analytics', async () => {
    const res = await request(appGetter()).get('/api/admin/analytics').set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
  });

  it('admin can list users', async () => {
    const res = await request(appGetter()).get('/api/admin/users').set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
  });

  it('returns 401 when no token provided', async () => {
    const res = await request(appGetter()).get('/api/admin/dashboard');
    expect(res.statusCode).toBe(401);
  });
});
