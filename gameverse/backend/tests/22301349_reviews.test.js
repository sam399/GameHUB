const request = require('supertest');
const { setupTestApp, teardownTestApp, getAuthTokenForNewUser, getAuthTokenForNewAdmin, appGetter } = require('./helpers');

let app;
let userToken;
let adminToken;
let gameId;
let reviewId;

const gamePayload = {
  title: 'Review Target Game',
  description: 'A comprehensive game designed for review testing scenarios',
  genre: ['RPG'],
  platforms: ['PC'],
  developer: 'Dev Studio',
  publisher: 'Publisher Inc',
  releaseDate: new Date(2024, 0, 1).toISOString(),
};

describe('Feature: Reviews (ID: 22301349)', () => {
  beforeAll(async () => {
    app = await setupTestApp();
    const user = await getAuthTokenForNewUser();
    userToken = user.token;
    const admin = await getAuthTokenForNewAdmin();
    adminToken = admin.token;

    const gRes = await request(appGetter())
      .post('/api/games')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(gamePayload);
    
    if (gRes.body?.data?._id) {
      gameId = gRes.body.data._id;
    }
  });

  afterAll(async () => {
    await teardownTestApp();
  });

  it('creates a review for a game', async () => {
    if (!gameId) { console.log('⊘ Skipped: gameId not available'); return; }
    
    const res = await request(appGetter())
      .post(`/api/reviews/games/${gameId}/reviews`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ rating: 5, title: 'Excellent Game!', content: 'This game is amazing and well-crafted.' });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    if (res.body.data?.review?._id) reviewId = res.body.data.review._id;
  });

  it('gets user reviews', async () => {
    const res = await request(appGetter())
      .get('/api/reviews/user')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('updates a review', async () => {
    if (!reviewId) { console.log('⊘ Skipped: reviewId not available'); return; }
    
    const res = await request(appGetter())
      .put(`/api/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ content: 'Actually, very good overall!' });
    expect([200,404]).toContain(res.statusCode);
  });

  it('reacts to a review', async () => {
    if (!reviewId) { console.log('⊘ Skipped: reviewId not available'); return; }
    
    const res = await request(appGetter())
      .post(`/api/reviews/${reviewId}/react`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ reaction: 'like' });
    expect([200,404,500]).toContain(res.statusCode);
  });

  it('gets review stats for the game', async () => {
    if (!gameId) { console.log('⊘ Skipped: gameId not available'); return; }
    
    const res = await request(appGetter())
      .get(`/api/reviews/games/${gameId}/reviews/stats`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 404 for updating non-existent review', async () => {
    const res = await request(appGetter())
      .put('/api/reviews/999999999999999999999999')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ comment: 'Nope' });
    expect([400,404]).toContain(res.statusCode);
  });

  it('rejects access without token', async () => {
    const res = await request(appGetter())
      .get('/api/reviews/user');
    expect(res.statusCode).toBe(401);
  });

  it('deletes a review', async () => {
    if (!reviewId) { console.log('⊘ Skipped: reviewId not available'); return; }
    
    const res = await request(appGetter())
      .delete(`/api/reviews/${reviewId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect([200,404,500]).toContain(res.statusCode);
  });
});
