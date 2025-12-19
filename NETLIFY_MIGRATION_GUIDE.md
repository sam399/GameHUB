# Netlify Migration Guide - From Vercel to Netlify

## Overview
This guide will help you migrate your GameVerse project from Vercel to Netlify. Your project consists of a React TypeScript frontend (Vite) and an Express.js backend.

---

## Step 1: Prerequisites

1. **Create Netlify Account**: Go to [netlify.com](https://netlify.com) and sign up
2. **Install Netlify CLI**: 
   ```bash
   npm install -g netlify-cli
   ```
3. **GitHub Connection**: Connect your GitHub repository to Netlify for auto-deployment

---

## Step 2: Project Structure Changes

Your current Vercel setup uses:
- Frontend: `gameverse/frontend` (Vite build → dist folder)
- Backend: `gameverse/backend/serverless.js` (Vercel Functions)

Netlify approach:
- Frontend: Deployed as static site
- Backend: Deployed as Netlify Functions (replaces Vercel Functions)

---

## Step 3: Configuration Files Created

### New Files:
1. **`netlify.toml`** - Main Netlify configuration
2. **Update `package.json`** scripts for Netlify builds
3. **Netlify Functions** - Replace serverless.js with function handlers

---

## Step 4: Local Setup

### 4.1 Update Environment Variables

Create a `.env.local` file in the root:
```
VITE_API_URL=http://localhost:8888/.netlify/functions
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
NODE_ENV=development
```

For frontend (`gameverse/frontend/.env.local`):
```
VITE_API_URL=http://localhost:8888/.netlify/functions
```

### 4.2 Install Netlify Dev Tools
```bash
npm install -g netlify-cli
```

### 4.3 Test Locally
```bash
# Run with Netlify dev server (simulates Netlify environment)
netlify dev
```

This will run on `http://localhost:8888` with functions on `http://localhost:8888/.netlify/functions`

---

## Step 5: Deployment Steps

### 5.1 Via Netlify UI (Recommended)
1. Go to [netlify.com](https://netlify.com)
2. Click "New site from Git"
3. Select your GitHub repository
4. Set build settings:
   - **Build command**: `npm run build:netlify`
   - **Publish directory**: `gameverse/frontend/dist`
5. Add environment variables in Netlify Dashboard (Site Settings → Build & Deploy → Environment)
6. Deploy!

### 5.2 Via Netlify CLI
```bash
# Login to Netlify
netlify login

# Initialize site
netlify init

# Deploy
netlify deploy --prod
```

---

## Step 6: API Endpoints Update

### Before (Vercel):
```javascript
fetch('/api/games')
```

### After (Netlify):
```javascript
// Frontend should use:
fetch(`${process.env.VITE_API_URL}/games`)
```

The API functions will be available at:
```
/.netlify/functions/api
```

---

## Step 7: Environment Variables on Netlify

Set these in **Netlify Dashboard → Site Settings → Build & Deploy → Environment**:

```
MONGODB_URI = your_database_url
JWT_SECRET = your_secret_key
JWT_EXPIRE = 30d
NODE_ENV = production
FRONTEND_URL = your_netlify_domain.netlify.app
```

---

## Step 8: Database Connection

Update `gameverse/backend/server.js`:

```javascript
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gameverse';
```

Ensure MongoDB Atlas connection string is set in environment variables.

---

## Step 9: Socket.io (Real-time Features)

Socket.io requires special handling on serverless:

1. **Frontend** (`gameverse/frontend/src/services/*.ts`):
```javascript
const SOCKET_URL = process.env.VITE_API_URL?.includes('localhost') 
  ? 'http://localhost:5000' 
  : 'wss://your-backend-url';
```

2. **Deploy Backend Separately** (NOT as Netlify Functions):
   - Keep `gameverse/backend/server.js` running on a VPS or Heroku
   - Update Socket.io connection URL in frontend accordingly
   - OR use a managed WebSocket service like Socket.io Cloud

---

## Step 10: Common Issues & Solutions

### Issue: CORS Errors
**Solution**: Update backend `server.js`:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

### Issue: 404 on SPA Routes
**Solution**: Netlify automatically handles this with `netlify.toml` redirects

### Issue: Functions Timeout
**Solution**: Increase timeout in `netlify.toml`:
```toml
[functions]
  timeout = 30
```

### Issue: Large Uploads
**Solution**: Increase function memory:
```toml
[[functions]]
  name = "api"
  memory = 1024
```

---

## Step 11: Monitoring & Debugging

### View Logs:
```bash
netlify logs
```

### Monitor Deployments:
```bash
netlify status
```

### Test Functions Locally:
```bash
netlify dev
# Visit http://localhost:8888/.netlify/functions/api
```

---

## Step 12: Rollback to Vercel (if needed)

1. Keep your Vercel settings intact
2. Update DNS to point back to Vercel
3. Deploy using: `vercel deploy --prod`

---

## Comparison: Vercel vs Netlify

| Feature | Vercel | Netlify |
|---------|--------|---------|
| Static Hosting | ✅ | ✅ |
| Serverless Functions | ✅ | ✅ |
| Edge Functions | ✅ (Premium) | ✅ (Premium) |
| Free Tier | Generous | Generous |
| Cold Start | ~100ms | ~200ms |
| CMS Integration | Limited | Excellent |
| Build Optimization | Very Fast | Fast |

---

## Next Steps

1. ✅ Review this guide
2. ✅ Create `.env` files
3. ✅ Update API URLs in frontend code
4. ✅ Deploy backend separately (or use Netlify Functions)
5. ✅ Test locally with `netlify dev`
6. ✅ Push to GitHub
7. ✅ Connect to Netlify
8. ✅ Set environment variables
9. ✅ Deploy!

---

## Support

- [Netlify Docs](https://docs.netlify.com)
- [Netlify Functions Guide](https://docs.netlify.com/functions/overview)
- [React Deployment on Netlify](https://docs.netlify.com/frameworks/react)

