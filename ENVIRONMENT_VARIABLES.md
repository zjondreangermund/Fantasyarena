# 🔐 Environment Variables Setup Guide

This guide shows you exactly what environment variables to add for your FantasyArena deployment.

---

## Quick Setup

### For Local Development

Create a `.env` file in the root directory with these variables:

```bash
# Copy and paste this into your .env file

# Database (Required)
DATABASE_URL=postgresql://user:password@localhost:5432/fantasyarena

# Environment (Required)
NODE_ENV=development

# Server Port (Optional - defaults to 5000)
PORT=5000

# Admin Users (Optional - for admin endpoints)
ADMIN_USER_IDS=54644807
```

### For Railway Deployment

Add these variables in the Railway dashboard under "Variables":

```bash
# Required
NODE_ENV=production
DATABASE_URL=<automatically set by Railway PostgreSQL>

# Optional (Railway auto-sets this)
PORT=5000

# Optional - for admin access
ADMIN_USER_IDS=54644807

# Optional - for live EPL data
API_FOOTBALL_KEY=your_api_key_here
```

---

## Complete Variable Reference

### ✅ Required Variables

#### `DATABASE_URL` (Required)
- **What it does**: PostgreSQL database connection string
- **Format**: `postgresql://username:password@host:port/database`
- **Examples**:
  - Local: `postgresql://postgres:password@localhost:5432/fantasyarena`
  - Railway: Automatically set when you add PostgreSQL service
  - Docker: `postgresql://postgres:password@fantasyarena-db:5432/fantasyarena`

**How to set up:**

**Local (Docker):**
```bash
docker run --name fantasyarena-db \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=fantasyarena \
  -p 5432:5432 -d postgres:15

# Then use:
DATABASE_URL=postgresql://postgres:password@localhost:5432/fantasyarena
```

**Local (Native PostgreSQL):**
```bash
createdb fantasyarena
# Then use:
DATABASE_URL=postgresql://localhost:5432/fantasyarena
```

**Railway:**
- Add PostgreSQL service in Railway dashboard
- `DATABASE_URL` is automatically set

---

#### `NODE_ENV` (Required)
- **What it does**: Determines if running in development or production
- **Options**: `development` or `production`
- **Default**: None (must be set)
- **Examples**:
  - Development: `NODE_ENV=development`
  - Production: `NODE_ENV=production`

**Impact:**
- Development: Enables Vite dev server, verbose logging
- Production: Serves static files, optimized builds

---

### 🔧 Optional Variables

#### `PORT` (Optional)
- **What it does**: Port the server listens on
- **Default**: `5000`
- **Railway**: Automatically set (usually 5000)
- **Example**: `PORT=5000`

---

#### `API_FOOTBALL_KEY` (Optional)
- **What it does**: API key for live EPL player data from API-Football.com
- **Without it**: App uses mock/cached data (works fine)
- **Get key at**: https://www.api-football.com/
- **Example**: `API_FOOTBALL_KEY=your_api_key_here`

**Plans:**
- Free tier: 100 requests/day
- Basic: $15/month
- Pro: $35/month

**Note:** The app works perfectly without this key using cached/mock data!

---

#### `ADMIN_USER_IDS` (Optional)
- **What it does**: Comma-separated list of user IDs with admin access
- **Default**: None (no admins)
- **Example**: `ADMIN_USER_IDS=54644807,12345678`

**Admin endpoints:**
- `POST /api/epl/sync` - Sync EPL data
- `POST /api/competitions/settle` - Settle competitions

**Note:** In Railway deployment with mock auth, the default user ID is `54644807`

---

#### `SESSION_SECRET` (Optional - Advanced)
- **What it does**: Secret key for session encryption
- **Default**: Generated automatically if not set
- **Example**: `SESSION_SECRET=your-super-secret-key-here`

**Note:** Only needed if you implement custom authentication

---

#### `REPL_ID` (Auto-set by Replit)
- **What it does**: Indicates running in Replit environment
- **Set by**: Replit automatically
- **You don't need to set this**: Only relevant in Replit deployments
- **Railway**: Leave unset (enables Railway auth bypass)

---

## Setup Instructions by Platform

### 🚀 Railway

1. **Go to Railway project** → **Variables** tab

2. **Add these variables:**
   ```
   NODE_ENV=production
   ```

3. **Add PostgreSQL service:**
   - Click "New" → "Database" → "PostgreSQL"
   - `DATABASE_URL` is automatically set

4. **Optional variables:**
   ```
   API_FOOTBALL_KEY=your_key_here
   ADMIN_USER_IDS=54644807
   ```

5. **Deploy!**

---

### 💻 Local Development

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` file:**
   ```bash
   DATABASE_URL=postgresql://postgres:password@localhost:5432/fantasyarena
   NODE_ENV=development
   PORT=5000
   ```

3. **Start database:**
   ```bash
   # Using Docker (recommended)
   docker run --name fantasyarena-db \
     -e POSTGRES_PASSWORD=password \
     -e POSTGRES_DB=fantasyarena \
     -p 5432:5432 -d postgres:15
   ```

4. **Initialize database:**
   ```bash
   npm run db:push
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

---

### 🐳 Docker

Create a `.env` file:
```bash
DATABASE_URL=postgresql://postgres:password@db:5432/fantasyarena
NODE_ENV=production
PORT=5000
```

Or use docker-compose environment variables:
```yaml
version: '3.8'
services:
  app:
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/fantasyarena
      - NODE_ENV=production
      - PORT=5000
```

---

## Validation

### Check if variables are set correctly:

```bash
# In your terminal
npm run dev

# You should see:
# ✅ "serving on port 5000"
# ✅ No "DATABASE_URL must be set" error
```

### Verify database connection:

```bash
# Try to push schema
npm run db:push

# Should succeed without errors
```

### Test the app:

```bash
# Visit in browser
http://localhost:5000

# Should load without errors
```

---

## Troubleshooting

### ❌ "DATABASE_URL must be set"
**Fix:** Add `DATABASE_URL` to your `.env` file or Railway variables

### ❌ Database connection error
**Fix:** 
1. Check PostgreSQL is running: `docker ps` or `psql -l`
2. Verify DATABASE_URL format is correct
3. Test connection: `psql $DATABASE_URL`

### ❌ Port already in use
**Fix:** 
1. Change PORT in `.env`: `PORT=3000`
2. Or kill process: `lsof -ti:5000 | xargs kill`

### ❌ "Cannot find module"
**Fix:** Run `npm install` first

---

## Security Best Practices

### ✅ DO:
- Keep `.env` file in `.gitignore` (already done)
- Use strong database passwords
- Rotate SESSION_SECRET periodically
- Restrict ADMIN_USER_IDS to trusted users only

### ❌ DON'T:
- Commit `.env` file to git
- Share your DATABASE_URL publicly
- Use weak passwords in production
- Expose API keys in client-side code

---

## Quick Reference Card

**Minimum variables for local dev:**
```bash
DATABASE_URL=postgresql://localhost:5432/fantasyarena
NODE_ENV=development
```

**Minimum variables for Railway:**
```bash
NODE_ENV=production
# DATABASE_URL is auto-set by Railway
```

**All optional variables:**
```bash
PORT=5000
API_FOOTBALL_KEY=your_key
ADMIN_USER_IDS=54644807
SESSION_SECRET=secret_key
```

---

## Need Help?

1. Check [README.md](./README.md) for full deployment guide
2. See [.env.example](./.env.example) for template
3. Review [GETTING_STARTED.md](./GETTING_STARTED.md) for setup walkthrough
4. Open an issue on GitHub

---

**Last Updated:** February 2026
**Version:** 1.0.0
