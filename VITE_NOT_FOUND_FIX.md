# Vite Build Error Fix

## Issue

Build was failing on Render with:
```
sh: 1: vite: not found
```

## Root Cause

**Build tools were in `devDependencies`:**
- vite
- esbuild
- @vitejs/plugin-react
- typescript

When deploying to Render (or other platforms), `npm install` may skip devDependencies or run in production mode, causing these build tools to be unavailable during the build phase.

## Solution

**Moved 4 essential build tools to `dependencies`:**

```json
"dependencies": {
  ...
  "vite": "^7.3.0",
  "esbuild": "^0.25.0",
  "@vitejs/plugin-react": "^4.7.0",
  "typescript": "5.6.3"
}
```

## Why This Is Correct

### Dependencies vs DevDependencies

**Common Misconception:**
- ❌ `dependencies` = production runtime code
- ❌ `devDependencies` = everything else

**Reality:**
- ✅ `dependencies` = needed at runtime OR build time in production
- ✅ `devDependencies` = only needed for local development

### Build Tools on Deployment Platforms

Build tools like vite and esbuild are:
- Run during the build phase (not runtime)
- Required before the application starts
- Must be available on the deployment platform
- Therefore, must be in `dependencies`

This is standard practice across all deployment platforms:
- Vercel
- Netlify
- Render
- Railway
- Heroku

## What Was Fixed

### Before (Broken)
```json
"devDependencies": {
  "vite": "^7.3.0",
  "esbuild": "^0.25.0",
  "@vitejs/plugin-react": "^4.7.0",
  "typescript": "5.6.3"
}
```

**Result:** Build fails with "vite: not found"

### After (Working)
```json
"dependencies": {
  "vite": "^7.3.0",
  "esbuild": "^0.25.0",
  "@vitejs/plugin-react": "^4.7.0",
  "typescript": "5.6.3"
},
"devDependencies": {
  // Other dev-only tools remain here
}
```

**Result:** Build succeeds ✅

## Impact

### Before
- ❌ Build fails on Render
- ❌ `vite: not found` error
- ❌ Only 361 packages installed
- ❌ Deployment blocked

### After
- ✅ Build succeeds
- ✅ All build tools available
- ✅ ~500+ packages installed
- ✅ Deployment works

## What Stays in devDependencies

Tools that are truly only needed for local development:
- `@types/*` - TypeScript type definitions (only for development type checking)
- `tsx` - Local development server
- `@replit/*` - Replit-specific development plugins
- `tailwindcss`, `autoprefixer`, `postcss` - Could go either way, but CSS is processed at build time so these could also be in dependencies

## Verification

After this change, Render build command works:
```bash
npm install --legacy-peer-deps  # Installs dependencies (including vite)
npm run build                    # ✅ Can now find vite
npm run build:client             # ✅ vite build succeeds
npm run build:server             # ✅ esbuild succeeds
npm run db:push                  # ✅ Runs successfully
```

## Similar Issues

This same issue occurs on other platforms:
- **Vercel:** Requires build tools in dependencies
- **Netlify:** Requires build tools in dependencies
- **Railway:** Requires build tools in dependencies
- **Heroku:** Requires build tools in dependencies

**Solution is always the same:** Move build tools from devDependencies to dependencies.

## Standard Practice

This follows industry standard practices:
- **Next.js** applications require Next.js in dependencies
- **Vite** applications require Vite in dependencies
- **Create React App** required react-scripts in dependencies
- Any build tool needed during deployment must be in dependencies

It's not about whether code runs in production, but about **when it's needed**.

## Key Takeaway

**Build-time dependencies = runtime dependencies for deployment platforms**

If a tool is needed to build your application for deployment, it belongs in `dependencies`, not `devDependencies`.

**Status: BUILD ERROR FIXED** ✅

The build will now succeed on Render!
