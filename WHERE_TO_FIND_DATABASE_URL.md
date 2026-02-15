# Where to Find DATABASE_URL in Render

If you're doing **Manual Setup** and need to find your DATABASE_URL, here's exactly where to look:

## Step-by-Step Visual Guide

### 1. Go to Your Database

```
Render Dashboard
  └── Your Projects
      └── [Your PostgreSQL Database]  👈 Click here
```

### 2. Navigate to Connections

Once on your database page:

```
Database Page
  ├── Info (tab)
  ├── Connections (tab)  👈 Click here
  ├── Metrics (tab)
  └── Settings (tab)
```

### 3. Find External Database URL

In the Connections section, you'll see:

```
┌─────────────────────────────────────────────────────────────┐
│  Connections                                                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Internal Database URL                                       │
│  postgres://...internal...                                   │
│  [Copy] button                                               │
│                                                              │
│  External Database URL  👈 THIS IS WHAT YOU NEED!           │
│  postgresql://user:abc123@dpg-xyz.oregon-postgres...        │
│  [Copy] button  👈 CLICK THIS                               │
│                                                              │
│  PSQL Command                                                │
│  psql postgres://...                                         │
│  [Copy] button                                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 4. Copy the URL

Click the **Copy** button next to "External Database URL"

The URL will look like:
```
postgresql://username:password@hostname.oregon-postgres.render.com:5432/database
```

### 5. Use It

Paste this URL as the value for `DATABASE_URL` environment variable in your web service.

---

## Important Notes

### ❌ Don't Use Internal Database URL

The **Internal Database URL** only works within Render's internal network. 

For your web service to connect, you **MUST** use the **External Database URL**.

### ✅ Use External Database URL

This URL can be accessed from your web service and includes:
- Hostname (publicly accessible)
- Port (usually 5432)
- Username and password
- Database name

### 🔒 Keep It Secret

This URL contains your database password! 

- Don't commit it to git
- Don't share it publicly
- Only paste it in Render's Environment Variables (which are encrypted)

---

## Quick Reference

**Where:** Render Dashboard → PostgreSQL Database → Connections tab

**What:** External Database URL (NOT Internal)

**Format:** `postgresql://user:pass@host.render.com:5432/dbname`

**Action:** Click Copy button, paste as DATABASE_URL value

---

## Still Stuck?

See [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md) for complete troubleshooting guide.
