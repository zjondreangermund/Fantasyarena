import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { seedDatabase, seedCompetitions } from "./seed";

const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS || "").split(",").filter(Boolean);

function isAdmin(req: any, res: any, next: any) {
  const user = req.user;
  if (!user) return res.status(401).json({ message: "Unauthorized" });
  const userId = user.claims?.sub || user.id;
  if (ADMIN_USER_IDS.length > 0 && !ADMIN_USER_IDS.includes(userId)) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  // Auth Setup for Railway/Local
  if (process.env.REPL_ID) {
    await setupAuth(app);
    registerAuthRoutes(app);
  } else {
    console.log("Railway environment detected: Bypassing Replit Auth.");
    app.use((req: any, _res, next) => {
      req.isAuthenticated = () => true;
      req.user = { 
        id: "54644807", 
        claims: { sub: "54644807" }, 
        firstName: "Zjondre", 
        lastName: "Angermund" 
      };
      next();
    });
    app.get("/api/auth/user", (req: any, res) => res.json(req.user));
    app.post("/api/auth/logout", (_req, res) => res.json({ success: true }));
  }

  // --- API ROUTES ---

  // Middleware to ensure user is authenticated
  function requireAuth(req: any, res: any, next: any) {
    if (!req.user?.id) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  }

  // Sync Data Route
  app.post("/api/epl/sync", async (_req, res) => {
    try {
      console.log("Starting Premier League data sync...");
      await seedDatabase();
      await seedCompetitions();
      res.json({ success: true, message: "Data synced successfully" });
    } catch (error: any) {
      console.error("Sync failed:", error);
      res.status(500).json({ message: "Failed to sync data", error: error.message });
    }
  });

  // FIX: Updated to fetch actual Card Items so design templates (rarity) show up
  app.get("/api/players", async (_req, res) => {
    try {
      const cards = await storage.getMarketplaceListings();
      res.json(cards);
    } catch (error: any) {
      console.error("Failed to fetch player cards:", error);
      res.status(500).json({ message: "Failed to fetch player cards" });
    }
  });

  // Fetch cards owned by the logged-in user
  app.get("/api/user/cards", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const cards = await storage.getUserCards(userId);
      res.json(cards);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch user cards" });
    }
  });

  // Fetch specific player details (for modals/profiles)
  app.get("/api/players/:id", async (req, res) => {
    try {
      const player = await storage.getPlayer(Number(req.params.id));
      if (!player) return res.status(404).json({ message: "Player not found" });
      res.json(player);
    } catch (error: any) {
      console.error("Error fetching player:", error);
      res.status(500).json({ message: "Error fetching player" });
    }
  });

  // --- MARKETPLACE ROUTES ---
  
  const { listCardForSale, buyCard, cancelListing } = await import("./services/marketplace");

  // List card for sale
  app.post("/api/marketplace/sell", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { cardId, price } = req.body;

      if (!cardId || !price) {
        return res.status(400).json({ message: "Card ID and price are required" });
      }

      const result = await listCardForSale(userId, cardId, price);
      
      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      res.json({ success: true, message: "Card listed successfully" });
    } catch (error: any) {
      console.error("Error listing card:", error);
      res.status(500).json({ message: "Failed to list card" });
    }
  });

  // Buy card from marketplace
  app.post("/api/marketplace/buy", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { cardId } = req.body;

      if (!cardId) {
        return res.status(400).json({ message: "Card ID is required" });
      }

      const result = await buyCard(userId, cardId);
      
      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      res.json({ 
        success: true, 
        message: "Card purchased successfully",
        totalCost: result.totalCost 
      });
    } catch (error: any) {
      console.error("Error buying card:", error);
      res.status(500).json({ message: "Failed to buy card" });
    }
  });

  // Cancel listing
  app.post("/api/marketplace/cancel", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { cardId } = req.body;

      if (!cardId) {
        return res.status(400).json({ message: "Card ID is required" });
      }

      const result = await cancelListing(userId, cardId);
      
      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      res.json({ success: true, message: "Listing cancelled" });
    } catch (error: any) {
      console.error("Error cancelling listing:", error);
      res.status(500).json({ message: "Failed to cancel listing" });
    }
  });

  // --- COMPETITIONS ROUTES ---
  
  const { settleCompetition, getCompetitionLeaderboard } = await import("./services/competitions");

  // Settle competition (admin only)
  app.post("/api/competitions/settle", isAdmin, async (req, res) => {
    try {
      const { competitionId } = req.body;

      if (!competitionId) {
        return res.status(400).json({ message: "Competition ID is required" });
      }

      const result = await settleCompetition(competitionId);
      
      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      res.json({ success: true, message: "Competition settled successfully" });
    } catch (error: any) {
      console.error("Error settling competition:", error);
      res.status(500).json({ message: "Failed to settle competition" });
    }
  });

  // Get competition leaderboard
  app.get("/api/competitions/:id/leaderboard", async (req, res) => {
    try {
      const competitionId = Number(req.params.id);
      const leaderboard = await getCompetitionLeaderboard(competitionId);
      res.json(leaderboard);
    } catch (error: any) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // --- NOTIFICATIONS ROUTES ---
  
  const { db } = await import("./db");
  const { notifications } = await import("@shared/schema");
  const { eq, desc } = await import("drizzle-orm");

  // Get user notifications
  app.get("/api/notifications", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;

      const userNotifications = await db
        .select()
        .from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(desc(notifications.createdAt));

      res.json(userNotifications);
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  // Mark notification as read
  app.patch("/api/notifications/:id/read", async (req: any, res) => {
    try {
      const notificationId = Number(req.params.id);

      await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.id, notificationId));

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to update notification" });
    }
  });

  // Mark all notifications as read
  app.post("/api/notifications/read-all", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;

      await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.userId, userId));

      res.json({ success: true });
    } catch (error: any) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to update notifications" });
    }
  });

  // --- FANTASY LEAGUE ROUTES ---
  
  const { 
    getLeagueStandings, 
    getPlayerScores, 
    getInjuries 
  } = await import("./services/fantasyLeagueApi");

  // Get league standings
  app.get("/api/fantasy/standings", async (_req, res) => {
    try {
      const standings = await getLeagueStandings();
      res.json(standings);
    } catch (error: any) {
      console.error("Error fetching standings:", error);
      res.status(500).json({ message: "Failed to fetch standings" });
    }
  });

  // Get player scores
  app.get("/api/fantasy/scores", async (req, res) => {
    try {
      const limit = Number(req.query.limit) || 20;
      const scores = await getPlayerScores(limit);
      res.json(scores);
    } catch (error: any) {
      console.error("Error fetching scores:", error);
      res.status(500).json({ message: "Failed to fetch scores" });
    }
  });

  // Get injuries
  app.get("/api/fantasy/injuries", async (_req, res) => {
    try {
      const injuries = await getInjuries();
      res.json(injuries);
    } catch (error: any) {
      console.error("Error fetching injuries:", error);
      res.status(500).json({ message: "Failed to fetch injuries" });
    }
  });

  return httpServer;
}
