import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(process.cwd(), "dist", "public");

  console.log(`Checking for build directory at: ${distPath}`);

  if (!fs.existsSync(distPath)) {
    const fallbackPath = path.resolve(process.cwd(), "public");
    if (fs.existsSync(path.resolve(fallbackPath, "index.html"))) {
       console.log(`Found build at fallback: ${fallbackPath}`);
       app.use(express.static(fallbackPath, {
         etag: true,
         lastModified: true,
         setHeaders: (res, filePath) => {
           // Ensure correct MIME types for common file extensions
           if (filePath.endsWith('.js')) {
             res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
           } else if (filePath.endsWith('.css')) {
             res.setHeader('Content-Type', 'text/css; charset=utf-8');
           } else if (filePath.endsWith('.html')) {
             res.setHeader('Content-Type', 'text/html; charset=utf-8');
           } else if (filePath.endsWith('.json')) {
             res.setHeader('Content-Type', 'application/json; charset=utf-8');
           } else if (filePath.endsWith('.png')) {
             res.setHeader('Content-Type', 'image/png');
           } else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
             res.setHeader('Content-Type', 'image/jpeg');
           } else if (filePath.endsWith('.svg')) {
             res.setHeader('Content-Type', 'image/svg+xml');
           } else if (filePath.endsWith('.woff')) {
             res.setHeader('Content-Type', 'font/woff');
           } else if (filePath.endsWith('.woff2')) {
             res.setHeader('Content-Type', 'font/woff2');
           }
         }
       }));
       // FIX: Use named wildcard for Express v5
       app.get("/*splat", (_req, res) => res.sendFile(path.resolve(fallbackPath, "index.html")));
       return;
    }

    throw new Error(`Could not find the build directory: ${distPath}. Build artifacts missing.`);
  }

  // Serve static files with proper MIME types
  app.use(express.static(distPath, {
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
      // Ensure correct MIME types for common file extensions
      if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      } else if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css; charset=utf-8');
      } else if (filePath.endsWith('.html')) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
      } else if (filePath.endsWith('.json')) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
      } else if (filePath.endsWith('.png')) {
        res.setHeader('Content-Type', 'image/png');
      } else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
        res.setHeader('Content-Type', 'image/jpeg');
      } else if (filePath.endsWith('.svg')) {
        res.setHeader('Content-Type', 'image/svg+xml');
      } else if (filePath.endsWith('.woff')) {
        res.setHeader('Content-Type', 'font/woff');
      } else if (filePath.endsWith('.woff2')) {
        res.setHeader('Content-Type', 'font/woff2');
      }
    }
  }));
  
  // FIX: Use named wildcard for Express v5
  app.get("/*splat", (_req, res) => res.sendFile(path.resolve(distPath, "index.html")));
}
