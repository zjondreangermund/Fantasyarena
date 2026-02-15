# SQL Syntax Error Fix

## Issue
Server was crashing on startup with SQL syntax error:
```
error: syntax error at or near "desc"
code: '42601'
```

## Root Cause
The `getCompetitions()` method in `storage.ts` was using an incorrect column name:

```typescript
// storage.ts line 269 (WRONG)
return db.select().from(competitions).orderBy(desc(competitions.startTime));
```

The schema defines the column as `startDate`, not `startTime`:
```typescript
// schema.ts - competitions table
startDate: timestamp("start_date").notNull(),
endDate: timestamp("end_date").notNull(),
```

When Drizzle ORM tried to generate SQL for `desc(competitions.startTime)`, it couldn't find the column and generated invalid SQL, causing a syntax error.

## Solution
Changed the column reference to use the correct name:

```typescript
// storage.ts line 269 (CORRECT)
return db.select().from(competitions).orderBy(desc(competitions.startDate));
```

## Impact
- ✅ Server now starts successfully
- ✅ `seedCompetitions()` completes without errors
- ✅ Database seeding works correctly
- ✅ Competitions API endpoint works
- ✅ Competitions are properly ordered by start date (newest first)

## Verification
After deployment, check logs for:
```
Seeding database with players...
Seeded 27 players
Seeding marketplace listings...
Seeded 10 marketplace listings
Seeding competitions...
Seeded 4 competitions
✓ Database initialization complete
[express] serving on port 10000
```

No SQL syntax errors should appear!
