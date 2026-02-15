# Database Initialization Troubleshooting

Complete guide for troubleshooting database initialization issues during deployment.

## Common Issues and Solutions

### Issue 1: "Invalid flag --yes" Error

**Symptom:**
```
Error: Unknown option '--yes'
Database initialization failed
```

**Cause:**
Older documentation or code used `--yes` flag with `drizzle-kit push`, but newer versions don't support this flag.

**Solution:** ✅ FIXED
The code now uses the correct command without the `--yes` flag:
```bash
npx drizzle-kit push --config Fantasy-Sports-Exchange/drizzle.config.ts
```

**Verification:**
Check `Fantasy-Sports-Exchange/server/init-db.ts` line 36 - should NOT have `--yes` flag.

---

### Issue 2: SSL Connection Required (Render PostgreSQL)

**Symptom:**
```
error: no pg_hba.conf entry for host
error: SSL connection required
Database initialization failed
```

**Cause:**
Render PostgreSQL requires SSL for all external connections. If DATABASE_URL doesn't include SSL parameters, connections fail.

**Solution:** ✅ FIXED
The application now automatically detects Render and adds SSL configuration:

1. **Detection:**
   - Checks `process.env.RENDER === 'true'`
   - Checks if DATABASE_URL contains 'render.com'

2. **Auto-configuration:**
   - Appends `?sslmode=require` to DATABASE_URL
   - Configures Pool with `ssl: { rejectUnauthorized: false }`
   - Applied to both runtime (db.ts) and migrations (drizzle.config.ts)

**Verification:**
Look for this message in deployment logs:
```
✓ SSL mode added to DATABASE_URL for Render PostgreSQL
```

**Manual Override (if needed):**
If you need to manually configure SSL, add to DATABASE_URL in Render dashboard:
```
postgres://user:pass@host/db?sslmode=require
```

---

### Issue 3: "relation does not exist" Errors

**Symptom:**
```
error: relation "users" does not exist
error: relation "user_onboarding" does not exist
error: relation "wallets" does not exist
```

**Cause:**
Database exists but schema (tables) were never created. This happens when:
- Database initialization fails silently
- drizzle-kit push command errors out
- SSL connection fails (see Issue 2)
- DATABASE_URL is incorrect

**Solution:**

**Check logs for initialization:**
```
================================================================================
Database Initialization
================================================================================
Database schema does not exist - initializing...
Running drizzle-kit push to create database schema...
✓ Database schema successfully created!
================================================================================
```

**If initialization failed:**

1. **Check DATABASE_URL is set:**
   - Render: Environment tab → DATABASE_URL should exist
   - Railway: Automatically set when PostgreSQL added

2. **Check database is available:**
   - Render: Database service shows "Available" status
   - Railway: Database shows "Active" status

3. **Check for SSL errors** (see Issue 2)

4. **Manual fix** (if automatic fails):
   ```bash
   # In Render Shell or locally
   npm run db:push
   ```

---

### Issue 4: drizzle-kit Not Found

**Symptom:**
```
Error: Cannot find module 'drizzle-kit'
Database initialization failed
```

**Cause:**
`drizzle-kit` not installed in production dependencies.

**Solution:** ✅ FIXED
`package.json` now includes `drizzle-kit` in `dependencies` (not just `devDependencies`).

**Verification:**
Check package.json - should see drizzle-kit in dependencies section.

---

### Issue 5: Schema Path Not Found

**Symptom:**
```
Error: Cannot find schema file
Database initialization failed
```

**Cause:**
Drizzle Kit can't find the schema file at the specified path.

**Solution:** ✅ FIXED
The config correctly points to: `./shared/schema.ts`

**Structure:**
```
Fantasy-Sports-Exchange/
  ├── drizzle.config.ts (references ../shared/schema.ts)
  └── shared/
      └── schema.ts (actual schema)
```

---

## How Automatic Initialization Works

### Process Flow

1. **Server Starts** (`server/index.ts`)
2. **Checks Production** (only runs in NODE_ENV=production)
3. **Calls initializeDatabase()** (`server/init-db.ts`)
4. **Schema Check:**
   - Queries: `SELECT 1 FROM users LIMIT 1`
   - If succeeds → Schema exists, skip initialization
   - If fails with '42P01' → Schema missing, initialize
5. **Run Migration:**
   - Executes: `drizzle-kit push`
   - Creates all tables from schema.ts
6. **Verify:**
   - Queries users table again
   - Confirms schema created successfully
7. **Continue Startup**

### Why It's Safe

- **Idempotent:** Only creates schema if it doesn't exist
- **Fast:** Skip check takes < 1 second
- **Automatic:** No manual intervention needed
- **Logged:** Clear messages about what's happening

---

## Platform-Specific Guides

### Render

**Automatic SSL Configuration:**
- Detection: Checks `RENDER=true` or 'render.com' in URL
- Configuration: Adds `sslmode=require` automatically
- Pool: Uses `ssl: { rejectUnauthorized: false }`

**Expected Logs:**
```
✓ SSL mode added to DATABASE_URL for Render PostgreSQL
Database schema does not exist - initializing...
Running drizzle-kit push to create database schema...
✓ Database schema successfully created!
```

**If Still Fails:**
1. Check Environment tab → DATABASE_URL exists
2. Check Database → Status is "Available"
3. Wait 2-3 minutes after database provision
4. Redeploy service

### Railway

**Automatic Configuration:**
- No SSL configuration needed (Railway handles it)
- DATABASE_URL automatically set when PostgreSQL added

**Expected Logs:**
```
Database schema does not exist - initializing...
Running drizzle-kit push to create database schema...
✓ Database schema successfully created!
```

**If Still Fails:**
1. Add PostgreSQL service from Railway dashboard
2. Restart web service
3. Check variables tab → DATABASE_URL exists

### Local Development

**No SSL Configuration:**
- Runs normally without SSL (local PostgreSQL)
- Uses DATABASE_URL from .env file

**Setup:**
```bash
# Create .env file
echo "DATABASE_URL=postgresql://localhost:5432/fantasyarena" > .env

# Create database
createdb fantasyarena

# Run migrations
npm run db:push

# Start dev server
npm run dev
```

---

## Debugging Commands

### Check Database Connection

**From Render Shell:**
```bash
# Test connection
psql $DATABASE_URL -c "SELECT version();"

# Check tables exist
psql $DATABASE_URL -c "\dt"
```

**From Local:**
```bash
# Test connection
psql postgresql://localhost:5432/fantasyarena -c "\dt"
```

### Manual Schema Push

If automatic initialization fails, manually push schema:

```bash
# From Render Shell or local terminal
npm run db:push
```

### View Schema

```bash
# Show all tables
psql $DATABASE_URL -c "\dt"

# Show specific table structure
psql $DATABASE_URL -c "\d users"
```

---

## Environment Variables Reference

### Required

**DATABASE_URL:**
- Format: `postgresql://user:password@host:port/database`
- Render: Automatically set by Blueprint
- Railway: Automatically set when PostgreSQL added
- Local: Set in .env file

### Optional (Auto-detected)

**RENDER:**
- Set by Render automatically
- Value: `"true"`
- Used for SSL detection

**NODE_ENV:**
- Production: "production" (triggers auto-init)
- Development: "development" (manual db:push)
- Default: "development"

---

## Success Indicators

### First Deployment (Schema Created)

```
================================================================================
Database Initialization
================================================================================
✓ SSL mode added to DATABASE_URL for Render PostgreSQL
Database schema does not exist - initializing...
Running drizzle-kit push to create database schema...

📦 Applying changes...
✔ Created table: users
✔ Created table: players
✔ Created table: player_cards
✔ Created table: wallets
✔ Created table: transactions
✔ Created table: lineups
✔ Created table: user_onboarding
✔ Created table: competitions
✔ Created table: competition_entries
✔ Created table: swap_offers
✔ Created table: withdrawal_requests
... (more tables)

✓ Database schema successfully created!
================================================================================
11:22:39 AM [express] serving on port 10000
```

### Subsequent Deployments (Schema Exists)

```
================================================================================
Database Initialization
================================================================================
✓ Database schema already exists - skipping initialization
================================================================================
11:22:39 AM [express] serving on port 10000
```

### API Routes Working

```
11:22:52 AM [express] GET /api/auth/user 200 in 3ms
11:22:53 AM [express] GET /api/wallet 200 in 8ms
11:22:54 AM [express] GET /api/cards 200 in 12ms
```

No 500 errors! ✅

---

## When to Get Help

If after following this guide:
- Schema initialization still fails
- "relation does not exist" errors persist
- SSL connection errors continue

**Provide this information:**

1. **Platform:** Render, Railway, or Local
2. **Logs:** Full output from deployment
3. **Environment:** Screenshot of Environment variables tab
4. **Database Status:** Screenshot of database service status
5. **Error Messages:** Complete error text

**Check these guides:**
- `DATABASE_SCHEMA_SETUP.md` - Comprehensive database guide
- `RENDER_DEPLOYMENT.md` - Render-specific issues
- `RAILWAY_DEPLOYMENT.md` - Railway-specific issues
- `DATABASE_URL_ERROR.md` - Connection issues

---

## Quick Reference

| Issue | Solution | Status |
|-------|----------|--------|
| `--yes` flag error | Removed flag | ✅ Fixed |
| SSL required | Auto-configured | ✅ Fixed |
| drizzle-kit missing | Added to dependencies | ✅ Fixed |
| Schema not created | Auto-initialization | ✅ Fixed |
| Manual intervention | No longer needed | ✅ Fixed |

**All database initialization issues are now resolved!** 🎉

The application automatically handles schema creation on first deployment across all platforms.
