# Image Loading Troubleshooting Guide

## Overview

This guide explains how images are served in the Fantasy Arena application and provides troubleshooting steps for image loading issues on Render.

## Current Configuration ✅

### 1. Image File Locations

**Source (Development):**
```
Fantasy-Sports-Exchange/client/public/images/
├── player-1.png
├── player-2.png
├── player-3.png
├── player-4.png
├── player-5.png
├── player-6.png
├── hero-banner.png
└── pl-lion-bg.png
```

**Production (After Build):**
```
dist/public/images/
├── player-1.png
├── player-2.png
├── player-3.png
├── player-4.png
├── player-5.png
├── player-6.png
├── hero-banner.png
└── pl-lion-bg.png
```

### 2. Image References (All Correct ✅)

**Database:**
- Uses: `/images/player-1.png`, `/images/player-2.png`, etc.
- ✅ No `/public` prefix

**Frontend:**
- Landing page: `/images/hero-banner.png`
- Background: `/images/pl-lion-bg.png`
- Player cards: Uses imageUrl from database
- ✅ No `/public` prefix

**Seed Data:**
- server/seed.ts uses: `/images/player-X.png`
- ✅ Correct format

### 3. Build Configuration

**Vite Configuration (vite.config.ts):**
```typescript
build: {
  outDir: path.resolve(__dirname, "..", "dist", "public"),
  emptyOutDir: true,
}
```
- ✅ Builds to `dist/public`
- ✅ Vite automatically copies `client/public/` contents to `dist/public/`

**Static Serving (server/static.ts):**
```typescript
const distPath = path.resolve(process.cwd(), "dist", "public");
app.use(express.static(distPath, {
  // ... MIME types configured for images
}));
```
- ✅ Serves from `dist/public`
- ✅ Correct MIME types for PNG, JPG, SVG

### 4. File Naming (Case Sensitivity)

All image files are **lowercase**:
- ✅ `player-1.png` (not `Player-1.PNG`)
- ✅ `hero-banner.png` (not `Hero-Banner.png`)

This matches the database references, so case sensitivity on Linux won't be an issue.

## Verification Steps

### On Render Production

**1. Check if images directory exists:**
```bash
ls -la /opt/render/project/src/dist/public/
```

Expected output should include `images` directory.

**2. Check images directory contents:**
```bash
ls -la /opt/render/project/src/dist/public/images/
```

Expected output:
```
player-1.png
player-2.png
player-3.png
player-4.png
player-5.png
player-6.png
hero-banner.png
pl-lion-bg.png
```

**3. Check file permissions:**
```bash
ls -l /opt/render/project/src/dist/public/images/*.png
```

All files should be readable (permission includes `r--`).

**4. Check index.html references:**
```bash
grep -i "images" /opt/render/project/src/dist/public/index.html
```

Should show references to image files.

### From Browser DevTools

**1. Check Network tab:**
- Open DevTools (F12)
- Go to Network tab
- Filter by "img" or "Img"
- Reload page
- Look for image requests

**2. Check request paths:**
- Should see: `https://yourdomain.com/images/player-1.png`
- Should NOT see: `https://yourdomain.com/public/images/player-1.png`

**3. Check response status:**
- 200 = Image loaded successfully ✅
- 404 = Image not found ❌
- 403 = Permission denied ❌

**4. Check MIME type:**
- Response header `Content-Type` should be `image/png` or `image/jpeg`

## Troubleshooting Common Issues

### Issue 1: Images Not Loading (404)

**Symptom:**
- Browser shows 404 for image requests
- Broken image icons in UI
- Network tab shows failed image requests

**Possible Causes:**

**A. Images not copied during build**

Check build logs:
```bash
# During build, Vite should show:
✓ 2347 modules transformed.
rendering chunks...
computing gzip size...
../../dist/public/index.html
../../dist/public/assets/index-*.css
../../dist/public/assets/index-*.js
```

Verify images were copied:
```bash
# In Render Shell
ls -la /opt/render/project/src/dist/public/images/
```

**Solution:** If directory is missing, rebuild:
```bash
npm run build:client
```

**B. Wrong static path configuration**

Check server logs during startup:
```
Static File Serving Configuration
Current working directory: /opt/render/project/src
Checking for build directory at: /opt/render/project/src/dist/public
Directory exists: true
Found 4 items in build directory:
  - assets
  - favicon.png
  - images  ← Should see this!
  - index.html
```

**Solution:** If `images` not listed, check build process.

**C. Incorrect image paths in database**

Check database records:
```sql
SELECT name, image_url FROM players LIMIT 5;
```

Should show:
```
Marcus Rashford  | /images/player-1.png
Bruno Fernandes  | /images/player-2.png
```

NOT:
```
Marcus Rashford  | /public/images/player-1.png  ← Wrong!
```

**Solution:** Update database if paths include `/public`:
```sql
UPDATE players SET image_url = REPLACE(image_url, '/public/images/', '/images/');
```

### Issue 2: Case Sensitivity Problems

**Symptom:**
- Images work locally (Mac/Windows) but not on Render (Linux)
- Some images load, others don't
- Database has `Player-1.PNG` but file is `player-1.png`

**Diagnosis:**
```bash
# Check actual filenames
ls -la /opt/render/project/src/dist/public/images/

# Check database references
SELECT DISTINCT image_url FROM players;
```

**Solution:**

1. Rename files to lowercase:
```bash
# If files have wrong case
cd Fantasy-Sports-Exchange/client/public/images/
rename 's/Player/player/' *.PNG
rename 's/.PNG/.png/' *.png
```

2. Update database if needed:
```sql
UPDATE players SET image_url = LOWER(image_url);
```

3. Rebuild:
```bash
npm run build
```

### Issue 3: Mixed Content Warnings

**Symptom:**
- Site is HTTPS but images load as HTTP
- Browser console: "Mixed Content: The page at 'https://...' was loaded over HTTPS, but requested an insecure image 'http://...'"

**Diagnosis:**
Check image URLs in HTML/database:
```bash
# Should NOT see http:// in image URLs
grep -r "http://.*images" Fantasy-Sports-Exchange/
```

**Solution:**

Our configuration already uses relative paths (`/images/...`), which automatically use HTTPS when site is HTTPS. ✅

If you find absolute HTTP URLs:
```typescript
// Wrong:
imageUrl: "http://example.com/images/player.png"

// Correct (relative):
imageUrl: "/images/player.png"

// Also correct (protocol-relative):
imageUrl: "//example.com/images/player.png"
```

### Issue 4: Images Not in Build Artifacts

**Symptom:**
- Build completes successfully
- Server starts fine
- Images directory missing in `dist/public/`

**Diagnosis:**
```bash
# Check if images exist in source
ls Fantasy-Sports-Exchange/client/public/images/

# Check if they're in build output
ls dist/public/images/
```

**Possible Causes:**

**A. .gitignore excluding images**

Check if images are committed:
```bash
git ls-files Fantasy-Sports-Exchange/client/public/images/
```

Should list all PNG files. If empty, they're not in git.

**Solution:**
```bash
# Make sure images aren't ignored
grep -v "\.png" .gitignore > .gitignore.tmp
mv .gitignore.tmp .gitignore

# Add images to git
git add Fantasy-Sports-Exchange/client/public/images/*.png
git commit -m "Add player images"
```

**B. Vite not copying public folder**

This should work automatically, but verify vite.config.ts:
```typescript
// Should have:
root: path.resolve(__dirname, "client"),
build: {
  outDir: path.resolve(__dirname, "..", "dist", "public"),
}
```

**Solution:** Configuration is already correct ✅

### Issue 5: Permission Denied

**Symptom:**
- 403 Forbidden errors
- "Permission denied" in logs

**Diagnosis:**
```bash
# Check file permissions
ls -l /opt/render/project/src/dist/public/images/

# Should show readable files like:
# -rw-r--r-- 1 user user 1493812 player-1.png
```

**Solution:**
```bash
# Fix permissions if needed
chmod 644 /opt/render/project/src/dist/public/images/*.png
```

## Expected Directory Structure

### After Successful Build

```
/opt/render/project/src/
├── dist/
│   ├── index.cjs (server)
│   └── public/ (client)
│       ├── assets/
│       │   ├── index-[hash].css
│       │   └── index-[hash].js
│       ├── images/ ← MUST EXIST
│       │   ├── player-1.png
│       │   ├── player-2.png
│       │   ├── player-3.png
│       │   ├── player-4.png
│       │   ├── player-5.png
│       │   ├── player-6.png
│       │   ├── hero-banner.png
│       │   └── pl-lion-bg.png
│       ├── favicon.png
│       └── index.html
```

### Server Logs Should Show

```
================================================================================
Static File Serving Configuration
================================================================================
Current working directory: /opt/render/project/src
Checking for build directory at: /opt/render/project/src/dist/public
Directory exists: true
Found 4 items in build directory:
  - assets
  - favicon.png
  - images  ← MUST BE LISTED
  - index.html
index.html exists: true
================================================================================
✓ Serving static files from: /opt/render/project/src/dist/public
✓ Static file middleware configured
```

## Quick Verification Checklist

Use this checklist to verify image loading setup:

**Build:**
- [ ] `npm run build:client` completes successfully
- [ ] `dist/public/images/` directory exists
- [ ] All 8 PNG files present in `dist/public/images/`
- [ ] File names are lowercase
- [ ] Files are committed to git

**Configuration:**
- [ ] Database uses `/images/player-X.png` (no `/public`)
- [ ] Frontend uses `/images/...` (no `/public`)
- [ ] `vite.config.ts` builds to `dist/public`
- [ ] `server/static.ts` serves from `dist/public`

**Production:**
- [ ] Build logs show successful client build
- [ ] Server startup logs show `images` directory
- [ ] Browser Network tab shows 200 for image requests
- [ ] Images display correctly on page
- [ ] No mixed content warnings

**Permissions:**
- [ ] Image files are readable (644 or similar)
- [ ] Directories are executable (755 or similar)

## Render Shell Commands Reference

Access Render Shell from your dashboard, then run:

```bash
# Navigate to project
cd /opt/render/project/src

# Check directory structure
ls -la dist/public/
ls -la dist/public/images/

# Check specific images
file dist/public/images/player-1.png
stat dist/public/images/player-1.png

# Check permissions
ls -l dist/public/images/*.png

# Search for image references
grep -r "images" dist/public/index.html

# Check server logs
tail -f /var/log/render.log
```

## Summary

**Configuration Status:** ✅ ALL CORRECT

Your image loading configuration is already set up correctly:
- ✅ Image paths don't include `/public` prefix
- ✅ All files are lowercase (case-sensitive safe)
- ✅ Vite copies images during build
- ✅ Express serves with correct MIME types
- ✅ HTTPS compatible (relative paths)

**If images aren't loading:**
1. Verify images directory was copied during build
2. Check Render Shell for file existence
3. Check browser DevTools Network tab for 404s
4. Verify no case sensitivity issues
5. Ensure files are committed to git

**Most Common Issue:**
Images not copied during build. Solution: Ensure source images are committed to git and rebuild.

---

**Need Help?**
- Check build logs for errors
- Use Render Shell to inspect filesystem
- Check browser DevTools Network tab
- Verify database image paths
