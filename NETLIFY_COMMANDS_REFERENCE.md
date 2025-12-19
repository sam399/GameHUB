# Netlify Migration - Command Reference

## Installation & Setup

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Verify installation
netlify --version

# Login to Netlify
netlify login

# Initialize your site
netlify init

# Link existing Netlify site to local project
netlify link

# Open Netlify admin panel in browser
netlify open
```

## Local Development

```bash
# Run with Netlify local dev server (simulates production)
netlify dev

# Run with verbose logging
netlify dev --verbose

# Open specific function
netlify dev --functions=netlify/functions

# Run on specific port
netlify dev --port 3000
```

## Deployment

```bash
# Deploy preview (staging)
netlify deploy

# Deploy to production
netlify deploy --prod

# Deploy specific directory
netlify deploy --dir=gameverse/frontend/dist

# Show deployment status
netlify status

# List all deployments
netlify deploys:list

# Get deployment info
netlify deploy:info
```

## Logs & Monitoring

```bash
# View live logs
netlify logs

# View function logs
netlify logs --function=api

# Get function details
netlify functions:list

# Tail logs (watch mode)
netlify logs --tail
```

## Functions Management

```bash
# Create new function
netlify functions:create

# List all functions
netlify functions:list

# Invoke function locally
netlify functions:invoke api --payload='{"test": true}'

# Debug function
netlify functions:invoke api --debug
```

## Environment & Configuration

```bash
# Show current environment
netlify env:list

# Import environment from file
netlify env:import .env

# Set environment variable
netlify env:set KEY_NAME value

# Unset environment variable
netlify env:unset KEY_NAME

# Show environment variables
netlify env:show
```

## Sites Management

```bash
# List all your Netlify sites
netlify sites:list

# Create new site
netlify sites:create

# Get site info
netlify sites:info

# Open site in browser
netlify open

# Open admin panel
netlify open --admin
```

## Troubleshooting

```bash
# Clear cache
netlify cache:clean

# Check Netlify CLI for issues
netlify doctor

# Debug build
netlify deploy --prod --verbose

# Show logs from latest deploy
netlify deploys:list | head -1

# Open support chat
netlify support
```

## Environment Variables Example

```bash
# Set multiple variables
netlify env:set NODE_ENV production
netlify env:set MONGODB_URI "mongodb+srv://..."
netlify env:set JWT_SECRET "your-secret"
netlify env:set FRONTEND_URL "https://your-site.netlify.app"
```

## Build Commands

```bash
# From root directory

# Install dependencies
npm install

# Build for Netlify
npm run build:netlify

# Build frontend only
npm run build:frontend

# Build backend only
npm run build:backend

# Start local dev (not Netlify)
npm run dev

# Start local dev with Netlify
npm run dev:netlify

# Deploy with CLI
npm run deploy:netlify
```

## Common Issues - Quick Fixes

### Functions not found
```bash
# Ensure structure is correct
netlify functions:list

# Rebuild functions
netlify deploy --prod --force
```

### CORS errors
```bash
# Add to netlify.toml:
[functions]
  path = "netlify/functions"

# Set environment variable:
netlify env:set FRONTEND_URL "https://your-site.netlify.app"
```

### Database connection timeout
```bash
# Restart MongoDB connection pool
# Or whitelist Netlify IPs in MongoDB Atlas
# Settings → Network Access → Add IP Address
```

### Module not found
```bash
# Install missing module
npm install module-name --save

# Rebuild
npm run build:netlify
```

## API Endpoints Reference

### Development (Local)
```
Base: http://localhost:8888
API: http://localhost:8888/.netlify/functions/api
Example: http://localhost:8888/.netlify/functions/api/games
```

### Production (Netlify)
```
Base: https://your-site.netlify.app
API: https://your-site.netlify.app/.netlify/functions/api
Example: https://your-site.netlify.app/.netlify/functions/api/games
```

## Configuration Files Quick Reference

### netlify.toml (Root)
- Build command: `npm run build:netlify`
- Publish directory: `gameverse/frontend/dist`
- Functions directory: `netlify/functions`
- Environment variables
- Redirect rules for SPA

### vite.config.ts (Frontend)
- Updated build configuration
- Optimized chunks
- Dev proxy to Netlify functions

### package.json (Root)
- `build:netlify` - Build for Netlify
- `dev:netlify` - Local dev with Netlify
- `deploy:netlify` - CLI deployment

### .env.local (Create these)
```env
VITE_API_URL=http://localhost:8888/.netlify/functions/api
MONGODB_URI=your_connection_string
JWT_SECRET=your_secret
```

## Deployment Workflow

```bash
# 1. Develop locally
npm run dev:netlify

# 2. Test API calls
# Visit http://localhost:8888

# 3. Check logs
netlify logs

# 4. Commit changes
git add .
git commit -m "Migrate to Netlify"

# 5. Push to GitHub
git push origin main

# 6. Netlify auto-deploys OR manually deploy
netlify deploy --prod

# 7. Monitor
netlify logs --tail
```

## Performance Tips

```bash
# 1. Optimize functions (increase memory)
[[functions]]
  name = "api"
  memory = 1024

# 2. Set appropriate timeout
[functions]
  timeout = 30

# 3. Use environment variables (don't hardcode)
# Set in netlify.toml [context.production.environment]

# 4. Monitor cold starts
# Check netlify logs for timing
```

## Security Checklist

- [ ] Never commit `.env.local` (add to `.gitignore`)
- [ ] Set `FRONTEND_URL` in environment variables
- [ ] Enable CORS properly for your domain
- [ ] Use HTTPS-only in production
- [ ] Rotate JWT secrets regularly
- [ ] Whitelist database IPs

## Useful Links

- [Netlify CLI Documentation](https://cli.netlify.com)
- [Netlify Functions](https://docs.netlify.com/functions/overview)
- [Netlify Environment Variables](https://docs.netlify.com/environment/env-variables)
- [Netlify Redirects](https://docs.netlify.com/routing/redirects)

---

**Quick Deploy:**
```bash
git push origin main
netlify deploy --prod
```

**Quick Local Test:**
```bash
netlify dev
# http://localhost:8888
```

**Quick Status:**
```bash
netlify status
```
