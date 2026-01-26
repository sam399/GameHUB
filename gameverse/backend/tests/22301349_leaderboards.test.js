const request = require('supertest');
const { setupTestApp, teardownTestApp, getAuthTokenForNewAdmin, getAuthTokenForNewUser, appGetter } = require('./helpers');

let app;
let adminToken;
let userToken;

describe('Feature: Leaderboards (ID: 22301349)', () => {
  beforeAll(async () => {
    app = await setupTestApp();
    adminToken = (await getAuthTokenForNewAdmin()).token;
    userToken = (await getAuthTokenForNewUser()).token;
  });

  afterAll(async () => {
    await teardownTestApp();
  });

  it('lists leaderboards (public)', async () => {
    const res = await request(appGetter()).get('/api/leaderboards');
    expect(res.statusCode).toBe(200);
  });

  it('gets achievement leaderboard (public)', async () => {
    const res = await request(appGetter()).get('/api/leaderboards/achievements/global');
    expect(res.statusCode).toBe(200);
  });

  it('returns 401 for protected rank without token', async () => {
    const res = await request(appGetter()).get('/api/leaderboards/000000000000000000000000/rank');
    expect(res.statusCode).toBe(401);
  });

  it('returns 403 for admin-only refresh with normal user', async () => {
    const res = await request(appGetter())
      .post('/api/leaderboards/000000000000000000000000/refresh')
      .set('Authorization', `Bearer ${userToken}`);
    expect([401,403]).toContain(res.statusCode);
  });
});
