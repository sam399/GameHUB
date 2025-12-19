const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketio = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Socket.io setup with CORS
const io = socketio(server, {
  cors: {
    origin: process.env.FRONTEND_URL || process.env.VITE_SOCKET_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
    transports: ['websocket', 'polling']
  }
});

// Initialize realtime helper with io instance
const realtime = require('./realtime');
realtime.setIo(io);
const User = require('./models/User');
const feedRoutes = require('./routes/feedRoutes');

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/games', require('./routes/games'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/forum', require('./routes/forum'));
app.use('/api/chats', require('./routes/chats'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/notification-preferences', require('./routes/notificationPreferences'));
app.use('/api/friends', require('./routes/friends'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/library', require('./routes/library'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/moderation', require('./routes/moderationRoutes'));
app.use('/api/leaderboards', require('./routes/leaderboards'));
app.use('/api/achievements', require('./routes/achievements'));
app.use('/api/feed', feedRoutes);
const eventRoutes = require('./routes/eventRoutes');
app.use('/api/events', eventRoutes);
app.use('/api/recommendations', require('./routes/recommendationRoutes'));
// Basic route
app.get('/api', (req, res) => {
  res.json({
    message: 'GameVerse API is running!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      games: '/api/games',
      reviews: '/api/reviews',
      forum: '/api/forum',
      chats: '/api/chats',
      friends: '/api/friends',
      notifications: '/api/notifications',
      wishlist: '/api/wishlist',
      library: '/api/library',
      admin: '/api/admin',
      reports: '/api/reports',
      leaderboards: '/api/leaderboards',
      achievements: '/api/achievements',
      feed: '/api/feed',
      events: '/api/events',
      recommendations: '/api/recommendations'
    }
  });
});

// Socket.io connection handling
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // User joins with their user ID
  socket.on('user_connected', async (userId) => {
    try {
      connectedUsers.set(userId, socket.id);
      console.log(`User ${userId} connected with socket ${socket.id}`);

      // Join user to their personal room for private messages
      socket.join(`user_${userId}`);

      // If user is admin/moderator, also join them to admin room for admin realtime events
      try {
        const user = await User.findById(userId).select('role');
        if (user && ['admin', 'moderator'].includes(user.role)) {
          socket.join('admin_room');
          console.log(`Admin user ${userId} joined admin_room`);
        }
      } catch (err) {
        console.error('Error checking user role for admin room join:', err);
      }
    } catch (err) {
      console.error('user_connected handler error:', err);
    }
  });

  // Join chat room
  socket.on('join_chat', (chatId) => {
    socket.join(`chat_${chatId}`);
    console.log(`User joined chat: ${chatId}`);
  });

  // Leave chat room
  socket.on('leave_chat', (chatId) => {
    socket.leave(`chat_${chatId}`);
    console.log(`User left chat: ${chatId}`);
  });

  // Send message
  socket.on('send_message', async (data) => {
    try {
      const { chatId, message, sender } = data;
      
      // Broadcast to all users in the chat room except sender
      socket.to(`chat_${chatId}`).emit('new_message', {
        message,
        chatId
      });

      // Send delivery status to sender
      socket.emit('message_sent', {
        messageId: message._id,
        status: 'delivered'
      });

    } catch (error) {
      console.error('Socket send message error:', error);
      socket.emit('message_error', {
        error: 'Failed to send message'
      });
    }
  });

  // Typing indicators
  socket.on('typing_start', (data) => {
    const { chatId, userId } = data;
    socket.to(`chat_${chatId}`).emit('user_typing', {
      userId,
      isTyping: true
    });
  });

  socket.on('typing_stop', (data) => {
    const { chatId, userId } = data;
    socket.to(`chat_${chatId}`).emit('user_typing', {
      userId,
      isTyping: false
    });
  });

  // Message read receipts
  socket.on('mark_messages_read', (data) => {
    const { chatId, userId } = data;
    socket.to(`chat_${chatId}`).emit('messages_read', {
      chatId,
      userId
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    // Remove user from connected users
    for (let [userId, socketId] of connectedUsers.entries()) {
      if (socketId === socket.id) {
        connectedUsers.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
    console.log('Client disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('io', io);

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gameverse';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected successfully'))
.catch(err => console.log('❌ MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;

// Only listen if not in serverless environment (Vercel)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });
}

// Export for Vercel serverless functions
module.exports = app;