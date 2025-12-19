# Vercel vs Netlify - Detailed Comparison & Troubleshooting

## Configuration Comparison

### Vercel Setup (Before)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "gameverse/backend/serverless.js",
      "use": "@vercel/node"
    },
    {
      "src": "gameverse/frontend",
      "use": "@vercel/static-build"
    }
  ],
  "routes": [
    { "src": "^/api/(.*)", "dest": "/gameverse/backend/serverless.js" },
    { "handle": "filesystem" }
  ]
}
```

### Netlify Setup (After)
```toml
[build]
  command = "npm run build:netlify"
  publish = "gameverse/frontend/dist"
  functions = "netlify/functions"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## API URL Changes

| Scenario | Vercel | Netlify |
|----------|--------|---------|
| Development | `http://localhost:5000/api` | `http://localhost:8888/.netlify/functions/api` |
| Production | `https://domain.vercel.app/api` | `https://domain.netlify.app/.netlify/functions/api` |
| Env Variable (Frontend) | (none) | `VITE_API_URL=/.netlify/functions/api` |

---

## File Structure Comparison

### Vercel
```
root/
├── vercel.json           ← Config
├── gameverse/backend/
│   └── serverless.js     ← Entry point
└── gameverse/frontend/   ← Static site
```

### Netlify
```
root/
├── netlify.toml          ← Config
├── netlify/functions/
│   └── api.js            ← Entry point
├── gameverse/backend/    ← Source files
└── gameverse/frontend/   ← Static site
```

---

## Build Process Comparison

### Vercel Build Flow
1. Install dependencies
2. Build frontend → `dist`
3. Deploy frontend to CDN
4. Deploy serverless function
5. Configure routing

### Netlify Build Flow
1. Install dependencies
2. Run build command (`npm run build:netlify`)
3. Build frontend → `dist`
4. Deploy frontend to CDN
5. Deploy functions from `netlify/functions`
6. Auto-configure routing

---

## Performance Metrics

| Metric | Vercel | Netlify | Winner |
|--------|--------|---------|--------|
| Cold Start Time | ~80-150ms | ~150-300ms | Vercel |
| Build Time | ~2-3 min | ~2-3 min | Tie |
| Edge Locations | 30+ | 150+ | Netlify |
| Free Tier Limits | 100 functions | 125 functions | Tie |
| Bandwidth Limit | 100GB/month | Unlimited | Netlify |
| Build Minutes | 6000/month | 300/month | Vercel |

---

## Environment Variables

### Vercel
Set in `vercel.json` or Dashboard:
```json
{
  "env": {
    "NODE_ENV": "production",
    "JWT_EXPIRE": "30d"
  }
}
```

### Netlify
Set in `netlify.toml` or Dashboard:
```toml
[context.production.environment]
  NODE_ENV = "production"
  JWT_EXPIRE = "30d"
```

Or via CLI:
```bash
netlify env:set KEY value
```

---

## Debugging & Logs

### Vercel
```bash
# View logs
vercel logs

# View function logs
vercel logs --func serverless.js

# Real-time
vercel env list
```

### Netlify
```bash
# View logs
netlify logs

# View function logs
netlify logs --function=api

# Real-time
netlify logs --tail

# Function invocation
netlify functions:invoke api
```

---

## Common Issues & Solutions

### Issue 1: API Not Found (404)

**Symptoms:** Getting 404 on API calls

**Vercel Solution:**
```javascript
// Routes automatically mapped via vercel.json
fetch('/api/games')
```

**Netlify Solution:**
```javascript
// Must use full path or environment variable
const API_URL = import.meta.env.VITE_API_URL;
fetch(`${API_URL}/games`)
// OR
fetch('/.netlify/functions/api/games')
```

**Fix:**
1. Ensure `netlify.toml` redirect is correct
2. Check environment variable is set
3. Verify functions directory structure

---

### Issue 2: CORS Errors

**Symptoms:** 
```
Access to XMLHttpRequest blocked by CORS policy
```

**Vercel Fix:**
```javascript
app.use(cors({
  origin: 'https://domain.vercel.app'
}));
```

**Netlify Fix:**
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
```

**Additional Netlify Settings:**
Add to `netlify.toml`:
```toml
[[headers]]
  for = "/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
    Access-Control-Allow-Methods = "GET, POST, PUT, DELETE"
```

---

### Issue 3: Database Connection Timeout

**Symptoms:**
```
MongooseError: Cannot connect to MongoDB
```

**Vercel Solutions:**
1. Whitelist Vercel IPs in MongoDB Atlas
2. Check connection string in `vercel.json` env

**Netlify Solutions:**
1. Whitelist Netlify functions IPs:
   - Go to MongoDB Atlas
   - Network Access → IP Whitelist
   - Add Netlify IPs OR 0.0.0.0/0 (allow all)
2. Set `MONGODB_URI` in Netlify dashboard

**Diagnostic:**
```bash
# Test connection locally
netlify dev

# Check logs
netlify logs --function=api
```

---

### Issue 4: Dependencies Not Found

**Symptoms:**
```
Module not found: package-name
```

**Vercel:**
- Check `package.json` in root

**Netlify:**
- Check `package.json` in root
- Check `netlify/functions` can access dependencies
- May need to install in multiple locations

**Fix:**
```bash
# Ensure dependencies are in root package.json
npm install package-name --save

# Don't forget monorepo setup
# npm workspaces work fine with Netlify
```

---

### Issue 5: Function Timeout

**Symptoms:**
```
Function execution timed out after 30 seconds
```

**Vercel:**
```json
{
  "config": {
    "maxDuration": 60
  }
}
```

**Netlify:**
Add to `netlify.toml`:
```toml
[[functions]]
  name = "api"
  timeout = 60
```

---

### Issue 6: Large Upload Failed

**Symptoms:**
```
Payload too large
```

**Netlify Fix:**
```toml
[[functions]]
  name = "api"
  memory = 1024
```

Update Express middleware:
```javascript
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb' }));
```

---

## Migration Checklist: Step-by-Step

### Phase 1: Preparation
- [ ] Install Netlify CLI: `npm install -g netlify-cli`
- [ ] Create `.env.local` files
- [ ] Review migration guides
- [ ] Backup current Vercel config

### Phase 2: Local Testing
- [ ] Test with `netlify dev`
- [ ] Verify API endpoints work
- [ ] Check database connectivity
- [ ] Test authentication flow
- [ ] Verify Socket.io (if used)

### Phase 3: Configuration
- [ ] Create `netlify.toml`
- [ ] Create `netlify/functions/api.js`
- [ ] Update `vite.config.ts`
- [ ] Update `package.json` scripts
- [ ] Review all changes

### Phase 4: Deployment Prep
- [ ] Commit all changes
- [ ] Push to GitHub
- [ ] Create Netlify account
- [ ] Connect GitHub repo to Netlify

### Phase 5: Netlify Setup
- [ ] Set build command: `npm run build:netlify`
- [ ] Set publish directory: `gameverse/frontend/dist`
- [ ] Add environment variables
- [ ] Configure domain
- [ ] Enable auto-deploy

### Phase 6: Deployment & Testing
- [ ] Deploy preview
- [ ] Test all features
- [ ] Check performance
- [ ] Monitor logs
- [ ] Deploy to production

### Phase 7: Monitoring
- [ ] Watch for errors in logs
- [ ] Monitor API performance
- [ ] Check error rates
- [ ] Collect user feedback

---

## Rollback Plan

If something goes wrong:

### Immediate Rollback
```bash
# Switch DNS back to Vercel
# Or

# Deploy current code to Vercel
vercel deploy --prod
```

### Keep Both Running (Testing Phase)
1. Deploy to Netlify
2. Keep Vercel active
3. Use DNS/subdomain to test
4. Switch completely after verification

---

## Performance Optimization Tips

### Netlify-Specific Optimizations

1. **Function Memory:**
```toml
[[functions]]
  memory = 1024  # Default 128MB, increase for heavy workloads
```

2. **Cache Control:**
```toml
[[headers]]
  for = "/dist/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

3. **Edge Caching:**
- Use Netlify Edge Functions for URL rewrites
- Reduce Lambda cold starts

4. **Minify & Bundle:**
```javascript
// In vite.config.ts
build: {
  minify: 'terser',
  rollupOptions: { /* ... */ }
}
```

---

## Monitoring & Analytics

### Netlify Dashboard Metrics
- Deployment history
- Function invocations
- Bandwidth usage
- Error rates

### View via CLI
```bash
netlify status
netlify deploys:list
netlify logs --tail
```

### Integration with Services
- Sentry for error tracking
- LogRocket for session replay
- DataDog for performance monitoring

---

## Key Takeaways

| Aspect | Action |
|--------|--------|
| **Setup** | Use `netlify init` |
| **Development** | Run `netlify dev` |
| **Deployment** | Push to GitHub → Auto-deploy |
| **Debugging** | Use `netlify logs --tail` |
| **Environment** | Set in Netlify dashboard |
| **API URLs** | Use `/.netlify/functions/api` |
| **Database** | Whitelist Netlify IPs |
| **Monitoring** | Check Netlify dashboard |

---

## Additional Resources

- [Netlify Docs](https://docs.netlify.com)
- [Netlify Functions](https://docs.netlify.com/functions/overview)
- [Netlify CLI](https://cli.netlify.com)
- [Netlify Status](https://www.netlify.com/status/)
- [Community Slack](https://www.netlify.com/community/)

---

**Need Help?**
- Check [NETLIFY_COMMANDS_REFERENCE.md](./NETLIFY_COMMANDS_REFERENCE.md)
- See [NETLIFY_MIGRATION_GUIDE.md](./NETLIFY_MIGRATION_GUIDE.md)
- Run `netlify support` for live chat

---

**Last Updated:** December 19, 2025
