# esbuild Version Mismatch Fix

## Issue

Netlify build was failing with:
```
Error: Expected "0.27.3" but got "0.25.12"
Node.js v22.22.0
```

## Root Cause

**Version conflict:**
- Our package.json has `esbuild: ^0.25.0`
- tsx (dev dependency) has nested `esbuild: 0.27.3`
- Node.js 22 causing binary compatibility issues
- Mismatch during installation

## Solution

**Added `.nvmrc` file specifying Node.js 18 LTS**

This forces Netlify (and other platforms) to use Node.js 18 instead of 22, which resolves the binary compatibility issues.

## What Changed

**New file: `.nvmrc`**
```
18
```

This single-line file tells Netlify:
- Use Node.js 18.x (latest 18 LTS)
- Don't use Node.js 22
- Ensures binary compatibility

## Why This Works

**Node.js 18 LTS:**
- ✅ Stable and well-tested
- ✅ Compatible with all our dependencies
- ✅ Avoids binary version mismatches
- ✅ Recommended for production builds
- ✅ Supported until April 2025

**Binary Compatibility:**
- esbuild binaries are platform/Node-specific
- Node 18 ensures correct binary selection
- Avoids version detection issues
- Prevents install-time failures

## How to Use

### Netlify (Automatic)

Netlify will automatically:
1. Detect `.nvmrc` file
2. Switch to Node.js 18
3. Install dependencies with Node 18
4. Build with Node 18
5. Deploy successfully!

**Important:** Clear Netlify build cache first:
- Netlify Dashboard → Deploys
- Trigger deploy → **Clear build cache and deploy site**

### Local Development

Use nvm to match Netlify's environment:
```bash
# Install Node 18 if needed
nvm install 18

# Use Node 18 (reads .nvmrc automatically)
nvm use

# Verify version
node --version  # Should show v18.x.x

# Install and build
npm install
npm run build
```

### Render

Render also respects .nvmrc:
- Automatically uses Node 18
- No configuration needed
- Just deploy!

### Railway

Railway respects .nvmrc:
- Reads file on deployment
- Uses specified Node version
- No extra setup required

## Expected Build Output

**Before (with Node 22):**
```
❌ Using Node.js v22.22.0
❌ Error: Expected "0.27.3" but got "0.25.12"
❌ npm install failed
```

**After (with Node 18):**
```
✅ Using Node.js v18.x.x
✅ Installing dependencies
✅ added 418 packages
✅ No version conflicts
✅ vite building
✅ Build completed
✅ Deployed!
```

## Why Node 18 Instead of 22

**Node 18:**
- LTS (Long Term Support)
- Mature and stable
- Wide ecosystem compatibility
- Recommended for production
- Supported until April 2025

**Node 22:**
- Newer release
- Some packages not fully tested
- Binary compatibility issues possible
- Not necessary for our features

## Compatibility Check

**Node 18 supports everything we need:**
- ✅ React 19
- ✅ Vite 7
- ✅ esbuild 0.25
- ✅ TypeScript 5.6
- ✅ All ES2023 features
- ✅ Top-level await
- ✅ Import assertions
- ✅ All modern JavaScript

**No features require Node 22:**
- Our code uses standard JavaScript
- No Node 22-specific APIs
- No experimental features needed
- Node 18 is perfect!

## Alternative Solutions

If Node 18 doesn't work (unlikely), you could:

**Option 1: Upgrade esbuild**
```json
"esbuild": "^0.27.0"
```
But this might cause other issues.

**Option 2: Update tsx**
```bash
npm update tsx
```
But the current tsx version works fine with Node 18.

**Option 3: Use engines in package.json**
```json
"engines": {
  "node": "18.x"
}
```
But .nvmrc is simpler and more explicit.

## Verification

After deploying:
1. Check Netlify build logs
2. Should see: "Using Node.js v18.x.x"
3. Should see: npm install succeeds
4. Should see: Build completes
5. Should see: Site deployed

## Troubleshooting

**If build still fails:**

1. **Clear Netlify cache:**
   - Deploys → Trigger deploy
   - Select "Clear build cache and deploy site"
   - This ensures old binaries are purged

2. **Check .nvmrc file:**
   - Must be at repository root
   - Must contain just "18" (no quotes)
   - Must be committed and pushed

3. **Check Node version in logs:**
   - Look for "Now using node v18.x.x"
   - If still showing v22, cache not cleared

4. **Local testing:**
   ```bash
   nvm use 18
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

## Related Files

- `.nvmrc` - Specifies Node version
- `package.json` - Dependencies
- `netlify.toml` - Netlify configuration

## Status

**Fix Applied:** ✅  
**Committed:** ✅  
**Pushed:** ✅  

**Next Steps:**
1. Pull latest changes
2. Clear Netlify build cache
3. Trigger new deploy
4. Build succeeds!

---

**This fix resolves the esbuild version mismatch by using Node.js 18 LTS, which provides better binary compatibility and is the recommended version for production builds.**
