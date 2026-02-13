import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function serveStatic(app: Express) {
  // Go UP from /dist back to project root, then into dist (frontend)
  const distPath = path.resolve(__dirname, "../");

  if (!fs.existsSync(path.join(distPath, "index.html"))) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  app.get("*", (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}
