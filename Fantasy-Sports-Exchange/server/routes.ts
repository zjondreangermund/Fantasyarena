import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, registerAuthRoutes } from "./replit_integrations/auth";
import { seedDatabase, seedCompetitions } from "./seed";
import { z } from "zod";
import { SITE_FEE_RATE, RARITY_SUPPLY, calculateDecisiveLevel } from "@shared/schema";
// ... (keep all your existing imports)

const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS || "").split(",").filter(Boolean);

// UPDATED: More robust Admin check for Production
function isAdmin(req: any, res: any, next: any) {
  const user = req.user;
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  // Handle both Replit Auth (claims.sub) and Mock/Local Auth (id)
  const userId = user.claims?.sub || user.id;

  if (ADMIN_USER_IDS.length > 0 && !ADMIN_USER_IDS.includes(userId)) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

// ... (keep your existing schemas)

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // FIX: Only run Replit Auth if we are actually on Replit
  if (process.env.REPL_ID) {
    await setupAuth(app);
    registerAuthRoutes(app);
  } else {
    console.log("Railway environment detected: Bypassing Replit Auth.");

    // Simple Mock Auth for Railway Production
    // This allows you to stay logged in as an Admin using your ID
    app.use((req: any, _res, next) => {
      req.isAuthenticated = () => true;
      req.user = { 
        id: "54644807", // Defaulting to your ID for testing
        claims: { sub: "54644807" },
        firstName: "Zjondre",
        lastName: "Angermund"
      };
      next();
    });

    // Mock the auth routes so the frontend doesn't 404
    app.get("/api/auth/user", (req: any, res) => res.json(req.user));
    app.post("/api/auth/logout", (_req, res) => res.json({ success: true }));
  }

  // Ensure database is ready
  await seedDatabase();
  await seedCompetitions();

  // ... (Keep the rest of your existing API routes exactly as they are)

  return httpServer;
}