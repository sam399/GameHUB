# GameVerse

GameVerse is a small demo (frontend + backend) for a gaming community platform. It includes:

- Realtime chat (Socket.IO)
- Persistent notifications (stored in MongoDB)
- Friend requests with realtime updates
- A Vite + React TypeScript frontend and an Express + Mongoose backend

## Quick Start

Prerequisites

- Node.js 16+ (or compatible LTS)
- A running MongoDB instance (local or cloud)

Important environment variables (backend)

- `PORT` (default: `5000`)
- `MONGODB_URI` (MongoDB connection string)
- `JWT_SECRET` (used to sign auth tokens)

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

Notes about dev environment

- The frontend expects the backend at `http://localhost:5000` by default. Vite uses `import.meta.env.VITE_API_URL` for Socket.IO connections — set `VITE_API_URL` in `frontend/.env` if your backend runs elsewhere.
- If a port is already in use (e.g. `5000`), free it or set a different `PORT` in the backend `.env`.

Key API endpoints

- `GET /api/notifications` — fetch user's notifications (protected)
- `PUT /api/notifications/read-all` — mark all notifications read (protected)
- `GET /api/friends` — get friends list (protected)
- `GET /api/friends/requests` — get incoming/outgoing friend requests (protected)
- Friend request actions: `POST /api/friends/requests`, `PUT /api/friends/requests/:id/accept`, `PUT /api/friends/requests/:id/reject`, `DELETE /api/friends/requests/:id`

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

Troubleshooting

- If you see `ECONNREFUSED` in the frontend, confirm the backend is running and reachable at the configured URL/port.
- If Vite reports `Port 5173 in use` it will try another port; open the URL printed by Vite.

Want to run both servers together?

- Use a process manager (tmux, Windows Terminal panes) or add an orchestration script (e.g., `concurrently` or `npm-run-all`) to the workspace `package.json`.

Enjoy building!
