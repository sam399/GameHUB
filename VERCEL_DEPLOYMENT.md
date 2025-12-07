# GameVerse Vercel Deployment Guide

This guide will help you deploy GameVerse (frontend + backend) on Vercel.

## Project Structure for Vercel

Vercel works best with the following structure:
```
GameHUB/
├── gameverse/
│   ├── frontend/          # React + Vite (deployed as frontend)
│   └── backend/           # Express API (deployed as serverless functions)
├── vercel.json            # Vercel configuration
├── package.json           # Root package.json (optional)
└── README.md
```

## Prerequisites

1. **GitHub Account** - Push your code to GitHub
2. **Vercel Account** - Sign up at https://vercel.com
3. **MongoDB Atlas Account** - For cloud database (https://www.mongodb.com/cloud/atlas)
4. **Environment Variables** - Prepare your .env values

## Step 1: Prepare Your Project

### 1.1 Create MongoDB Atlas Database (if not already done)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account and cluster
3. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/gameverse`
4. Keep this for later - you'll need it for environment variables

### 1.2 Update Environment Files

**Backend (.env)**
```
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gameverse
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRE=30d
RAWG_API_KEY=your_rawg_api_key_here
```

**Frontend (.env.production)**
```
VITE_API_URL=https://your-backend-url.vercel.app/api
```

### 1.3 Push to GitHub

```powershell
cd "h:\My Website\GameHUB"
git init
git add .
git commit -m "Initial commit for Vercel deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/GameHUB.git
git push -u origin main
```

## Step 2: Deploy Backend (Express API)

### 2.1 Configure Backend for Vercel

The backend needs a `vercel.json` configuration:

```json
{
  "version": 2,
  "buildCommand": "cd gameverse/backend && npm install",
  "outputDirectory": "gameverse/backend",
  "devCommand": "cd gameverse/backend && npm run dev",
  "cleanUrls": true,
  "functions": {
    "gameverse/backend/server.js": {
      "maxDuration": 60
    }
  },
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "/gameverse/backend/server.js"
    }
  ]
}
```

### 2.2 Deploy Backend

**Option 1: Using Vercel CLI**

```powershell
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
cd "h:\My Website\GameHUB"
vercel

# During deployment:
# - Select "Existing project" or "Create new project"
# - Choose your project settings
# - Accept suggested environment variables
# - Add environment variables when prompted
```

**Option 2: Using GitHub (Recommended)**

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Select "Next.js" or "Node.js" for framework
5. Add Environment Variables:
   - `MONGODB_URI` - Your MongoDB Atlas connection string
   - `JWT_SECRET` - Your JWT secret
   - `RAWG_API_KEY` - RAWG API key (optional)
   - `NODE_ENV` - Set to `production`
   - `JWT_EXPIRE` - Set to `30d`
6. Click "Deploy"

**After Backend Deployment:**
- Note your backend URL (e.g., `https://gameverse-api.vercel.app`)
- You'll need this for the frontend deployment

## Step 3: Deploy Frontend (React + Vite)

### 3.1 Configure Frontend for Vercel

Create `gameverse/frontend/vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

### 3.2 Update Frontend Environment

Create or update `gameverse/frontend/.env.production`:

```
VITE_API_URL=https://your-backend-url.vercel.app/api
```

### 3.3 Deploy Frontend

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import your GitHub repository (same one)
4. Select the `gameverse/frontend` directory as root
5. Set Environment Variables:
   - `VITE_API_URL` - Your backend URL from step 2
6. Click "Deploy"

**After Frontend Deployment:**
- Your app will be live at `https://your-project-name.vercel.app`

## Step 4: Configure CORS

Update your backend `server.js` to allow requests from your Vercel frontend:

```javascript
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://your-frontend-url.vercel.app'
    : 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
```

## Step 5: Test Your Deployment

### 5.1 Frontend Tests
- [ ] Navigate to your frontend URL
- [ ] Login/Register works
- [ ] Game library loads
- [ ] Feed shows activities and news
- [ ] Friend suggestions work

### 5.2 Backend Tests
- [ ] API endpoints respond correctly
- [ ] MongoDB connection works
- [ ] Socket.IO connections work (might need additional config)
- [ ] Authentication tokens validate

### 5.3 Common Issues

**Issue: CORS errors**
- Update CORS configuration in backend
- Ensure frontend URL matches in .env

**Issue: MongoDB connection fails**
- Check MONGODB_URI is correct
- Whitelist Vercel IPs in MongoDB Atlas:
  - Go to MongoDB Atlas → Network Access
  - Add IP 0.0.0.0/0 (allows all IPs) or specific Vercel IPs

**Issue: Socket.IO not working**
- Socket.IO requires special configuration on Vercel
- Consider using polling instead of WebSockets for initial deployment
- Update SocketContext to use polling transport

**Issue: API routes not found (404)**
- Verify backend deployment was successful
- Check VITE_API_URL matches your backend URL
- Test backend directly: `https://your-backend-url.vercel.app/api/games`

## Step 6: Production Optimizations

### 6.1 Backend Optimizations
- Add caching headers
- Implement rate limiting
- Add error monitoring (Sentry)
- Enable compression
- Use connection pooling for MongoDB

### 6.2 Frontend Optimizations
- Image optimization
- Code splitting
- Lazy loading
- CSS optimization
- Minification (Vite does this by default)

## Step 7: Domain Setup (Optional)

1. In Vercel dashboard, go to your project settings
2. Click "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## Troubleshooting

### Check Logs

**Backend Logs:**
```powershell
vercel logs [project-name] --env production
```

**Frontend Logs:**
- Check browser console for errors
- Check Network tab in DevTools
- Check Vercel deployment logs in dashboard

### Useful Commands

```powershell
# Check Vercel CLI version
vercel --version

# Remove project from local Vercel config
vercel remove [project-name]

# Re-deploy current project
vercel --prod

# View deployment URL
vercel ls
```

## Environment Variables Reference

### Backend (.env)
```
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/gameverse
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
RAWG_API_KEY=your_api_key_optional
FRONTEND_URL=https://your-frontend-url.vercel.app
```

### Frontend (.env.production)
```
VITE_API_URL=https://your-backend-url.vercel.app/api
```

## Next Steps

After successful deployment:

1. **Monitor Performance** - Use Vercel Analytics
2. **Set Up CI/CD** - Vercel auto-deploys on git push
3. **Error Tracking** - Add Sentry for error monitoring
4. **Database Backups** - Enable MongoDB Atlas backups
5. **Security** - Add rate limiting, input validation
6. **CDN** - Vercel includes global CDN by default

## Helpful Links

- Vercel Documentation: https://vercel.com/docs
- Express on Vercel: https://vercel.com/docs/concepts/functions/serverless-functions
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- Socket.IO on Vercel: https://socket.io/docs/v4/deployment/

## Support

For issues:
1. Check Vercel deployment logs
2. Review error messages in browser console
3. Test endpoints using Postman
4. Check GitHub Issues in repository

---

**Last Updated:** December 7, 2025
**Version:** 1.0.0
