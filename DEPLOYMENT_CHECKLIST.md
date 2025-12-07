# GameVerse Vercel Deployment Checklist

## Pre-Deployment ✓

### 1. Code Preparation
- [ ] All code committed to GitHub
- [ ] No console errors in local development
- [ ] No hardcoded API URLs (using environment variables)
- [ ] .env files are NOT committed to git (check .gitignore)
- [ ] Backend exports app module correctly
- [ ] Frontend has build output (dist folder)

### 2. Database Setup
- [ ] MongoDB Atlas cluster created
- [ ] Database user created with strong password
- [ ] IP whitelist configured (allow 0.0.0.0/0 or Vercel IPs)
- [ ] Connection string copied: `mongodb+srv://user:pass@cluster.mongodb.net/gameverse`
- [ ] Database name set to `gameverse`

### 3. API Keys & Secrets
- [ ] JWT_SECRET generated (use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- [ ] RAWG_API_KEY obtained (optional but recommended)
- [ ] All values are strong and production-ready
- [ ] Secrets stored securely (never in code)

### 4. Environment Files
- [ ] `.env.example` created in backend with all required variables
- [ ] `.env.example` created in frontend with all required variables
- [ ] `.env` files added to `.gitignore`
- [ ] Local `.env` files match example format

### 5. Configuration Files
- [ ] `vercel.json` exists in root directory
- [ ] `package.json` has build scripts
- [ ] Backend `server.js` exports app for serverless
- [ ] Frontend `vite.config.ts` is configured

## Backend Deployment

### Step 1: Create Vercel Project (Backend)
1. [ ] Go to https://vercel.com/dashboard
2. [ ] Click "Add New..." → "Project"
3. [ ] Connect GitHub account
4. [ ] Select GameHUB repository
5. [ ] Select "Next.js" or "Node.js" framework
6. [ ] Set root directory to `gameverse/backend`

### Step 2: Configure Environment Variables
In Vercel project settings, add:
- [ ] `MONGODB_URI` = `mongodb+srv://...`
- [ ] `JWT_SECRET` = Your generated secret
- [ ] `JWT_EXPIRE` = `30d`
- [ ] `RAWG_API_KEY` = Your API key (or skip if not needed)
- [ ] `NODE_ENV` = `production`
- [ ] `FRONTEND_URL` = (you'll fill this after frontend deployment)

### Step 3: Deploy
- [ ] Click "Deploy"
- [ ] Wait for deployment to complete
- [ ] Check deployment logs for errors
- [ ] Note the backend URL: `https://gameverse-api-xxxxx.vercel.app`

### Step 4: Test Backend
- [ ] Visit `https://gameverse-api-xxxxx.vercel.app/api`
- [ ] Should see: `{"message": "GameVerse API is running!", ...}`
- [ ] Test with Postman: `GET https://gameverse-api-xxxxx.vercel.app/api/games`
- [ ] Should receive 401 (needs auth) or 200 with games data

### Step 5: Fix Errors (if any)
- [ ] Check deployment logs: `vercel logs [project]`
- [ ] Check MongoDB connection
- [ ] Verify environment variables are set
- [ ] Check CORS configuration

## Frontend Deployment

### Step 1: Update Frontend Environment
1. [ ] Create `gameverse/frontend/.env.production`
2. [ ] Add: `VITE_API_URL=https://gameverse-api-xxxxx.vercel.app/api`
3. [ ] Replace with your actual backend URL from Step 3

### Step 2: Create Vercel Project (Frontend)
1. [ ] Go to https://vercel.com/dashboard
2. [ ] Click "Add New..." → "Project"
3. [ ] Select same GitHub repository
4. [ ] Set root directory to `gameverse/frontend`
5. [ ] Framework: Select "Vite"

### Step 3: Configure Environment Variables
In Vercel project settings:
- [ ] `VITE_API_URL` = Your backend URL with `/api` suffix

### Step 4: Deploy
- [ ] Click "Deploy"
- [ ] Wait for deployment to complete
- [ ] Note the frontend URL: `https://gameverse-xxxxx.vercel.app`

### Step 5: Test Frontend
- [ ] Visit `https://gameverse-xxxxx.vercel.app`
- [ ] Login page should load
- [ ] Check browser console for errors
- [ ] Test login functionality
- [ ] Navigate through pages

## Post-Deployment Configuration

### Step 1: Update Backend CORS
1. [ ] Go to backend Vercel project settings
2. [ ] Add environment variable `FRONTEND_URL` = Your frontend URL
3. [ ] Redeploy backend: Click "Deployments" → Latest → Click menu → "Redeploy"

### Step 2: Test Complete Flow
- [ ] Register new account
- [ ] Login
- [ ] Browse games
- [ ] View feed
- [ ] Send friend request
- [ ] Check notifications
- [ ] Create review

### Step 3: Monitor Deployment
- [ ] Enable Vercel analytics
- [ ] Set up error tracking
- [ ] Monitor database usage
- [ ] Check API rate limits

## Common Issues & Solutions

### Issue: 502 Bad Gateway
**Solution:**
- [ ] Check backend deployment logs
- [ ] Verify MongoDB connection string
- [ ] Check for unhandled promise rejections
- [ ] Ensure server exports app

### Issue: CORS Errors
**Solution:**
- [ ] Update CORS origin in backend to match frontend URL
- [ ] Set `FRONTEND_URL` environment variable
- [ ] Redeploy backend

### Issue: 404 API Not Found
**Solution:**
- [ ] Verify `VITE_API_URL` matches backend URL
- [ ] Check backend is deployed successfully
- [ ] Test direct API call: `curl https://backend-url/api`

### Issue: MongoDB Connection Failed
**Solution:**
- [ ] Verify MONGODB_URI in environment variables
- [ ] Check MongoDB Atlas whitelist includes all IPs
- [ ] Test connection string locally
- [ ] Ensure database user has correct permissions

### Issue: Socket.IO Not Connecting
**Solution:**
- [ ] Socket.IO limited on Vercel (serverless)
- [ ] Consider using HTTP polling instead
- [ ] For now, non-real-time features will work

## Deployment URLs

After successful deployment, update these:

**Backend (API):** `https://your-backend-url.vercel.app`
- Example: `https://gameverse-api-abc123.vercel.app`
- Test endpoint: `https://gameverse-api-abc123.vercel.app/api`

**Frontend:** `https://your-frontend-url.vercel.app`
- Example: `https://gameverse-abc123.vercel.app`
- Test page: `https://gameverse-abc123.vercel.app/login`

## GitHub Actions (Optional CI/CD)

For automatic deployments on push:

1. [ ] Vercel automatically deploys on GitHub push
2. [ ] Check "Settings" → "Git" in each Vercel project
3. [ ] Production deployments on main branch
4. [ ] Preview deployments on pull requests

## Security Checklist

- [ ] All secrets in Vercel environment variables (not in code)
- [ ] `.env` files in `.gitignore`
- [ ] JWT_SECRET is strong (32+ characters)
- [ ] MongoDB password is strong
- [ ] CORS properly configured
- [ ] Rate limiting enabled (recommended)
- [ ] HTTPS enforced (Vercel default)
- [ ] API keys rotated periodically

## Maintenance

### Regular Tasks
- [ ] Monitor Vercel analytics weekly
- [ ] Check error logs daily
- [ ] Update dependencies monthly
- [ ] Backup MongoDB monthly
- [ ] Review CORS whitelist quarterly
- [ ] Rotate secrets every 90 days

### Performance Optimization
- [ ] Enable Vercel caching
- [ ] Optimize images
- [ ] Compress responses
- [ ] Implement database indexes
- [ ] Cache API responses

## Rollback Plan

If deployment fails:

1. [ ] Check recent deployments
2. [ ] Click "Redeploy" on previous working version
3. [ ] Review error logs for issues
4. [ ] Fix issues locally and push to GitHub
5. [ ] Vercel will automatically deploy

## Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **MongoDB Atlas:** https://www.mongodb.com/cloud/atlas
- **Socket.IO Deployment:** https://socket.io/docs/v4/deployment/
- **Express on Vercel:** https://vercel.com/docs/concepts/functions/serverless-functions

## Final Verification

- [ ] Frontend loads without errors
- [ ] Backend API responds correctly
- [ ] Database queries work
- [ ] Authentication works
- [ ] WebSockets/real-time features (if applicable)
- [ ] All environment variables set
- [ ] No console errors in browser
- [ ] No errors in Vercel logs
- [ ] Performance acceptable (< 2s page load)
- [ ] Mobile responsive works

---

**Status:** Ready for Deployment ✓
**Last Updated:** December 7, 2025
**Version:** 1.0.0
