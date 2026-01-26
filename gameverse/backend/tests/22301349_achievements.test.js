const request = require('supertest');
const { setupTestApp, teardownTestApp, getAuthTokenForNewAdmin, getAuthTokenForNewUser, appGetter } = require('./helpers');

let app;
let adminToken;
let userToken;

describe('Feature: Achievements (ID: 22301349)', () => {
  beforeAll(async () => {
    app = await setupTestApp();
    adminToken = (await getAuthTokenForNewAdmin()).token;
    userToken = (await getAuthTokenForNewUser()).token;
  });

  afterAll(async () => {
    await teardownTestApp();
  });

  it('lists achievements (public)', async () => {
    const res = await request(appGetter()).get('/api/achievements');
    expect(res.statusCode).toBe(200);
  });

  it('returns 401 for protected routes without token', async () => {
    const res = await request(appGetter()).put('/api/achievements/user/000000000000000000000000/progress');
    expect(res.statusCode).toBe(401);
  });

  it('returns 403 when user tries to create (admin only)', async () => {
    const res = await request(appGetter())
      .post('/api/achievements')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Test' });
    expect(res.statusCode).toBe(403);
  });

  it('admin can create achievement', async () => {
    const res = await request(appGetter())
      .post('/api/achievements')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ 
        name: 'Test Achievement',
        description: 'A test achievement for validation',
        type: 'social',
        icon: '🎖️',
        points: 50,
        criteria: {
          type: 'friends_count',
          target: 5,
          comparison: 'greater_than'
        }
      });
    expect([200,201]).toContain(res.statusCode);
  });
});
