# Image Loading Debug Guide

## Quick Diagnosis

If images aren't loading, follow this 5-step quick diagnosis:

1. **Check Browser DevTools Network Tab** - Look for 404 errors on image requests
2. **Verify File Paths** - Ensure using `/images/...` format (no `/public`)
3. **Check Case Sensitivity** - Filenames must match exactly (Linux is case-sensitive)
4. **Clear Browser Cache** - Hard refresh (Ctrl+Shift+R)
5. **Check Build Artifacts** - Verify images exist in `dist/public/images/`

## 1. Browser DevTools - Network Tab Inspection

### How to Inspect Image Requests

1. **Open DevTools**: Press `F12` or right-click → "Inspect"
2. **Go to Network Tab**: Click the "Network" tab
3. **Filter by Images**: Click "Img" filter button
4. **Reload Page**: Press `Ctrl+R` or `F5`
5. **Look for Failed Requests**: Red entries indicate failures

### What to Check

**Status Codes:**
- `404 Not Found` → File doesn't exist or wrong path
- `403 Forbidden` → Permission denied
- `500 Internal Server Error` → Server configuration issue
- `Mixed Content` → HTTP image on HTTPS site

**Request URL:**
- Should be: `https://your-site.com/images/player-1.png`
- NOT: `https://your-site.com/public/images/player-1.png`

**Response Headers:**
- `Content-Type`: Should be `image/png` or `image/jpeg`
- `x-powered-by: Express` → Confirms Express is serving

**Example of Failed Request:**
```
Request URL: https://fantasyarena.onrender.com/images/player-4.png
Status Code: 404 Not Found
```
→ File doesn't exist at that path or case mismatch

## 2. Browser DevTools - Console Tab

### Check for JavaScript Errors

1. Open **Console** tab in DevTools
2. Look for errors (red text):
   - CORS errors
   - Mixed content warnings
   - Path resolution errors
   - Loading failures

**Common Console Errors:**

```
Mixed Content: The page was loaded over HTTPS but requested an insecure image
```
→ Use relative paths like `/images/...` instead of `http://...`

```
GET http://site.com/images/Player-4.png 404 (Not Found)
```
→ Case sensitivity issue: `Player-4.png` vs `player-4.png`

## 3. Image Path Verification

### Correct Path Formats

**✅ CORRECT:**
```html
<img src="/images/player-1.png" alt="Player" />
<img src="/favicon.png" alt="Icon" />
<link rel="icon" href="/favicon.png" />
```

**CSS:**
```css
background-image: url('/images/hero-banner.png');
```

**Database:**
```typescript
imageUrl: "/images/player-1.png"
```

**❌ INCORRECT:**
```html
<img src="./public/images/player-1.png" />  <!-- Don't include 'public' -->
<img src="/public/images/player-1.png" />   <!-- Don't include 'public' -->
<img src="images/player-1.png" />           <!-- Missing leading slash -->
<img src="../images/player-1.png" />        <!-- Relative paths can break -->
```

### Path Resolution

**How paths resolve:**
- `/images/player-1.png` → `https://your-site.com/images/player-1.png`
- Static files served from: `dist/public/`
- Actual file location: `dist/public/images/player-1.png`
- Express serves `dist/public` as root: `/`

## 4. Case Sensitivity Issues

### Linux is Case-Sensitive!

On Render (Linux-based), file names are case-sensitive:

**Example Problem:**
```
Database: /images/player-4.png
Filesystem: player-4.PNG  ❌
Result: 404 Not Found
```

**Solution:**
```
Database: /images/player-4.png
Filesystem: player-4.png  ✅
Result: Image loads
```

### How to Check Case Sensitivity

**In Render Shell:**
```bash
# List files with exact names
ls -la /opt/render/project/src/dist/public/images/

# Should see:
# player-1.png (lowercase)
# player-2.png (lowercase)
# NOT: Player-1.PNG or PLAYER-1.png
```

**Fix Case Mismatch:**
1. Rename files to all lowercase
2. Update database references to match
3. Rebuild and redeploy

## 5. File Existence Verification

### Check if Images Exist in Production

**Render Shell Commands:**
```bash
# Navigate to project
cd /opt/render/project/src

# Check images directory
ls -la dist/public/images/

# Expected output:
# player-1.png
# player-2.png
# player-3.png
# player-4.png
# player-5.png
# player-6.png
# hero-banner.png
# pl-lion-bg.png

# Check specific file
test -f dist/public/images/player-1.png && echo "EXISTS" || echo "MISSING"

# Count PNG files
ls dist/public/images/*.png | wc -l
# Should be: 8 files

# Check favicon
ls -la dist/public/favicon.png
```

### If Images Are Missing

**Cause:** Images not copied during build

**Solution:**
1. Verify images exist in source: `Fantasy-Sports-Exchange/client/public/images/`
2. Ensure images are committed to git: `git ls-files | grep images`
3. Rebuild: Trigger new deployment on Render
4. Verify: Check Render Shell after build

## 6. External Image Links

### If Using External Images

**Test external URL:**
```bash
curl -I https://external-site.com/image.png

# Should return:
# HTTP/2 200
# content-type: image/png
```

**Common Issues:**
- External server down
- CORS restrictions
- Authentication required
- Rate limiting

**Solution:**
- Host images locally in `client/public/images/`
- More reliable and faster
- No CORS issues

## 7. Browser Cache Issues

### Clear Browser Cache

**Chrome:**
1. Press `Ctrl+Shift+Delete`
2. Select "Cached images and files"
3. Click "Clear data"

**Or use Hard Refresh:**
- Windows: `Ctrl+Shift+R`
- Mac: `Cmd+Shift+R`

**Disable Cache in DevTools:**
1. Open DevTools (`F12`)
2. Go to Network tab
3. Check "Disable cache"
4. Keep DevTools open while testing

### Browser Cache Can Cause:
- Old images showing instead of new ones
- 404 errors persisting after fixing
- Stale redirects

## 8. Browser Settings

### Verify Images Are Allowed

**Chrome:**
1. Go to `chrome://settings/`
2. Privacy and Security → Site Settings
3. Images → Should be "Sites can show images"

**Firefox:**
1. Go to `about:preferences#privacy`
2. Permissions → Block
 pop-up windows
3. Ensure images aren't blocked

**Edge:**
1. Go to `edge://settings/`
2. Cookies and site permissions → Images
3. Should be "Allow"

## 9. Browser Extensions

### Extensions That Can Block Images

- **Ad Blockers:** uBlock Origin, AdBlock Plus
- **Privacy Extensions:** Privacy Badger, Ghostery
- **Script Blockers:** NoScript, ScriptSafe

### How to Test

1. **Open Incognito/Private Window:**
   - Chrome: `Ctrl+Shift+N`
   - Extensions usually disabled by default

2. **Disable Extensions:**
   - Go to `chrome://extensions/`
   - Toggle off all extensions
   - Reload page

3. **Check Specific Extension:**
   - Right-click extension icon
   - Look for "Blocked X items"
   - Whitelist your site if needed

## 10. Server-Side: File Permissions

### Check File Permissions

**In Render Shell:**
```bash
# Check permissions
ls -la /opt/render/project/src/dist/public/images/

# Should see: -rw-r--r--  (644)
# Files should be readable by all

# If wrong permissions:
chmod 644 /opt/render/project/src/dist/public/images/*.png
chmod 755 /opt/render/project/src/dist/public/images/
```

**Permission Breakdown:**
- `644` for files: Owner can read/write, others can read
- `755` for directories: Owner full access, others read/execute

### Permission Issues Cause:
- `403 Forbidden` errors
- Images fail to load randomly
- Works locally but not in production

## 11. Server-Side: Express Configuration

### Verify Static File Serving

**Current Configuration (from static.ts):**
```typescript
// Serves from dist/public
const distPath = path.resolve(process.cwd(), "dist", "public");

// Static file middleware
app.use(express.static(distPath, {
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    }
    // ... other MIME types
  }
}));
```

**This configuration:**
- ✅ Serves files from `dist/public`
- ✅ Sets correct MIME types
- ✅ Image at `dist/public/images/player-1.png` → `/images/player-1.png`

### Test Static Serving Internally

**In Render Shell:**
```bash
# Test from inside container
curl -I http://localhost:10000/images/player-1.png

# Expected response:
# HTTP/1.1 200 OK
# Content-Type: image/png
# Content-Length: XXXX
```

## Common Issues and Solutions

### Issue 1: All Images Return 404

**Cause:** Images not copied during build

**Diagnosis:**
```bash
ls dist/public/images/
# Empty or directory doesn't exist
```

**Solution:**
1. Verify images in source: `ls Fantasy-Sports-Exchange/client/public/images/`
2. Ensure committed to git: `git add Fantasy-Sports-Exchange/client/public/images/*.png`
3. Commit and push
4. Rebuild on Render

### Issue 2: Some Images Load, Others Don't

**Cause:** Case sensitivity mismatch

**Diagnosis:**
```bash
# Check exact filenames
ls dist/public/images/

# Compare with database:
# Database: /images/player-4.png
# Filesystem: player-4.PNG  ← Case mismatch!
```

**Solution:**
1. Rename files to match database (all lowercase)
2. Or update database to match files
3. Ensure consistency

### Issue 3: Images Load Then Break

**Cause:** External link went down

**Diagnosis:**
- Images work initially
- Later return 404 or timeout
- External hosting issue

**Solution:**
- Host images locally
- Download and add to `client/public/images/`
- Update paths to local

### Issue 4: Mixed Content Warnings

**Cause:** HTTP images on HTTPS site

**Diagnosis:**
```
Console: Mixed Content: The page at 'https://...' was loaded over HTTPS, 
but requested an insecure image 'http://...'
```

**Solution:**
- Use relative paths: `/images/...` (automatically uses HTTPS)
- NOT absolute HTTP: `http://site.com/images/...`

### Issue 5: Favicon Not Showing

**Cause:** favicon.png not at root

**Diagnosis:**
```bash
ls dist/public/favicon.png
# No such file or directory
```

**Solution:**
1. Ensure `favicon.png` in `Fantasy-Sports-Exchange/client/public/`
2. Vite will copy to `dist/public/favicon.png`
3. Reference as: `/favicon.png`
4. HTML: `<link rel="icon" href="/favicon.png" />`

## Step-by-Step Debugging Process

Follow this process systematically:

### Step 1: Open DevTools Network Tab
- Press `F12`
- Click "Network" tab
- Filter by "Img"

### Step 2: Reload Page
- Press `Ctrl+R`
- Watch for red/failed requests

### Step 3: Check Failed Requests
- Click failed image request
- Note the Status Code
- Check Request URL

### Step 4: Verify Request URL Format
- Should be: `/images/player-X.png`
- Should NOT have: `/public/` prefix

### Step 5: Check Case Sensitivity
- Compare request URL case
- Check actual filename case
- Must match exactly

### Step 6: Verify File Exists
- Use Render Shell commands
- Check `dist/public/images/` directory
- Confirm file is there

### Step 7: Check File Permissions
- Run `ls -la dist/public/images/`
- Should be `644` for files
- Should be `755` for directory

### Step 8: Clear Browser Cache
- Hard refresh: `Ctrl+Shift+R`
- Or clear cache completely

### Step 9: Test in Incognito
- Open incognito window
- Disables extensions and cache
- Reload page

### Step 10: Check Server Logs
- Look for errors in Render logs
- Check for permission denied
- Look for path resolution errors

## Quick Fix Checklist

- [ ] Images exist in source: `Fantasy-Sports-Exchange/client/public/images/`
- [ ] Images committed to git: `git ls-files | grep images`
- [ ] Build completed successfully
- [ ] Images in build output: `dist/public/images/`
- [ ] Paths use `/images/...` format (no `/public`)
- [ ] Filenames are lowercase
- [ ] Filenames match database exactly
- [ ] Static serving middleware configured
- [ ] Browser cache cleared
- [ ] Extensions disabled for testing
- [ ] DevTools Network tab shows no 404s
- [ ] File permissions are 644
- [ ] Directory permissions are 755
- [ ] Console shows no CORS/mixed content errors

## Production Verification Commands

Run these commands in Render Shell to verify everything:

```bash
# Check project structure
cd /opt/render/project/src

# Verify dist/public exists
ls -la dist/public/

# Check images directory
ls -la dist/public/images/

# Count image files
ls dist/public/images/*.png | wc -l
# Expected: 8 files

# Check specific images
test -f dist/public/images/player-1.png && echo "✓ player-1.png" || echo "✗ player-1.png"
test -f dist/public/images/player-2.png && echo "✓ player-2.png" || echo "✗ player-2.png"
test -f dist/public/images/player-3.png && echo "✓ player-3.png" || echo "✗ player-3.png"
test -f dist/public/images/player-4.png && echo "✓ player-4.png" || echo "✗ player-4.png"
test -f dist/public/images/player-5.png && echo "✓ player-5.png" || echo "✗ player-5.png"
test -f dist/public/images/player-6.png && echo "✓ player-6.png" || echo "✗ player-6.png"

# Check favicon
test -f dist/public/favicon.png && echo "✓ favicon.png" || echo "✗ favicon.png"

# Check permissions
ls -l dist/public/images/*.png

# Test internal access
curl -I http://localhost:10000/images/player-1.png
# Should return: HTTP/1.1 200 OK

# Check for case sensitivity issues
find dist/public/images -name "*.PNG"
# Should return nothing (all should be .png lowercase)
```

## Expected Directory Structure

After successful build, this structure should exist:

```
dist/
└── public/
    ├── favicon.png
    ├── images/
    │   ├── player-1.png
    │   ├── player-2.png
    │   ├── player-3.png
    │   ├── player-4.png
    │   ├── player-5.png
    │   ├── player-6.png
    │   ├── hero-banner.png
    │   └── pl-lion-bg.png
    ├── assets/
    │   ├── index-[hash].css
    │   └── index-[hash].js
    └── index.html
```

## Summary

**Most Common Issues:**
1. Images not committed to git → Not in build artifacts
2. Case sensitivity mismatch → 404 on Linux
3. Wrong path format → Using `/public/images/` instead of `/images/`
4. Browser cache → Showing old/cached errors
5. File permissions → 403 Forbidden errors

**Quick Fixes:**
1. Commit images to git
2. Use lowercase filenames
3. Use `/images/...` path format
4. Clear browser cache
5. Check file permissions (644)

**Configuration is Correct if:**
- ✅ Paths use `/images/...` (no `/public`)
- ✅ Files are lowercase
- ✅ Express serves from `dist/public`
- ✅ MIME types set correctly
- ✅ Images copied during build

**Still Having Issues?**
- Follow the 10-step debugging process above
- Use DevTools Network tab systematically
- Check Render Shell with verification commands
- Verify every item in the checklist

This guide should help you identify and fix any image loading issues in development or production!
