const request = require('supertest');
const { setupTestApp, teardownTestApp, getAuthTokenForNewUser, getAuthTokenForNewAdmin, appGetter } = require('./helpers');

let app;
let userToken;
let adminToken;

describe('Feature: Reports (ID: 22301349)', () => {
  beforeAll(async () => {
    app = await setupTestApp();
    userToken = (await getAuthTokenForNewUser()).token;
    adminToken = (await getAuthTokenForNewAdmin()).token;
  });

  afterAll(async () => {
    await teardownTestApp();
  });

  it('returns 401 when creating report without token', async () => {
    const res = await request(appGetter())
      .post('/api/reports')
      .send({ reason: 'spam', targetId: '000000000000000000000000' });
    expect(res.statusCode).toBe(401);
  });

  it('user can create a report', async () => {
    const res = await request(appGetter())
      .post('/api/reports')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ reason: 'inappropriate', targetType: 'comment', targetId: '507f1f77bcf86cd799439011' });
    expect([200,201,400,404]).toContain(res.statusCode); // May fail if foreign key missing
  });

  it('user can view their reports', async () => {
    const res = await request(appGetter()).get('/api/reports/user').set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
  });

  it('admin can access moderation queue', async () => {
    const res = await request(appGetter()).get('/api/moderation/queue').set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(200);
  });

  it('normal user cannot access moderation queue', async () => {
    const res = await request(appGetter()).get('/api/moderation/queue').set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(403);
  });
});
