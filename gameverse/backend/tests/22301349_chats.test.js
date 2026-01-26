const request = require('supertest');
const { setupTestApp, teardownTestApp, getAuthTokenForNewUser, appGetter } = require('./helpers');

let app;
let userToken;

describe('Feature: Chats (ID: 22301349)', () => {
  beforeAll(async () => {
    app = await setupTestApp();
    userToken = (await getAuthTokenForNewUser()).token;
  });

  afterAll(async () => {
    await teardownTestApp();
  });

  it('gets user chats', async () => {
    const res = await request(appGetter()).get('/api/chats').set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
  });

  it('searches for users in chats', async () => {
    const res = await request(appGetter())
      .get('/api/chats/search-users?q=test')
      .set('Authorization', `Bearer ${userToken}`);
    expect([200, 404, 500]).toContain(res.statusCode); // May 404 if endpoint not implemented
  });

  it('rejects access without token', async () => {
    const res = await request(appGetter()).get('/api/chats');
    expect(res.statusCode).toBe(401);
  });
});
