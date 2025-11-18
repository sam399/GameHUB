const { MongoMemoryServer } = require('mongodb-memory-server');
const { spawn } = require('child_process');
const fetch = require('node-fetch');

async function waitForServer(url, timeout = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch (err) {
      // ignore
    }
    await new Promise(r => setTimeout(r, 200));
  }
  throw new Error('Server did not start in time');
}

async function run() {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  console.log('In-memory MongoDB URI:', uri);

  // Spawn the server with MONGODB_URI set to the in-memory server
  const env = Object.assign({}, process.env, { MONGODB_URI: uri, PORT: '5000' });
  const server = spawn(process.execPath, ['server.js'], { cwd: __dirname + '/../', env, stdio: ['ignore', 'pipe', 'pipe'] });

  server.stdout.on('data', d => process.stdout.write('[server] ' + d));
  server.stderr.on('data', d => process.stderr.write('[server] ' + d));

  try {
    await waitForServer('http://127.0.0.1:5000/api');
    console.log('Server is ready — testing auth endpoints');

    // Register
    const username = 'memuser';
    const email = `memuser+${Date.now()}@example.com`;
    const password = 'password123';

    let res = await fetch('http://127.0.0.1:5000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    const reg = await res.json();
    console.log('Register response:', reg);

    // Login
    res = await fetch('http://127.0.0.1:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const login = await res.json();
    console.log('Login response:', login);

    const token = login?.data?.token;
    if (!token) throw new Error('Login did not return token');

    // Get current user
    res = await fetch('http://127.0.0.1:5000/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const me = await res.json();
    console.log('Me response:', me);

  } catch (err) {
    console.error('Test error:', err);
  } finally {
    // Teardown
    server.kill();
    await mongod.stop();
    console.log('Teardown complete');
    process.exit(0);
  }
}

run();
