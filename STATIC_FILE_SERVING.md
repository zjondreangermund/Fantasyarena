# Static File Serving for Production - Technical Guide

## Overview

This document explains how static files (CSS, JS, images) are served in production on Render. If you're experiencing issues with static files not loading, this guide will help you understand and debug the setup.

## Build Structure

The application uses a **monorepo structure** with separate client and server builds:

```
Project Root
├── Fantasy-Sports-Exchange/
│   ├── client/          # React/Vite frontend source
│   ├── server/          # Express backend source
│   └── vite.config.ts   # Vite configuration
├── dist/                # Build output (created during deploy, not in git)
│   ├── index.cjs        # Bundled server (from esbuild)
│   └── public/          # Built frontend (from Vite)
│       ├── index.html
│       ├── assets/
│       │   ├── index-[hash].js
│       │   └── index-[hash].css
│       └── favicon.png
├── package.json         # Root package.json with build scripts
└── render.yaml          # Render deployment configuration
```

## How It Works

### 1. Build Process (on Render)

When deploying to Render, the following happens:

```bash
# Render runs this command (from render.yaml):
npm install --legacy-peer-deps && npm run build

# Which expands to:
npm run build:client  # Vite builds React app to dist/public/
npm run build:server  # esbuild bundles server to dist/index.cjs
```

**Vite Build (Client):**
- Source: `Fantasy-Sports-Exchange/client/`
- Output: `dist/public/`
- Configuration: `Fantasy-Sports-Exchange/vite.config.ts`
- Result: index.html + assets/ folder with hashed JS/CSS files

**esbuild Bundle (Server):**
- Source: `Fantasy-Sports-Exchange/server/index.ts`
- Output: `dist/index.cjs` (single file)
- Bundles all server code into one file
- Excludes node_modules dependencies (external)

### 2. Server Start (Production)

```bash
# Render runs:
npm start

# Which runs:
NODE_ENV=production node dist/index.cjs
```

The server starts from `dist/index.cjs` and:
1. Registers API routes
2. Calls `serveStatic(app)` to set up static file serving
3. Listens on the PORT environment variable

### 3. Static File Serving Configuration

Located in: `Fantasy-Sports-Exchange/server/static.ts`

```typescript
export function serveStatic(app: Express) {
  // Resolve path from project root
  const distPath = path.resolve(process.cwd(), "dist", "public");
  
  // Serve static files with explicit MIME types
  app.use(express.static(distPath, {
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
      // Set explicit Content-Type headers
      if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css; charset=utf-8');
      }
      // ... other file types
    }
  }));
  
  // SPA fallback route for React Router
  app.get("/*splat", (req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
```

## Path Resolution

**Critical Detail:** The server is bundled to `dist/index.cjs`, but `process.cwd()` returns the **project root**, not `dist/`.

**Correct Path Resolution:**
```typescript
// ✅ CORRECT: Resolves from project root
path.resolve(process.cwd(), "dist", "public")
// On Render: /app/dist/public

// ❌ WRONG: Would look relative to dist/
path.resolve(__dirname, "public")
// Would try: /app/dist/public (incorrect when server is in dist/)
```

## Request Flow

### Static Asset Request (e.g., `/assets/index-ABC123.css`)

1. **Request arrives:** GET `/assets/index-ABC123.css`
2. **Express.static middleware:** Checks `dist/public/assets/index-ABC123.css`
3. **File found:** Serves file with `Content-Type: text/css; charset=utf-8`
4. **Browser:** Receives CSS and applies styles ✅

### SPA Route Request (e.g., `/dashboard`)

1. **Request arrives:** GET `/dashboard`
2. **API routes:** Not matched (doesn't start with `/api`)
3. **Express.static:** Not a file in `dist/public/`
4. **SPA fallback:** Matches `/*splat` route
5. **Server:** Returns `dist/public/index.html`
6. **React Router:** Takes over and renders `/dashboard` component ✅

## Content-Type Headers

**Why Explicit Headers?**

Express.static normally uses the `mime` package to detect Content-Types automatically. However, in some containerized environments (like Render), MIME type detection can fail, causing CSS and JS files to be served as `text/plain`, which browsers ignore.

**Solution:** Explicitly set Content-Type headers for all common file types.

```typescript
setHeaders: (res, filePath) => {
  if (filePath.endsWith('.css')) {
    res.setHeader('Content-Type', 'text/css; charset=utf-8');
  } else if (filePath.endsWith('.js')) {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  }
  // ... other types
}
```

## Debugging Static File Issues

### Check 1: Is Build Directory Created?

The server logs this on startup:

```
================================================================================
Static File Serving Configuration
================================================================================
Current working directory: /app
__dirname would be: /app/dist
Checking for build directory at: /app/dist/public
Directory exists: true
Found 3 items in build directory:
  - index.html
  - assets
  - favicon.png
index.html exists: true
================================================================================
```

**If "Directory exists: false":**
- Build didn't complete
- Check Render build logs for errors
- Verify `npm run build` succeeds locally

### Check 2: Are Files Being Served?

Look for requests in server logs:

```
SPA fallback triggered for: /dashboard -> /app/dist/public/index.html
```

**If you see this for CSS/JS files:**
- Files aren't in build directory
- Path resolution is wrong
- Check build output

### Check 3: Content-Type Headers

In browser DevTools → Network tab:
1. Refresh page
2. Click on CSS file
3. Check Response Headers

**Should see:**
```
Content-Type: text/css; charset=utf-8
Status: 200
```

**If you see:**
```
Content-Type: text/plain
```
or
```
Content-Type: text/html
```

Then Content-Type headers aren't being set correctly.

### Check 4: Render Build Logs

In Render Dashboard → Logs → Look for:

```
✓ built in 45s  # Vite build succeeded
Build completed successfully
```

**If you see:**
```
sh: 1: vite: not found
npm ERR! Failed at build script
```

Build failed - fix build errors first.

## Common Issues & Solutions

### Issue 1: "Could not find build directory"

**Error:**
```
Error: Could not find the build directory: /app/dist/public
Build artifacts missing.
```

**Cause:** Build didn't complete or failed.

**Solution:**
1. Check Render build logs for errors
2. Verify `npm run build` works locally
3. Ensure `dist/` is in `.gitignore` (so Render builds it)
4. Check that render.yaml has correct buildCommand

### Issue 2: CSS/JS Files Return 404

**Symptoms:** 
- HTML loads
- CSS/JS return 404 Not Found

**Cause:** Files not in build directory or wrong paths

**Solution:**
1. Check build output in logs - should show asset files created
2. Verify Vite config output path: `dist/public`
3. Check `distPath` in static.ts matches Vite output

### Issue 3: Files Load but Wrong Content-Type

**Symptoms:**
- Files return 200 OK
- Content-Type is `text/plain` or `text/html`
- Browser doesn't apply CSS

**Cause:** setHeaders not working

**Solution:**
- This should be fixed with current code
- Verify you're deploying from correct branch
- Check that static.ts has setHeaders function

### Issue 4: SPA Routes Return 404

**Symptoms:**
- Direct navigation to `/dashboard` returns 404
- Works when clicking links in app

**Cause:** SPA fallback route not configured

**Solution:**
- Verify `app.get("/*splat", ...)` is present
- Check that it's registered AFTER express.static
- Must use named wildcard (`/*splat`) for Express v5

### Issue 5: API Routes Not Working

**Symptoms:**
- API requests return HTML instead of JSON

**Cause:** SPA fallback catching API routes

**Solution:**
- API routes must be registered BEFORE serveStatic()
- Check server/index.ts order:
  1. Register API routes first
  2. Then call serveStatic()

## Verification Checklist

When deploying to Render, verify:

- [ ] Build command includes both client and server: `npm run build`
- [ ] Start command is: `npm start`
- [ ] NODE_ENV is set to `production`
- [ ] dist/ is in .gitignore
- [ ] Render build logs show successful Vite build
- [ ] Render logs show "Static File Serving Configuration" section
- [ ] Render logs show "Directory exists: true"
- [ ] Files listed in build directory include index.html and assets
- [ ] Content-Type headers are correct in browser DevTools

## Local Testing

To test production build locally:

```bash
# 1. Build the application
npm run build

# 2. Check build output
ls -la dist/public/
ls -la dist/public/assets/

# 3. Set environment variables
export NODE_ENV=production
export DATABASE_URL=postgresql://localhost:5432/fantasyarena
export PORT=5000

# 4. Start production server
npm start

# 5. Check logs for "Static File Serving Configuration"
# Should show dist/public directory exists

# 6. Test in browser
open http://localhost:5000

# 7. Check DevTools Network tab
# CSS/JS should load with correct Content-Type
```

## Summary

**Key Points:**

1. ✅ **Build happens on Render** - dist/ not in git
2. ✅ **Vite outputs to** `dist/public/`
3. ✅ **Server bundles to** `dist/index.cjs`
4. ✅ **Path resolution uses** `process.cwd()` (project root)
5. ✅ **Static middleware** serves from `dist/public/`
6. ✅ **Content-Type** explicitly set for all file types
7. ✅ **SPA fallback** serves index.html for client routes
8. ✅ **API routes** registered BEFORE static middleware

**The setup is correct. If static files aren't loading:**
1. User needs to redeploy
2. Or clear browser cache aggressively
3. Or check Render logs for build errors

---

For step-by-step troubleshooting, see:
- **STILL_NOT_WORKING.md** - Diagnostic flowchart
- **NO_STYLING_VISIBLE.md** - User-facing guide
- **CSS_ASSETS_NOT_LOADING.md** - Technical troubleshooting
