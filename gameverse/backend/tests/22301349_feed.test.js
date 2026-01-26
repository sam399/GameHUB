const request = require('supertest');
const { setupTestApp, teardownTestApp, getAuthTokenForNewUser, appGetter } = require('./helpers');

let app;
let userToken;

describe('Feature: Feed (ID: 22301349)', () => {
  beforeAll(async () => {
    app = await setupTestApp();
    userToken = (await getAuthTokenForNewUser()).token;
  });

  afterAll(async () => {
    await teardownTestApp();
  });

  it('returns 401 for feed without token', async () => {
    const res = await request(appGetter()).get('/api/feed');
    expect(res.statusCode).toBe(401);
  });

  it('returns feed with token', async () => {
    const res = await request(appGetter()).get('/api/feed').set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
  });
});
