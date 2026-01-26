const request = require('supertest');
const { setupTestApp, teardownTestApp, getAuthTokenForNewUser, appGetter } = require('./helpers');

let app;
let token;

describe('Feature: Notifications (ID: 22301349)', () => {
  beforeAll(async () => {
    app = await setupTestApp();
    token = (await getAuthTokenForNewUser()).token;
  });

  afterAll(async () => {
    await teardownTestApp();
  });

  it('returns notifications for user', async () => {
    const res = await request(appGetter()).get('/api/notifications').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });

  it('returns stats for user', async () => {
    const res = await request(appGetter()).get('/api/notifications/stats').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });

  it('rejects access without token', async () => {
    const res = await request(appGetter()).get('/api/notifications');
    expect(res.statusCode).toBe(401);
  });
});
