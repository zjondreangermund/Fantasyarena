# FantasyArena Deployment Guide

## 🚀 Quick Deploy to Railway

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new)

This guide will help you deploy FantasyArena to Railway in minutes.

---

## Prerequisites

- A [Railway account](https://railway.app/) (free tier available)
- A PostgreSQL database (Railway provides this)
- Node.js 20+ (for local development)

---

## Railway Deployment Steps

### 1. Create a New Project on Railway

1. Go to [Railway](https://railway.app/)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your forked `zjondreangermund/Fantasyarena` repository
5. Railway will automatically detect the Node.js project

### 2. Add PostgreSQL Database

1. In your Railway project dashboard, click **"New"**
2. Select **"Database" → "PostgreSQL"**
3. Railway will automatically provision a PostgreSQL database
4. The `DATABASE_URL` environment variable will be automatically set

### 3. Configure Environment Variables

In your Railway project settings, go to **"Variables"** and add:

**Required:**
```bash
NODE_ENV=production
DATABASE_URL=<automatically set by Railway>
PORT=5000
```

**Optional (for live EPL data):**
```bash
API_FOOTBALL_KEY=your_api_football_key_here
```

**Optional (for admin access):**
```bash
ADMIN_USER_IDS=54644807,another_user_id
```

### 4. Configure Build & Start Commands

Railway should auto-detect these from `package.json`, but verify:

**Build Command:**
```bash
npm run build
```

**Start Command:**
```bash
npm start
```

### 5. Deploy

1. Click **"Deploy"** in Railway dashboard
2. Railway will:
   - Install dependencies (`npm install`)
   - Build the client (`vite build`)
   - Build the server (`esbuild`)
   - Start the application (`node dist/index.cjs`)

3. Your app will be available at: `https://your-app-name.up.railway.app`

### 6. Initialize Database Schema

After first deployment, you need to push the database schema:

**Option A: Using Railway CLI**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Push database schema
railway run npm run db:push
```

**Option B: Using Railway Shell**
1. In Railway dashboard, go to your service
2. Click **"Settings" → "Deploy"**
3. Open the **"Shell"** tab
4. Run: `npm run db:push`

---

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/zjondreangermund/Fantasyarena.git
cd Fantasyarena
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/fantasyarena

# Environment
NODE_ENV=development

# Optional: API Keys
API_FOOTBALL_KEY=your_key_here

# Optional: Admin Users
ADMIN_USER_IDS=54644807
```

### 4. Set Up Local Database

**Using Docker:**
```bash
docker run --name fantasyarena-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=fantasyarena \
  -p 5432:5432 \
  -d postgres:15
```

**Or install PostgreSQL locally** and create a database:
```bash
createdb fantasyarena
```

### 5. Push Database Schema

```bash
npm run db:push
```

### 6. Seed Data (Optional)

The app includes an API endpoint to sync EPL data:

```bash
# Start the dev server first
npm run dev

# In another terminal, sync data
curl -X POST http://localhost:5000/api/epl/sync
```

### 7. Start Development Server

```bash
npm run dev
```

Visit: http://localhost:5000

---

## Build for Production

### Build Command
```bash
npm run build
```

This will:
1. Build client assets to `Fantasy-Sports-Exchange/dist/public/`
2. Bundle server code to `dist/index.cjs`

### Start Production Server
```bash
npm start
```

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | ✅ Yes | - | PostgreSQL connection string |
| `NODE_ENV` | ✅ Yes | - | `development` or `production` |
| `PORT` | No | `5000` | Server port (Railway auto-sets) |
| `REPL_ID` | No | - | Auto-set by Replit (not needed for Railway) |
| `API_FOOTBALL_KEY` | No | - | API-Football.com key for live EPL data |
| `ADMIN_USER_IDS` | No | - | Comma-separated user IDs with admin access |

---

## Database Schema

The application uses Drizzle ORM with PostgreSQL. Schema is defined in:
- `Fantasy-Sports-Exchange/shared/schema.ts`

### Main Tables
- `users` - User accounts
- `players` - Football players
- `player_cards` - NFT-style player cards
- `wallets` - User balances
- `transactions` - Financial transactions
- `competitions` - Fantasy competitions
- `competition_entries` - User entries
- `notifications` - User notifications
- `marketplace_trades` - Card trading history
- `user_trade_history` - Rate limiting tracking

### Migrations

To update schema:
```bash
npm run db:push
```

---

## API Endpoints

### Public Endpoints
- `GET /api/players` - List all player cards
- `GET /api/players/:id` - Get player details
- `GET /api/fantasy/standings` - EPL standings
- `GET /api/fantasy/scores` - Player scores
- `GET /api/fantasy/injuries` - Injury updates

### Authenticated Endpoints
- `GET /api/user/cards` - User's card collection
- `POST /api/marketplace/sell` - List card for sale
- `POST /api/marketplace/buy` - Buy a card
- `POST /api/marketplace/cancel` - Cancel listing
- `GET /api/notifications` - User notifications
- `PATCH /api/notifications/:id/read` - Mark as read

### Admin Endpoints
- `POST /api/epl/sync` - Sync EPL data
- `POST /api/competitions/settle` - Settle competition

---

## Troubleshooting

### Build Failures

**Issue:** `Cannot find module '@shared/schema'`
- **Fix:** Ensure `tsconfig.json` exists in root directory

**Issue:** `Top-level await not supported`
- **Fix:** This should be fixed in `vite.config.ts`. If not, check that you're using the latest version from the repo.

**Issue:** Vite build fails with plugin errors
- **Fix:** Railway environment should skip Replit plugins automatically. Check `process.env.REPL_ID` is undefined.

### Runtime Errors

**Issue:** `DATABASE_URL must be set`
- **Fix:** Verify `DATABASE_URL` is set in Railway environment variables

**Issue:** Application won't start
- **Fix:** Check Railway logs:
  1. Go to Railway dashboard
  2. Click on your service
  3. View "Deployments" → "Logs"

**Issue:** Database connection errors
- **Fix:** Ensure PostgreSQL service is running and `DATABASE_URL` is correct

### Performance Issues

**Issue:** Slow first load
- **Fix:** This is normal for Railway free tier (cold starts). Upgrade to hobby plan for always-on instances.

**Issue:** API timeouts
- **Fix:** Check if you have `API_FOOTBALL_KEY` set. Without it, the app uses mock data (no timeouts).

---

## Monitoring & Logs

### View Logs in Railway

1. Go to Railway dashboard
2. Select your project
3. Click on the service
4. Go to **"Deployments"** tab
5. Click on latest deployment
6. View logs in real-time

### Common Log Messages

**Success:**
```
serving on port 5000
Railway environment detected: Bypassing Replit Auth.
```

**Database Connected:**
```
Starting Premier League data sync...
Data synced successfully
```

---

## Scaling & Performance

### Railway Free Tier
- 512 MB RAM
- Shared CPU
- $5 free credit/month
- Sleeps after inactivity

### Railway Hobby Plan ($5/month)
- 8 GB RAM
- 8 vCPU shared
- Always-on
- Custom domains

### Optimization Tips

1. **Enable caching** - Fantasy data is cached (30min standings, 5min scores)
2. **Database indexing** - Schema includes indexes on foreign keys
3. **Connection pooling** - Drizzle ORM handles this automatically
4. **Static assets** - Served from `dist/public/` with proper caching headers

---

## Security Best Practices

### Production Checklist

- [ ] Use strong `DATABASE_URL` with random password
- [ ] Set `NODE_ENV=production`
- [ ] Restrict `ADMIN_USER_IDS` to trusted users only
- [ ] Keep `API_FOOTBALL_KEY` secret (if used)
- [ ] Enable HTTPS (Railway provides this automatically)
- [ ] Review Railway logs for suspicious activity

### Authentication

**Railway Deployment:**
- Uses mock authentication with hardcoded user ID
- **For production**, replace with real OAuth2 provider:
  - Auth0
  - Firebase Auth
  - Clerk
  - NextAuth.js

**Replit Deployment:**
- Uses Replit Auth automatically
- No additional setup needed

---

## Custom Domain Setup

### Railway Custom Domains

1. Go to Railway dashboard
2. Select your project
3. Click **"Settings"** → **"Domains"**
4. Click **"Generate Domain"** for Railway subdomain
5. Or click **"Custom Domain"** to add your own:
   - Add domain: `yourdomain.com`
   - Update DNS records as shown
   - Railway will provision SSL certificate

---

## Backup & Recovery

### Database Backups

**Automated (Railway Pro/Team):**
- Railway automatically backs up databases
- Point-in-time recovery available

**Manual Backup:**
```bash
# Using Railway CLI
railway run pg_dump $DATABASE_URL > backup.sql

# Restore
railway run psql $DATABASE_URL < backup.sql
```

---

## Cost Estimation

### Railway Free Tier
- **Cost:** $0/month + $5 free credit
- **Limits:** 500 hours/month, sleeps after 5min inactivity
- **Best for:** Development, testing, demo

### Railway Hobby Plan
- **Cost:** $5/month
- **Limits:** Unlimited usage within fair use
- **Best for:** Small production apps, side projects

### Railway Pro Plan
- **Cost:** $20/month + usage
- **Limits:** Higher resources, priority support
- **Best for:** Production apps with higher traffic

---

## Support & Resources

### Documentation
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md) - Technical details
- [Railway Docs](https://docs.railway.app/)
- [Drizzle ORM Docs](https://orm.drizzle.team/)

### Getting Help
- GitHub Issues: [Create an issue](https://github.com/zjondreangermund/Fantasyarena/issues)
- Railway Discord: [Join community](https://discord.gg/railway)

---

## What's Next?

After deployment:

1. ✅ **Test all features** - Visit your deployed app and test:
   - User registration/login
   - Card collection
   - Marketplace
   - Competitions
   - Notifications

2. ✅ **Sync EPL data** - Call `POST /api/epl/sync` to populate real player data

3. ✅ **Monitor logs** - Check Railway logs for any errors

4. ✅ **Set up custom domain** (optional)

5. ✅ **Configure real authentication** - Replace mock auth with OAuth2

---

## Contributing

Want to improve FantasyArena? PRs welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a PR

---

## License

MIT License - see LICENSE file for details

---

## Need Help?

If you encounter any issues not covered in this guide:

1. Check the [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
2. Review Railway deployment logs
3. [Open an issue](https://github.com/zjondreangermund/Fantasyarena/issues)

Happy deploying! 🚀
