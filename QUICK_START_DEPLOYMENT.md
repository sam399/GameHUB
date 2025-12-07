# Quick Start: Deploy GameVerse to Vercel

## 5-Minute Setup

### 1. Prepare MongoDB Atlas (2 min)
```
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account & cluster
3. Create database user (e.g., gameverse_user, password: strong_password)
4. Whitelist IPs (allow 0.0.0.0/0)
5. Copy connection string: mongodb+srv://gameverse_user:password@cluster0.xxxxx.mongodb.net/gameverse
```

### 2. Generate Secrets (1 min)
```powershell
# Generate JWT Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Output: copy this value
```

### 3. Push to GitHub (1 min)
```powershell
cd "h:\My Website\GameHUB"
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 4. Deploy Backend (1 min)
```
1. Go to https://vercel.com (login/signup with GitHub)
2. "Add New..." → "Project"
3. Select "GameHUB" repository
4. Root Directory: gameverse/backend
5. Framework: "Node.js"
6. Add Environment Variables:
   MONGODB_URI = mongodb+srv://gameverse_user:password@cluster0.xxxxx.mongodb.net/gameverse
   JWT_SECRET = your_generated_secret
   JWT_EXPIRE = 30d
   RAWG_API_KEY = (optional)
   NODE_ENV = production
7. Click "Deploy"
8. Note your backend URL: https://gameverse-api-xxxxx.vercel.app
```

### 5. Deploy Frontend (0 min)
```
1. Go to https://vercel.com
2. "Add New..." → "Project"
3. Select "GameHUB" repository again
4. Root Directory: gameverse/frontend
5. Framework: "Vite"
6. Environment Variables:
   VITE_API_URL = https://gameverse-api-xxxxx.vercel.app/api
7. Click "Deploy"
8. Your frontend URL: https://gameverse-xxxxx.vercel.app
```

## Done! 🎉

Your app is now live at `https://gameverse-xxxxx.vercel.app`

## Troubleshooting

### App shows blank page
- Check browser console for errors
- Verify `VITE_API_URL` in Vercel environment variables

### Can't login
- Check backend `MONGODB_URI` is correct
- Verify MongoDB IP whitelist includes all IPs
- Check backend deployment logs: `vercel logs [project]`

### API returns 404
- Verify backend was deployed successfully
- Check `VITE_API_URL` ends with `/api`
- Test directly: `https://gameverse-api-xxxxx.vercel.app/api`

### Need Help?
- See `VERCEL_DEPLOYMENT.md` for detailed guide
- See `DEPLOYMENT_CHECKLIST.md` for complete steps
- Check Vercel deployment logs for errors

## Next Steps

1. Update backend `FRONTEND_URL` env variable with frontend URL
2. Monitor Vercel analytics
3. Set up custom domain (optional)
4. Enable Vercel analytics
5. Configure error tracking (Sentry, etc.)

---

That's it! Your gaming community platform is now live! 🚀
