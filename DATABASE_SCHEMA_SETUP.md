# Database Schema Setup

## Overview

The Fantasy Arena application uses PostgreSQL with Drizzle ORM. The database schema is automatically initialized on first server startup in production.

## Automatic Schema Initialization

### How It Works

When the server starts in production (`NODE_ENV=production`), it automatically:

1. Checks if database tables already exist
2. If not, runs `drizzle-kit push` to create all tables
3. Verifies the schema was created successfully
4. Logs the process for debugging

This happens in `Fantasy-Sports-Exchange/server/init-db.ts` and is called from `server/index.ts`.

### First Deployment

On your first deployment to Render or Railway:

```
================================================================================
Database Initialization
================================================================================
Database schema does not exist - initializing...
Running drizzle-kit push to create database schema...
✓ Database schema successfully created!
================================================================================
11:22:39 AM [express] serving on port 10000
```

The server will:
- Create all tables defined in `shared/schema.ts`
- Create all PostgreSQL enums (rarity, position, etc.)
- Set up all foreign key relationships
- This takes 10-30 seconds on first run

### Subsequent Deployments

On subsequent deployments, the schema already exists:

```
================================================================================
Database Initialization
================================================================================
✓ Database schema already exists - skipping initialization
================================================================================
11:22:39 AM [express] serving on port 10000
```

The server will:
- Check if tables exist (< 1 second)
- Skip initialization
- Start immediately

### Idempotent Design

The initialization is **idempotent** - it's safe to run multiple times:
- If tables exist → Does nothing (fast)
- If tables don't exist → Creates them
- No risk of data loss or duplicate tables

## Database Tables Created

Based on `Fantasy-Sports-Exchange/shared/schema.ts`:

### Core Tables

- **users** - User accounts (from Replit Auth)
- **players** - Player database (Premier League, La Liga, etc.)
- **player_cards** - Individual card instances owned by users

### Game Tables

- **lineups** - User's active 5-card lineup
- **user_onboarding** - Onboarding progress and starter packs
- **competitions** - Weekly competitions (Common/Rare tiers)
- **competition_entries** - User entries in competitions

### Economy Tables

- **wallets** - User balance and locked funds
- **transactions** - All financial transactions
- **withdrawal_requests** - Pending withdrawals
- **swap_offers** - Card swap offers between users

### EPL Data Tables

- **epl_players** - Premier League player stats
- **epl_fixtures** - Match schedules and results
- **epl_injuries** - Injury reports
- **epl_standings** - League table
- **epl_sync_log** - API sync tracking

### Enums

- **rarity**: common, rare, unique, epic, legendary
- **position**: GK, DEF, MID, FWD
- **transaction_type**: deposit, withdrawal, purchase, sale, entry_fee, prize, swap_fee
- **competition_tier**: common, rare
- **competition_status**: open, active, completed
- **swap_status**: pending, accepted, rejected, cancelled
- **withdrawal_status**: pending, processing, completed, rejected
- **payment_method**: eft, ewallet, bank_transfer, mobile_money, other

## Manual Schema Management

### Push Schema Changes

If you make changes to `shared/schema.ts`, push them to the database:

```bash
npm run db:push
```

This will:
- Compare your schema to the database
- Generate and apply necessary changes
- Safe to run anytime (idempotent)

### Verify Schema

Check that tables exist:

```bash
psql $DATABASE_URL -c "\dt"
```

List all tables in the database.

### Reset Database (Development Only)

**⚠️ WARNING: This deletes all data!**

To completely reset your database:

```bash
# Drop all tables
psql $DATABASE_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Recreate schema
npm run db:push
```

## Troubleshooting

### "relation does not exist" Errors

**Problem:** API routes return 500 errors with messages like:
```
error: relation "player_cards" does not exist
error: relation "wallets" does not exist
```

**Cause:** Database tables weren't created.

**Solution:**
1. Redeploy from `copilot/set-up-railway-deployment` branch
2. Check logs for "Database schema successfully created!"
3. If still failing, manually run: `npm run db:push`

### Database Initialization Failed

**Problem:** Server logs show:
```
❌ Database initialization failed!
```

**Possible Causes:**

1. **DATABASE_URL not set**
   - Check Environment tab in Render/Railway
   - Verify DATABASE_URL exists and is correct

2. **Database not accessible**
   - Check database status in platform dashboard
   - Ensure database is "Available" not "Creating"

3. **drizzle-kit not installed**
   - Should be in dependencies (not devDependencies)
   - Verify with: `npm list drizzle-kit`

**Solution:**
- Check DATABASE_URL: `echo $DATABASE_URL`
- Test connection: `psql $DATABASE_URL -c "SELECT 1"`
- Manually push schema: `npm run db:push`

### Schema Out of Sync

**Problem:** Local changes to schema.ts not reflected in database.

**Solution:**
```bash
# Push your local schema changes
npm run db:push

# Or restart server (will auto-detect changes on next drizzle-kit push)
```

### Different Schema in Production vs Development

**Problem:** Production has different tables than development.

**Cause:** Schema changes pushed to development but not production.

**Solution:**
1. Ensure `shared/schema.ts` is committed to git
2. Redeploy to production (triggers schema update)
3. Or manually run on production: `npm run db:push`

## Schema Migration Best Practices

### Adding a New Table

1. Define table in `shared/schema.ts`:
```typescript
export const myNewTable = pgTable("my_new_table", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").notNull().references(() => users.id),
  data: text("data"),
});
```

2. Push to database:
```bash
npm run db:push
```

3. Add storage methods in `server/storage.ts`

4. Deploy - schema will auto-update on production

### Changing Existing Tables

**⚠️ WARNING:** Be careful with production data!

**Safe Changes:**
- Adding nullable columns
- Adding new tables
- Adding indexes

**Risky Changes:**
- Dropping columns (data loss!)
- Changing column types (may fail if incompatible)
- Adding NOT NULL columns to existing tables

**Recommended Approach:**
1. Test in development first
2. Backup production database before changes
3. Make changes incrementally
4. Use migrations for complex changes

### Data Migrations

For complex schema changes that need data transformation:

1. Create a migration script in `Fantasy-Sports-Exchange/migrations/`
2. Run after schema push
3. Document in deployment notes

Example:
```typescript
// migrations/001_add_level_field.ts
import { db } from "../server/db";
import { playerCards } from "../shared/schema";

// Set default level for existing cards
await db.update(playerCards)
  .set({ level: 1 })
  .where(sql`level IS NULL`);
```

## Local Development Setup

### Prerequisites

- PostgreSQL installed locally
- Database created: `createdb fantasyarena`
- `.env` file with DATABASE_URL

### Initialize Local Database

```bash
# Create database
createdb fantasyarena

# Set environment variable
echo "DATABASE_URL=postgresql://localhost:5432/fantasyarena" > .env

# Push schema (creates tables)
npm run db:push

# Start development server
npm run dev
```

The schema will be created automatically, and you can start developing.

### Seed Development Data

To add sample data for testing:

```typescript
// Run seed script (if exists)
npm run seed

// Or create seed data manually in DB
```

## Production Deployment Checklist

Before deploying:

- [ ] `shared/schema.ts` matches intended schema
- [ ] DATABASE_URL set in platform environment variables
- [ ] drizzle-kit in dependencies (not devDependencies)
- [ ] Deploying from correct branch (`copilot/set-up-railway-deployment`)
- [ ] Database shows "Available" status in platform dashboard

After deploying:

- [ ] Check logs for "Database schema successfully created!"
- [ ] Verify API routes return 200 (not 500)
- [ ] Test key functionality (wallet, cards, lineup)
- [ ] No "relation does not exist" errors

## Technical Details

### Drizzle Kit Push

`drizzle-kit push` is a schema synchronization tool that:

- Compares your TypeScript schema to actual database
- Generates SQL to make database match schema
- Applies changes automatically
- Doesn't use migration files (direct sync)
- Idempotent (safe to run multiple times)

### Schema Definition

Schema is defined using Drizzle ORM's type-safe API:

```typescript
export const tableName = pgTable("table_name", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  field: text("field").notNull(),
});
```

Benefits:
- Type-safe queries
- Automatic TypeScript types
- Schema as code (version controlled)
- No SQL writing needed

### Why Automatic Initialization?

Manual schema setup is error-prone:
- Users forget to run migrations
- Different schema between environments
- Hard to debug "table missing" errors

Automatic initialization ensures:
- ✅ Schema always matches code
- ✅ No manual steps required
- ✅ Consistent across all deployments
- ✅ Self-documenting (in logs)

## Support

If database issues persist:

1. Check [DATABASE_URL_ERROR.md](./DATABASE_URL_ERROR.md)
2. Check [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md) troubleshooting section
3. Review server logs for specific error messages
4. Verify database accessible: `psql $DATABASE_URL -c "SELECT 1"`

For schema-specific questions:
- Review `Fantasy-Sports-Exchange/shared/schema.ts`
- Check Drizzle ORM docs: https://orm.drizzle.team/
- Verify drizzle-kit installed: `npm list drizzle-kit`
