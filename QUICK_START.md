# 🚀 Quick Start: Deploy Your Site for FREE

You exceeded Railway's free tier. Here's how to get your Fantasy Arena site online **RIGHT NOW** for free!

> **💡 About Environment Variables:** When you use Blueprint (this guide), **all environment variables are set automatically**! You don't need to configure anything. Just deploy and go! 
> 
> For details on variables or manual setup, see [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md)

## ⚡ Fastest Way (10 Minutes)

### Step 1: Sign Up
Go to **[render.com](https://render.com)** and click "Get Started"
- Sign up with your GitHub account
- **No credit card required!** ✅

### Step 2: Deploy with Blueprint
1. In Render dashboard, click **"New +"**
2. Select **"Blueprint"**
3. Connect your GitHub account (if not already connected)
4. Select your **"Fantasyarena"** repository
5. **IMPORTANT:** Before clicking "Apply", click "Advanced" and:
   - Change **Branch** to: `copilot/set-up-railway-deployment`
   - (This branch has all the deployment configuration)
6. Click **"Apply"**

> **⚠️ Common Issue:** If you get build errors like "vite: not found" or peer dependency errors, you deployed from the wrong branch. See [TROUBLESHOOTING_RENDER_BUILD.md](TROUBLESHOOTING_RENDER_BUILD.md) for the fix!

### Step 3: Wait for Deploy (5-10 minutes)
Render will automatically:
- ✅ Create your web service
- ✅ Create PostgreSQL database
- ✅ Build your app
- ✅ Connect everything together
- ✅ **Set all environment variables automatically** (DATABASE_URL, NODE_ENV, PORT)
- ✅ **Initialize database schema automatically** (creates all tables on first startup)

**You don't need to set ANY variables or run ANY commands!** The Blueprint handles everything. ✨

### Step 4: Access Your Site! 🎉
- Find your URL in the Render dashboard
- It will look like: `https://fantasy-arena.onrender.com`
- **Your site is live!**

---

## 💰 What This Costs

### Free for 90 Days:
- ✅ Web service: FREE (with 15-min sleep on inactivity)
- ✅ PostgreSQL database: FREE for 90 days

### After 90 Days:
- **Option 1**: Upgrade to paid ($14/month for both)
- **Option 2**: Move DB to Supabase (free forever, keep Render free web service)
- **Option 3**: Recreate free database (90 more days free)

---

## 🆘 Troubleshooting

### Environment tab is empty - no variables showing
**Problem:** Looking at Web Service → Environment tab and there are no environment variables

**This is the issue!** Your app needs `NODE_ENV` and `DATABASE_URL` to run.

**Quick Fix:**
1. Click **"Add Environment Variable"** in the Environment tab
2. Add: `NODE_ENV` = `production`
3. Add: `DATABASE_URL` = [Copy from your database Connections tab]
4. Save changes

**If using Blueprint and variables should be automatic:**
- Check Settings → Branch is set to `copilot/set-up-railway-deployment`
- If wrong branch, change it and redeploy

📖 **Complete guide:** [EMPTY_ENVIRONMENT_TAB.md](EMPTY_ENVIRONMENT_TAB.md) with step-by-step instructions

### ⚠️ CRITICAL: API calls return HTML or CSS files show HTML content
**Problem:** SPA fallback route is catching all requests including API and assets

**Symptoms:**
- API routes return `<!DOCTYPE html>` instead of JSON
- CSS/JS files contain HTML in Network tab preview
- Console error: "Unexpected token '<'"
- MIME type error: "Refused to apply style... MIME type ('text/html')"

**Solution:**
1. This fix is already in `copilot/set-up-railway-deployment` branch
2. Deploy from that branch (Settings → Branch → change to copilot/set-up-railway-deployment)
3. Wait for deployment to complete
4. Clear browser cache (Ctrl+Shift+R or Incognito)

📖 **Complete guide:** [SPA_FALLBACK_ISSUE.md](SPA_FALLBACK_ISSUE.md) with detailed explanation and verification steps

### App crashes with "DATABASE_URL must be set" error
**Problem:** Database isn't connected or DATABASE_URL environment variable is missing

**Solutions:**
- **If database is still provisioning:** Wait 2-3 minutes and check status in Render dashboard
- **If database failed:** Check database service shows "Available" status
- **If using Blueprint:** DATABASE_URL should be auto-set; verify in Environment tab
- **If manual setup:** Add DATABASE_URL from database "External Database URL"

📖 **Complete guide:** [DATABASE_URL_ERROR.md](DATABASE_URL_ERROR.md) with solutions for all scenarios

### Build fails with "vite: not found" or peer dependency errors
**Problem:** You deployed from the wrong branch (main instead of copilot/set-up-railway-deployment)

**Solution:**
1. Go to your Web Service in Render → **Settings**
2. Change **Branch** to `copilot/set-up-railway-deployment`
3. Save and redeploy

📖 **Full guide:** [TROUBLESHOOTING_RENDER_BUILD.md](TROUBLESHOOTING_RENDER_BUILD.md)

### "Blueprint not found"
1. Make sure you pushed the latest code to GitHub
2. Refresh your GitHub connection in Render
3. Try Manual Setup instead (see RENDER_DEPLOYMENT.md)

### Build fails
1. Check Render logs for error details
2. Ensure you have `render.yaml` in your repository
3. See full troubleshooting in RENDER_DEPLOYMENT.md

### Database won't initialize / "relation does not exist" errors
**Problem:** API routes return 500 errors with messages like:
- `error: relation "player_cards" does not exist`
- `error: relation "wallets" does not exist`
- `error: relation "user_onboarding" does not exist`

**This is CRITICAL!** Your database exists but tables weren't created.

**Solution:**
1. The fix is already in `copilot/set-up-railway-deployment` branch
2. Redeploy from that branch (will auto-create tables on startup)
3. Check logs for "Database schema successfully created!"
4. If still failing, see DATABASE_SCHEMA_SETUP.md

**Why this happens:**
- Database was provisioned ✅
- DATABASE_URL was set ✅
- But schema (tables) weren't created ❌

**After the fix:**
- Tables auto-create on first server startup
- Takes 10-30 seconds on first deploy
- Future deploys skip this (< 1 second check)

📖 **Complete guide:** [DATABASE_SCHEMA_SETUP.md](DATABASE_SCHEMA_SETUP.md) with technical details

### Site is slow
- **First load after sleep**: 20-30 seconds (normal on free tier)
- **After that**: Fast!
- **Solution**: Use UptimeRobot (free) to ping your site every 10 min

### Site loads but no CSS/styling appears
**Problem:** Page loads as plain HTML without any layout or styling

**Quick Fix:**
1. Check browser DevTools → Network tab
2. Look at CSS/JS files - do they have Status 200?
3. Check Content-Type headers (should be text/css and application/javascript)
4. If Content-Type is wrong, redeploy from correct branch

📖 **Complete guide:** [CSS_ASSETS_NOT_LOADING.md](CSS_ASSETS_NOT_LOADING.md)

### I see all text but "no pics, background, etc"
**Problem:** All content visible but no styling, colors, backgrounds, or images

**This is the same as above** - your CSS isn't loading. Follow the fix above or see:

📖 **Step-by-step fix:** [NO_STYLING_VISIBLE.md](NO_STYLING_VISIBLE.md) - made specifically for this symptom

### Still not working after following all steps?

**Problem:** Followed all troubleshooting but STILL seeing plain text with no styling

If you:
- ✅ Redeployed from correct branch
- ✅ Cleared browser cache
- ✅ Waited 10+ minutes
- ❌ Still seeing plain text

📖 **Deep troubleshooting:** [STILL_NOT_WORKING.md](STILL_NOT_WORKING.md) - comprehensive diagnostic guide

---

## 📚 Need More Info?

- **Detailed Guide**: [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md)
- **Compare Platforms**: [HOSTING_ALTERNATIVES.md](HOSTING_ALTERNATIVES.md)
- **Full Documentation**: [README.md](README.md)

---

## ⏱️ Timeline

| Task | Time |
|------|------|
| Sign up on Render | 1 minute |
| Deploy with Blueprint | 5-10 minutes |
| Initialize database | 1 minute |
| **Total** | **~10-15 minutes** |

---

## ✅ Checklist

- [ ] Sign up at [render.com](https://render.com)
- [ ] Click "New +" → "Blueprint"
- [ ] Select your Fantasyarena repository
- [ ] Click "Apply" and wait for deployment
- [ ] Run `npm run db:push` in Shell tab
- [ ] Access your site at the Render URL
- [ ] 🎉 Celebrate - your site is live!

---

## 🔄 Alternative If You Need It

If Render doesn't work for you, see [HOSTING_ALTERNATIVES.md](HOSTING_ALTERNATIVES.md) for 6 other free options including:
- Fly.io (requires credit card for verification)
- Vercel + Supabase (requires app restructuring)
- Koyeb (simple alternative)

But **Render is your best bet** for getting online quickly and free! 🚀

---

**Questions?** Check [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md) for full troubleshooting guide.
