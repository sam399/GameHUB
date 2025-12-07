# GameVerse Deployment Architecture

## High-Level Deployment Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     YOUR LOCAL MACHINE                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐                                               │
│  │  Your Code   │                                               │
│  │   (React +   │                                               │
│  │   Express)   │                                               │
│  └──────┬───────┘                                               │
│         │                                                       │
│         ├──→ git push → GitHub                                  │
│         └──→ Development & Testing                              │
└─────────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────────┐
│                    GITHUB (Code Repository)                     │
├─────────────────────────────────────────────────────────────────┤
│  GameHUB/                                                        │
│  ├── gameverse/frontend/                                        │
│  ├── gameverse/backend/                                         │
│  └── vercel.json                                                │
└─────────────────────────────────────────────────────────────────┘
         ↓
┌──────────────────────────────────────────────────────────────────┐
│                       VERCEL DEPLOYMENT                          │
├───────────────────────────┬────────────────────────────────────┤
│                           │                                    │
│  FRONTEND                 │  BACKEND                          │
│  ┌──────────────────┐    │  ┌──────────────────┐             │
│  │ React + Vite    │    │  │ Express + Node.js│             │
│  │                  │    │  │                  │             │
│  │ Build: Vite      │    │  │ Serverless Func  │             │
│  │ Output: dist/    │    │  │ Runtime: Node.js │             │
│  │ Host: CDN        │    │  │ Env: Production  │             │
│  │ CORS: Configured │    │  │ Memory: 1GB      │             │
│  └─────────┬────────┘    │  └──────────┬───────┘             │
│            │             │             │                    │
│ https://   │             │             │                    │
│ gameverse  │             │  https://   │                    │
│ -xxx.     │             │  gameverse  │                    │
│ vercel.app│             │  -api-xxx.  │                    │
│           │             │  vercel.app │                    │
│           │             │             │                    │
│  Browser  │             │  API Routes │                    │
│  Requests │             │  Endpoints  │                    │
│           │             │             │                    │
└───────────┼─────────────┴─────────────┼────────────────────┘
            │                            │
            └──────────────┬─────────────┘
                           ↓
            ┌──────────────────────────────┐
            │  CORS Configured Connection  │
            │  https:// API calls          │
            └──────────────┬───────────────┘
                           ↓
        ┌──────────────────────────────────────┐
        │     MONGODB ATLAS (Cloud Database)   │
        ├──────────────────────────────────────┤
        │  Cluster 0                           │
        │  ├── Collections                     │
        │  │   ├── Users                       │
        │  │   ├── Games                       │
        │  │   ├── Activities                  │
        │  │   ├── Reviews                     │
        │  │   ├── Friends                     │
        │  │   ├── Notifications               │
        │  │   └── ...                         │
        │  │                                   │
        │  ├── Backups: Auto                   │
        │  ├── Replication: 3-node             │
        │  └── SSL/TLS: Enabled                │
        └──────────────────────────────────────┘
```

## Detailed Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + Vite)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Browser (https://gameverse-xxx.vercel.app)                   │
│  ├── App.tsx (Router)                                          │
│  ├── Pages/                                                    │
│  │   ├── Login                                                │
│  │   ├── GameLibrary                                          │
│  │   ├── NewsFeed                                             │
│  │   ├── Friends                                              │
│  │   ├── Chat                                                 │
│  │   ├── Profile                                              │
│  │   └── Admin (for admins)                                   │
│  │                                                             │
│  ├── Services/                                                 │
│  │   ├── api.ts (axios instance)                              │
│  │   ├── feedService.ts → /api/feed                           │
│  │   ├── authService.ts → /api/auth                           │
│  │   ├── gameService.ts → /api/games                          │
│  │   └── ...                                                   │
│  │                                                             │
│  └── Contexts/                                                 │
│      ├── AuthContext (user data)                              │
│      ├── SocketContext (real-time)                            │
│      └── NotificationContext                                  │
│                                                                 │
│  Production Build: npm run build → dist/                       │
│  Vercel CDN: Global distribution                               │
│  HTTPS: Automatic SSL/TLS                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
           ↓ HTTP Requests (/api/...)
           ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Express + Node.js)                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  server.js (Express App)                                       │
│  ├── Middleware/                                               │
│  │   ├── CORS (handle cross-origin requests)                   │
│  │   ├── bodyParser (JSON parsing)                             │
│  │   └── auth (JWT validation)                                 │
│  │                                                             │
│  ├── Routes/                                                   │
│  │   ├── /api/auth (login, register)                           │
│  │   ├── /api/games (game CRUD)                                │
│  │   ├── /api/reviews (game reviews)                           │
│  │   ├── /api/feed (activities + news)                         │
│  │   ├── /api/friends (friend system)                          │
│  │   ├── /api/notifications (user notifications)              │
│  │   ├── /api/notification-preferences (user settings)        │
│  │   └── ... (15+ routes)                                      │
│  │                                                             │
│  ├── Controllers/                                              │
│  │   ├── authController.js                                    │
│  │   ├── gameController.js                                    │
│  │   ├── feedController.js (with RAWG API)                    │
│  │   ├── friendController.js                                  │
│  │   └── ...                                                   │
│  │                                                             │
│  ├── Models/ (Mongoose Schemas)                               │
│  │   ├── User                                                  │
│  │   ├── Game                                                  │
│  │   ├── Activity                                              │
│  │   ├── Review                                                │
│  │   ├── Notification                                          │
│  │   ├── NotificationPreference                                │
│  │   └── ... (15+ models)                                      │
│  │                                                             │
│  ├── Utilities/                                                │
│  │   ├── redisCache.js (caching layer)                         │
│  │   ├── realtime.js (Socket.IO helper)                        │
│  │   └── notificationFactory.js                                │
│  │                                                             │
│  └── Serverless Deployment:                                    │
│      ├── Max Execution Time: 60 seconds                        │
│      ├── Memory: 1GB                                           │
│      ├── Environment: Node.js 20.x                             │
│      └── Cold Start: ~2 seconds                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
           ↓ MongoDB Queries
           ↓
┌─────────────────────────────────────────────────────────────────┐
│              MONGODB ATLAS (Cloud Database)                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Cluster: M0 Free Tier (512MB) or larger                       │
│  Region: AWS (configurable)                                    │
│  Replication: 3-node replica set                               │
│  Backup: Daily snapshots                                       │
│  SSL/TLS: Always encrypted                                     │
│  Network: IP whitelist (0.0.0.0/0 for Vercel)                  │
│                                                                 │
│  Collections:                                                   │
│  ├── users (authentication, profiles)                          │
│  ├── games (game library data)                                │
│  ├── activities (user activities)                             │
│  ├── reviews (game reviews)                                   │
│  ├── notifications (user notifications)                       │
│  ├── friends (friend relationships)                           │
│  └── ... (more collections)                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Examples

### Example 1: User Login
```
1. User enters email/password in browser
   ↓
2. Frontend sends POST /api/auth/login
   ↓
3. Backend authController validates credentials
   ↓
4. MongoDB finds user document
   ↓
5. Password compared with hash
   ↓
6. JWT token generated
   ↓
7. Frontend receives token
   ↓
8. Token stored in localStorage
   ↓
9. User logged in, redirect to /profile
```

### Example 2: Browse Games
```
1. User visits /games
   ↓
2. Frontend calls GET /api/games?page=1
   ↓
3. Backend gameController.getGames() executes
   ↓
4. MongoDB finds games (10 per page)
   ↓
5. Data formatted and sent back
   ↓
6. Frontend renders GameLibrary component
   ↓
7. User sees games with images, ratings, etc.
```

### Example 3: View Activity Feed
```
1. User navigates to /feed
   ↓
2. Frontend calls GET /api/feed
   ↓
3. Backend feedController:
   - Fetches friend activities from MongoDB
   - Fetches RAWG API trending games (cached)
   - Merges data
   ↓
4. Frontend receives:
   {
     activities: [...],  // Internal activities
     news: [...]         // Trending games
   }
   ↓
5. Components render:
   - ActivityCard for each activity
   - NewsCard for each trending game
   ↓
6. Real-time Socket.IO listener updates on new activities
```

## Environment & Security

### Production Environment Variables
```
Backend (.env in Vercel):
├── MONGODB_URI      → MongoDB Atlas connection
├── JWT_SECRET       → Signing tokens
├── JWT_EXPIRE       → Token expiration
├── RAWG_API_KEY     → Gaming news API
├── NODE_ENV         → Set to 'production'
└── FRONTEND_URL     → For CORS

Frontend (.env.production):
└── VITE_API_URL     → Backend API base URL
```

### Security Features
```
✓ HTTPS/SSL (Vercel automatic)
✓ CORS configured
✓ JWT authentication
✓ Password hashing (bcryptjs)
✓ MongoDB authentication
✓ Environment variables secured
✓ No secrets in code
✓ Rate limiting (recommended)
✓ Input validation
```

## Scalability & Performance

### Current Setup (Free Tier)
```
Frontend:
- Vercel CDN (global)
- Static files served from edge
- ~50-100ms response time

Backend:
- Single Node.js instance
- Serverless (auto-scaling)
- MongoDB Atlas free tier

Database:
- 512MB storage limit
- Single replica set
- Suitable for development
```

### When to Upgrade
```
Frontend → Pro Plan when:
  - Need custom domain
  - Analytics needed
  - Team collaboration

Backend → When:
  - API calls > 1M/month
  - Response time critical
  - Need multiple regions

Database → Pro/M2+ when:
  - Storage > 512MB
  - High query volume
  - Production critical
```

## Deployment Workflow

```
                    ┌─ LOCAL DEVELOPMENT
                    │
                    ├─ Write Code
                    ├─ Test Locally (npm run dev)
                    ├─ Commit to Git (git commit)
                    │
                    ↓
                GITHUB (main branch)
                    │
                    ├─ Webhook triggered
                    │
                    ↓
              VERCEL BUILD
                    │
    ┌───────────────┼───────────────┐
    │               │               │
    ↓               ↓               ↓
FRONTEND        BACKEND        (runs tests)
  build           build
  |               |
  ├─ vite build   ├─ npm install
  ├─ Minify       ├─ Node modules
  └─ dist/        └─ Ready
    |               |
    ↓               ↓
  VERCEL       VERCEL
  CDN          SERVERLESS
  |               |
  └───────────────┴─────────────────┐
                                    ↓
                            LIVE ON INTERNET
                  https://gameverse-xxx.vercel.app
```

## Monitoring & Debugging

### Vercel Dashboard
```
✓ Deployment history
✓ Build logs
✓ Runtime errors
✓ Performance metrics
✓ Traffic analytics
```

### Browser DevTools
```
✓ Console (errors)
✓ Network tab (API calls)
✓ Storage (localStorage tokens)
✓ Application tab (service workers)
```

### MongoDB Atlas
```
✓ Query analyzer
✓ Performance advisor
✓ Storage metrics
✓ Connection logs
```

---

**This architecture ensures:**
- ✅ Fast, reliable global delivery
- ✅ Automatic scaling
- ✅ Secure data storage
- ✅ Easy deployment & updates
- ✅ Cost-effective (free tier available)
- ✅ Production-ready infrastructure
