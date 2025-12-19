# GameVerse 🎮

**GameVerse** is a comprehensive gaming community platform built with modern web technologies. It combines social networking, content management, competitive gaming, and real-time interactions into a single, feature-rich application with **The Nexus Interface** - an immersive, cyber-fantasy design system that makes users feel like they're logging into a futuristic game lobby.

## 🚀 Current Status

- ✅ **Backend**: Running on port 5000 with MongoDB Atlas (database-first architecture)
- ✅ **Frontend**: Running on port 5173 with Vite hot-reload
- ✅ **Database**: MongoDB Atlas with 49 games (fully populated and indexed)
- ✅ **Game Library**: Fully functional pagination and filtering system
- ✅ **Light/Dark Mode**: Complete theme system with CSS variables across all pages
- ✅ **Animations**: WebGL hex grid and particles visible in both light and dark modes
- ✅ **2FA**: Two-Factor Authentication fully functional
- ✅ **Socket.IO**: Real-time features operational
- ✅ **Nexus Interface**: Immersive cyber-fantasy UI with theme-aware components
- ✅ **Profile Dropdown**: Click-based menu now working properly
- ✅ **All Core Features**: Tested and working properly
- ✅ **Codebase Cleanup**: Removed 27 legacy files and external API dependencies

## 🎨 The Nexus Interface

Experience a revolutionary cyber-fantasy design system that transforms web browsing into an immersive gaming experience:

### Visual & Interactive Elements
- **Drone Cursor** — Custom animated cursor with glowing trails, velocity-based sparks, and energy pulse ripples on clicks
- **Living Background** — WebGL-powered hexagonal grid with mouse-reactive ripples, scroll-based movement, and floating particles (GPU-accelerated with Three.js)
- **Sound System** — Procedurally generated UI sounds (high-tech chirp on hover, digital lock-in on click, whoosh transitions)
- **Parallax Hero** — 2.5D multi-layer parallax with character tracking mouse movement and holographic CTA buttons
- **Enhanced Game Cards** — Video-on-hover, 3D tilt effects, holographic scanlines, and brand-color-specific glows
- **Futuristic Navigation** — Frosted glass morphism, animated scanlines, rotating avatar rings, and smooth transitions
- **Cyber-Fantasy Theme** — Electric cyan + plasma magenta color palette with CSS variable system

### Technical Features
- **GPU Acceleration** — Three.js and WebGL for smooth 60fps animations
- **GSAP Animations** — Professional-grade motion design
- **Web Audio API** — Real-time procedural sound generation
- **Responsive Design** — Optimized for desktop, tablet, and mobile devices
- **Performance Optimized** — Efficient rendering with minimal overhead

## 🌟 Core Features

### 🎯 Gaming & Content

- **Game Library** — Browse all 49 games with full pagination (5 pages, 12 games per page), filtering by genre/platform, and search functionality
- **Curated Game Database** — Complete metadata including ratings, genres, platforms, pricing, and cover artwork
- **Reviews & Ratings** — Write detailed game reviews, rate games, and react to community reviews (helpful, funny, awards)
- **Wishlist System** — Create and manage your game wishlist with public/private visibility toggle
- **Game Discovery** — Browse games by genre, search, and view featured titles
- **AI Recommendations** — Get personalized game suggestions based on your review history and genre preferences

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

### 🔐 Security Features
- **Two-Factor Authentication (2FA)** — TOTP-based authentication using Google Authenticator or compatible apps
- **QR Code Setup** — Easy 2FA setup with QR code generation for authenticator apps
- **Secret Protection** — 2FA secrets stored securely with select: false in database schema
- **Progressive Login** — Seamless 2FA flow that prompts for code only when enabled
- **JWT Authentication** — Secure token-based authentication with refresh capability
- **Password Hashing** — Bcrypt with salt rounds for secure password storage
- **Content Validation** — Input sanitization and validation middleware

### 👨‍💼 Admin & Analytics
- **Admin Dashboard** — Real-time statistics on users, games, reviews, reports, and system health
- **Analytics Dashboard** — Interactive charts showing user growth, content trends, and genre distribution
- **User Management** — View, search, and manage user accounts with role assignment
- **Report Management** — Assign reports to moderators, track resolution status, and view report history
- **Audit Logs** — Complete history of admin actions with detailed context and timestamps
- **Bulk Moderation** — Process multiple moderation actions simultaneously
- **Role-Based Access Control** — Separate admin and moderator roles with authorization middleware

### 🎨 User Experience
- **The Nexus Interface** — Immersive cyber-fantasy design with drone cursor, living background, and procedural sound system
- **Parallax Effects** — 2.5D multi-layer parallax with mouse-reactive character tracking
- **Interactive Game Cards** — Video-on-hover, 3D tilt effects, and holographic scanlines
- **Gaming Terminology** — Immersive language throughout (Spawn In, Resume Game, Disconnect, Command Center, Intel Center, Scout Games)
- **Glassmorphism UI** — Modern frosted glass effects on cards, overlays, and navigation elements
- **Dark Mode & Theme System** — Toggle between light and dark themes with system preference detection
- **Theme Persistence** — Preferences saved to localStorage across sessions
- **Responsive Design** — Fully responsive UI built with Tailwind CSS with mobile-first approach
- **Real-time Updates** — Socket.IO powers live notifications, chat, and activity feeds
- **Search & Filtering** — Advanced search across games, users, activities, and content
- **Pagination** — Efficient data loading with pagination throughout the application
- **Custom Animations** — GSAP-powered animations, neon pulse effects, and smooth transitions
- **Fixed Navigation** — Backdrop-blurred navbar that stays visible during scrolling

### 🔧 Technical Features

- **Two-Factor Authentication** — TOTP-based 2FA with QR code generation using speakeasy library
- **AI Recommendation Engine** — Genre-based preference learning from user reviews with compatibility scoring
- **Activity Hooks** — Automatic activity creation across all controllers with real-time broadcasts
- **MongoDB Game Library** — Database-first architecture with 49 games including all metadata (genres, platforms, pricing, ratings)
- **JWT Authentication** — Secure token-based authentication with refresh capability
- **Socket.IO Rooms** — User-specific and admin rooms for targeted real-time events
- **Mongoose ODM** — MongoDB integration with schema validation and relationships
- **Notification Factory** — Centralized notification creation and delivery system
- **Content Validation** — Input sanitization and validation middleware
- **Error Handling** — Comprehensive error handling with meaningful error messages
- **MongoDB Atlas** — Cloud database support with connection string configuration
- **The Nexus Interface** — WebGL/Three.js rendering, GSAP animations, Web Audio API sound system

## 🚀 Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for blazing-fast development
- **Tailwind CSS** for styling with dark mode support and custom gaming aesthetics
- **Three.js & @react-three/fiber** for WebGL 3D graphics and animations
- **@react-three/drei** for advanced Three.js utilities
- **GSAP** for professional-grade animations
- **Socket.IO Client** for real-time communication
- **Axios** for HTTP requests with interceptors
- **React Router** for navigation
- **Recharts** for data visualization in admin analytics
- **Playwright** for end-to-end testing
- **Web Audio API** for procedural sound generation

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose ODM (supports MongoDB Atlas)
- **Socket.IO** for real-time events
- **JWT** for authentication
- **Speakeasy** for TOTP-based 2FA
- **QRCode** for 2FA QR code generation
- **Redis** for caching (optional with fallback)
- **Bcrypt** for password hashing
- **dotenv** for environment configuration

## 📋 Quick Start

### Prerequisites

- Node.js 16+ (or compatible LTS)
- MongoDB Atlas account (or local MongoDB instance)
- Redis (optional, for caching - falls back to in-memory cache)
- Google Authenticator app (optional, for 2FA testing)

### Environment Setup

**Important environment variables (backend)**

Create a `.env` file in `gameverse/backend`:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database (MongoDB Atlas or local)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gameverse
# Or for local: mongodb://localhost:27017/gameverse

# Authentication
JWT_SECRET=your_super_secure_jwt_secret_here_change_in_production
JWT_EXPIRE=7d

# Frontend URL (for CORS and Socket.IO)
FRONTEND_URL=http://localhost:5173

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

**2. Database is pre-populated with 49 games**

The game database is already populated with a curated collection of 49 games. You can verify this by checking MongoDB Atlas or by accessing `/api/games` in the browser once the backend is running.

To add more games (optional):

```powershell
cd "H:\My Website\GameHUB\gameverse\backend"
node scripts/populatePopularGames.js
```

**3. Start the frontend (Vite)**

```powershell
cd "H:\My Website\GameHUB\gameverse\frontend"
npm install
npm run dev
```

The frontend will start on `http://localhost:5173` or another available port shown by Vite.

**4. Create an admin user (optional)**

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
- **Port conflicts**: If port 5000 or 5173 is in use, either free it or set a different `PORT` in the backend `.env`

### Codebase Cleanup & Refactoring

This project was recently refactored to remove legacy code and external API dependencies:

- **Removed 27 files**: Old controllers, seed scripts, deployment documentation, and test utilities
- **Simplified feedController**: Removed RapidAPI/RAWG/FreeToGame external API calls (~50 lines of code)
- **Database-first architecture**: All data now sourced from MongoDB Atlas, no external API dependencies
- **Clean package.json**: Removed unused npm scripts and simplified dependencies
- **See [REFACTOR_SUMMARY.md](./REFACTOR_SUMMARY.md) for complete details of all changes**

## 📡 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` — Register a new user account
- `POST /api/auth/login` — Login and receive JWT token (supports 2FA)
- `GET /api/auth/me` — Get current user profile (protected)
- `PUT /api/auth/profile` — Update user profile (protected)
- `POST /api/auth/2fa/generate` — Generate 2FA QR code (protected)
- `POST /api/auth/2fa/verify` — Verify and enable 2FA (protected)

### Game Endpoints
- `GET /api/games` — Get all games with pagination and search
- `GET /api/games/featured` — Get featured games
- `GET /api/games/genre/:genre` — Get games by genre
- `GET /api/games/:id` — Get game details by ID
- `GET /api/games/meta/genres` — Get all unique genres
- `GET /api/games/meta/platforms` — Get all unique platforms
- `GET /api/games/meta/stats` — Get game library statistics
- `POST /api/games` — Create a new game (admin only)
- `PUT /api/games/:id` — Update a game (admin only)
- `DELETE /api/games/:id` — Delete a game (admin only)

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

### Two-Factor Authentication (2FA) Test

Test the 2FA implementation:

```powershell
cd "H:\My Website\GameHUB\gameverse\backend"
node test/test-2fa.js
```

This automated test verifies:
- User registration and login
- 2FA QR code generation
- Token verification endpoints
- Login flow with 2FA enabled

For manual testing, see the [2FA Test Report](2FA_TEST_REPORT.md).

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
- Ensure MongoDB service is running (or MongoDB Atlas is accessible)
- Verify connection string format
- For local: `mongodb://localhost:27017/gameverse`
- For Atlas: `mongodb+srv://username:password@cluster.mongodb.net/gameverse`
- Check network connectivity for cloud databases

**2FA issues**
- Ensure `speakeasy` and `qrcode` packages are installed
- Verify time sync between server and authenticator app
- Check that 2FA secret is properly stored in database
- For testing, use a TOTP generator or Google Authenticator app

**Game library empty**
- Run the population script: `node scripts/populatePopularGames.js`
- Check MongoDB connection is working
- Verify 50 games were inserted successfully
- Review backend logs for database errors

## 🔐 Two-Factor Authentication Setup

GameVerse supports TOTP-based 2FA for enhanced account security.

### Enabling 2FA

1. **Login to your account**
2. **Navigate to Profile page**
3. **Find "Security Settings" section**
4. **Click "Enable 2FA" button**
5. **Scan QR code** with Google Authenticator, Authy, or compatible app
6. **Enter 6-digit code** from authenticator app
7. **Click "Verify & Activate"**

### Using 2FA for Login

Once enabled, the login flow changes:

1. **Enter email and password** as normal
2. **2FA prompt appears** after password validation
3. **Enter current 6-digit code** from authenticator app
4. **Login completes** upon successful verification

### 2FA Architecture

- **TOTP Standard**: RFC 6238 Time-based One-Time Password
- **Secret Storage**: Encrypted in MongoDB with `select: false`
- **QR Generation**: Automatic via `qrcode` library
- **Validation**: 30-second time window with clock drift tolerance
- **Progressive**: Non-breaking change for existing users

### Supported Authenticator Apps

- Google Authenticator (iOS, Android)
- Microsoft Authenticator (iOS, Android)
- Authy (iOS, Android, Desktop)
- 1Password (with TOTP support)
- Any RFC 6238 compliant TOTP app

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
- 🎮 The Nexus Interface with WebGL/Three.js
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
- **Tailwind CSS** — Styling framework with custom gaming aesthetics
- **Recharts** — Data visualization
- **React** — Frontend framework with TypeScript
- **Express** — Backend framework

---

## 🎮 Gaming Terminology Reference

GameVerse uses immersive gaming terminology throughout the platform to enhance the user experience:

| Standard Term | Gaming Term | Icon |
|--------------|-------------|------|
| Sign Up | Spawn In / Create Character | ⚔️ |
| Log In | Resume Game / Connect | 🎮 |
| Log Out | Disconnect | 🚪 |
| Dashboard | Command Center | 🎮 |
| Profile | Character Sheet | 📊 |
| Settings | Config / Loadout | ⚙️ |
| Notifications | Intel / Pings | 📡 |
| Search | Scout / Recon | 🔍 |
| Browse | Scout Games | 🔍 |
| Error / 404 | Connection Lost / Glitch | ⚠️ |
| Success | Achievement Unlocked / Level Up | 🏆 |

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
│       │   │   └── nexus/    # Nexus Interface components
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
├── NEXUS_IMPLEMENTATION_SUMMARY.md  # Nexus Interface docs
└── README.md                # This file
```

### Nexus Interface Components

The Nexus Interface includes these core components in `gameverse/frontend/src/components/nexus/`:
- **DroneCursor.tsx** — Custom animated cursor with trails and effects
- **LivingBackground.tsx** — WebGL hexagonal grid animation
- **SoundSystem.tsx** — Procedural UI sound generation
- **ParallaxHero.tsx** — 2.5D parallax hero section
- **NexusGameCard.tsx** — Enhanced game cards with video hover
- **NexusNavbar.tsx** — Futuristic navigation bar
- **NexusHome.tsx** — Main homepage with Nexus features

## Deployment on Vercel

Ready to deploy? We've prepared everything for you!

### Quick Deployment (20-30 minutes)

1. **Start with:** [QUICK_START_DEPLOYMENT.md](./QUICK_START_DEPLOYMENT.md) (5-minute guide)
2. **Detailed steps:** [DEPLOYMENT_COMMANDS.md](./DEPLOYMENT_COMMANDS.md) (copy-paste ready)
3. **Complete guide:** [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) (comprehensive)

**What's included:**
- ✅ Pre-configured `vercel.json`
- ✅ Backend serverless setup
- ✅ Frontend build optimization
- ✅ Environment variable templates
- ✅ MongoDB Atlas connection
- ✅ Troubleshooting guides

## 📚 Additional Documentation

- **[Nexus Implementation Summary](NEXUS_IMPLEMENTATION_SUMMARY.md)** — Complete Nexus Interface implementation details
- **[Nexus Quick Start](gameverse/NEXUS_QUICK_START.md)** — Get started with the Nexus Interface
- **[Nexus Visual Guide](gameverse/NEXUS_VISUAL_GUIDE.md)** — Visual overview of Nexus components
- **[Refactoring Summary](REFACTOR_SUMMARY.md)** — Details of codebase cleanup and removed files
- **[2FA Test Report](2FA_TEST_REPORT.md)** — Complete 2FA testing and setup guide
- **[Feature Verification](FEATURE_VERIFICATION_REPORT.md)** — All features tested and validated

## 🎮 Quick Access

### For Users
- **Application URL**: http://localhost:5173
- **Features**: The Nexus Interface with immersive cyber-fantasy UI, 49-game curated library with pagination, 2FA security, real-time chat, forums, achievements, leaderboards
- **Test Account**: Create your own via registration page

### For Developers
- **Backend API**: http://localhost:5000
- **API Docs**: See API Documentation section above
- **Database**: MongoDB Atlas with 49 games and complete schema
- **Theme System**: Light/dark mode with CSS variables across all components

### For Admins
- **Admin Panel**: Login as admin and access Command Center
- **Create Admin**: `node scripts/createAdmin.js admin@example.com password123 adminuser`
- **Moderation**: Access moderation queue for reports and content management

---

**Built with ❤️ for the gaming community**

Enjoy building!
