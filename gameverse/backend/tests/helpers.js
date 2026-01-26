const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../models/User');

let mongoServer;
let app;

const defaultPassword = 'P@ssword123';

async function setupTestApp() {
  process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
  process.env.JWT_EXPIRE = process.env.JWT_EXPIRE || '1h';
  process.env.NODE_ENV = 'test';

  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  app = require('../server');
  return app;
}

async function teardownTestApp() {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (mongoServer) await mongoServer.stop();
}

async function registerUser({ username, email, password = defaultPassword } = {}) {
  const payload = {
    username: username || 'user_' + Math.random().toString(36).slice(2, 8),
    email: email || `user_${Math.random().toString(36).slice(2, 8)}@example.com`,
    password
  };
  const res = await request(app).post('/api/auth/register').send(payload);
  return { res, payload };
}

async function loginUser({ email, password = defaultPassword } = {}) {
  const res = await request(app).post('/api/auth/login').send({ email, password });
  const token = res.body?.data?.token;
  return { res, token };
}

async function elevateToAdmin(userId) {
  await User.updateOne({ _id: userId }, { role: 'admin' });
}

async function getAuthTokenForNewUser() {
  const { res } = await registerUser({});
  const user = res.body.data.user;
  const { token } = await loginUser({ email: user.email });
  return { user, token };
}

async function getAuthTokenForNewAdmin() {
  const { res } = await registerUser({});
  const user = res.body.data.user;
  await elevateToAdmin(user._id);
  const { token } = await loginUser({ email: user.email });
  return { user, token };
}

module.exports = {
  setupTestApp,
  teardownTestApp,
  registerUser,
  loginUser,
  elevateToAdmin,
  getAuthTokenForNewUser,
  getAuthTokenForNewAdmin,
  appGetter: () => app,
};
