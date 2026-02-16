# Render Build Command Fix

## Issue

Build is failing on Render with error:
```
npm error Missing script: "build"
```

## Root Cause

Render is running the wrong build command:
```bash
npm install && npm run build
```

But it should be running:
```bash
npm install --legacy-peer-deps && npm run build && npm run db:push
```

**Why this happens:**
- Render is NOT using the `render.yaml` Blueprint configuration
- It's using manual settings configured in the Render Dashboard
- The manual settings are outdated or incorrect

## Solution

### Method 1: Update Dashboard Settings (Quick Fix - 5 minutes)

1. **Go to Render Dashboard**
   - Navigate to your web service
   - Click on "Settings" tab

2. **Update Build Command**
   - Find "Build Command" field
   - Change from: `npm install && npm run build`
   - Change to: `npm install --legacy-peer-deps && npm run build && npm run db:push`

3. **Update Start Command** (if needed)
   - Find "Start Command" field
   - Ensure it's set to: `npm start`

4. **Save and Redeploy**
   - Click "Save Changes"
   - Go to "Manual Deploy" → "Clear build cache & deploy"
   - Wait for build to complete

### Method 2: Deploy via Blueprint (Proper Solution - 10 minutes)

This is the **recommended** method as it uses the `render.yaml` configuration:

1. **Delete Current Service** (if exists)
   - Go to Render Dashboard
   - Select your web service
   - Settings → Delete Service

2. **Deploy New Blueprint Instance**
   - Dashboard → "New" → "Blueprint"
   - Connect your GitHub repository
   - Select branch: `copilot/set-up-railway-deployment`
   - Render will automatically detect `render.yaml`
   - Review the configuration
   - Click "Apply"

3. **Wait for Deployment**
   - Render will create the web service and database
   - Build will run with correct commands
   - Application will start automatically

## Why Each Flag is Critical

### --legacy-peer-deps

**Without it:** npm install fails with peer dependency conflicts
```
npm error ERESOLVE could not resolve
npm error While resolving: react@19.2.4
npm error Conflicting peer dependency: react@18.3.1
```

**Why it happens:**
- Project uses React 18.3.1
- Some Radix UI components require React 19
- `--legacy-peer-deps` allows npm to proceed despite conflicts

### && npm run db:push

**Without it:** Database tables don't exist, application crashes
```
error: relation "wallets" does not exist
error: relation "user_onboarding" does not exist
```

**What it does:**
- Runs `drizzle-kit push` during build
- Creates all database tables from schema
- Ensures schema is ready before app starts

## Expected Build Output After Fix

```
==> Running build command 'npm install --legacy-peer-deps && npm run build && npm run db:push'...

up to date, audited 526 packages in 2s
found 0 vulnerabilities

> rest-express@1.0.0 build
> npm run build:client && npm run build:server

> rest-express@1.0.0 build:client
> NODE_ENV=production vite build --config Fantasy-Sports-Exchange/vite.config.ts

vite v7.3.1 building client environment for production...
✓ 2347 modules transformed.
✓ built in 8s

> rest-express@1.0.0 build:server
> esbuild Fantasy-Sports-Exchange/server/index.ts --bundle...

  dist/index.cjs  280kb
⚡ Done in 21ms

Reading config file '/opt/render/project/src/Fantasy-Sports-Exchange/drizzle.config.ts'
[✓] Pulling schema from database...
[i] No changes detected

==> Build successful 🎉
```

## Verification

After fixing the build command:

1. **Check Build Logs**
   - Should see "up to date, audited 526 packages"
   - Should see Vite build output
   - Should see esbuild output
   - Should see drizzle-kit push output
   - Should end with "Build successful 🎉"

2. **Check Application Startup**
   ```
   Seeding database with players...
   Seeded 27 players
   Seeding competitions...
   Seeded 4 competitions
   ✓ Database initialization complete
   [express] serving on port 10000
   ==> Your service is live 🎉
   ```

3. **Test Application**
   - Visit your Render URL
   - Site should load with full styling
   - API endpoints should work
   - No "relation does not exist" errors

## Troubleshooting

### Still Getting "Missing script: build"

**Issue:** Build command not updated correctly

**Solution:**
- Double-check the build command in Render Dashboard
- Ensure there are no extra spaces or typos
- Try Method 2 (Blueprint deployment) instead

### Build Succeeds But App Crashes

**Issue:** Missing environment variables or database

**Solution:**
- Check that `DATABASE_URL` is set in Environment Variables
- Verify database is connected (should be automatic with Blueprint)
- Check logs for specific error messages

### npm install Fails with Peer Dependency Errors

**Issue:** Missing `--legacy-peer-deps` flag

**Solution:**
- Ensure build command includes `--legacy-peer-deps`
- Do NOT remove this flag - it's required for this project

## Why render.yaml Wasn't Used

If you deployed without using "New Blueprint", Render creates a manual service that doesn't use render.yaml. To use render.yaml:

1. Service must be created via "New Blueprint" option
2. GitHub repository must be connected
3. render.yaml must be in root of repository
4. Blueprint deployment reads render.yaml automatically

## Summary

**Issue:** Wrong build command → build fails
**Fix:** Update to: `npm install --legacy-peer-deps && npm run build && npm run db:push`
**Methods:** 
1. Update Dashboard manually (quick)
2. Deploy via Blueprint (recommended)

**Status:** Issue identified and solution provided ✅

User needs to update Render Dashboard configuration to use the correct build command.
