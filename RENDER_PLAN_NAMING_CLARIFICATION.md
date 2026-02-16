# Render Plan Naming Clarification

## ⚠️ IMPORTANT: "starter" IS the FREE Tier!

This document clarifies Render's confusing plan naming convention.

## The Confusion

You might think:
- "starter" = paid plan
- "free" = free plan

**But that's WRONG!**

## The Truth

**Render's FREE tier is called "starter"**

```
Render Plan Names:
├── starter    → FREE ($0/month)*
├── standard   → Paid ($7/month)
├── pro        → Paid ($25/month)
└── enterprise → Paid (custom pricing)

* Free with limitations, see below
```

## There is NO Plan Called "free"

If you try to use `plan: free` in your render.yaml:

```yaml
plan: free  # ❌ ERROR: Invalid plan name
```

**Result:**
- Blueprint validation fails
- Error message: "Invalid plan name 'free'"
- Deployment blocked

## Why This is Confusing

**Render's documentation says:**
- "Free instance types"
- "Deploy for free"
- "No-cost hosting"

**But the actual plan name is:**
- `starter` (not "free", not "trial", not "basic")

## Current render.yaml (CORRECT)

```yaml
services:
  - type: web
    name: fantasy-arena-web
    plan: starter  # ✅ This IS the free tier!
    
databases:
  - name: fantasy-arena-db
    plan: starter  # ✅ This IS the free tier!
```

**Cost: $0/month** ✅

## What "starter" (Free) Includes

### Web Service (Starter/Free)
- ✅ 750 hours/month free
- ✅ 512 MB RAM
- ✅ Shared CPU
- ✅ Auto-sleep after 15 min inactivity
- ✅ Free SSL certificates
- ✅ Free custom domains

### Database (Starter/Free)
- ✅ 1 GB storage
- ✅ 97 max connections
- ✅ Free for 90 days
- ⚠️ After 90 days: Auto-sleep when inactive
- ⚠️ Suspended after 90 days of inactivity

## Plan Comparison

| Feature | Starter (FREE) | Standard (Paid) | Pro (Paid) |
|---------|---------------|-----------------|------------|
| **Cost** | $0/month | $7/month | $25/month |
| **RAM** | 512 MB | 2 GB | 4 GB |
| **CPU** | Shared | 0.5 CPU | 1 CPU |
| **Auto-sleep** | Yes (15 min) | No | No |
| **Storage** | 1 GB | 10 GB | 100 GB |

## Common Mistakes

### ❌ Wrong: Changing to "free"
```yaml
plan: free  # Error: Invalid plan
```

### ❌ Wrong: Adding runtime for "free tier"
```yaml
runtime: node  # Blocks free tier!
plan: starter
```

### ✅ Correct: Current configuration
```yaml
plan: starter  # Free tier
# No runtime    # Required for free
```

## How to Verify You're on Free Tier

After deployment, check Render Dashboard:

1. **Database:**
   - Should say: "Starter" plan
   - Should show: "Free" badge (for first 90 days)
   - Cost: $0

2. **Web Service:**
   - Should say: "Starter" plan
   - Should show: "Free" badge
   - Cost: $0

If it says "Standard" or "Pro" → You're on paid tier!

## Why Keep "starter"

**DON'T change `plan: starter` because:**

1. ✅ "starter" IS the free tier
2. ✅ Current config is correct
3. ✅ Changing to "free" will cause errors
4. ✅ It already costs $0

**Change it and:**

1. ❌ Blueprint validation fails
2. ❌ Deployment blocked
3. ❌ More frustration
4. ❌ No benefit

## What to Do

### ✅ DO THIS:
- Keep `plan: starter` as-is
- Deploy current render.yaml
- Verify "Starter" plan in dashboard
- Enjoy FREE hosting!

### ❌ DON'T DO THIS:
- Change to `plan: free`
- Add `runtime: node`
- Switch to paid plans
- Overthink it

## Summary

**The confusion:**
- Render calls it "free tier"
- But plan name is "starter"

**The solution:**
- Accept that "starter" = free
- Use `plan: starter` in render.yaml
- Don't try to change it to "free"

**The result:**
- $0/month hosting
- Working application
- No payment required

## References

- [Render Pricing](https://render.com/pricing)
- [Render Free Tier Documentation](https://render.com/docs/free)
- [Render Plans Comparison](https://render.com/docs/plans)

## Your Render.yaml is ALREADY CORRECT!

```yaml
services:
  - plan: starter  # ✅ FREE tier ($0/month)

databases:
  - plan: starter  # ✅ FREE tier ($0/month for 90 days)
```

**Don't change it. Just deploy it!** 🚀

---

*Last updated: 2026-02-16*
*Status: render.yaml is correctly configured for FREE deployment*
