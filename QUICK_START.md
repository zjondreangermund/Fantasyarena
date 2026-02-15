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

**You don't need to set ANY variables!** The Blueprint handles everything. ✨

### Step 4: Initialize Database
After deployment completes:

1. Click on your **web service** in Render dashboard
2. Click **"Shell"** tab
3. Type this command and press Enter:
```bash
npm run db:push
```

### Step 5: Access Your Site! 🎉
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

### Database won't initialize
1. Make sure deployment finished completely
2. Wait 1-2 minutes after deploy completes
3. Try running `npm run db:push` again

### Site is slow
- **First load after sleep**: 20-30 seconds (normal on free tier)
- **After that**: Fast!
- **Solution**: Use UptimeRobot (free) to ping your site every 10 min

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
