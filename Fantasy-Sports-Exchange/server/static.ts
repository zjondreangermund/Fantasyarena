import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  // Use process.cwd() to start from the absolute project root (/app)
  const distPath = path.resolve(process.cwd(), "dist", "public");

  console.log(`Checking for build directory at: ${distPath}`);

  if (!fs.existsSync(distPath)) {
    // Check one level up just in case Railway's structure is flattened
    const fallbackPath = path.resolve(process.cwd(), "public");
    if (fs.existsSync(path.resolve(fallbackPath, "index.html"))) {
       console.log(`Found build at fallback: ${fallbackPath}`);
       app.use(express.static(fallbackPath));
       app.get("*", (_req, res) => res.sendFile(path.resolve(fallbackPath, "index.html")));
       return;
    }

    throw new Error(
      `Could not find the build directory: ${distPath}. Build artifacts missing.`
    );
  }

  app.use(express.static(distPath));
  app.get("*", (_req, res) => res.sendFile(path.resolve(distPath, "index.html")));
}