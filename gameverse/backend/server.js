const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Simple in-memory counter to track requests to /api (useful for quick verification)
let apiPingCount = 0;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/forum', require('./routes/forum'));
// Attach routes if they exist
if (fs.existsSync(__dirname + '/routes/auth.js')) {
  app.use('/api/auth', require('./routes/auth'));
}

if (fs.existsSync(__dirname + '/routes/games.js')) {
  app.use('/api/games', require('./routes/games'));
}

if (fs.existsSync(__dirname + '/routes/reviews.js')) {
  app.use('/api/reviews', require('./routes/reviews'));
}

// Basic route
app.get('/api', (req, res) => {
  apiPingCount += 1;
  console.log(`[${new Date().toISOString()}] GET /api (#${apiPingCount}) from ${req.ip || req.connection.remoteAddress}`);
  res.json({ 
    message: 'GameVerse API is running!',
    version: '1.0.0',
    endpoints: {
      auth: fs.existsSync(__dirname + '/routes/auth.js') ? '/api/auth' : undefined,
      games: fs.existsSync(__dirname + '/routes/games.js') ? '/api/games' : undefined
    }
  });
});
app.get('/api', (req, res) => {
  res.json({ 
    message: 'GameVerse API is running!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      games: '/api/games',
      reviews: '/api/reviews'
    }
  });
});
app.get('/api', (req, res) => {
  res.json({ 
    message: 'GameVerse API is running!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      games: '/api/games',
      reviews: '/api/reviews',
      forum: '/api/forum'
    }
  });
});
// Endpoint to check how many times /api was requested (for quick verification)
app.get('/api/pings', (req, res) => {
  res.json({ pings: apiPingCount });
});

// Development-only seed endpoint — seeds sample games into the server's active DB connection
if (process.env.NODE_ENV !== 'production') {
  app.post('/api/seed', async (req, res) => {
    try {
      const seeder = require('./scripts/seedGames');
      await seeder.seedIntoExistingConnection();
      return res.json({ success: true, message: 'Seeded sample games' });
    } catch (err) {
      console.error('Seed endpoint error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  });
}

// Development-only seed endpoint to populate sample games
if (process.env.NODE_ENV !== 'production') {
  try {
    const { sampleGames } = require('./scripts/seedGames');
    const Game = require('./models/Game');

    app.post('/api/dev/seed', async (req, res) => {
      try {
        await Game.deleteMany({});
        const inserted = await Game.insertMany(sampleGames);
        return res.json({ success: true, inserted: inserted.length });
      } catch (err) {
        console.error('Dev seed error:', err);
        return res.status(500).json({ success: false, error: err.message });
      }
    });
  } catch (err) {
    // ignore if seed file not present
  }
}

// Start server helper (create HTTP server and attach Socket.IO)
const startServer = (port) => {
  const http = require('http');
  const server = http.createServer(app);

  // init socket.io
  try {
    const { Server } = require('socket.io');
    const io = new Server(server, {
      cors: {
        origin: '*'
      }
    });
    // expose io to controllers via realtime module
    try {
      const realtime = require('./realtime');
      realtime.setIo(io);
    } catch (err) {
      console.warn('Realtime module not initialized:', err.message || err);
    }

    io.use((socket, next) => {
      // Simple token auth for sockets. Expect token in handshake.auth.token
      try {
        const token = socket.handshake.auth && socket.handshake.auth.token;
        if (!token) return next(); // allow unauthenticated connections for public events
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.userId;
        return next();
      } catch (err) {
        console.warn('Socket auth failed:', err && err.message ? err.message : err);
        // disconnect unauthenticated sockets
        return next();
      }
    });

    io.on('connection', (socket) => {
      console.log('Realtime client connected', socket.id, 'userId=', socket.userId || 'anon');
      socket.on('disconnect', () => console.log('Realtime client disconnected', socket.id));
    });
  } catch (err) {
    console.warn('Socket.IO not available:', err.message || err);
  }

  server.listen(port, () => {
    console.log(`🚀 Server is running on http://localhost:${port}`);
  });
};

// Connect to MongoDB if possible; fallback to in-memory server for dev/tests
const connectWithFallback = async () => {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (MONGODB_URI) {
    try {
      await mongoose.connect(MONGODB_URI);
      console.log('✅ MongoDB connected successfully (MONGODB_URI)');
      startServer(process.env.PORT || 5000);
      return;
    } catch (err) {
      console.warn('❌ MongoDB connection error with MONGODB_URI:', err.message || err);
    }
  }

  // Try local MongoDB
  try {
    const localUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gameverse';
    await mongoose.connect(localUri);
    console.log('✅ MongoDB connected successfully (local)');
    startServer(process.env.PORT || 5000);
    return;
  } catch (err) {
    console.warn('⚠️ Local MongoDB not available:', err.message || err);
  }

  // Fallback to mongodb-memory-server for local development/testing
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected using in-memory server');
    startServer(process.env.PORT || 5000);
  } catch (err) {
    console.error('❌ MongoDB in-memory fallback failed:', err);
    process.exit(1);
  }
};

connectWithFallback();

// Development-only seed endpoint (enabled when ALLOW_SEED=true)
if (process.env.ALLOW_SEED === 'true') {
  const Game = require('./models/Game');
  const { sampleGames } = require('./scripts/seedGames');

  app.post('/api/_seed', async (req, res) => {
    try {
      await Game.deleteMany({});
      await Game.insertMany(sampleGames);
      return res.json({ success: true, message: 'Seeded sample games' });
    } catch (err) {
      console.error('Seed endpoint error:', err);
      return res.status(500).json({ success: false, message: err.message });
    }
  });
}