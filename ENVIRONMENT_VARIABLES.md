# Environment Variables Guide

This guide explains what environment variables your Fantasy Arena application needs and when you need to set them.

## 🎯 Quick Answer

**If you're using Render Blueprint (recommended in QUICK_START.md):**
- ✅ **You don't need to set ANY variables manually!**
- ✅ Render automatically sets everything for you
- ✅ Just deploy and you're done!

**If you're doing Manual Setup:**
- You need to set 2 variables: `NODE_ENV` and `DATABASE_URL`

---

## 📋 Required Environment Variables

### 1. DATABASE_URL (Required)
**What it is:** Connection string to your PostgreSQL database

**Format:**
```
postgresql://username:password@host:port/database
```

**Example:**
```
postgresql://user:pass@dpg-abc123.oregon-postgres.render.com:5432/fantasyarena
```

**When to set it:**

| Deployment Method | How it's set |
|-------------------|--------------|
| **Render Blueprint** | ✅ **AUTO-SET** - Render connects your database automatically |
| **Render Manual** | You paste it from your PostgreSQL database page |
| **Railway** | ✅ **AUTO-SET** - Railway connects automatically |
| **Local Development** | You set it in `.env` file pointing to your local PostgreSQL |

---

### 2. NODE_ENV (Recommended)
**What it is:** Tells the app whether it's running in development or production

**Values:**
- `production` - For deployed sites (Render, Railway, etc.)
- `development` - For local development

**When to set it:**

| Deployment Method | Value | How it's set |
|-------------------|-------|--------------|
| **Render Blueprint** | `production` | ✅ **AUTO-SET** in render.yaml |
| **Render Manual** | `production` | You type it manually |
| **Railway** | `production` | Usually auto-set or set manually |
| **Local Development** | `development` | Set in `.env` file or leave unset (defaults to development) |

---

### 3. PORT (Optional - Usually Auto-Set)
**What it is:** The port your web server listens on

**Default:** 5000

**When to set it:**

| Deployment Method | How it's set |
|-------------------|--------------|
| **Render** | ✅ **AUTO-SET** - Render sets it dynamically |
| **Railway** | ✅ **AUTO-SET** - Railway sets it dynamically |
| **Local Development** | Optional - defaults to 5000 if not set |

**Note:** You almost never need to set this manually. Cloud platforms always set it automatically.

---

## 🚀 Render Deployment (Blueprint Method)

### What Gets Auto-Set

When you use the Blueprint (recommended in QUICK_START.md), this is what happens automatically:

```yaml
# From render.yaml - These are set automatically!
envVars:
  - key: NODE_ENV
    value: production              # ✅ AUTO-SET to "production"
  - key: DATABASE_URL
    fromDatabase:
      name: fantasy-arena-db
      property: connectionString   # ✅ AUTO-SET from your database
```

### What You Need to Do

**NOTHING!** 

Just:
1. Deploy with Blueprint
2. Wait for it to finish
3. Run `npm run db:push` in the Shell

That's it! All variables are set automatically.

---

## 🛠️ Manual Setup on Render

If you're not using Blueprint, you need to manually set variables.

### Step-by-Step: Where to Add Variables

1. **After creating your Web Service**, go to the service page
2. Click **"Environment"** tab on the left
3. Click **"Add Environment Variable"**
4. Enter each variable:

```
Key: NODE_ENV
Value: production

Key: DATABASE_URL
Value: postgresql://user:pass@host:port/database
```

### Where to Get DATABASE_URL

1. Go to your **PostgreSQL database** in Render dashboard
2. Click on it to open the database page
3. Scroll down to **"Connections"** section
4. Copy the **"External Database URL"**
5. Paste that as the value for `DATABASE_URL`

**Screenshot location in Render:**
```
Dashboard → Your Database → Connections → External Database URL
```

---

## 🚂 Railway Deployment

### What Gets Auto-Set

Railway automatically sets:
- ✅ `DATABASE_URL` - When you add PostgreSQL service
- ✅ `PORT` - Set dynamically by Railway

### What You Should Set

Go to your service → Variables tab:

```
NODE_ENV = production
```

That's usually all you need!

---

## 💻 Local Development

### Create a .env File

In the root of your project, create a file named `.env`:

```env
# Database - Point to your local PostgreSQL
DATABASE_URL=postgresql://localhost:5432/fantasyarena

# Environment
NODE_ENV=development

# Port (optional - defaults to 5000)
PORT=5000
```

### How to Set Up Local Database

```bash
# 1. Install PostgreSQL (if not already installed)
# On Mac: brew install postgresql
# On Ubuntu: sudo apt-get install postgresql

# 2. Start PostgreSQL service
# On Mac: brew services start postgresql
# On Ubuntu: sudo service postgresql start

# 3. Create database
createdb fantasyarena

# 4. Set up your .env file (as shown above)

# 5. Push the schema
npm run db:push

# 6. Start dev server
npm run dev
```

---

## ❓ Troubleshooting

### "DATABASE_URL must be set" Error

**Problem:** App crashes saying DATABASE_URL is required

**Solutions:**

**If using Render Blueprint:**
- Wait for database to fully provision (takes 2-3 minutes)
- Check that database service shows "Available" in dashboard
- Restart your web service after database is ready

**If using Manual Setup:**
- Go to Environment tab
- Verify DATABASE_URL is set
- Make sure you copied the FULL connection string (starts with `postgresql://`)
- Check for typos in the connection string

**If local development:**
- Create `.env` file in project root
- Add `DATABASE_URL=postgresql://localhost:5432/fantasyarena`
- Make sure PostgreSQL is running locally

### "Cannot connect to database" Error

**Render Blueprint:**
- Database might still be provisioning - wait 2-3 minutes
- Check database status in Render dashboard
- Try restarting the web service

**Manual Setup:**
- Verify DATABASE_URL is the "External Database URL" not the "Internal Database URL"
- Ensure web service and database are in the same region
- Check database is in "Available" status

**Local:**
- Start PostgreSQL: `brew services start postgresql` (Mac) or `sudo service postgresql start` (Linux)
- Verify database exists: `psql -l | grep fantasyarena`
- Create if missing: `createdb fantasyarena`

### Variables Not Taking Effect

**Solution:** After changing environment variables:
1. Go to your service in Render/Railway dashboard
2. Click **"Manual Deploy"** or **"Restart"**
3. Wait for the new deployment to complete

Variables are only loaded when the app starts, so you need to restart/redeploy.

---

## 📝 Summary Table

| Variable | Required? | Blueprint | Manual Setup | Local Dev |
|----------|-----------|-----------|--------------|-----------|
| `DATABASE_URL` | **YES** | ✅ Auto | You set it | You set it |
| `NODE_ENV` | Recommended | ✅ Auto (`production`) | You set to `production` | `development` |
| `PORT` | Optional | ✅ Auto | ✅ Auto | Defaults to 5000 |

---

## 🎓 Understanding the Variables

### Why DATABASE_URL?

Your app needs to know where to find the PostgreSQL database. This connection string contains:
- **Host:** Where the database server is
- **Port:** Usually 5432 for PostgreSQL
- **Database name:** fantasyarena
- **Username & Password:** For authentication

### Why NODE_ENV?

This tells the app how to behave:
- **production:** Uses optimized builds, serves static files, enables caching
- **development:** Enables hot reload, detailed error messages, development tools

### Why PORT?

The app needs to know which port to listen on. Cloud platforms set this dynamically because they assign ports automatically. You rarely need to set this yourself.

---

## 🆘 Still Confused?

**For Render Blueprint users:** You don't need to set anything! Just deploy.

**For Manual Setup users:** Only set `NODE_ENV=production` and `DATABASE_URL=[your-database-url]`

**Need more help?**
- See [QUICK_START.md](QUICK_START.md) for Blueprint deployment (easiest)
- See [RENDER_DEPLOYMENT.md](RENDER_DEPLOYMENT.md) for detailed manual setup
- Check [README.md](README.md) for environment variables table

---

**Remember:** If you're following QUICK_START.md with Blueprint, variables are automatic! 🎉
