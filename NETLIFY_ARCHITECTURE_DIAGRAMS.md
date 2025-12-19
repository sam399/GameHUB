# Netlify Deployment Architecture & Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     END USERS / BROWSER                          │
└────────────────────────┬──────────────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────┐
        │   Netlify CDN (Global Edge)    │
        │  - Static Files Cached         │
        │  - Fast Delivery               │
        └────────────┬───────────────────┘
                     │
        ┌────────────┴───────────────────┐
        ▼                                ▼
   ┌─────────┐                    ┌─────────────────────┐
   │  React  │                    │  API Requests       │
   │   App   │                    │  /.netlify/...      │
   │(index   │                    │                     │
   │.html)   │                    └──────────┬──────────┘
   └─────────┘                               │
                                    ┌────────▼──────────┐
                                    │ Netlify Functions │
                                    │  (Serverless API) │
                                    │   api.js          │
                                    └────────┬──────────┘
                                             │
                        ┌────────────────────┼────────────────────┐
                        ▼                    ▼                    ▼
                  ┌──────────┐         ┌──────────┐         ┌───────────┐
                  │  MongoDB │         │ Other    │         │ External  │
                  │  Atlas   │         │Services  │         │  APIs     │
                  └──────────┘         └──────────┘         └───────────┘
```

---

## Deployment Flow

```
Developer           GitHub              Netlify             Production
   │                  │                   │                    │
   ├─ git push ──────→│                   │                    │
   │                  │                   │                    │
   │                  ├─ webhook ────────→│                    │
   │                  │                   │                    │
   │                  │              ┌────▼─────┐              │
   │                  │              │ 1. Build  │              │
   │                  │              │   npm run │              │
   │                  │              │   build   │              │
   │                  │              └────┬─────┘              │
   │                  │                   │                    │
   │                  │              ┌────▼──────────┐         │
   │                  │              │ 2. Functions  │         │
   │                  │              │    netlify/   │         │
   │                  │              │    functions  │         │
   │                  │              └────┬──────────┘         │
   │                  │                   │                    │
   │                  │              ┌────▼──────────┐         │
   │                  │              │ 3. Deploy     │         │
   │                  │              │    CDN        │         │
   │                  │              └────┬──────────┘         │
   │                  │                   │                    │
   │                  │                   ├─ Deploy ──────────→│
   │                  │                   │                    │
   │                  │                   │                    │ ✓ Live
```

---

## File Serving Flow

```
REQUEST: GET https://your-site.netlify.app/games

         │
         ▼
   ┌─────────────────┐
   │  Netlify Router │
   └────────┬────────┘
            │
      Does it match /api/*?
            │
        ┌───┴───┐
        │       │
       NO      YES
        │       │
        ▼       ▼
   ┌─────┐  ┌──────────────────────┐
   │ CDN │  │ Netlify Function     │
   │     │  │ /.netlify/functions/ │
   │ 200 │  │ api.js               │
   │     │  │                      │
   └─────┘  └─────────┬────────────┘
                      │
                 ┌────▼─────┐
                 │ Routing   │
                 │ /games    │
                 │ /reviews  │
                 │ /auth     │
                 └────┬──────┘
                      │
                      ▼
                 ┌──────────┐
                 │ Database │
                 │ MongoDB  │
                 └──────────┘
```

---

## Development vs Production

### Local Development (netlify dev)

```
Browser (localhost:8888)
         │
         ├─ GET / ─────→ vite dev server ─→ React App
         │
         ├─ GET /api/games ─→ /.netlify/functions/api ─→ api.js
         │                                                 │
         │                                                 ▼
         │                                            MongoDB
         │
         └─ HMR (Hot Module Reload) ←─ vite
```

### Production (Netlify)

```
Browser (your-site.netlify.app)
         │
         ├─ GET / ─────→ Netlify CDN ─→ Cached React App
         │              (Edge Location)
         │
         ├─ GET /api/games ─→ Netlify Functions ─→ api.js
         │                                          │
         │                                          ▼
         └─────────────────────────────────── MongoDB Atlas
```

---

## Request/Response Cycle

### API Request Example

```
1. Browser sends request:
   GET /.netlify/functions/api/games

2. Netlify routes to function handler:
   netlify/functions/api.js

3. Express app processes:
   app.get('/api/games', ...)

4. Backend logic:
   ├─ Authenticate user
   ├─ Query MongoDB
   ├─ Process results
   └─ Return JSON

5. Response sent back:
   { games: [...], status: 200 }

6. Browser receives & React updates UI
```

---

## Environment Variables Flow

```
┌─────────────────────────────────────────────────┐
│          Netlify Dashboard                      │
│     Environment Variables Settings              │
│  ┌──────────────────────────────────────────┐  │
│  │ MONGODB_URI=mongodb+srv://...            │  │
│  │ JWT_SECRET=your_secret                   │  │
│  │ FRONTEND_URL=https://your-site...        │  │
│  └──────────────────────────────────────────┘  │
└──────────────────┬──────────────────────────────┘
                   │
                   │ At Build Time
                   ▼
         ┌─────────────────────┐
         │ Build Environment   │
         │ process.env.* vars  │
         └─────────────────────┘
                   │
        ┌──────────┴───────────┐
        │                      │
     Backend              Frontend
        │                      │
        ▼                      ▼
   server.js          .env.local vars
   (Node.js)          (Vite env)
        │                      │
        ▼                      ▼
   process.env.*         import.meta.env.*
   (Private)             (Client-side)
```

---

## Directory Structure Diagram

```
h:\My Website\GameHUB\
│
├── 📄 netlify.toml                 ← Main Config
├── 📁 netlify/
│   └── 📁 functions/
│       └── 🔵 api.js              ← Entry Point (Functions)
│
├── 📁 gameverse/
│   ├── 📁 backend/
│   │   ├── 🔵 server.js            ← Express Server
│   │   ├── 📁 routes/              ← API Routes
│   │   ├── 📁 controllers/          ← Business Logic
│   │   ├── 📁 models/              ← MongoDB Models
│   │   └── 📄 package.json
│   │
│   └── 📁 frontend/
│       ├── 🔵 vite.config.ts       ← Build Config
│       ├── 📁 dist/                ← Build Output
│       ├── 📁 src/
│       │   ├── 📁 components/      ← React Components
│       │   └── 📁 services/
│       │       └── apiClient.ts    ← API Client
│       └── 📄 package.json
│
├── 📄 package.json                 ← Root Package
├── 📄 .env.local                   ← (CREATE THIS)
└── 📚 Documentation/
    ├── START_HERE_NETLIFY.md
    ├── NETLIFY_QUICKSTART.md
    ├── NETLIFY_MIGRATION_GUIDE.md
    ├── NETLIFY_COMMANDS_REFERENCE.md
    └── VERCEL_VS_NETLIFY_GUIDE.md
```

---

## Build Process Timeline

```
Time  Event                          Details
────  ──────────────────────────────  ─────────────────────────────
0s    Build Started                  Netlify receives code push
│
├─ 5s  Dependencies Install          npm install in gameverse/frontend
│
├─ 15s Frontend Build                vite build creates dist/
│
├─ 20s Backend Prepare               Copy backend files to functions
│
├─ 25s Functions Bundling            Prepare netlify/functions/api.js
│
├─ 30s Deploy to CDN                 Upload dist/ to edge locations
│
├─ 35s Deploy Functions              Make serverless API available
│
└─ 40s Success ✓                     Site goes live!
```

---

## CORS & Headers Flow

```
Browser Request                    Netlify Response
     │                                  │
     ├─ Origin: http://localhost     ┌──▼─────────────────┐
     │                               │ Check CORS Headers │
     │                               │ in netlify.toml    │
     │                               └──────┬─────────────┘
     │                                      │
     │                               ┌──────▼──────────────┐
     │                               │ Add Headers:        │
     │                               │ Allow-Origin: *     │
     │◄──────────────────────────────│ Allow-Methods: ...  │
     │     (Response with headers)   │ Allow-Headers: ...  │
     │                               └─────────────────────┘
     │
     ▼
  Browser allows response ✓
```

---

## Error Handling & Logging

```
Request to API
     │
     ▼
Function Handler (api.js)
     │
  ┌──┴──┐
  │     │
SUCCESS  ERROR
  │      │
  ▼      ▼
Response  Error Handler
│         │
└────┬────┘
     │
     ▼
Netlify Logs (netlify logs --tail)
     │
┌────┴─────────────┐
│                  │
▼                  ▼
Success Logs    Error Logs
- 200 OK        - 500 Error
- Request path  - Stack trace
- Response time - Error message
```

---

## Cold Start vs Warm Invocation

```
First Request (Cold Start)
┌─────────────────────────────────────┐
│ Netlify Function Initialization     │
│ - Allocate resources                │
│ - Load Node.js runtime              │
│ - Connect to MongoDB                │
│ - Load Express app                  │
│ - Route request                     │
│                           ~200-500ms │
└─────────────────────────────────────┘

Subsequent Requests (Warm Invocation)
┌──────────────────────────────────┐
│ Request routed to running instance│
│ - Express processes request       │
│ - Database already connected      │
│ - Return response                 │
│                          ~50-100ms │
└──────────────────────────────────┘
```

---

## Deployment Strategies

```
Strategy 1: Branch Deploys
├─ main branch → Production
├─ develop branch → Preview
└─ feature/* → Deploy preview

Strategy 2: Manual Deploys
├─ netlify deploy → Preview
└─ netlify deploy --prod → Production

Strategy 3: Scheduled Deploys
└─ Automatically redeploy periodically

Strategy 4: Monorepo Deploys
├─ Frontend build → one site
└─ Backend functions → same site
```

---

## Monitoring & Observability

```
┌─────────────────────────────────────┐
│  Netlify Dashboard                  │
├─────────────────────────────────────┤
│ Deployments                         │
│ ├─ Status (Success/Failed)          │
│ ├─ Duration                         │
│ └─ Deploy logs                      │
│                                     │
│ Functions                           │
│ ├─ Invocation count                 │
│ ├─ Error rate                       │
│ └─ Duration                         │
│                                     │
│ Analytics                           │
│ ├─ Requests                         │
│ ├─ Bandwidth                        │
│ └─ Geographic distribution          │
└─────────────────────────────────────┘

CLI Monitoring
├─ netlify logs --tail               (Live logs)
├─ netlify logs --function=api       (Function specific)
└─ netlify status                    (Current status)
```

---

## Scaling & Performance

```
User Traffic                    Netlify Response
    │                                │
    └─ 1-10 req/s ────────────────→ CDN + 1 Function Instance
       └─ 10-100 req/s ─────────────→ CDN + Multiple Instances
          └─ 100+ req/s ────────────→ CDN + Auto-scaling
             └─ 1000+ req/s ───────→ Enterprise Plan
```

---

## Success Indicators ✓

```
After Deployment:

✓ Site loads: https://your-site.netlify.app
✓ API works: https://your-site.netlify.app/.netlify/functions/api/games
✓ Database connected: Can fetch data
✓ Auth working: Can login
✓ No errors in logs: netlify logs is clean
✓ Performance: Load time < 3s
✓ Mobile responsive: Works on all devices
✓ Production ready: All features tested
```

---

## Quick Reference Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                  YOUR DEPLOYMENT                            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Frontend (React)          Backend (Node.js API)            │
│  gameverse/frontend    →   netlify/functions/api.js         │
│  dist folder deployed  →   Serverless functions            │
│  CDN cached           →   Auto-scaling                      │
│                                                              │
│         Data Layer (Shared)                                 │
│         ├─ MongoDB Atlas                                    │
│         ├─ Environment Variables                            │
│         └─ External Services                                │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

**Remember:**
- Frontend: Static files → CDN
- Backend: Serverless functions → Auto-scaling
- Data: MongoDB Atlas → Persistent storage
- All connected via Netlify infrastructure

For more details, see the comprehensive guides in the root directory.
