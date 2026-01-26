const request = require('supertest');
const { setupTestApp, teardownTestApp, getAuthTokenForNewUser, getAuthTokenForNewAdmin, appGetter } = require('./helpers');

let app;
let userToken;
let adminToken;
let gameId;

describe('Feature: Wishlist (ID: 22301349)', () => {
  beforeAll(async () => {
    app = await setupTestApp();
    const user = await getAuthTokenForNewUser();
    userToken = user.token;
    const admin = await getAuthTokenForNewAdmin();
    adminToken = admin.token;

    const gRes = await request(appGetter())
      .post('/api/games')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Wish Game', description: 'A test game for wishlist features', genre: ['Action'], platforms: ['PC'], developer: 'Dev', publisher: 'Pub', releaseDate: new Date(2024, 0, 1).toISOString()
      });
    gameId = gRes.body?.data?._id;
  });

  afterAll(async () => {
    await teardownTestApp();
  });

  it('adds a game to wishlist', async () => {
    const res = await request(appGetter())
      .post('/api/wishlist/games')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ gameId });
    expect([200,201]).toContain(res.statusCode);
  });

  it('checks game in wishlist', async () => {
    const res = await request(appGetter())
      .get(`/api/wishlist/check/${gameId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
  });

  it('gets wishlist', async () => {
    const res = await request(appGetter())
      .get('/api/wishlist')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
  });

  it('removes a game from wishlist', async () => {
    const res = await request(appGetter())
      .delete(`/api/wishlist/games/${gameId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect([200,204]).toContain(res.statusCode);
  });

  it('rejects unauthorized access', async () => {
    const res = await request(appGetter()).get('/api/wishlist');
    expect(res.statusCode).toBe(401);
  });
});
