const request = require('supertest');
const { setupTestApp, teardownTestApp, getAuthTokenForNewUser, getAuthTokenForNewAdmin, appGetter } = require('./helpers');

let app;
let userToken;
let adminToken;

describe('Feature: Events (ID: 22301349)', () => {
  beforeAll(async () => {
    app = await setupTestApp();
    userToken = (await getAuthTokenForNewUser()).token;
    adminToken = (await getAuthTokenForNewAdmin()).token;
  });

  afterAll(async () => {
    await teardownTestApp();
  });

  it('lists events (public)', async () => {
    const res = await request(appGetter()).get('/api/events');
    expect(res.statusCode).toBe(200);
  });

  it('returns 401 when creating event without token', async () => {
    const res = await request(appGetter())
      .post('/api/events')
      .send({ title: 'Test', date: new Date().toISOString() });
    expect(res.statusCode).toBe(401);
  });

  it('returns 401 when joining without token', async () => {
    const res = await request(appGetter()).post('/api/events/000000000000000000000000/join');
    expect(res.statusCode).toBe(401);
  });
});
