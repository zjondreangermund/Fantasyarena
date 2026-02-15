import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { seedDatabase, seedCompetitions } from "./seed";

const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS || "").split(",").filter(Boolean);
const PLATFORM_FEE_RATE = 0.08; // 8% platform fee
const MAX_TRANSACTION_AMOUNT = 1000000; // $1M max per transaction

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

  // Admin check endpoint
  app.get("/api/admin/check", (req: any, res) => {
    try {
      const user = req.user;
      if (!user) return res.json({ isAdmin: false });
      const userId = user.claims?.sub || user.id;
      const isAdmin = ADMIN_USER_IDS.length > 0 && ADMIN_USER_IDS.includes(userId);
      res.json({ isAdmin });
    } catch (error: any) {
      console.error("Admin check failed:", error);
      res.status(500).json({ isAdmin: false });
    }
  });

  // Onboarding status endpoint
  app.get("/api/onboarding/status", async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      
      const onboarding = await storage.getOnboarding(userId);
      
      if (!onboarding) {
        // User hasn't started onboarding yet
        return res.json({ completed: false, hasStarterPacks: false });
      }
      
      res.json({
        completed: onboarding.completed || false,
        hasStarterPacks: onboarding.hasStarterPacks || false,
        selectedCards: onboarding.selectedCards || []
      });
    } catch (error: any) {
      console.error("Onboarding status check failed:", error);
      res.status(500).json({ message: "Failed to check onboarding status" });
    }
  });

  // Wallet endpoints
  app.get("/api/wallet", async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      
      let wallet = await storage.getWallet(userId);
      
      // Create wallet if it doesn't exist
      if (!wallet) {
        wallet = await storage.createWallet({
          userId,
          balance: 0,
          lockedBalance: 0,
        });
      }
      
      res.json(wallet);
    } catch (error: any) {
      console.error("Failed to fetch wallet:", error);
      res.status(500).json({ message: "Failed to fetch wallet" });
    }
  });

  app.get("/api/wallet/withdrawals", async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      
      const withdrawals = await storage.getUserWithdrawalRequests(userId);
      res.json(withdrawals);
    } catch (error: any) {
      console.error("Failed to fetch withdrawals:", error);
      res.status(500).json({ message: "Failed to fetch withdrawals" });
    }
  });

  app.post("/api/wallet/deposit", async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      
      const { amount } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid deposit amount" });
      }
      
      if (amount > MAX_TRANSACTION_AMOUNT) {
        return res.status(400).json({ message: `Maximum deposit amount is $${MAX_TRANSACTION_AMOUNT.toLocaleString()}` });
      }
      
      // Platform fee
      const fee = amount * PLATFORM_FEE_RATE;
      const netAmount = amount - fee;
      
      // Update wallet balance
      const wallet = await storage.updateWalletBalance(userId, netAmount);
      
      // Record transaction
      await storage.createTransaction({
        userId,
        type: "deposit",
        amount: netAmount,
        status: "completed",
        description: `Deposit of $${amount.toFixed(2)} (fee: $${fee.toFixed(2)})`,
      });
      
      res.json({ success: true, wallet, fee, netAmount });
    } catch (error: any) {
      console.error("Deposit failed:", error);
      res.status(500).json({ message: "Failed to process deposit" });
    }
  });

  app.post("/api/wallet/withdraw", async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      
      const { amount, method, address } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid withdrawal amount" });
      }
      
      if (amount > MAX_TRANSACTION_AMOUNT) {
        return res.status(400).json({ message: `Maximum withdrawal amount is $${MAX_TRANSACTION_AMOUNT.toLocaleString()}` });
      }
      
      const wallet = await storage.getWallet(userId);
      if (!wallet || wallet.balance < amount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      
      // Platform fee
      const fee = amount * PLATFORM_FEE_RATE;
      const netAmount = amount - fee;
      
      // Lock funds
      await storage.lockFunds(userId, amount);
      
      // Create withdrawal request
      const withdrawal = await storage.createWithdrawalRequest({
        userId,
        amount: netAmount,
        fee,
        status: "pending",
        method: method || "bank_transfer",
        address: address || "",
      });
      
      res.json({ success: true, withdrawal, fee, netAmount });
    } catch (error: any) {
      console.error("Withdrawal failed:", error);
      res.status(500).json({ message: "Failed to process withdrawal" });
    }
  });

  // Cards endpoint (user's cards)
  app.get("/api/cards", async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      
      const cards = await storage.getUserCards(userId);
      res.json(cards);
    } catch (error: any) {
      console.error("Failed to fetch cards:", error);
      res.status(500).json({ message: "Failed to fetch cards" });
    }
  });

  // Lineup endpoints
  app.get("/api/lineup", async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      
      const lineup = await storage.getLineup(userId);
      
      if (!lineup) {
        return res.json({ lineup: null, cards: [] });
      }
      
      // Fetch the cards in the lineup
      const cardIds = lineup.cardIds as number[];
      const cards = await Promise.all(
        cardIds.map(id => storage.getPlayerCardWithPlayer(id))
      );
      
      res.json({
        lineup,
        cards: cards.filter(c => c !== undefined)
      });
    } catch (error: any) {
      console.error("Failed to fetch lineup:", error);
      res.status(500).json({ message: "Failed to fetch lineup" });
    }
  });

  app.post("/api/lineup", async (req: any, res) => {
    try {
      const userId = req.user?.id || req.user?.claims?.sub;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });
      
      const { cardIds, captainId } = req.body;
      
      if (!Array.isArray(cardIds) || cardIds.length !== 5) {
        return res.status(400).json({ message: "Lineup must have exactly 5 cards" });
      }
      
      if (!captainId || !cardIds.includes(captainId)) {
        return res.status(400).json({ message: "Captain must be one of the lineup cards" });
      }
      
      const lineup = await storage.createOrUpdateLineup(userId, cardIds, captainId);
      res.json({ success: true, lineup });
    } catch (error: any) {
      console.error("Failed to update lineup:", error);
      res.status(500).json({ message: "Failed to update lineup" });
    }
  });

  return httpServer;
}
