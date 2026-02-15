# Production Database Migration Guide

## Issue: "relation does not exist" Errors (PostgreSQL 42P01)

You're seeing errors like:
```
ERROR: relation "wallets" does not exist
ERROR: relation "lineups" does not exist
ERROR: relation "user_onboarding" does not exist
ERROR: relation "player_cards" does not exist
```

This means your database schema hasn't been pushed to production yet.

## Good News: Configuration is Already Correct! ✅

Your repository is **already properly configured** for automatic schema push:

1. ✅ **render.yaml** (line 7): Build command includes `npm run db:push`
   ```yaml
   buildCommand: npm install --legacy-peer-deps && npm run build && npm run db:push
   ```

2. ✅ **package.json** (line 13): Script is defined
   ```json
   "db:push": "drizzle-kit push --config Fantasy-Sports-Exchange/drizzle.config.ts"
   ```

3. ✅ **drizzle.config.ts**: Correctly configured
   ```typescript
   export default {
     schema: "./shared/schema.ts",
     out: "./drizzle",
     driver: "pg",
     dbCredentials: {
       connectionString: process.env.DATABASE_URL!,
     },
   } satisfies Config;
   ```

4. ✅ **Schema file**: Contains all required tables (wallets, lineups, user_onboarding, player_cards)

## Why It Hasn't Run Yet

The schema push may not have run because:

1. **First deployment** was before `npm run db:push` was added to the build command
2. **Build phase failed** or was interrupted before reaching db:push
3. **DATABASE_URL** wasn't available during the build phase
4. **Silent failure** in the build logs

## Solution: 3 Methods to Push Schema

### Method 1: Trigger a Rebuild (Recommended)

1. Go to your Render Dashboard
2. Navigate to your web service (fantasy-arena)
3. Click **"Manual Deploy"** → **"Clear build cache & deploy"**
4. Wait for the build to complete
5. Check the build logs for:
   ```
   Running 'npm run db:push'...
   [drizzle-kit] Tables created successfully
   ```

### Method 2: Run in Render Shell (Quick Fix)

1. Go to your Render Dashboard
2. Navigate to your web service (fantasy-arena)
3. Click **"Shell"** tab
4. Run this command:
   ```bash
   npm run db:push
   ```
5. You should see output like:
   ```
   [drizzle-kit] Pushing schema...
   [drizzle-kit] ✓ Tables created
   ```

### Method 3: Manual SQL (If above methods fail)

If you need to run migrations manually:

1. Go to Render Dashboard → fantasy-arena-db
2. Click **"Connect"** → **"External Connection"**
3. Copy the connection string
4. Use a PostgreSQL client (like psql or DBeaver) to connect
5. Run the schema creation SQL (drizzle-kit will generate this)

## Verification Steps

After running the schema push, verify it worked:

### 1. Check Build Logs
Look for these lines in your Render build logs:
```
> rest-express@1.0.0 db:push
> drizzle-kit push --config Fantasy-Sports-Exchange/drizzle.config.ts

[drizzle-kit] Reading config file
[drizzle-kit] Pushing schema to database...
✓ Successfully created tables
```

### 2. Test API Endpoints
Try these endpoints to confirm tables exist:
```bash
# Check wallet endpoint
curl https://fantasyarena.onrender.com/api/wallet

# Should return wallet data, NOT a 500 error
```

### 3. Check Render Logs
Your application logs should no longer show:
```
❌ ERROR: relation "wallets" does not exist
```

Instead you should see:
```
✓ Database connection successful
✓ Serving API routes
```

## Expected Tables

After schema push, these tables will be created:

| Table Name | Purpose |
|------------|---------|
| `users` | User accounts |
| `players` | Player data |
| `player_cards` | Cards owned by users |
| `wallets` | User wallet balances |
| `transactions` | Financial transactions |
| `lineups` | User lineup configurations |
| `user_onboarding` | Onboarding status |
| `competitions` | Competition data |
| `competition_entries` | User competition entries |
| `swap_offers` | Card swap offers |
| `withdrawal_requests` | Withdrawal requests |
| `epl_players` | EPL player data |
| `epl_fixtures` | EPL fixtures |
| `epl_injuries` | EPL injury data |
| `epl_standings` | EPL standings |
| `epl_sync_log` | EPL data sync log |

Plus various enums: `rarity`, `position`, `transaction_type`, etc.

## Troubleshooting

### Issue: "Cannot find module drizzle-kit"

**Cause**: drizzle-kit not installed

**Fix**: Already resolved - drizzle-kit is in dependencies (not devDependencies)

### Issue: "Invalid connection string"

**Cause**: DATABASE_URL not set during build

**Solution**:
1. Go to Render Dashboard → your service → Environment
2. Verify `DATABASE_URL` is set and connected to `fantasy-arena-db`
3. The render.yaml should auto-connect this:
   ```yaml
   envVars:
     - key: DATABASE_URL
       fromDatabase:
         name: fantasy-arena-db
         property: connectionString
   ```

### Issue: "Permission denied"

**Cause**: Database user doesn't have permission

**Fix**: This shouldn't happen with Render's auto-provisioned databases, but if it does:
1. Check that the database user has CREATE TABLE permissions
2. Verify you're connecting to the correct database

### Issue: "SSL certificate error"

**Cause**: PostgreSQL SSL configuration

**Fix**: Already handled in `db.ts` with:
```typescript
ssl: isProduction ? { rejectUnauthorized: false } : false
```

## Prevention: Future Deployments

With the current configuration, future deployments will automatically:

1. Install dependencies (`npm install --legacy-peer-deps`)
2. Build the application (`npm run build`)
3. **Push database schema** (`npm run db:push`) ← Automatic!
4. Start the server (`npm start`)

The schema push runs **during the build phase**, ensuring your database is always up to date.

## Need Help?

If you're still seeing "relation does not exist" errors after:
1. Rebuilding the app
2. Running db:push manually
3. Checking the build logs

Then check:
- Does DATABASE_URL point to the correct database?
- Are there any error messages in the build logs?
- Does the database user have CREATE TABLE permissions?

## Summary

**Your configuration is correct!** You just need to trigger the schema push:

✅ **Quickest Solution**: Run `npm run db:push` in Render Shell

✅ **Best Solution**: Trigger a rebuild to test the full build pipeline

The schema will then be automatically maintained on all future deployments.
