# SPA Fallback Catching API Routes and Static Assets

## Problem Description

If you're experiencing these symptoms:
- ✗ API calls returning HTML instead of JSON
- ✗ CSS files showing as HTML in Network tab
- ✗ JavaScript files returning HTML
- ✗ Browser console errors: "Unexpected token '<'" (trying to parse HTML as JS)
- ✗ MIME type errors: "Refused to apply style... MIME type ('text/html') is not a supported stylesheet MIME type"

**Root Cause:** The SPA fallback route (`/*splat`) is catching ALL requests, including API routes and static assets.

## The Fix (Already Implemented)

This issue has been fixed in the `copilot/set-up-railway-deployment` branch.

### What Was Changed

Modified `Fantasy-Sports-Exchange/server/static.ts` to add intelligent exclusions to the SPA fallback route:

```typescript
app.get("/*splat", (req, res, next) => {
  const requestPath = req.path;
  
  // Skip API routes - pass to 404/error handler
  if (requestPath.startsWith('/api/')) {
    return next();
  }
  
  // Skip static assets - return 404 if file doesn't exist
  const staticExtensions = ['.js', '.css', '.png', /* ... */];
  if (staticExtensions.some(ext => requestPath.endsWith(ext))) {
    return res.status(404).send('Asset not found');
  }
  
  // Legitimate client route - serve index.html for React Router
  res.sendFile(indexPath);
});
```

### Why This Works

**Before:**
- Request `/api/cards` → Fallback catches it → Returns `index.html` → API fails
- Request `/assets/main.css` → Fallback catches it → Returns `index.html` → CSS fails
- Request `/dashboard` → Fallback catches it → Returns `index.html` → Works but for wrong reason

**After:**
- Request `/api/cards` → Fallback skips it → API route handles it → Returns JSON ✓
- Request `/assets/main.css` → express.static handles it → Returns CSS ✓
- Request `/dashboard` → Fallback handles it → Returns `index.html` → React Router works ✓

## How to Apply the Fix

### Step 1: Deploy from Correct Branch

**In Render Dashboard:**
1. Go to your web service
2. Click **Settings**
3. Find **Branch** section
4. Change to: `copilot/set-up-railway-deployment`
5. Click **Save Changes**
6. Go to **Manual Deploy** → **Deploy latest commit**

### Step 2: Wait for Deployment

Watch the deployment logs. You should see:
```
==> Running build command 'npm install --legacy-peer-deps && npm run build'...
...build output...
==> Build succeeded
==> Starting server with `node dist/index.cjs`
```

### Step 3: Verify in Server Logs

After deployment starts, check logs for:
```
================================================================================
Static File Serving Configuration
================================================================================
Current working directory: /app
Checking for build directory at: /app/dist/public
Directory exists: true
Found X items in build directory:
  - index.html
  - assets
  - favicon.png
✓ Serving static files from: /app/dist/public
✓ Static file middleware configured
```

### Step 4: Verify in Browser

**Clear your browser cache aggressively:**
- Chrome/Edge: Ctrl+Shift+Delete → Clear cached images and files
- Or: Open in Incognito/Private window

**Check DevTools Network Tab:**

1. Refresh your app
2. Open DevTools (F12) → Network tab
3. Find a CSS file (e.g., `index-ABC123.css`)
4. Check:
   - Status: **200** ✓
   - Type: **css** ✓
   - Size: **Should be kilobytes, not just bytes** ✓
   - Preview: **Should show CSS code, not HTML** ✓

5. Find a JS file (e.g., `index-ABC123.js`)
6. Check:
   - Status: **200** ✓
   - Type: **js** or **javascript** ✓
   - Size: **Should be large (100KB+)** ✓
   - Preview: **Should show JS code, not HTML** ✓

7. Try an API call (if your app makes one)
8. Check:
   - Status: **200** (or 401/403 if auth required) ✓
   - Type: **json** or **xhr** ✓
   - Preview: **Should show JSON data, not HTML** ✓

### Step 5: Verify Styling Appears

If all the above checks pass, your site should now show:
- ✓ Colors and backgrounds
- ✓ Proper layout and spacing
- ✓ Buttons and interactive elements styled correctly
- ✓ Images loading
- ✓ Fonts applying correctly

## Common Issues After Fix

### Issue 1: Still Seeing Plain Text/No Styling

**Cause:** Browser cache is very stubborn

**Solution:**
1. Hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
2. Clear site data: DevTools → Application → Clear Storage → Clear site data
3. Try different browser or Incognito mode
4. Try on mobile device or different network

### Issue 2: Console Shows "Unexpected token '<'"

**Cause:** Old JavaScript files cached

**Solution:**
1. Clear browser cache completely
2. Check Network tab - JS files should NOT show HTML content
3. Verify build succeeded in Render logs
4. Check that `dist/public/assets/` folder has JS files

### Issue 3: API Calls Still Return HTML

**Check these in order:**

1. **Did you deploy from correct branch?**
   - Settings → Branch should be `copilot/set-up-railway-deployment`

2. **Did build succeed?**
   - Check logs for "Build succeeded"

3. **Is server running?**
   - Check logs for "serving on port 10000" or similar

4. **Check the actual request in Network tab:**
   - Request URL should be `/api/something`
   - If it's returning HTML, check server logs for warnings:
     - `⚠ API route /api/cards reached SPA fallback`
     - This means the fix didn't apply - verify branch and redeploy

### Issue 4: Getting 404 on Assets That Should Exist

**Cause:** Build didn't create the asset files

**Solution:**
1. Check Render build logs for errors during `npm run build`
2. Look for Vite build errors
3. Verify build command in `render.yaml`:
   ```yaml
   buildCommand: npm install --legacy-peer-deps && npm run build
   ```
4. If build failed, fix build errors and redeploy

## Technical Deep Dive

### Why Was This Happening?

Express.js processes routes in the order they're registered:

```typescript
// index.ts
app.use(express.json());           // 1. Parse JSON
await registerRoutes(app);          // 2. Register API routes
serveStatic(app);                   // 3. Static files + fallback
```

The problem was in step 3. Inside `serveStatic()`:

```typescript
// static.ts (OLD - BROKEN)
app.use(express.static(distPath));  // Serve static files
app.get("/*splat", (req, res) => {  // Catch-all wildcard
  res.sendFile(indexPath);          // Always serve index.html
});
```

**The wildcard `/*splat` matched EVERYTHING**, including:
- `/api/cards` (should be handled by API routes)
- `/assets/main.css` (should be handled by express.static)
- `/dashboard` (should be handled by fallback - this was correct)

Even though API routes were registered first, the wildcard was catching them!

### How the Fix Works

```typescript
// static.ts (NEW - FIXED)
app.use(express.static(distPath));  // Serve static files
app.get("/*splat", (req, res, next) => {
  const path = req.path;
  
  // Explicit exclusions:
  if (path.startsWith('/api/')) return next();  // Skip to API routes
  if (hasAssetExtension(path)) return res.status(404).send('Asset not found');
  
  // Only serve index.html for client routes
  res.sendFile(indexPath);
});
```

**Key differences:**
1. **API routes:** Call `next()` to pass to 404 handler (API routes already handled or doesn't exist)
2. **Asset paths:** Return explicit 404 (if express.static didn't serve it, file doesn't exist)
3. **Client routes:** Serve index.html (legitimate SPA routes for React Router)

### Logging Added for Debugging

The fix adds warnings when things go wrong:

```typescript
// If you see this, API routes aren't working properly
console.log(`⚠ API route ${path} reached SPA fallback - this should not happen!`);

// If you see this, an asset file is missing
console.log(`⚠ Static asset ${path} reached SPA fallback - file may not exist`);

// This is normal for client routes
console.log(`SPA fallback triggered for client route: ${path} -> index.html`);
```

Check your server logs for these messages to diagnose issues.

## Prevention for Future

### When Creating New Routes

**API Routes:** Always prefix with `/api/`
```typescript
app.get('/api/users', ...)        // ✓ Good
app.get('/users', ...)            // ✗ Bad - might conflict with client routes
```

**Static Assets:** Always in `/assets/` or similar
```typescript
/assets/main.css                  // ✓ Good - served by express.static
/main.css                         // ✗ Risky - might conflict with client routes
```

**Client Routes:** Can be anything
```typescript
/dashboard                        // ✓ Good - handled by React Router
/users/profile                    // ✓ Good - handled by React Router
```

### When Modifying server/static.ts

If you need to modify the SPA fallback logic:

1. **Always check for `/api/` prefix first**
2. **Always check for asset file extensions**
3. **Only serve index.html as last resort**
4. **Add logging for debugging**

### Testing Locally

Before deploying, test the production build locally:

```bash
# Build for production
npm run build

# Start production server
NODE_ENV=production node dist/index.cjs

# Test API routes (should return JSON)
curl http://localhost:5000/api/cards

# Test static assets (should return CSS)
curl http://localhost:5000/assets/index-*.css

# Test client routes (should return HTML)
curl http://localhost:5000/dashboard
```

## Summary

**Problem:** SPA fallback was too greedy, catching all requests
**Solution:** Added explicit exclusions for API routes and static assets
**Result:** API calls return JSON, assets load correctly, client routing works

**To apply the fix:**
1. Deploy from `copilot/set-up-railway-deployment` branch
2. Clear browser cache aggressively
3. Verify in DevTools Network tab

The fix is complete and ready to use!
