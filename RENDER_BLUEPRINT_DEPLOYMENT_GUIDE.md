# Render Blueprint Deployment Guide

## Your Questions Answered

### ❓ "where is my bp saved?"

**Answer:** Your Blueprint file is saved at:
```
/render.yaml
```

This file is located at the **root of the repository**, at the same level as `package.json`.

### ❓ "what to fill in at branch"

**Answer:** Fill in:
```
copilot/set-up-railway-deployment
```

This is the branch that contains all the deployment fixes and configurations we've implemented.

### ❓ "what to fill in at blueprint path"

**Answer:** Fill in:
```
render.yaml
```

Or you can leave it blank/default - Render will automatically find `render.yaml` at the repository root.

---

## Complete Deployment Instructions

### Step 1: Access Render Dashboard

1. Go to [https://dashboard.render.com](https://dashboard.render.com)
2. Sign in with your GitHub account (if not already signed in)

### Step 2: Create New Blueprint

1. Click the **"New"** button (top right)
2. Select **"Blueprint"** from the dropdown

### Step 3: Connect GitHub Repository

If not already connected:
1. Click "Connect GitHub"
2. Authorize Render to access your repositories
3. Select the `zjondreangermund/Fantasyarena` repository

### Step 4: Fill in Blueprint Form

Enter the following values:

```
┌──────────────────────────────────────────────────┐
│ Repository: zjondreangermund/Fantasyarena       │
│                                                  │
│ Branch: copilot/set-up-railway-deployment       │
│                                                  │
│ Blueprint Name: fantasy-arena                    │
│         (or any name you prefer)                 │
│                                                  │
│ Blueprint Path: render.yaml                      │
│         (or leave as default)                    │
└──────────────────────────────────────────────────┘
```

**Important Values:**
- **Repository**: `zjondreangermund/Fantasyarena`
- **Branch**: `copilot/set-up-railway-deployment` ← CRITICAL!
- **Blueprint Path**: `render.yaml` (or leave default)

### Step 5: Review and Apply

1. Click **"Apply"**
2. Render will show you what will be created:
   - PostgreSQL Database: `fantasy-arena-db`
   - Web Service: `fantasy-arena-web`
3. Confirm and click **"Apply"** again

### Step 6: Wait for Deployment

The deployment process takes 5-10 minutes:

```
1. ⏳ Creating PostgreSQL database...
2. ⏳ Creating Web Service...
3. ⏳ Running build command...
   - npm install --legacy-peer-deps
   - npm run build (builds client + server)
   - npx drizzle-kit push (creates database tables)
4. ⏳ Starting application...
5. ✅ Deployment complete!
```

---

## What's in Your Blueprint File

The `/render.yaml` file at the root of your repository contains:

### 1. Database Configuration
```yaml
databases:
  - name: fantasy-arena-db
    databaseName: fantasy_arena
    plan: starter  # Free tier
```

### 2. Web Service Configuration
```yaml
services:
  - type: web
    name: fantasy-arena-web
    runtime: node
    buildCommand: npm install --legacy-peer-deps && npm run build && npm run db:push
    startCommand: npm start
```

### 3. Environment Variables
```yaml
envVars:
  - key: NODE_ENV
    value: production
  - key: DATABASE_URL
    fromDatabase:
      name: fantasy-arena-db
      property: connectionString
```

The `DATABASE_URL` is automatically set from the database connection!

---

## What Happens During Deployment

### Phase 1: Build (5-8 minutes)

```
1. Clone repository from GitHub
2. Checkout branch: copilot/set-up-railway-deployment
3. Install dependencies: npm install --legacy-peer-deps
   - Installs 526 packages
   - Uses --legacy-peer-deps for React version compatibility
4. Build client: npm run build:client
   - Vite builds React application
   - Output: dist/public/ (HTML, CSS, JS)
5. Build server: npm run build:server
   - esbuild bundles Express server
   - Output: dist/index.cjs
6. Push database schema: npx drizzle-kit push
   - Creates all database tables
   - Sets up indexes and constraints
```

### Phase 2: Startup (1-2 minutes)

```
1. Start server: npm start
2. Seed database with players (27 players)
3. Seed competitions (4 competitions)
4. Start Express server on port 10000
5. Application is live! 🎉
```

---

## Verification Checklist

After deployment completes, verify:

### ✅ Database Status
- Go to Render Dashboard → Databases
- Check `fantasy-arena-db` status is "Available"
- Verify connection string exists

### ✅ Web Service Status
- Go to Render Dashboard → Services
- Check `fantasy-arena-web` status is "Live"
- Note the provided URL (e.g., `https://fantasyarena.onrender.com`)

### ✅ Build Logs
- Click on the web service
- Check "Logs" tab
- Look for:
  ```
  ✓ built in 8s
  ✓ Database schema successfully created
  ✓ Database initialization complete
  [express] serving on port 10000
  Your service is live 🎉
  ```

### ✅ Application Access
- Visit the provided URL
- Frontend should load with full styling
- Try navigating to different pages
- Check onboarding flow works

### ✅ API Endpoints
- Open browser DevTools → Network tab
- Check that API calls return proper responses:
  - `/api/auth/user` → 200 or 304
  - `/api/onboarding` → 200
  - `/api/onboarding/status` → 200

---

## Troubleshooting

### Issue: "Branch not found"

**Solution:**
- Make sure you entered: `copilot/set-up-railway-deployment`
- Check for typos
- Verify the branch exists in your GitHub repository

### Issue: "Blueprint file not found"

**Solution:**
- Verify `render.yaml` exists at repository root
- Check you're on the correct branch
- Try entering `render.yaml` explicitly in the Blueprint Path field

### Issue: "Build failed"

**Solution:**
- Check the build logs for specific error
- Most common: Missing `--legacy-peer-deps` flag
- See [RENDER_BUILD_COMMAND_FIX.md](./RENDER_BUILD_COMMAND_FIX.md) for details

### Issue: "Database connection failed"

**Solution:**
- Verify database status is "Available"
- Check that `DATABASE_URL` environment variable is set
- Review [DATABASE_URL_ERROR.md](./DATABASE_URL_ERROR.md)

### Issue: "Application loads but no styling"

**Solution:**
- Clear browser cache (Ctrl+Shift+R)
- Check static files are being served
- Review [FRONTEND_STYLING_FIX.md](./FRONTEND_STYLING_FIX.md)

---

## Quick Reference Card

```
📁 Blueprint File Location:
   /render.yaml (at repository root)

🌿 Branch to Deploy:
   copilot/set-up-railway-deployment

📝 Blueprint Path:
   render.yaml (or leave default)

🔗 Repository:
   zjondreangermund/Fantasyarena

⏱️ Deployment Time:
   5-10 minutes

💰 Cost:
   Free tier (PostgreSQL Starter + Web Service Starter)
```

---

## Next Steps After Deployment

1. **Test the Application**
   - Visit your deployed URL
   - Create an account / sign in
   - Try the onboarding flow
   - Select player cards
   - Explore the dashboard

2. **Monitor Logs**
   - Keep Logs tab open
   - Watch for any errors
   - Check API response times

3. **Optional: Add Custom Domain**
   - Go to Settings → Custom Domains
   - Add your domain
   - Configure DNS records

4. **Optional: Enable Auto-Deploy**
   - Settings → Auto-Deploy
   - Enable for the deployment branch
   - Future commits will auto-deploy

---

## Summary

**Your Blueprint is saved at:** `/render.yaml` (root of repository)

**Deploy with these values:**
- **Branch:** `copilot/set-up-railway-deployment`
- **Blueprint Path:** `render.yaml`

**What you get:**
- PostgreSQL database with all tables
- Web service with your application
- Automatic environment configuration
- Production-ready deployment

**After deployment:**
- Application accessible at provided URL
- Database seeded with 27 players
- 4 competitions available
- Full frontend and backend functionality

---

## Need More Help?

See these related guides:
- [QUICK_START.md](./QUICK_START.md) - Overview of deployment process
- [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) - Detailed Render guide
- [RENDER_BUILD_COMMAND_FIX.md](./RENDER_BUILD_COMMAND_FIX.md) - Build troubleshooting
- [DEPLOYMENT_COMPLETE.md](./DEPLOYMENT_COMPLETE.md) - Technical details

**Happy Deploying! 🚀**
