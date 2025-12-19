# Quick Start: Deploying to Netlify

## 🚀 5-Minute Setup

### Step 1: Install Netlify CLI
```bash
npm install -g netlify-cli
```

### Step 2: Create `.env.local` Files

**Root directory** (`h:\My Website\GameHUB\.env.local`):
```env
VITE_API_URL=http://localhost:8888/.netlify/functions/api
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRE=30d
NODE_ENV=development
```

**Frontend** (`gameverse/frontend/.env.local`):
```env
VITE_API_URL=http://localhost:8888/.netlify/functions/api
```

### Step 3: Test Locally
```bash
# In project root
netlify dev

# Then visit: http://localhost:8888
```

### Step 4: Deploy to Netlify

**Option A: Web UI (Easiest)**
1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click "New site from Git"
4. Select your repository
5. Build command: `npm run build:netlify`
6. Publish directory: `gameverse/frontend/dist`
7. Add environment variables (see Step 5)
8. Deploy!

**Option B: CLI**
```bash
netlify login
netlify init
netlify deploy --prod
```

### Step 5: Set Environment Variables on Netlify

Go to: **Site Settings → Build & Deploy → Environment → Environment Variables**

Add these:
```
MONGODB_URI = your_connection_string
JWT_SECRET = your_secret_key
JWT_EXPIRE = 30d
NODE_ENV = production
FRONTEND_URL = https://your-site.netlify.app
```

---

## 📁 What Changed?

### New Files:
- ✅ `netlify.toml` - Netlify configuration
- ✅ `netlify/functions/api.js` - API handler
- ✅ `NETLIFY_MIGRATION_GUIDE.md` - Full guide
- ✅ `.env.example` - Example environment variables
- ✅ `gameverse/frontend/.env.example` - Frontend env example

### Updated Files:
- ✅ `package.json` - Added Netlify scripts
- ✅ `gameverse/frontend/package.json` - Fixed build script
- ✅ `gameverse/frontend/vite.config.ts` - Updated build config
- ✅ `gameverse/backend/server.js` - Enhanced Socket.io CORS

---

## 🔗 API Endpoints

### Local Development (with `netlify dev`)
```
Frontend: http://localhost:8888
API: http://localhost:8888/.netlify/functions/api
```

### Production (Netlify)
```
Frontend: https://your-site.netlify.app
API: https://your-site.netlify.app/.netlify/functions/api
```

---

## ⚠️ Important Notes

### 1. Socket.io / Real-time Features
- Netlify Functions are **serverless** (stateless)
- Socket.io requires a persistent connection
- **Solution**: Deploy backend separately to Heroku, Railway, or Render:

```bash
# Deploy backend server separately
# Use https://www.heroku.com, https://railway.app, or https://render.com

# Update frontend env:
VITE_SOCKET_URL=https://your-backend-server.com
```

### 2. API Usage in Frontend

Update all API calls to use environment variable:

```typescript
// Before (Vercel):
const response = await fetch('/api/games');

// After (Netlify):
const API_URL = import.meta.env.VITE_API_URL;
const response = await fetch(`${API_URL}/games`);
```

### 3. Environment Variables

**Frontend** (accessible in browser):
```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

**Backend** (Node.js only):
```javascript
const mongoUri = process.env.MONGODB_URI;
```

---

## 🛠️ Troubleshooting

### Issue: "Function not found"
```bash
# Solution: Ensure functions directory structure is correct
# netlify/functions/api.js should exist
netlify functions:create
```

### Issue: "CORS errors"
```
Solution: Environment variable not set. Add to Netlify dashboard:
FRONTEND_URL=https://your-site.netlify.app
```

### Issue: "Database connection timeout"
```
Solution: Whitelist Netlify IP ranges in MongoDB Atlas
- Go to MongoDB Atlas
- Network Access → Add IP Address
- Add 0.0.0.0/0 (allow all) OR
- Add Netlify's IP ranges: Check Netlify docs
```

### Issue: "Module not found"
```bash
# Solution: Ensure all dependencies are in package.json
npm install package-name --save
```

---

## 📊 Build Logs

### View deployment logs:
```bash
netlify logs --function=api
```

### Local test with more verbose output:
```bash
netlify dev --verbose
```

---

## 🔄 Rollback to Vercel

If you need to go back:
1. Ensure `vercel.json` is still in repo
2. Run: `vercel deploy --prod`
3. Update DNS/domain settings

---

## 📚 Useful Commands

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Initialize site
netlify init

# Local dev
netlify dev

# Deploy preview
netlify deploy

# Deploy to production
netlify deploy --prod

# View logs
netlify logs

# Status
netlify status

# List sites
netlify sites:list

# Open site
netlify open
```

---

## ✅ Deployment Checklist

- [ ] Install Netlify CLI
- [ ] Create `.env.local` files
- [ ] Test locally with `netlify dev`
- [ ] Push to GitHub
- [ ] Connect repository to Netlify
- [ ] Set environment variables in dashboard
- [ ] Verify build settings
- [ ] Check database connectivity
- [ ] Test API endpoints
- [ ] Verify Socket.io connections (if applicable)
- [ ] Monitor deployment logs
- [ ] Test all features on live site

---

## 🎯 Next Steps

1. **Test Locally**: `netlify dev`
2. **Fix Any Issues**: Check logs with `netlify logs`
3. **Push to GitHub**: Your changes are ready
4. **Connect to Netlify**: Link GitHub repo
5. **Deploy**: Click "Deploy Site"
6. **Monitor**: Check performance and errors

For questions, refer to:
- [Netlify Docs](https://docs.netlify.com)
- [Full Migration Guide](./NETLIFY_MIGRATION_GUIDE.md)

---

**Happy Deploying! 🎉**
