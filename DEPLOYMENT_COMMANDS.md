# Vercel Deployment: Step-by-Step Commands

## Prerequisites
- GitHub account with code pushed
- Vercel account (free): https://vercel.com
- MongoDB Atlas account (free): https://www.mongodb.com/cloud/atlas

## Step 1: Set Up MongoDB Atlas

### 1.1 Create Cluster
```
1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Create a New Cluster"
3. Choose M0 (Free tier)
4. Select region closest to you
5. Click "Create Cluster"
```

### 1.2 Create Database User
```
1. Go to "Database Access"
2. Click "Add New Database User"
3. Username: gameverse_user
4. Password: Generate strong password (copy it!)
5. Click "Add User"
```

### 1.3 Configure Network Access
```
1. Go to "Network Access"
2. Click "Add IP Address"
3. Select "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"
```

### 1.4 Get Connection String
```
1. Go to "Clusters"
2. Click "Connect"
3. Choose "Connect your application"
4. Copy connection string:
   mongodb+srv://gameverse_user:<password>@cluster0.xxxxx.mongodb.net/gameverse
5. Replace <password> with your user password
6. SAVE THIS! You'll need it for Vercel
```

## Step 2: Generate Secrets

### 2.1 JWT Secret
```powershell
# Run this command in PowerShell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Output will be: abc123def456... (copy this!)
```

## Step 3: Prepare GitHub

### 3.1 Ensure Git is Initialized
```powershell
cd "h:\My Website\GameHUB"
git status
# If error, initialize:
git init
git remote add origin https://github.com/YOUR_USERNAME/GameHUB.git
```

### 3.2 Commit All Changes
```powershell
cd "h:\My Website\GameHUB"
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

## Step 4: Deploy Backend to Vercel

### 4.1 Go to Vercel Dashboard
```
Visit: https://vercel.com/dashboard
```

### 4.2 Create New Project
```
1. Click "Add New..." button
2. Select "Project"
3. Click "Continue with GitHub"
4. Authorize Vercel
5. Search for "GameHUB" repository
6. Click "Import"
```

### 4.3 Configure Backend
```
1. Project Name: gameverse-api (or your preferred name)
2. Root Directory: Select "gameverse/backend"
3. Framework: Node.js
4. Build Command: "npm install"
5. Output Directory: Leave empty
6. Environment Variables: Add these:
```

### 4.4 Add Environment Variables
```
In the Environment Variables section, add:

Name: MONGODB_URI
Value: mongodb+srv://gameverse_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/gameverse

Name: JWT_SECRET
Value: YOUR_GENERATED_JWT_SECRET

Name: JWT_EXPIRE
Value: 30d

Name: RAWG_API_KEY
Value: (leave empty or add if you have one)

Name: NODE_ENV
Value: production
```

### 4.5 Deploy
```
1. Click "Deploy" button
2. Wait 2-3 minutes for deployment
3. When done, you'll see "Congratulations!"
4. SAVE YOUR BACKEND URL: https://gameverse-api-xxxxx.vercel.app
```

### 4.6 Verify Backend
```
Open in browser: https://gameverse-api-xxxxx.vercel.app/api
Should see: {"message": "GameVerse API is running!", ...}
```

## Step 5: Deploy Frontend to Vercel

### 5.1 Update Frontend .env
```powershell
# Create or edit gameverse/frontend/.env.production
# Content:
VITE_API_URL=https://gameverse-api-xxxxx.vercel.app/api
# Replace xxxxx with your actual backend URL
```

### 5.2 Commit Changes
```powershell
cd "h:\My Website\GameHUB"
git add gameverse/frontend/.env.production
git commit -m "Add production API URL"
git push origin main
```

### 5.3 Create Frontend Project
```
1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Select "GameHUB" repository again
4. Click "Import"
```

### 5.4 Configure Frontend
```
1. Project Name: gameverse (or your preferred name)
2. Root Directory: Select "gameverse/frontend"
3. Framework: Vite
4. Build Command: "npm run build"
5. Output Directory: dist
```

### 5.5 Add Environment Variables (if needed)
```
If .env.production is not detected, add:

Name: VITE_API_URL
Value: https://gameverse-api-xxxxx.vercel.app/api
```

### 5.6 Deploy
```
1. Click "Deploy" button
2. Wait 1-2 minutes
3. When done, you'll see your frontend URL
4. SAVE YOUR FRONTEND URL: https://gameverse-xxxxx.vercel.app
```

### 5.7 Verify Frontend
```
Open in browser: https://gameverse-xxxxx.vercel.app
Should see: Login page
Check browser console for errors
```

## Step 6: Final Configuration

### 6.1 Update Backend Environment Variable
```
1. Go to your backend project in Vercel
2. Click "Settings" → "Environment Variables"
3. Add new variable:
   Name: FRONTEND_URL
   Value: https://gameverse-xxxxx.vercel.app
4. Click "Save"
```

### 6.2 Redeploy Backend
```
1. Click "Deployments" tab
2. Find the latest deployment
3. Click "..." menu
4. Select "Redeploy"
5. Wait for redeploy to complete
```

## Step 7: Test Everything

### 7.1 Test Frontend
```
1. Visit https://gameverse-xxxxx.vercel.app
2. Try to register new account
3. Try to login
4. Browse games
5. Check if API errors in console
```

### 7.2 Check Browser Console
```
1. Press F12 or Ctrl+Shift+I
2. Go to Console tab
3. Look for any red errors
4. If CORS error, make sure backend FRONTEND_URL is set
```

### 7.3 Test with Postman (Optional)
```
1. Download Postman: https://www.postman.com
2. Test endpoint:
   GET https://gameverse-api-xxxxx.vercel.app/api/games
3. Should return: {"success": true, "data": {...}}
```

## Troubleshooting

### Issue: "Cannot GET /"
**Solution:**
```
Frontend not deployed properly
1. Check Vercel deployment logs
2. Verify root directory is "gameverse/frontend"
3. Check build command is "npm run build"
4. Redeploy
```

### Issue: CORS Error in Console
**Solution:**
```
Backend not allowing frontend
1. Go to backend Vercel project
2. Add/update FRONTEND_URL env variable
3. Redeploy backend
4. Wait 5 minutes
5. Refresh frontend
```

### Issue: "Cannot connect to MongoDB"
**Solution:**
```
MongoDB connection issue
1. Verify MONGODB_URI is correct in backend env vars
2. Check MongoDB Atlas IP whitelist (should be 0.0.0.0/0)
3. Test connection string locally:
   mongosh "mongodb+srv://gameverse_user:password@cluster0.xxxxx.mongodb.net/gameverse"
4. If still failing, regenerate password in MongoDB Atlas
```

### Issue: "JWT_SECRET is not defined"
**Solution:**
```
Environment variable not set
1. Go to backend Vercel project settings
2. Check if JWT_SECRET is in Environment Variables
3. If not, add it
4. Redeploy
```

## What's Live Now?

After completing all steps:

✅ **Frontend:** https://gameverse-xxxxx.vercel.app
- Login/Register
- Browse games
- View feed
- Friend suggestions
- Notifications

✅ **Backend API:** https://gameverse-api-xxxxx.vercel.app/api
- All game endpoints
- Authentication
- User data
- Reviews and ratings

✅ **Database:** MongoDB Atlas (Cloud)
- Persistent data storage
- Auto-backups

## Next Steps

1. **Monitor:** Check Vercel analytics dashboard
2. **Custom Domain:** Add custom domain in Vercel settings
3. **SSL:** Already enabled by Vercel (HTTPS)
4. **Backups:** Enable MongoDB Atlas backups
5. **Scaling:** Upgrade plan if needed

## Helpful Links

- Vercel Dashboard: https://vercel.com/dashboard
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- Vercel Docs: https://vercel.com/docs
- Express on Vercel: https://vercel.com/docs/concepts/functions/serverless-functions

## Need Help?

1. Check Vercel deployment logs
2. Check browser console (F12)
3. Review error messages carefully
4. See VERCEL_DEPLOYMENT.md for more details

---

🎉 Congratulations! Your app is now deployed!
