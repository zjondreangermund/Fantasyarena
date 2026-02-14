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
  app.get("/api/user/cards", async (req: any, res) => {
    try {
      const userId = req.user?.id || "54644807";
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
  
  // Sell a card on the marketplace
  app.post("/api/marketplace/sell", async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const { cardId, price } = req.body;
      if (!cardId || !price) {
        return res.status(400).json({ message: "Missing cardId or price" });
      }

      // Get the card
      const card = await storage.getPlayerCard(cardId);
      if (!card) {
        return res.status(404).json({ message: "Card not found" });
      }
      if (card.ownerId !== userId) {
        return res.status(403).json({ message: "You don't own this card" });
      }
      if (card.forSale) {
        return res.status(400).json({ message: "Card is already for sale" });
      }

      // Import marketplace service
      const { validateSellRequest, recordTrade, logMarketplaceTrade } = await import("./services/marketplace");

      // Validate sell request (price and rate limit)
      const validation = await validateSellRequest(userId, price, card.rarity);
      if (!validation.valid) {
        return res.status(400).json({ message: validation.error });
      }

      // List the card for sale
      await storage.updatePlayerCard(cardId, {
        forSale: true,
        price,
      });

      // Record trade in history
      await recordTrade(userId, 'sell', cardId);

      // Log the marketplace trade
      await logMarketplaceTrade(userId, null, cardId, price, 'sell');

      res.json({ success: true, message: "Card listed for sale" });
    } catch (error: any) {
      console.error("Error selling card:", error);
      res.status(500).json({ message: "Failed to list card for sale", error: error.message });
    }
  });

  // Buy a card from the marketplace
  app.post("/api/marketplace/buy", async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const { cardId } = req.body;
      if (!cardId) {
        return res.status(400).json({ message: "Missing cardId" });
      }

      // Get the card
      const card = await storage.getPlayerCard(cardId);
      if (!card) {
        return res.status(404).json({ message: "Card not found" });
      }
      if (!card.forSale) {
        return res.status(400).json({ message: "Card is not for sale" });
      }
      if (card.ownerId === userId) {
        return res.status(400).json({ message: "You already own this card" });
      }

      // Import marketplace service
      const { validateBuyRequest, recordTrade, logMarketplaceTrade } = await import("./services/marketplace");

      // Validate buy request (rate limit)
      const validation = await validateBuyRequest(userId);
      if (!validation.valid) {
        return res.status(400).json({ message: validation.error });
      }

      // Check buyer's balance
      const wallet = await storage.getWallet(userId);
      if (!wallet || wallet.balance < (card.price ?? 0)) {
        return res.status(400).json({ message: "Insufficient funds" });
      }

      const sellerId = card.ownerId;
      const price = card.price ?? 0;

      // Transfer funds
      await storage.updateWalletBalance(userId, -price);
      if (sellerId) {
        await storage.updateWalletBalance(sellerId, price);
      }

      // Transfer card ownership
      await storage.updatePlayerCard(cardId, {
        ownerId: userId,
        forSale: false,
        price: 0,
      });

      // Record transactions
      await storage.createTransaction({
        userId,
        type: 'purchase',
        amount: -price,
        description: `Purchased card #${cardId}`,
      });

      if (sellerId) {
        await storage.createTransaction({
          userId: sellerId,
          type: 'sale',
          amount: price,
          description: `Sold card #${cardId}`,
        });
      }

      // Record trade in history
      await recordTrade(userId, 'buy', cardId);

      // Log the marketplace trade
      await logMarketplaceTrade(sellerId ?? 'system', userId, cardId, price, 'buy');

      res.json({ success: true, message: "Card purchased successfully" });
    } catch (error: any) {
      console.error("Error buying card:", error);
      res.status(500).json({ message: "Failed to purchase card", error: error.message });
    }
  });

  // Swap cards
  app.post("/api/marketplace/swap", async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const { offeredCardId, requestedCardId } = req.body;
      if (!offeredCardId || !requestedCardId) {
        return res.status(400).json({ message: "Missing card IDs" });
      }

      // Import marketplace service
      const { validateSwapRequest, recordTrade } = await import("./services/marketplace");

      // Validate swap request (rate limit)
      const validation = await validateSwapRequest(userId);
      if (!validation.valid) {
        return res.status(400).json({ message: validation.error });
      }

      // Record trade in history for rate limiting
      await recordTrade(userId, 'swap', offeredCardId);

      // Note: Actual swap logic should be handled through swap offers table
      res.json({ success: true, message: "Swap request validated" });
    } catch (error: any) {
      console.error("Error processing swap:", error);
      res.status(500).json({ message: "Failed to process swap", error: error.message });
    }
  });

  // --- COMPETITION ROUTES ---

  // Settle competition (admin only)
  app.post("/api/competitions/settle", isAdmin, async (req: any, res) => {
    try {
      const { competitionId } = req.body;
      if (!competitionId) {
        return res.status(400).json({ message: "Missing competitionId" });
      }

      // Import competitions service
      const { settleCompetition } = await import("./services/competitions");

      // Settle the competition
      const result = await settleCompetition(competitionId);

      if (!result.success) {
        return res.status(400).json({ message: result.error });
      }

      res.json({
        success: true,
        message: "Competition settled successfully",
        distribution: result.distribution,
      });
    } catch (error: any) {
      console.error("Error settling competition:", error);
      res.status(500).json({ message: "Failed to settle competition", error: error.message });
    }
  });

  // --- NOTIFICATION ROUTES ---

  // Get user notifications
  app.get("/api/notifications", async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const notifications = await storage.getNotifications(userId);
      res.json(notifications);
    } catch (error: any) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  // Mark notification as read
  app.patch("/api/notifications/:id/read", async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const notificationId = Number(req.params.id);
      if (isNaN(notificationId)) {
        return res.status(400).json({ message: "Invalid notification ID" });
      }

      // Get notification to verify ownership
      const notifications = await storage.getNotifications(userId);
      const notification = notifications.find(n => n.id === notificationId);

      if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
      }

      // Mark as read
      await storage.markNotificationAsRead(notificationId);

      res.json({ success: true, message: "Notification marked as read" });
    } catch (error: any) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  return httpServer;
}
