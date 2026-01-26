const request = require('supertest');
const { setupTestApp, teardownTestApp, getAuthTokenForNewAdmin, appGetter } = require('./helpers');

let app;
let adminToken;
let createdGameId;

const validGamePayload = {
  title: 'Test Game',
  description: 'A detailed description of the test game for comprehensive testing',
  genre: ['Action'],
  platforms: ['PC'],
  developer: 'Test Developer Studios',
  publisher: 'Test Publisher Inc',
  releaseDate: new Date(2024, 0, 1).toISOString(),
  price: 0,
  isFree: true,
};

describe('Feature: Games Management (ID: 22301349)', () => {
  beforeAll(async () => {
    app = await setupTestApp();
    const admin = await getAuthTokenForNewAdmin();
    adminToken = admin.token;
  });

  afterAll(async () => {
    await teardownTestApp();
  });

  it('creates a game (admin only)', async () => {
    const res = await request(appGetter())
      .post('/api/games')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(validGamePayload);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('_id');
    createdGameId = res.body.data._id;
  });

  it('retrieves a game by id', async () => {
    const res = await request(appGetter()).get(`/api/games/${createdGameId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe(validGamePayload.title);
  });

  it('updates a game (admin only)', async () => {
    const res = await request(appGetter())
      .put(`/api/games/${createdGameId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ featured: true });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.featured).toBe(true);
  });

  it('returns 404 when updating non-existent game', async () => {
    const res = await request(appGetter())
      .put('/api/games/999999999999999999999999')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ featured: false });

    expect([400,404]).toContain(res.statusCode);
  });

  it('deletes a game (soft delete, admin only)', async () => {
    const res = await request(appGetter())
      .delete(`/api/games/${createdGameId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 400 for validation error (missing required fields)', async () => {
    const res = await request(appGetter())
      .post('/api/games')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Incomplete' });

    expect([400,422]).toContain(res.statusCode);
    expect(res.body.success).toBe(false);
  });

  it('returns 401/403 when creating without admin rights', async () => {
    const res = await request(appGetter())
      .post('/api/games')
      .send(validGamePayload);
    expect([401,403]).toContain(res.statusCode);
  });
});
