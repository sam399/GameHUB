/**
 * Netlify Function: API Handler
 * Replaces Vercel serverless.js
 * All backend API routes are served through this function
 * 
 * Available at: /.netlify/functions/api/*
 */

// Import the backend server (Express app)
// This is a wrapper that converts the backend server to a Netlify Function

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import routes
const authRoutes = require('../../gameverse/backend/routes/auth');
const gameRoutes = require('../../gameverse/backend/routes/games');
const reviewRoutes = require('../../gameverse/backend/routes/reviews');
const forumRoutes = require('../../gameverse/backend/routes/forum');
const chatRoutes = require('../../gameverse/backend/routes/chats');
const notificationRoutes = require('../../gameverse/backend/routes/notifications');
const notificationPrefRoutes = require('../../gameverse/backend/routes/notificationPreferences');
const friendRoutes = require('../../gameverse/backend/routes/friends');
const wishlistRoutes = require('../../gameverse/backend/routes/wishlist');
const libraryRoutes = require('../../gameverse/backend/routes/library');
const adminRoutes = require('../../gameverse/backend/routes/admin');
const reportRoutes = require('../../gameverse/backend/routes/reports');
const moderationRoutes = require('../../gameverse/backend/routes/moderationRoutes');
const leaderboardRoutes = require('../../gameverse/backend/routes/leaderboards');
const achievementRoutes = require('../../gameverse/backend/routes/achievements');
const feedRoutes = require('../../gameverse/backend/routes/feedRoutes');
const eventRoutes = require('../../gameverse/backend/routes/eventRoutes');
const recommendationRoutes = require('../../gameverse/backend/routes/recommendationRoutes');

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// MongoDB Connection (only connect once)
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gameverse';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/notification-preferences', notificationPrefRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/moderation', moderationRoutes);
app.use('/api/leaderboards', leaderboardRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/recommendations', recommendationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'GameVerse API',
    version: '1.0.0',
    status: 'running',
    platform: 'Netlify'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    status: err.status || 500
  });
});

// Netlify Function handler
exports.handler = async (event, context) => {
  // Prevent function from terminating before response
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    // Connect to MongoDB
    await connectDB();

    // Handle the request
    return new Promise((resolve, reject) => {
      app(
        {
          ...event,
          requestContext: event.requestContext || {}
        },
        {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ message: 'ok' }),
          setHeader: () => {},
          end: (body) => {
            resolve({
              statusCode: 200,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': process.env.FRONTEND_URL || '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
              },
              body: body || JSON.stringify({ message: 'ok' })
            });
          }
        },
        (result) => {
          if (result?.statusCode) {
            resolve(result);
          }
        }
      );
    });
  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: error.message || 'Internal Server Error'
      })
    };
  }
};
