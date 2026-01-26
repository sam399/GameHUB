const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../models/User');

let app;
let mongoServer;

const defaultUser = {
  username: 'tester',
  email: 'tester@example.com',
  password: 'P@ssword123'
};

const registerUser = async (override = {}) => {
  return request(app)
    .post('/api/auth/register')
    .send({ ...defaultUser, ...override });
};

const loginUser = async (credentials = {}) => {
  const payload = { email: defaultUser.email, password: defaultUser.password, ...credentials };
  return request(app)
    .post('/api/auth/login')
    .send(payload);
};

describe('Feature: Auth System (ID: 22301349)', () => {
  beforeAll(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
    process.env.JWT_EXPIRE = process.env.JWT_EXPIRE || '1h';
    process.env.NODE_ENV = 'test';

    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    app = require('../server');
  });

  beforeEach(async () => {
    await mongoose.connection.db.dropDatabase();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  it('creates a user account and returns auth token', async () => {
    const res = await registerUser();

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user).toMatchObject({
      username: defaultUser.username,
      email: defaultUser.email,
    });
  });

  it('logs in an existing user and returns a token', async () => {
    await registerUser();

    const res = await loginUser();

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.user.email).toBe(defaultUser.email);
  });

  it('retrieves the current profile with a valid token', async () => {
    await registerUser();
    const loginRes = await loginUser();
    const token = loginRes.body.data.token;

    const profileRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(profileRes.statusCode).toBe(200);
    expect(profileRes.body.success).toBe(true);
    expect(profileRes.body.data.user.email).toBe(defaultUser.email);
  });

  it('rejects access to profile without a token', async () => {
    const res = await request(app).get('/api/auth/me');

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/not authorized/i);
  });

  it('rejects login with an invalid password', async () => {
    await registerUser();

    const res = await loginUser({ password: 'WrongPassword!' });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/invalid email or password/i);
  });

  it('returns 404 when profile is requested for a deleted user', async () => {
    await registerUser();
    const loginRes = await loginUser();
    const token = loginRes.body.data.token;

    await User.deleteMany({ email: defaultUser.email });

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/not found/i);
  });

  it('prevents duplicate registrations with the same email', async () => {
    const first = await registerUser();
    expect(first.statusCode).toBe(201);

    const second = await registerUser();
    expect(second.statusCode).toBe(400);
    expect(second.body.success).toBe(false);
    expect(second.body.message).toMatch(/already exists/i);
  });
});
