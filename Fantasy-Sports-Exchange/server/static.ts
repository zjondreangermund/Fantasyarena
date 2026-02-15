import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  // Use absolute path resolution from project root
  const distPath = path.resolve(process.cwd(), "dist", "public");

  console.log("=".repeat(80));
  console.log("Static File Serving Configuration");
  console.log("=".repeat(80));
  console.log(`Current working directory: ${process.cwd()}`);
  console.log(`__dirname would be: ${__dirname}`);
  console.log(`Checking for build directory at: ${distPath}`);
  console.log(`Directory exists: ${fs.existsSync(distPath)}`);

  if (fs.existsSync(distPath)) {
    const files = fs.readdirSync(distPath);
    console.log(`Found ${files.length} items in build directory:`);
    files.forEach(file => console.log(`  - ${file}`));
    
    // Check for index.html
    const indexPath = path.resolve(distPath, "index.html");
    console.log(`index.html exists: ${fs.existsSync(indexPath)}`);
  }
  console.log("=".repeat(80));

  if (!fs.existsSync(distPath)) {
    const fallbackPath = path.resolve(process.cwd(), "public");
    console.log(`Primary build directory not found. Trying fallback: ${fallbackPath}`);
    
    if (fs.existsSync(path.resolve(fallbackPath, "index.html"))) {
       console.log(`✓ Found build at fallback: ${fallbackPath}`);
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
       // SPA fallback route for React Router
       app.get("/*splat", (req, res, next) => {
         const requestPath = req.path;
         
         // Skip API routes
         if (requestPath.startsWith('/api/')) {
           console.log(`⚠ API route ${requestPath} reached SPA fallback - this should not happen!`);
           return next();
         }
         
         // Skip static asset requests
         const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.svg', '.gif', '.ico', '.woff', '.woff2', '.ttf', '.eot', '.json', '.map'];
         if (staticExtensions.some(ext => requestPath.endsWith(ext))) {
           console.log(`⚠ Static asset ${requestPath} reached SPA fallback - file may not exist`);
           return res.status(404).send('Asset not found');
         }
         
         console.log(`SPA fallback triggered for client route: ${requestPath} -> index.html`);
         res.sendFile(path.resolve(fallbackPath, "index.html"));
       });
       console.log(`✓ Static file middleware configured with fallback`);
       return;
     }

    console.error(`✗ Could not find build directory at: ${distPath}`);
    console.error(`✗ Fallback directory also not found at: ${fallbackPath}`);
    throw new Error(
      `Could not find the build directory: ${distPath}. ` +
      `Build artifacts missing. Make sure 'npm run build' completed successfully.`
    );
  }

  console.log(`✓ Serving static files from: ${distPath}`);

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
  
  console.log(`✓ Static file middleware configured`);
  console.log(`✓ SPA fallback route will serve: ${path.resolve(distPath, "index.html")}`);
  console.log("=".repeat(80));
  
  // SPA fallback route - serves index.html for all non-API, non-static routes
  // This allows React Router to handle client-side routing
  // IMPORTANT: This must NOT match /api/* routes or static asset paths
  app.get("/*splat", (req, res, next) => {
    const requestPath = req.path;
    
    // Skip API routes - these should have been handled by API router already
    if (requestPath.startsWith('/api/')) {
      console.log(`⚠ API route ${requestPath} reached SPA fallback - this should not happen!`);
      return next(); // Pass to error handler
    }
    
    // Skip static asset requests (common extensions)
    // If a static file exists, express.static middleware should have handled it already
    // If we're here, it means either the file doesn't exist or wasn't caught by static middleware
    const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.svg', '.gif', '.ico', '.woff', '.woff2', '.ttf', '.eot', '.json', '.map'];
    if (staticExtensions.some(ext => requestPath.endsWith(ext))) {
      console.log(`⚠ Static asset ${requestPath} reached SPA fallback - file may not exist`);
      return res.status(404).send('Asset not found');
    }
    
    // This is a client-side route - serve index.html for React Router
    const indexPath = path.resolve(distPath, "index.html");
    console.log(`SPA fallback triggered for client route: ${requestPath} -> index.html`);
    res.sendFile(indexPath);
  });
}
