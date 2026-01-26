const request = require('supertest');
const { setupTestApp, teardownTestApp, getAuthTokenForNewUser, appGetter } = require('./helpers');

let app;
let token;

describe('Feature: Notification Preferences (ID: 22301349)', () => {
  beforeAll(async () => {
    app = await setupTestApp();
    token = (await getAuthTokenForNewUser()).token;
  });

  afterAll(async () => {
    await teardownTestApp();
  });

  it('gets current preferences', async () => {
    const res = await request(appGetter()).get('/api/notification-preferences').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });

  it('updates preferences partially', async () => {
    const res = await request(appGetter())
      .patch('/api/notification-preferences/delivery')
      .set('Authorization', `Bearer ${token}`)
      .send({ email: true, push: true });
    expect([200,204]).toContain(res.statusCode);
  });

  it('rejects access without token', async () => {
    const res = await request(appGetter()).get('/api/notification-preferences');
    expect(res.statusCode).toBe(401);
  });
});
