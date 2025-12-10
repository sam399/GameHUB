# GameVerse 🎮

**GameVerse** is a comprehensive gaming community platform built with modern web technologies. It combines social networking, content management, competitive gaming, and real-time interactions into a single, feature-rich application.

## 🌟 Core Features

### 🎯 Gaming & Content

- **Game Library** — Track your gaming collection with play status, hours played, completion percentage, and play sessions
- **Reviews & Ratings** — Write detailed game reviews, rate games, and react to community reviews (helpful, funny, awards)
- **Wishlist System** — Create and manage your game wishlist with public/private visibility toggle
- **Game Discovery** — Browse games by genre, search, and view featured titles
- **AI Recommendations** — Get personalized game suggestions based on your review history and genre preferences
- **News Feed** — Stay updated with latest gaming news powered by RAWG API with Redis caching

### 👥 Social & Community
- **Friends System** — Send/receive friend requests with real-time notifications and status updates
- **Real-time Chat** — Direct messaging with Socket.IO for instant communication
- **Community Forums** — Create threads, post replies, and engage in gaming discussions
- **User Profiles** — Customizable profiles with avatars, bios, gaming stats, and achievements
- **Activity Feed** — Follow friends' activities including achievements, reviews, and forum posts

### 🏆 Competitive Gaming
- **Leaderboards** — Global and game-specific leaderboards with rankings and scores
- **Achievements System** — Unlock achievements, earn points, and track progress
- **Events & Tournaments** — Create and join gaming events (tournaments, LAN parties, casual meetups)
- **Event Registration** — Join events with participant tracking, check-in system, and winner announcements

### 🔔 Notifications & Preferences
- **Persistent Notifications** — Stored in MongoDB with real-time Socket.IO delivery
- **Notification Center** — View, mark as read, and manage all notifications
- **Notification Preferences** — Customize which activities trigger notifications (achievements, reviews, forum posts, etc.)
- **Delivery Methods** — Configure in-app, email, and push notification preferences
- **Email Digests** — Choose daily, weekly, or no email digests
- **Quiet Hours** — Set time windows to suppress notifications

### 🛡️ Moderation & Safety
- **Content Reporting** — Report inappropriate content (users, reviews, forum posts, games, messages)
- **Moderation Queue** — Admin dashboard to view, assign, and resolve pending reports
- **Content Filter** — Automatic filtering of banned words in user-generated content
- **Severity Levels** — Reports categorized by severity (low, medium, high, critical)
- **Moderation Actions** — Delete content, ban users, or dismiss false reports with resolution notes
- **Duplicate Prevention** — System prevents multiple reports for the same item from the same user
- **Audit Logging** — All moderation actions tracked with timestamps, performer, and target details
- **Real-time Updates** — Socket.IO events notify admins instantly when new reports are created

### 👨‍💼 Admin & Analytics
- **Admin Dashboard** — Real-time statistics on users, games, reviews, reports, and system health
- **Analytics Dashboard** — Interactive charts showing user growth, content trends, and genre distribution
- **User Management** — View, search, and manage user accounts with role assignment
- **Report Management** — Assign reports to moderators, track resolution status, and view report history
- **Audit Logs** — Complete history of admin actions with detailed context and timestamps
- **Bulk Moderation** — Process multiple moderation actions simultaneously
- **Role-Based Access Control** — Separate admin and moderator roles with authorization middleware

### 🎨 User Experience
- **Dark Mode & Theme System** — Toggle between light and dark themes with system preference detection
- **Theme Persistence** — Preferences saved to localStorage across sessions
- **Responsive Design** — Fully responsive UI built with Tailwind CSS
- **Real-time Updates** — Socket.IO powers live notifications, chat, and activity feeds
- **Search & Filtering** — Advanced search across games, users, activities, and content
- **Pagination** — Efficient data loading with pagination throughout the application

### 🔧 Technical Features

- **AI Recommendation Engine** — Genre-based preference learning from user reviews with compatibility scoring
- **Activity Hooks** — Automatic activity creation across all controllers with real-time broadcasts
- **Redis Caching** — RAWG API news caching with 1-hour TTL and automatic fallback
- **JWT Authentication** — Secure token-based authentication with refresh capability
- **Socket.IO Rooms** — User-specific and admin rooms for targeted real-time events
- **Mongoose ODM** — MongoDB integration with schema validation and relationships
- **Notification Factory** — Centralized notification creation and delivery system
- **Content Validation** — Input sanitization and validation middleware
- **Error Handling** — Comprehensive error handling with meaningful error messages

## 🚀 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for blazing-fast development
- **Tailwind CSS** for styling with dark mode support
- **Socket.IO Client** for real-time communication
- **Axios** for HTTP requests with interceptors
- **React Router** for navigation
- **Recharts** for data visualization in admin analytics
- **Playwright** for end-to-end testing

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose ODM
- **Socket.IO** for real-time events
- **JWT** for authentication
- **Redis** for caching (optional with fallback)
- **RAWG API** integration for game data and news
- **Bcrypt** for password hashing
- **dotenv** for environment configuration

## 📋 Quick Start

### Prerequisites

- Node.js 16+ (or compatible LTS)
- MongoDB (local or cloud instance like MongoDB Atlas)
- Redis (optional, for caching - falls back to in-memory cache)
- RAWG API Key (optional, free at https://rawg.io/login?forward=developer)

### Environment Setup

**Important environment variables (backend)**

Create a `.env` file in `gameverse/backend`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/gameverse

# Authentication
JWT_SECRET=your_super_secure_jwt_secret_here_change_in_production

# Frontend URL (for CORS and Socket.IO)
FRONTEND_URL=http://localhost:5173

# Optional: RAWG API (for game data and news)
RAWG_API_KEY=your_rawg_api_key_here

# Optional: Redis (for caching - will use in-memory fallback if not set)
REDIS_URL=redis://localhost:6379

# Optional: Email Configuration (for notification emails)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

**Frontend environment variables**

Create a `.env` file in `gameverse/frontend`:

```env
# API Base URL
VITE_API_URL=http://localhost:5000
```

### Installation & Running

**1. Start the backend API**

```powershell
cd "H:\My Website\GameHUB\gameverse\backend"
npm install
npm run dev
```

The backend will start on `http://localhost:5000` (or the PORT you specified).

**2. Start the frontend (Vite)**

```powershell
cd "H:\My Website\GameHUB\gameverse\frontend"
npm install
npm run dev
```

The frontend will start on `http://localhost:5173` or another available port shown by Vite.

**3. Create an admin user (optional)**

Use the convenience script to create or promote an admin user:

```powershell
cd "H:\My Website\GameHUB\gameverse\backend"
node .\scripts\createAdmin.js admin@example.com securePassword123 adminuser
```

The script will promote an existing user with that email to `admin` or create a new admin user if none exists.

### Development Tips

- **Both servers together**: Use Windows Terminal with split panes or a process manager like `concurrently`
- **TypeScript checks**: Run `npx tsc --noEmit` in the frontend directory
- **Hot reloading**: Both frontend (Vite) and backend (nodemon) support hot reloading
- **Socket testing**: Use `frontend/scripts/socketSmokeTest.js` to simulate Socket.IO clients
- **Port conflicts**: If port 5000 or 5173 is in use, either free it or set a different `PORT` in the backend `.env`

## 📡 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` — Register a new user account
- `POST /api/auth/login` — Login and receive JWT token
- `GET /api/auth/me` — Get current user profile (protected)
- `PUT /api/auth/profile` — Update user profile (protected)

### Game Endpoints
- `GET /api/games` — Get all games with pagination and search
- `GET /api/games/featured` — Get featured games
- `GET /api/games/genre/:genre` — Get games by genre
- `GET /api/games/:id` — Get game details by ID

### Review Endpoints
- `GET /api/reviews/games/:gameId/reviews` — Get all reviews for a game
- `GET /api/reviews/games/:gameId/reviews/stats` — Get review statistics for a game
- `GET /api/reviews/user` — Get current user's reviews (protected)
- `POST /api/reviews/games/:gameId/reviews` — Create a review (protected)
- `PUT /api/reviews/:id` — Update a review (protected)
- `DELETE /api/reviews/:id` — Delete a review (protected)
- `POST /api/reviews/:id/react` — React to a review (helpful/funny/award) (protected)

### Wishlist Endpoints
- `GET /api/wishlist` — Get user's wishlist (protected)
- `GET /api/wishlist/check/:gameId` — Check if game is in wishlist (protected)
- `GET /api/wishlist/user/:userId` — View a public wishlist by user ID
- `POST /api/wishlist/games` — Add game to wishlist (protected)
- `PUT /api/wishlist/games/:gameId` — Update wishlist item (protected)
- `PUT /api/wishlist/privacy` — Toggle wishlist privacy (protected)
- `DELETE /api/wishlist/games/:gameId` — Remove from wishlist (protected)

### Library & Game Tracking Endpoints
- `GET /api/library` — Get user's game library (protected)
- `GET /api/library/stats` — Get gaming statistics (protected)
- `GET /api/library/games/:gameId` — Get game tracking details (protected)
- `POST /api/library/games` — Track a new game (protected)
- `PUT /api/library/games/:gameId` — Update game tracking (protected)
- `DELETE /api/library/games/:gameId` — Remove from library (protected)
- `POST /api/library/games/:gameId/sessions` — Add play session (protected)

### Friend Endpoints
- `GET /api/friends` — Get friends list (protected)
- `GET /api/friends/requests` — Get friend requests (protected)
- `POST /api/friends/requests` — Send friend request (protected)
- `PUT /api/friends/requests/:id/accept` — Accept friend request (protected)
- `PUT /api/friends/requests/:id/reject` — Reject friend request (protected)
- `DELETE /api/friends/requests/:id` — Cancel friend request (protected)
- `DELETE /api/friends/:friendId` — Remove friend (protected)

### Notification Endpoints
- `GET /api/notifications` — Get user's notifications (protected)
- `GET /api/notifications/stats` — Get notification statistics (protected)
- `PUT /api/notifications/:notificationId/read` — Mark notification as read (protected)
- `PUT /api/notifications/read-all` — Mark all notifications as read (protected)
- `DELETE /api/notifications/:notificationId` — Delete notification (protected)

### Notification Preference Endpoints
- `GET /api/notification-preferences` — Get user's notification preferences (protected)
- `PUT /api/notification-preferences` — Update all preferences (protected)
- `PATCH /api/notification-preferences/activities` — Update activity preferences (protected)
- `PATCH /api/notification-preferences/delivery` — Update delivery preferences (protected)
- `PATCH /api/notification-preferences/digest` — Update email digest settings (protected)

### Activity Feed Endpoints
- `GET /api/feed` — Get activity feed with pagination, filtering, and search (protected)

### Forum Endpoints
- `GET /api/forum/categories` — Get all forum categories
- `GET /api/forum/categories/:categoryId/threads` — Get threads in a category
- `GET /api/forum/threads/:threadId` — Get thread details with posts
- `POST /api/forum/categories/:categoryId/threads` — Create new thread (protected)
- `POST /api/forum/threads/:threadId/posts` — Create post in thread (protected)
- `PUT /api/forum/posts/:postId` — Update post (protected)
- `DELETE /api/forum/posts/:postId` — Delete post (protected)

### Chat Endpoints
- `GET /api/chats` — Get user's chat conversations (protected)
- `GET /api/chats/:chatId/messages` — Get messages in a chat (protected)
- `POST /api/chats/:chatId/messages` — Send message (protected)
- `PUT /api/chats/:chatId/read` — Mark chat as read (protected)

### Event Endpoints
- `GET /api/events` — Get all events with filtering
- `GET /api/events/:eventId` — Get event details
- `POST /api/events` — Create new event (protected)
- `PUT /api/events/:eventId` — Update event (protected)
- `DELETE /api/events/:eventId` — Delete event (protected)
- `POST /api/events/:eventId/register` — Register for event (protected)
- `DELETE /api/events/:eventId/unregister` — Unregister from event (protected)

### Leaderboard Endpoints
- `GET /api/leaderboards` — Get all leaderboards
- `GET /api/leaderboards/:leaderboardId` — Get leaderboard details
- `GET /api/leaderboards/achievements/global` — Get global achievement leaderboard
- `GET /api/leaderboards/:leaderboardId/rank` — Get user's rank (protected)
- `GET /api/leaderboards/achievements/user` — Get user's achievements (protected)
- `POST /api/leaderboards/achievements/check` — Check for new achievements (protected)
- `POST /api/leaderboards/:leaderboardId/refresh` — Refresh leaderboard (admin only)

### Achievement Endpoints
- `GET /api/achievements` — Get all available achievements
- `GET /api/achievements/user` — Get user's unlocked achievements (protected)
- `POST /api/achievements/check` — Check and unlock achievements (protected)

### Recommendation Endpoints
- `GET /api/recommendations` — Get personalized game recommendations based on user reviews (protected)

### Report & Moderation Endpoints
- `POST /api/reports` — Create a report (protected)
- `GET /api/reports/user` — Get user's submitted reports (protected)
- `GET /api/reports/:reportId` — Get report details (protected)
- `POST /api/moderation/report` — Submit moderation report (protected)
- `GET /api/moderation/queue` — Get moderation queue (admin/moderator only)
- `PUT /api/moderation/resolve/:id` — Resolve report (admin/moderator only)

### Admin Endpoints (Admin/Moderator Only)
- `GET /api/admin/dashboard` — Get dashboard statistics
- `GET /api/admin/analytics` — Get detailed analytics
- `GET /api/admin/stats` — Get system statistics for charts
- `GET /api/admin/users` — List all users with pagination
- `PUT /api/admin/users/:userId` — Update user role/status
- `GET /api/admin/reports` — Get all reports with filtering
- `PUT /api/admin/reports/:reportId/assign` — Assign report to moderator
- `PUT /api/admin/reports/:reportId/resolve` — Resolve report
- `GET /api/admin/audit-logs` — Get audit logs
- `POST /api/admin/moderate/bulk` — Bulk moderation actions

## 🔌 Real-time Events (Socket.IO)

GameVerse uses Socket.IO for real-time features. The frontend connects and listens to these events:

### User Events
- `user_connected` — User joins their personal room for notifications
- `friend_request:received` — New friend request received
- `friend_request:accepted` — Friend request accepted
- `friend_request:rejected` — Friend request rejected
- `friend_request:cancelled` — Friend request cancelled
- `friend:removed` — Friend removed from list
- `notification:new` — New notification received
- `activity_created` — New activity in feed

### Admin Events (Admin Room)
- `report.created` — New report submitted
- `report.assigned` — Report assigned to moderator
- `report.resolved` — Report resolved

### Chat Events
- `message:new` — New chat message received
- `chat:typing` — User is typing in chat
- `chat:read` — Chat messages marked as read

### Event System
- `event:participant_joined` — New participant joined event
- `event:participant_left` — Participant left event
- `event:status_updated` — Event status changed

## 🧪 Testing

### Playwright E2E Tests

Run end-to-end tests with Playwright:

```powershell
cd "H:\My Website\GameHUB\gameverse\frontend"
npm install
npx playwright install
npm run test:e2e
```

The tests validate:
- Homepage loading and rendering
- Login page functionality
- Protected route redirects
- Admin area authentication

### Socket.IO Smoke Test

Test real-time functionality with the socket smoke test:

```powershell
cd "H:\My Website\GameHUB\gameverse\frontend"
node scripts/socketSmokeTest.js
```

This simulates two clients connecting and exchanging messages.

### TypeScript Type Checking

Verify TypeScript types without emitting files:

```powershell
cd "H:\My Website\GameHUB\gameverse\frontend"
npx tsc --noEmit
```

## 🐛 Troubleshooting

### Common Issues

**Backend won't start**
- Check if MongoDB is running: `mongod --version`
- Verify `.env` file exists in `gameverse/backend`
- Ensure `MONGODB_URI` is correct
- Check if port 5000 is already in use

**Frontend can't connect to backend**
- Verify backend is running on `http://localhost:5000`
- Check `VITE_API_URL` in `gameverse/frontend/.env`
- Look for CORS errors in browser console
- Ensure JWT token is saved in localStorage

**Socket.IO not connecting**
- Check browser console for connection errors
- Verify `FRONTEND_URL` in backend `.env`
- Ensure Socket.IO port matches backend port
- Check firewall settings

**Database connection errors**
- Ensure MongoDB service is running
- Verify connection string format: `mongodb://localhost:27017/gameverse`
## ☁️ Deployment on Vercel

GameVerse is production-ready with comprehensive deployment guides!

### Quick Deployment (20-30 minutes)

1. **Start here:** [QUICK_START_DEPLOYMENT.md](./QUICK_START_DEPLOYMENT.md) — 5-minute quick start
2. **Copy-paste ready:** [DEPLOYMENT_COMMANDS.md](./DEPLOYMENT_COMMANDS.md) — All commands
3. **Complete guide:** [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) — Comprehensive walkthrough
4. **Verification:** [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) — Post-deployment checks

### What's Included
- ✅ Pre-configured `vercel.json` for serverless deployment
- ✅ Backend serverless setup with catch-all routing
- ✅ Frontend optimized build configuration
- ✅ Environment variable templates and guides
- ✅ MongoDB Atlas integration instructions
- ✅ Troubleshooting guides and common fixes
- ✅ Post-deployment verification checklists

### Deployment Features
- **Serverless Backend** — Express app runs as serverless functions
- **Static Frontend** — Optimized Vite build with SPA routing
- **Environment Variables** — Secure configuration management
- **Custom Domains** — Easy custom domain setup
- **SSL/HTTPS** — Automatic SSL certificates
- **Global CDN** — Fast content delivery worldwide
- **Auto-scaling** — Handles traffic spikes automatically

## 🎯 Key Features Summary

### For Users

- 🎮 Track your gaming library and play sessions
- ⭐ Review and rate games
- 🤖 Get AI-powered personalized game recommendations
- 👥 Connect with friends and chat in real-time
- 🏆 Compete on leaderboards and unlock achievements
- 📰 Stay updated with gaming news
- 🎪 Join gaming events and tournaments
- 🔔 Customizable notifications with quiet hours
- 🌙 Beautiful dark mode support

### For Admins
- 📊 Real-time analytics dashboard with charts
- 👤 User management with role assignment
- 🛡️ Content moderation queue
- 📝 Complete audit log of all actions
- 📈 User growth and engagement metrics
- 🚨 Real-time report notifications
- 🔨 Bulk moderation tools

### For Developers

- 🏗️ Clean MVC architecture
- 🤖 AI recommendation engine with genre-based learning
- 🔌 Real-time Socket.IO integration
- 🗃️ MongoDB with Mongoose ODM
- 🔐 JWT authentication with middleware
- ⚡ Redis caching with fallback
- 🎨 Tailwind CSS with dark mode
- 📱 Fully responsive design
- 🧪 E2E testing with Playwright

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Report Bugs** — Open an issue with detailed reproduction steps
2. **Suggest Features** — Share your ideas for new features
3. **Submit PRs** — Fork, create a feature branch, and submit a pull request
4. **Improve Docs** — Help improve documentation and guides
5. **Write Tests** — Add test coverage for new features

### Development Guidelines
- Follow existing code style and conventions
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Test thoroughly before submitting PR

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- **RAWG API** — Game data and news (https://rawg.io)
- **MongoDB** — Database solution
- **Socket.IO** — Real-time communication
- **Vercel** — Deployment platform
- **Tailwind CSS** — Styling framework
- **Recharts** — Data visualization

---

**Built with ❤️ for the gaming community**

Enjoy building your gaming community! 🎮🚀
## 📚 Project Structure

```
GameHUB/
├── gameverse/
│   ├── backend/
│   │   ├── api/              # Serverless API handlers
│   │   ├── controllers/      # Request handlers
│   │   ├── middleware/       # Auth, content filter
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/           # API routes
│   │   ├── scripts/          # Utility scripts
│   │   ├── utils/            # Helper functions
│   │   ├── server.js         # Express server
│   │   ├── serverless.js     # Vercel wrapper
│   │   └── realtime.js       # Socket.IO setup
│   │
│   └── frontend/
│       ├── public/           # Static assets
│       ├── src/
│       │   ├── components/   # React components
│       │   ├── contexts/     # React contexts (Auth, Theme)
│       │   ├── pages/        # Page components
│       │   ├── services/     # API service layer
│       │   ├── utils/        # Helper functions
│       │   ├── App.tsx       # Main app component
│       │   └── main.tsx      # Entry point
│       ├── tests/            # Playwright tests
│       └── vite.config.ts    # Vite configuration
│
├── api/                      # Vercel API routes
├── vercel.json              # Vercel deployment config
└── README.md                # This file
```

## Deployment on Vercel

Ready to deploy? We've prepared everything for you!

### Quick Deployment (20-30 minutes)

1. **Start with:** [QUICK_START_DEPLOYMENT.md](./QUICK_START_DEPLOYMENT.md) (5-minute guide)
2. **Detailed steps:** [DEPLOYMENT_COMMANDS.md](./DEPLOYMENT_COMMANDS.md) (copy-paste ready)
3. **Complete guide:** [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) (comprehensive)
4. **Checklist:** [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) (verification)

**What's included:**
- ✅ Pre-configured `vercel.json`
- ✅ Backend serverless setup
- ✅ Frontend build optimization
- ✅ Environment variable templates
- ✅ Troubleshooting guides
- ✅ Post-deployment checklists



Enjoy building!
