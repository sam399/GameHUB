# Render Backend Deployment Guide

## Prerequisites

1. GitHub account (for Render to pull code)
2. Render account (free tier available at render.com)
3. MongoDB Atlas connection string

## Step 1: Push Code to GitHub

Ensure your repo is on GitHub with all the latest changes:

```bash
cd h:\My Website\GameHUB
git add .
git commit -m "Set up Render deployment for backend"
git push origin main
```

## Step 2: Create Render Service

1. Go to https://render.com
2. Sign up / Log in with GitHub
3. Click "New +" → "Web Service"
4. Select your GameHUB repository
5. Configure the service:
   - **Name**: `gameverse-backend`
   - **Environment**: `Node`
   - **Region**: `Oregon` (or closest to you)
   - **Branch**: `main`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free` (or Starter for production)

## Step 3: Add Environment Variables

In Render dashboard → Services → gameverse-backend → Environment:

```
NODE_ENV = production
MONGODB_URI = your_mongodb_atlas_connection_string
JWT_SECRET = your_secret_key_here
JWT_EXPIRE = 30d
FRONTEND_URL = https://your-netlify-site.netlify.app
PORT = 10000
```

⚠️ **Important**: 
- `MONGODB_URI`: Get from MongoDB Atlas → Connect → Connection String
- `JWT_SECRET`: Use a strong, random string (same as your local .env)
- `FRONTEND_URL`: Replace with your actual Netlify site URL

## Step 4: Configure CORS in Backend

Update `gameverse/backend/server.js` to use environment variables:

```javascript
// Line 12 in server.js
const io = socketio(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
    transports: ['websocket', 'polling']
  }
});

// Line 27 in server.js
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## Step 5: Deploy Backend

1. Render will automatically deploy when you push to GitHub
2. Monitor the deployment in Render dashboard
3. Once live, you'll get a URL like: `https://gameverse-backend.onrender.com`

## Step 6: Test Backend API

After deployment completes:

```bash
# Test health endpoint
curl https://gameverse-backend.onrender.com/api/health

# Expected response:
# {
#   "status": "ok",
#   "message": "API is running",
#   "timestamp": "2025-12-19T..."
# }
```

## Step 7: Update Frontend to Point to Render Backend

Set environment variable in Netlify dashboard:

- **Netlify → Site Settings → Build & Deploy → Environment**:
  - `VITE_API_URL=https://gameverse-backend.onrender.com/api`
  - `VITE_SOCKET_URL=https://gameverse-backend.onrender.com`

Then redeploy frontend:

```bash
# Or manually via Netlify dashboard
netlify deploy --prod
```

## Step 8: Verify Connection

1. Visit your Netlify site: `https://your-site.netlify.app`
2. Open browser console (F12)
3. Try logging in or fetching data
4. Check Network tab to confirm API calls go to Render

---

## Troubleshooting

### Backend won't start
- Check Render logs: Dashboard → gameverse-backend → Logs
- Verify `MONGODB_URI` is correct and MongoDB Atlas accepts connections

### CORS errors
- Ensure `FRONTEND_URL` matches your Netlify site exactly
- Include the full URL: `https://your-site.netlify.app` (no trailing slash)

### MongoDB connection timeout
- Go to MongoDB Atlas → Network Access
- Add Render's IP ranges or use `0.0.0.0/0` (allow all) for testing
- Verify Atlas user has correct password

### 404 on API endpoints
- Check that backend deployed successfully (green status in Render)
- Verify `VITE_API_URL` in frontend is set to your Render URL
- Clear browser cache and redeploy frontend

---

## Free Tier Limitations (Render)

- Free tier services spin down after 15 minutes of inactivity (cold start ~30 sec)
- For production, consider upgrading to Starter ($7/month)
- No outbound egress charges for MongoDB Atlas connections

## Production Checklist

- [ ] MONGODB_URI set in Render environment
- [ ] JWT_SECRET is strong and secure
- [ ] FRONTEND_URL is set to Netlify site
- [ ] Backend health endpoint responds
- [ ] Frontend API calls reach backend
- [ ] Login/authentication works
- [ ] Test file uploads and real-time features (if applicable)
- [ ] Monitor Render logs for errors

---

## Next Steps

1. Push code to GitHub
2. Connect Render to your repo
3. Set environment variables
4. Update frontend API URL
5. Test end-to-end integration

**Need help?** Check [Render Docs](https://render.com/docs) or [MongoDB Atlas Guide](https://www.mongodb.com/docs/atlas/)
