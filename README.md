# GameVerse

GameVerse is a small demo (frontend + backend) for a gaming community platform. It includes:

- Realtime chat (Socket.IO)
- Persistent notifications (stored in MongoDB)
- Friend requests with realtime updates
- A Vite + React TypeScript frontend and an Express + Mongoose backend

Additional features added recently:

- Centralized notification factory (backend) that persists notifications and emits them to per-user socket rooms.
- Admin area with realtime dashboard, users, reports, audit logs, and moderation tools (frontend + backend).
- Audit logging (`AuditLog`) for important admin and moderation actions (report creation, assignment, resolution, friend request events, wishlist privacy changes, bulk moderation).
- Wishlist privacy toggle (frontend component + API) to make wishlists public/private and a public wishlist route.
- Admin realtime events: server emits `report.created`, `report.assigned`, `report.resolved` to connected admins in `admin_room` so dashboards update live.
- Playwright smoke tests for quick end-to-end checks (frontend/tests).
- Small admin UI: side-menu layout, assign/resolve controls for reports, and simple admin pages scaffolded.

**Latest enhancements (Q4 2025):**

- **Activity Hooks & Real-time Feed** — Automatic activity creation with Socket.IO broadcasts across all controllers (achievements, forum posts, leaderboard scores, reviews). Activities include rich metadata (user, type, game info, timestamps) and are broadcast to all connected clients via `activity_created` events for real-time feed updates.
  
- **Redis Caching with Fallback** — Integrated Redis-backed caching for RAWG API gaming news with 1-hour TTL and automatic fallback to in-process cache if Redis is unavailable. Reduces API latency and external dependencies while maintaining data freshness.

- **Activity Filtering & Search** — Frontend feed now supports filtering by activity type (e.g., `ACHIEVEMENT_UNLOCKED`, `GAME_REVIEWED`, `NEW_HIGHSCORE`), full-text search across activity data, and sort options (newest/oldest). Includes "Reset Filters" button for quick view reset.

- **Notification Preferences System** — New `NotificationPreference` model and controller (`/api/notification-preferences`) allowing users to customize:
  - Which activity types trigger notifications (activities: achievements, reviews, forum posts, etc.)
  - System notifications (friend requests, messages, etc.)
  - Delivery method preferences (in-app, email, push)
  - Email digest frequency (daily, weekly, never)
  - Quiet hours (configurable time window to suppress notifications)

- **Activity Search & Sorting** — Backend feed endpoint now supports pagination, filtering by activity type, and sorting. Frontend includes interactive controls for searching user activities and sorting by recency or popularity.

- **Content Moderation System** — Comprehensive moderation tools for community safety:
  - **User Reports** — Users can report inappropriate content (users, reviews, forum posts, games, messages) with severity levels and detailed descriptions
  - **Moderation Queue** — Admin/moderator dashboard to view, assign, and resolve pending reports
  - **Content Filter** — Automatic filtering of banned words in user-generated content (titles, comments, descriptions, bios)
  - **Role-Based Access** — Dedicated admin and moderator roles with authorization middleware
  - **Audit Logging** — All moderation actions tracked with timestamps, performer, and target details
  - **Real-time Updates** — Socket.IO events notify admins instantly when new reports are created
  - **Multiple Actions** — Delete content, ban users, or dismiss false reports with resolution notes

- **Events & Tournament System** — Gaming events and community gatherings:
  - **Event Types** — Support for tournaments, LAN parties, and casual meetups
  - **Event Management** — Create events with game selection, start time, location (online/offline), and participant limits
  - **Event Registration** — Users can join/register for events with status tracking (REGISTERED, CHECKED_IN, ELIMINATED, WINNER)
  - **Real-time Participant Updates** — Live participant count and status updates
  - **Event Card Component** — Beautiful event display with game info, date/time, and participant count

- **Dark Mode & Theme System** — Complete light/dark theme support:
  - **Theme Toggle** — Sun/moon emoji button in navbar to switch between light and dark modes
  - **Theme Persistence** — Saves user preference to localStorage across sessions
  - **System Preference Detection** — Automatically detects and uses system dark mode preference on first visit
  - **Smooth Transitions** — CSS transitions for seamless theme switching
  - **Tailwind Dark Classes** — Full dark mode support with `dark:` utility classes throughout the UI
  - **ThemeContext Provider** — Centralized theme state management with React Context API

## Quick Start

Prerequisites

- Node.js 16+ (or compatible LTS)
- A running MongoDB instance (local or cloud)

Important environment variables (backend)

- `PORT` (default: `5000`)
- `MONGODB_URI` (MongoDB connection string)
- `JWT_SECRET` (used to sign auth tokens)

Optional / useful env vars
- `FRONTEND_URL` or `VITE_API_URL` — base url used by the frontend (Socket.IO client) when not running on localhost:5000.
- `RAWG_API_KEY` — API key for RAWG Video Games Database (https://rawg.io/apidocs). Get a free key at https://rawg.io/login?forward=developer. If not set, the app will use mock news data.

Create a `.env` file in `gameverse/backend` with the values above. Example:

```text
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gameverse
JWT_SECRET=your_jwt_secret_here
```

Start the backend API

```powershell
cd "H:\My Website\GameHUB\gameverse\backend"
npm install
# starts with nodemon (dev) or node (prod) depending on package.json
npm run dev
```

Start the frontend (Vite)

```powershell
cd "H:\My Website\GameHUB\gameverse\frontend"
npm install
npm run dev
# Open the app (Vite may pick an alternate port), e.g. http://127.0.0.1:5173/ or the port shown by Vite
```

Create or promote an admin user (convenience script)

We added a helper script to create or promote an admin user:

```powershell
cd "H:\My Website\GameHUB\gameverse\backend"
node .\scripts\createAdmin.js admin@example.com 123456789 adminuser
```

The script will promote an existing user with that email to `admin` or create a new admin user if none exists.

Notes about dev environment

- The frontend expects the backend at `http://localhost:5000` by default. Vite uses `import.meta.env.VITE_API_URL` for Socket.IO connections — set `VITE_API_URL` in `frontend/.env` if your backend runs elsewhere.
- If a port is already in use (e.g. `5000`), free it or set a different `PORT` in the backend `.env`.

Key API endpoints

- `GET /api/notifications` — fetch user's notifications (protected)
- `PUT /api/notifications/read-all` — mark all notifications read (protected)
- `GET /api/friends` — get friends list (protected)
- `GET /api/friends/requests` — get incoming/outgoing friend requests (protected)
- Friend request actions: `POST /api/friends/requests`, `PUT /api/friends/requests/:id/accept`, `PUT /api/friends/requests/:id/reject`, `DELETE /api/friends/requests/:id`

Activity & Feed endpoints
- `GET /api/feed` — fetch activity feed with pagination, filtering by type, and search (protected)
- `GET /api/notification-preferences` — get user's notification preferences (protected)
- `PUT /api/notification-preferences` — update all notification preference settings (protected)
- `PATCH /api/notification-preferences/activities` — update which activities trigger notifications (protected)
- `PATCH /api/notification-preferences/delivery` — update delivery method preferences (protected)
- `PATCH /api/notification-preferences/email-digest` — update email digest settings (protected)

Report & Moderation endpoints
- `POST /api/reports` — create a report for inappropriate content (protected)
- `GET /api/reports/user` — get current user's submitted reports (protected)
- `GET /api/reports/:reportId` — get report details (protected)
- `POST /api/moderation/report` — submit moderation report (protected)
- `GET /api/moderation/queue` — get pending reports queue (admin/moderator only)
- `PUT /api/moderation/resolve/:id` — resolve a report with action (admin/moderator only)

Admin & moderation endpoints (examples)
- `GET /api/admin/dashboard` — admin dashboard statistics (admin only)
- `GET /api/admin/users` — list users (admin only)
- `PUT /api/admin/users/:userId` — update user role/status (admin only)
- `GET /api/admin/reports` — list reports with filtering and pagination (admin only)
- `PUT /api/admin/reports/:reportId/assign` — assign report to moderator (admin only)
Realtime events (Socket.IO)

- Server emits events like `friend_request:received`, `friend_request:accepted`, `friend_request:cancelled`, `friend:removed` to user rooms.
- Admin events: `report.created`, `report.assigned`, `report.resolved` are emitted to the `admin_room` for real-time moderation dashboard updates.
- The frontend connects using Socket.IO and listens to these events to refresh notifications and show transient toasts.
Wishlist endpoints
- `GET /api/wishlist` — user's wishlist
- `PUT /api/wishlist/privacy` — toggle wishlist public/private
- `GET /api/wishlist/user/:userId` — view a public wishlist by user id

Realtime events (Socket.IO)

- Server emits events like `friend_request:received`, `friend_request:accepted`, `friend_request:cancelled`, `friend:removed` to user rooms.
- The frontend connects using Socket.IO and listens to these events to refresh notifications and show transient toasts.

Development checks & helpers

- Run TypeScript checks in the frontend:

```powershell
cd "H:\My Website\GameHUB\gameverse\frontend"
npx tsc --noEmit
```

-- There's a lightweight smoke-test script for sockets at `frontend/scripts/socketSmokeTest.js` to simulate two clients — useful while backend + frontend are running.

Playwright smoke tests
----------------------
We added a minimal Playwright setup and a smoke test to quickly validate the frontend server and routing. To run:

```powershell
cd "H:\My Website\GameHUB\gameverse\frontend"
npm install
npx playwright install
npm run test:e2e
```

The tests check the homepage, login page, and that unauthenticated admin routes redirect to login. Expand the tests to cover authenticated admin flows as needed.

Troubleshooting

- If you see `ECONNREFUSED` in the frontend, confirm the backend is running and reachable at the configured URL/port.
- If Vite reports `Port 5173 in use` it will try another port; open the URL printed by Vite.
Admin UI notes
- The frontend includes a simple admin area at `/admin/*` (Dashboard, Users, Reports, Audit Logs, Moderation). Only users with `role: 'admin'` or `role: 'moderator'` can access these routes.
- Admin clients join an `admin_room` socket on connect so server-side realtime events (report.created/assigned/resolved) are delivered to them.
- The admin reports page includes quick Assign/Resolve actions (prompt-based). These call the admin APIs and trigger audit logs and realtime events.
- **Moderation Queue** at `/admin/moderation` provides a quick view of pending reports with Delete Content and Dismiss actions.
- **Report Button** component available for integration into ReviewCard, UserProfile, ForumPost, and other content areas.

Content Moderation features
- **Automatic Content Filtering**: Middleware filters banned words from titles, comments, descriptions, bios, and content fields
- **User Reporting**: Users can report content with reasons (spam, harassment, inappropriate content, hate speech, etc.) and severity levels
- **Moderation Actions**: Admins/moderators can delete content, ban users, or dismiss reports
- **Duplicate Prevention**: System prevents users from submitting multiple reports for the same item
- **Audit Trail**: All moderation actions are logged with performer, target, timestamp, and action details
- **Role-Based Access**: Authorization middleware ensures only admins and moderators can access moderation endpoints
- The admin reports page includes quick Assign/Resolve actions (prompt-based). These call the admin APIs and trigger audit logs and realtime events.


Want to run both servers together?

- Use a process manager (tmux, Windows Terminal panes) or add an orchestration script (e.g., `concurrently` or `npm-run-all`) to the workspace `package.json`.

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
