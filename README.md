# GameVerse

GameVerse is a small demo project (frontend + backend) for a gaming community platform.

## Quick Start

Prerequisites:
- Node.js (16+)

Start the backend API:


cd "h:\JAVASCRIPTS\gameverse\backend"
npm install
# dev with auto-reload
npm run dev
```

Start the frontend (Vite):

```powershell
cd "h:\JAVASCRIPTS\gameverse\frontend"
npm install
npm run dev
# Open http://127.0.0.1:5173/
```

Notes:
- The frontend dev server proxies `/api` to `http://localhost:5000` (see `frontend/vite.config.ts`).
- Backend environment variables are stored in `backend/.env` (don't commit secrets).

If you want, run both servers together using a process manager or add an npm script to orchestrate them.
