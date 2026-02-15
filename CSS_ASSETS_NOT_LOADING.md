# CSS/Assets Not Loading on Render - Troubleshooting Guide

## Problem

Site loads as plain text/HTML without CSS or layout on Render deployment.

## Root Cause

This issue typically occurs when:
1. Static assets (CSS, JS) are served with incorrect MIME types
2. Asset paths don't match the actual file locations
3. Build artifacts aren't being generated correctly
4. Express.static middleware isn't configured properly

## Solution Implemented

### 1. Fixed Express Static File Serving

Updated `Fantasy-Sports-Exchange/server/static.ts` to explicitly set Content-Type headers for static files:

```typescript
app.use(express.static(distPath, {
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    // Explicitly set MIME types for common file extensions
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    } else if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css; charset=utf-8');
    }
    // ... other file types
  }
}));
```

**Why this fixes it:**
- Express normally uses the `mime` package to determine Content-Types
- In some environments, MIME types may not be correctly detected
- Explicitly setting headers ensures browsers interpret files correctly
- Without correct Content-Type, browsers may display CSS/JS as plain text

### 2. Build Configuration

The project uses Vite with the following configuration:

**File Structure:**
```
dist/
  ├── index.cjs          (Server bundle)
  └── public/            (Client static files)
      ├── index.html
      ├── assets/
      │   ├── index-[hash].js
      │   └── index-[hash].css
      └── favicon.png
```

**Vite Config** (`Fantasy-Sports-Exchange/vite.config.ts`):
```typescript
build: {
  outDir: path.resolve(__dirname, "..", "dist", "public"),
  emptyOutDir: true,
}
```

**Server serves from:**
```typescript
const distPath = path.resolve(process.cwd(), "dist", "public");
app.use(express.static(distPath));
```

### 3. Asset Path Verification

Vite automatically handles:
- ✅ Asset hashing (e.g., `index-ABC123.js`)
- ✅ Path rewriting in HTML (from `/src/main.tsx` to `/assets/index-[hash].js`)
- ✅ Base path configuration (defaults to `/` which is correct)

**Source index.html:**
```html
<script type="module" src="/src/main.tsx"></script>
```

**Built index.html (after Vite):**
```html
<script type="module" crossorigin src="/assets/index-ABC123.js"></script>
<link rel="stylesheet" crossorigin href="/assets/index-DEF456.css">
```

## Verification Steps

### 1. Check Build Output

After deployment, verify files exist:
```bash
ls -la dist/public/
ls -la dist/public/assets/
```

Should see:
- `index.html`
- `assets/index-[hash].js`
- `assets/index-[hash].css`
- `favicon.png`

### 2. Check Server Logs

Look for this log line:
```
Checking for build directory at: /app/dist/public
```

Should NOT see:
```
Could not find the build directory: /app/dist/public
```

### 3. Test Asset Loading

In browser DevTools (Network tab):
- Check that CSS files load with Status: 200
- Verify Content-Type: `text/css; charset=utf-8`
- Check that JS files load with Status: 200
- Verify Content-Type: `application/javascript; charset=utf-8`

### 4. Check for 404s

Common issues:
- ❌ `/assets/index.js` → 404 (wrong path)
- ✅ `/assets/index-ABC123.js` → 200 (correct with hash)

## Render-Specific Configuration

### Required Settings in Render Dashboard

**Build Command:**
```bash
npm install --legacy-peer-deps && npm run build
```

**Start Command:**
```bash
npm start
```

**Environment Variables:**
- `NODE_ENV` = `production`
- `DATABASE_URL` = [auto-set from database]
- `PORT` = [auto-set by Render]

**No need to set:**
- ❌ Publish Directory (not used for Node.js services)
- ❌ Static Site settings (this is a dynamic Node.js app)

### render.yaml Configuration

```yaml
services:
  - type: web
    name: fantasy-arena
    runtime: node
    buildCommand: npm install --legacy-peer-deps && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
```

## Common Issues and Solutions

### Issue 1: CSS Still Not Loading

**Symptoms:**
- Files load but appear as plain text
- DevTools shows incorrect Content-Type

**Solution:**
- Verify Content-Type headers are being set
- Check that `static.ts` changes were deployed
- Restart the Render service

### Issue 2: 404 on Asset Files

**Symptoms:**
- `GET /assets/index.js` returns 404
- Assets directory not found

**Solutions:**
- Verify build completed successfully
- Check that `npm run build` runs both build:client and build:server
- Verify `dist/public/assets/` directory exists after build

### Issue 3: Assets Load but App Doesn't Initialize

**Symptoms:**
- CSS loads correctly
- JS loads but React doesn't mount
- Console shows errors

**Solutions:**
- Check browser console for JS errors
- Verify API routes are accessible (check `/api/auth/user`)
- Check DATABASE_URL is set correctly

### Issue 4: Casing Issues

**Symptoms:**
- Works locally but fails on Render
- Case-sensitive filesystem issues

**Solutions:**
- Verify all imports match actual file casing
- Check `import './Component.tsx'` matches actual filename
- Use consistent casing (recommend PascalCase for components)

## Testing Locally

To test the production build locally:

```bash
# 1. Build the application
npm run build

# 2. Set environment variables
export NODE_ENV=production
export DATABASE_URL=postgresql://localhost:5432/fantasyarena
export PORT=5000

# 3. Start the production server
npm start

# 4. Open browser
open http://localhost:5000
```

## Debugging Tips

### 1. Check Network Tab in DevTools

Look for:
- Status codes (200 = success, 404 = not found)
- Content-Type headers
- Response previews (should show CSS/JS, not HTML)

### 2. Check Response Headers

In DevTools Network tab, click on a CSS file:
```
Content-Type: text/css; charset=utf-8  ✅ GOOD
Content-Type: text/html               ❌ BAD (shows API response)
Content-Type: text/plain              ❌ BAD (no MIME type)
```

### 3. Check Server Logs in Render

Look for:
```
✅ "Checking for build directory at: /app/dist/public"
✅ "serving on port 10000"
❌ "Could not find the build directory"
❌ "ENOENT: no such file or directory"
```

## Additional Resources

- [Express.static documentation](https://expressjs.com/en/starter/static-files.html)
- [Vite build documentation](https://vitejs.dev/guide/build.html)
- [Render Node.js deployment](https://render.com/docs/deploy-node-express-app)

## Quick Checklist

- [ ] Build completes successfully (`npm run build`)
- [ ] `dist/public/` directory exists with index.html
- [ ] `dist/public/assets/` contains JS and CSS files
- [ ] Server starts without errors (`npm start`)
- [ ] Environment variables are set (NODE_ENV, DATABASE_URL)
- [ ] Content-Type headers are correct in static.ts
- [ ] No 404 errors in browser Network tab
- [ ] CSS applies (check Elements tab for styles)
- [ ] JavaScript executes (React app mounts)

---

If you're still experiencing issues after following this guide, check:
1. Render deployment logs for build errors
2. Browser console for JavaScript errors
3. Network tab for failed requests
4. Server logs for routing issues
