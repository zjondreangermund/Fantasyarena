# Render.com Deployment Guide

This document provides step-by-step instructions for deploying the Fantasy Arena application to Render.com - a free alternative to Railway.

> **💡 Quick Note:** If you use **Option 1 (Blueprint)**, all environment variables are set automatically! You only need to manually configure variables if you use **Option 2 (Manual Setup)**. See [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md) for details.

## Why Render.com?

- **Free Tier**: Web services and PostgreSQL database (free for 90 days)
- **No Credit Card Required**: Get started immediately
- **Similar to Railway**: Easy deployment from GitHub
- **Auto-Deploy**: Automatically redeploys on git push
- **Free SSL**: HTTPS included on all plans

## Prerequisites

- A GitHub account with this repository
- A Render account (sign up at [render.com](https://render.com))

## Deployment Steps

### Option 1: Deploy with Blueprint (Recommended - Fastest)

The repository includes a `render.yaml` blueprint file that automatically sets up both your app and database.

1. **Sign Up / Log In to Render**
   - Go to [render.com](https://render.com)
   - Click "Get Started" and sign up with GitHub

2. **Create New Blueprint**
   - From your Render dashboard, click "New +"
   - Select "Blueprint"
   - Connect your GitHub account if not already connected
   - Select the `Fantasyarena` repository
   - **IMPORTANT:** Click "Advanced" before clicking "Apply"
   - Change **Branch** to: `copilot/set-up-railway-deployment`
   - Now click "Apply"
   
   > **Why?** All deployment configuration (render.yaml, build fixes) is in this branch. The main branch may not have these files yet.

3. **Automatic Setup**
   Render will automatically:
   - Create a web service for your application
   - Provision a PostgreSQL database
   - Link them together with DATABASE_URL
   - Build and deploy your app

4. **Initialize Database Schema**
   After the first deployment completes:
   
   **Using Render Shell:**
   - Go to your web service in Render dashboard
   - Click "Shell" tab
   - Run:
   ```bash
   npm run db:push
   ```
   
   **Or using local connection:**
   - In Render dashboard, click on your PostgreSQL database
   - Copy the "External Database URL"
   - Run locally:
   ```bash
   DATABASE_URL="<your-render-db-url>" npm run db:push
   ```

5. **Access Your Application**
   - Your app will be available at: `https://fantasy-arena.onrender.com` (or similar)
   - Find the URL in your Render dashboard under the web service

### Option 2: Manual Setup

If you prefer manual setup or the blueprint doesn't work:

#### Step 1: Create PostgreSQL Database

1. In Render dashboard, click "New +"
2. Select "PostgreSQL"
3. Configure:
   - **Name**: fantasy-arena-db
   - **Database**: fantasyarena
   - **User**: fantasyarena
   - **Region**: Choose closest to you
   - **Plan**: Free
4. Click "Create Database"
5. **Save the connection details** (you'll need the "External Database URL")

#### Step 2: Create Web Service

1. Click "New +" again
2. Select "Web Service"
3. Connect your GitHub repository (Fantasyarena)
4. Configure:
   - **Name**: fantasy-arena
   - **Region**: Same as your database
   - **Branch**: main (or your default branch)
   - **Runtime**: Node
   - **Build Command**: `npm install --legacy-peer-deps && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. **Add Environment Variables**
   - Click "Advanced" or go to Environment tab
   - Add these **2 required variables**:
   
   ```
   Key: NODE_ENV
   Value: production
   
   Key: DATABASE_URL  
   Value: [Paste your PostgreSQL External Database URL from Step 1]
   ```
   
   **Where to find DATABASE_URL:**
   - Go back to your PostgreSQL database page in Render
   - Scroll to "Connections" section
   - Copy the **"External Database URL"** (starts with `postgresql://`)
   - Paste it as the value for DATABASE_URL
   
   **Note:** Don't set PORT - Render sets it automatically!
   
   📖 **Need more help?** See [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md) for detailed guidance.

6. Click "Create Web Service"

#### Step 3: Initialize Database Schema

After deployment completes, run:
```bash
DATABASE_URL="<your-render-db-url>" npm run db:push
```

## Important Notes

### Free Tier Limitations

- **Web Service**: 
  - 750 hours/month (essentially 24/7 for one service)
  - Spins down after 15 minutes of inactivity
  - Cold starts take ~30 seconds (first request after sleep)
  
- **PostgreSQL**:
  - Free for 90 days
  - After 90 days: $7/month
  - 1 GB storage
  - No automatic backups on free tier

### Keeping Your App Awake

Since free tier services sleep after 15 minutes of inactivity, you can:

1. **Use a monitoring service** (like UptimeRobot - free) to ping your app every 10 minutes
2. **Upgrade to paid tier** ($7/month) for always-on service
3. **Accept the cold starts** - first request after sleep takes ~30 seconds

### Environment Variables

| Variable | Description | Set By |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Automatically set via render.yaml or manually |
| `NODE_ENV` | Environment mode | Set to `production` |
| `PORT` | Server port | Automatically set by Render |

## Monitoring and Logs

### View Logs
1. Click on your web service in Render dashboard
2. Go to "Logs" tab
3. View real-time deployment and application logs

### Check Metrics
1. Click on your web service
2. Go to "Metrics" tab (available on paid plans)
3. View response times, memory usage, etc.

### Shell Access
1. Click on your web service
2. Go to "Shell" tab
3. Get direct terminal access to your running container

## Updating Your Application

Render automatically redeploys when you push to GitHub:

1. Make changes to your code locally
2. Commit and push to GitHub:
```bash
git add .
git commit -m "Your changes"
git push
```
3. Render automatically detects changes and redeploys

### Manual Deploy

You can also trigger manual deploys:
1. Go to your web service in Render dashboard
2. Click "Manual Deploy" → "Deploy latest commit"

## Troubleshooting

### Environment Tab is Empty - No Variables Showing ⚠️

**Problem**: You go to Web Service → Environment tab and there are NO environment variables listed.

**This is a common issue!** Your app needs environment variables to run.

**Quick Fix:**
1. In the Environment tab, click **"Add Environment Variable"**
2. Add: `NODE_ENV` = `production`  
3. Add: `DATABASE_URL` = [Get from your database Connections tab]
4. Save changes and restart service

**If you used Blueprint (variables should be automatic):**
- Go to Settings → Check Branch is `copilot/set-up-railway-deployment`
- If wrong, change it and redeploy

📖 **Complete Guide:** See [EMPTY_ENVIRONMENT_TAB.md](EMPTY_ENVIRONMENT_TAB.md) for detailed step-by-step instructions

### Build Fails with "vite: not found" or Peer Dependency Errors ⚠️

**Problem**: Build fails with errors like:
```
npm error ERESOLVE could not resolve
sh: 1: vite: not found
==> Build failed 😞
```

**Root Cause**: You're deploying from the `main` branch instead of `copilot/set-up-railway-deployment` branch.

**Solution:**
1. Go to your Web Service in Render dashboard
2. Click **"Settings"**
3. Scroll to **"Build & Deploy"** section
4. Change **Branch** from `main` to `copilot/set-up-railway-deployment`
5. Click **"Save Changes"**
6. Render will automatically redeploy

📖 **Complete Fix Guide:** See [TROUBLESHOOTING_RENDER_BUILD.md](TROUBLESHOOTING_RENDER_BUILD.md) for detailed steps

### Build Fails with Other Dependency Errors

**Problem**: Build fails with dependency errors

**Solutions**:
- Check build logs in Render dashboard
- Verify build command includes `--legacy-peer-deps`
- Ensure all dependencies are in `package.json`
- Check Node.js version (should be 20.x)
- Clear build cache in Render settings and retry

### Application Crashes on Start

**Problem**: App deploys but crashes immediately

**Solutions**:
- Check logs for error messages
- Verify `DATABASE_URL` is set correctly in Environment tab
- Ensure database schema is initialized (`npm run db:push`)
- Check that build created `dist/` folder
- See [DATABASE_URL_ERROR.md](DATABASE_URL_ERROR.md) for database issues

### Database Connection Errors

**Problem**: Can't connect to database or "relation does not exist" errors

**Solutions:**
- ✅ **SSL Auto-Configured**: Latest code automatically adds SSL for Render PostgreSQL
- Verify DATABASE_URL is correct (use "External Database URL" from Render)
- Ensure PostgreSQL service is running and shows "Available" status
- Check logs for "Database schema successfully created!" message
- Database schema auto-initializes on first startup (no manual steps!)
- If still failing, see [DATABASE_INITIALIZATION_TROUBLESHOOTING.md](DATABASE_INITIALIZATION_TROUBLESHOOTING.md)

**Common Errors:**
- `error: no pg_hba.conf entry` → SSL required (auto-fixed in latest code)
- `error: relation "users" does not exist` → Schema not created (auto-fixed in latest code)
- `Unknown option '--yes'` → Invalid drizzle-kit flag (fixed in latest code)

### Site Loads as Plain Text - CSS/Assets Not Loading ⚠️

**Problem**: Site loads but appears as plain HTML without styling or layout. CSS and JavaScript files aren't being applied.

**Common Causes:**
- Static files served with incorrect MIME types
- Build artifacts not generated correctly
- Asset paths don't match file locations

**Quick Check:**
1. Open browser DevTools → Network tab
2. Check if CSS/JS files load with Status 200
3. Verify Content-Type headers:
   - CSS should be `text/css; charset=utf-8`
   - JS should be `application/javascript; charset=utf-8`
4. If Content-Type is wrong (text/plain or text/html), that's the issue

**Solution:**
The fix has been implemented in the codebase (see `Fantasy-Sports-Exchange/server/static.ts`). Ensure you're deploying from the `copilot/set-up-railway-deployment` branch which includes the fix.

📖 **Complete Guide:** See [CSS_ASSETS_NOT_LOADING.md](CSS_ASSETS_NOT_LOADING.md) for detailed troubleshooting and verification steps

### Cold Start Issues

**Problem**: App is slow on first request

**Solutions**:
- This is normal for free tier (15 min inactivity → sleep)
- Use a monitoring service to ping your app regularly
- Upgrade to paid tier ($7/month) for always-on service

### Database Expires After 90 Days

**Problem**: Free PostgreSQL expires after 90 days

**Solutions**:
- Upgrade to paid PostgreSQL ($7/month)
- Export data and recreate free database
- Switch to another free tier platform

## Render vs Railway Comparison

| Feature | Render Free | Railway Free |
|---------|-------------|--------------|
| **Web Service** | 750 hrs/month | $5 credit (~500 hrs) |
| **Database** | Free 90 days | Included in credit |
| **Credit Card** | Not required | Not required |
| **Cold Starts** | Yes (15 min) | No |
| **Auto-Deploy** | Yes | Yes |
| **Custom Domain** | Yes | Yes |
| **SSL** | Free | Free |

## Cost Information

### Free Tier
- Web Service: Free (with sleep after 15 min inactivity)
- PostgreSQL: Free for 90 days

### After Free Tier
- Web Service: $7/month (always-on)
- PostgreSQL: $7/month (after 90 days)
- Total: $14/month for production-ready hosting

### Alternatives After Free Tier
If you want to stay free after 90 days:
- **Supabase**: Free PostgreSQL forever (500 MB)
- **Neon**: Free PostgreSQL with some limits
- **PlanetScale**: Free MySQL (PostgreSQL alternative)

## Migration Path

If you need to migrate from Render later:

1. **Export Database**:
   ```bash
   pg_dump DATABASE_URL > backup.sql
   ```

2. **Switch Platform**: Follow deployment guide for new platform

3. **Import Database**:
   ```bash
   psql NEW_DATABASE_URL < backup.sql
   ```

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com/)
- [Render Status Page](https://status.render.com/)
- [Render Discord](https://discord.gg/render)

## Need Help?

If you encounter issues:
1. Check the Render logs (Logs tab in dashboard)
2. Review this guide's Troubleshooting section
3. Visit [Render Community](https://community.render.com/)
4. Check the application's README.md for more details

---

**Deployment Time**: ~10-15 minutes (including database setup)
**Cost**: Free to start (PostgreSQL free for 90 days)
**Best For**: Getting your site online immediately without payment

Happy deploying! 🚀
