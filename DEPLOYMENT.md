# Deployment Guide - Netlify

## Overview

This document provides deployment instructions for the Fantasy Arena application on Netlify.

## Recent Fix: esbuild Binary Version Mismatch

### Problem
Netlify deployments were failing with the error:
```
Error: Expected "0.27.3" but got "0.25.12"
```

This occurred because:
1. Netlify sets `NODE_ENV=production` by default during builds
2. With `NODE_ENV=production`, npm only installs packages from `dependencies`, not `devDependencies`
3. Build tools (tsx, esbuild, vite) were in `devDependencies` but needed during the build process

### Solution Implemented
Moved build-time tools from `devDependencies` to `dependencies`:
- `tsx@^4.21.0` - Required for dev server and build process
- `esbuild@^0.27.3` - Required for server build script
- `vite@^7.3.1` - Required for client build script

This ensures these tools are available when Netlify runs in production mode.

## Netlify Configuration

### netlify.toml
```toml
[build]
  command = "npm install --legacy-peer-deps && npm run build"
  publish = "dist/public"
```

- `--legacy-peer-deps`: Handles peer dependency conflicts during installation
- Build command runs both client (`vite build`) and server (`esbuild`) builds
- Publishes the `dist/public` directory containing the compiled client application

### Build Scripts
The `npm run build` command executes:
1. `npm run build:client` - Vite builds the React client to `dist/public`
2. `npm run build:server` - esbuild bundles the Express server to `dist/index.cjs`

## Deployment Instructions

### Initial Setup
1. Connect your GitHub repository to Netlify
2. Configure build settings (or use netlify.toml, which is already committed)
3. Set required environment variables (see below)

### Regular Deployments
Netlify automatically deploys when you push to the configured branch.

### Deploy Without Cache (When Needed)
If you need to force a fresh build without using cached dependencies:

1. Go to your site in the Netlify dashboard
2. Navigate to **Deploys** tab
3. Click **Trigger deploy** button
4. Select **Deploy without cache**

**Note**: This is useful when:
- You've updated dependencies and want to ensure a clean install
- Previous builds had caching issues
- You want to verify the build works from scratch

## Environment Variables

Required environment variables to set in Netlify:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `ISSUER_URL` | Replit Auth OIDC issuer URL |
| `REPL_ID` | Replit application ID |
| `SESSION_SECRET` | Secret key for session encryption |

Configure these in: **Site settings → Environment variables**

## Troubleshooting

### Build Fails with "devDependencies not installed"
**Status**: ✅ Fixed in commit dd31505

Build tools are now in `dependencies`, so they install in production mode.

### Build Fails with esbuild Version Mismatch
**Status**: ✅ Fixed in commit 6d3f2f6 and dd31505

esbuild is pinned to 0.27.3 and in dependencies section.

### Need to Force Fresh Build
Use **Deploy without cache** option (see instructions above).

### Build Succeeds but Runtime Errors
Check that all environment variables are set correctly in Netlify dashboard.

## Build Output

After a successful build:
- Client files: `dist/public/` (HTML, JS, CSS, assets)
- Server bundle: `dist/index.cjs` (not deployed to Netlify, only client is served)

Netlify serves the static files from `dist/public` as specified in the `publish` setting.

## Package Versions

Current versions (as of latest fix):
- Node.js: 20.19.0 (via .nvmrc)
- esbuild: 0.27.3
- tsx: 4.21.0
- vite: 7.3.1

## Additional Resources

- [Netlify Build Configuration](https://docs.netlify.com/configure-builds/overview/)
- [Managing Build Dependencies](https://docs.netlify.com/configure-builds/manage-dependencies/)
- [Environment Variables](https://docs.netlify.com/environment-variables/overview/)
