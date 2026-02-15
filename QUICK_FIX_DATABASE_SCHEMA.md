# Quick Fix: Database Schema Push

## 🚨 Problem
Your app is crashing with:
```
ERROR: relation "wallets" does not exist
ERROR: relation "lineups" does not exist
ERROR: relation "user_onboarding" does not exist
ERROR: relation "player_cards" does not exist
```

## ✅ Good News
**Your configuration is already correct!** You just need to run the schema push.

## 🔧 Quick Fix (2 minutes)

### Option 1: Render Shell (Fastest)
1. Go to https://dashboard.render.com
2. Click on your service: **fantasy-arena**
3. Click the **"Shell"** tab
4. Run this command:
   ```bash
   npm run db:push
   ```
5. Wait for success message:
   ```
   ✓ Successfully created tables
   ```
6. Test your app - it should work now!

### Option 2: Rebuild (Recommended for long-term)
1. Go to https://dashboard.render.com
2. Click on your service: **fantasy-arena**
3. Click **"Manual Deploy"**
4. Select **"Clear build cache & deploy"**
5. Wait 5-10 minutes for build to complete
6. Check build logs for:
   ```
   Running 'npm run db:push'...
   ✓ Successfully created tables
   ```

## 📋 Verification
After running the fix, verify it worked:

```bash
# Test an API endpoint
curl https://fantasyarena.onrender.com/api/wallet

# Should return wallet data, NOT a 500 error
```

## 🎯 What This Does
The `npm run db:push` command:
- Reads your schema from `Fantasy-Sports-Exchange/shared/schema.ts`
- Connects to your Render PostgreSQL database
- Creates all required tables: wallets, lineups, user_onboarding, player_cards, etc.
- Sets up all relationships and constraints

## 🔮 Future Deployments
Your `render.yaml` is already configured to automatically run `npm run db:push` during every build, so this issue won't happen again after the first fix.

## 📚 More Details
See [PRODUCTION_DATABASE_MIGRATION_GUIDE.md](./PRODUCTION_DATABASE_MIGRATION_GUIDE.md) for:
- Detailed troubleshooting
- Alternative solutions
- Verification steps
- Prevention tips

## 🆘 Still Having Issues?
If you still see errors after running db:push:
1. Check that DATABASE_URL is set in Render Environment variables
2. Verify the database service (fantasy-arena-db) is running
3. Check build logs for any error messages during db:push
4. Review the full guide: PRODUCTION_DATABASE_MIGRATION_GUIDE.md

---

**Summary: Run `npm run db:push` in Render Shell. That's it!** ✅
