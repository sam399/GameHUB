# Local Development Setup - Manual Start (Workaround)

## Current Status

Due to a known bug in Netlify CLI on Windows with interactive prompts, we'll run the services manually.

### ✅ Frontend Server Running
- **URL**: http://127.0.0.1:5174/
- **Status**: Running
- **Command**: `npm run dev` (in `gameverse/frontend`)

### ⏳ Backend Server (Next Step)

You need to start the Express backend server in a separate terminal.

---

## Starting the Backend

### Option 1: Direct Node.js (Recommended)

Open a NEW terminal window and run:

```bash
cd h:\My Website\GameHUB\gameverse\backend
npm install
npm run dev
```

This will start the backend on **http://localhost:5000**

### Option 2: Using Nodemon

```bash
cd h:\My Website\GameHUB\gameverse\backend
npm run dev
```

---

## Environment Configuration

### Update Frontend API URL

The frontend is currently configured in `vite.config.ts` to proxy API calls:

```typescript
proxy: {
  '/api': {
    target: 'http://localhost:8888',  // Netlify dev
    // OR for manual backend:
    target: 'http://localhost:5000',  // Express server
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, '/api')
  }
}
```

Since we're running Vite + Express manually (not Netlify), API calls to `/api/*` will automatically proxy to `http://localhost:5000/api/*`.

---

## Complete Local Development Setup

### Terminal 1: Frontend (Already Running)
```bash
cd h:\My Website\GameHUB\gameverse\frontend
npm run dev
# Running on http://127.0.0.1:5174
```

### Terminal 2: Backend (Start New)
```bash
cd h:\My Website\GameHUB\gameverse\backend
npm install
npm run dev
# Running on http://localhost:5000
```

### Terminal 3: (Optional) MongoDB Check
```bash
# If using local MongoDB
mongod

# Or verify your MongoDB Atlas connection string in backend/.env
```

---

## Accessing Your Application

1. **Frontend**: http://127.0.0.1:5174
2. **API**: http://localhost:5000/api
3. **Health Check**: http://localhost:5000/api/health

---

## What's Different from `netlify dev`

- **Netlify dev**: Simulates Netlify's serverless environment locally
- **Manual setup**: Runs Vite dev server + Express server separately
- **For testing**: Manual setup is actually better for development since you get:
  - Instant hot reload (Vite)
  - Direct Node.js debugging
  - Easier to test backend changes
  - No CLI bugs!

---

## Next Steps

1. **Open a new terminal** and start the backend (see above)
2. **Verify everything works**:
   - Frontend loads: http://127.0.0.1:5174
   - API responds: http://localhost:5000/api/health
   - Check browser console for any errors

3. **Test your features**:
   - Login/authentication
   - Load games list
   - Create a review
   - Any other features

4. **When ready to deploy**: 
   - Use Netlify web UI (netlify.com)
   - Or try `netlify init` without the buggy prompt system
   - Or just `git push` and connect to Netlify

---

## Troubleshooting

### Frontend not loading
- Check that port 5174 is being used
- Look for errors in Vite dev server (terminal 1)

### API not responding (404)
- Check that backend is running (terminal 2)
- Verify `http://localhost:5000/api/health` works directly
- Check CORS configuration in `gameverse/backend/server.js`

### Database connection error
- Ensure MongoDB is running OR
- Verify `MONGODB_URI` in `.env.local`
- Check connection string in `gameverse/backend/.env`

### Port already in use
- Kill existing process: `lsof -ti :5174,5000 | xargs kill -9` (Mac/Linux)
- Or use: `netstat -ano | findstr ":5174"` (Windows)

---

## Fixing Netlify CLI (Optional)

The Windows CLI bug seems related to the inquirer-autocomplete-prompt dependency. If you want to fix it:

```bash
# Try with a different Node version
nvm install 18
nvm use 18
npm install -g netlify-cli@18
netlify dev
```

Or file an issue: https://github.com/netlify/cli/issues

---

## Alternative: Deploy Without Testing Locally

If the local setup is problematic, you can:

1. Commit your code to GitHub
2. Connect repo to Netlify.com directly
3. Let Netlify build and deploy
4. Test on the live preview URL

This skips `netlify dev` entirely.

---

**Ready to start the backend?** Follow "Terminal 2" instructions above!

