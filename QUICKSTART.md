# ⚡ Quick Start - Deploy to Railway in 5 Minutes

## Step 1: Fork & Deploy (1 minute)
1. Fork this repository to your GitHub account
2. Go to [Railway.app](https://railway.app)
3. Click "Start a New Project"
4. Select "Deploy from GitHub repo"
5. Choose your forked repository

## Step 2: Add Database (30 seconds)
1. In Railway project, click "New"
2. Select "Database" → "PostgreSQL"
3. Done! `DATABASE_URL` is automatically set

## Step 3: Set Environment Variables (30 seconds)
Go to "Variables" and add:
```
NODE_ENV=production
PORT=5000
```

## Step 4: Deploy (2 minutes)
1. Click "Deploy"
2. Wait for build to complete
3. Your app is live! 🎉

## Step 5: Initialize Database (1 minute)
In Railway dashboard:
1. Open your service
2. Go to "Settings" → "Deploy" → "Shell"
3. Run: `npm run db:push`

---

## That's it! Your app is running! 🚀

Access your app at: `https://your-project.up.railway.app`

### Optional: Sync Live Data
Make a POST request to: `https://your-project.up.railway.app/api/epl/sync`

---

## Need More Details?
- 📖 [Full Deployment Guide](./README.md)
- ✅ [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)
- 🔧 [Technical Details](./IMPLEMENTATION_SUMMARY.md)

---

## Local Development?
```bash
npm install
# Set up .env file (copy from .env.example)
npm run db:push
npm run dev
```

Visit: http://localhost:5000
