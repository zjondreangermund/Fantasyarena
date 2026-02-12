import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, registerAuthRoutes } from "./replit_integrations/auth";
import { seedDatabase } from "./seed";
import { z } from "zod";

function randomScores(): number[] {
  return Array.from({ length: 5 }, () => Math.floor(Math.random() * 80) + 10);
}

const depositSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
});

const lineupSchema = z.object({
  cardIds: z.array(z.number()).length(5, "Must select exactly 5 cards"),
  captainId: z.number().int().positive(),
});

const buySchema = z.object({
  cardId: z.number().int().positive(),
});

const sellSchema = z.object({
  cardId: z.number().int().positive(),
  price: z.number().positive("Price must be positive"),
});

const completeOnboardingSchema = z.object({
  cardIds: z.array(z.number()).length(5, "Must select exactly 5 cards"),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);

  await seedDatabase();

  app.get("/api/wallet", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let wallet = await storage.getWallet(userId);
      if (!wallet) {
        wallet = await storage.createWallet({ userId, balance: 0 });
      }
      res.json(wallet);
    } catch (error) {
      console.error("Error getting wallet:", error);
      res.status(500).json({ message: "Failed to get wallet" });
    }
  });

  app.post("/api/wallet/deposit", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = depositSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0]?.message || "Invalid input" });
      }
      const { amount } = parsed.data;

      let wallet = await storage.getWallet(userId);
      if (!wallet) {
        wallet = await storage.createWallet({ userId, balance: 0 });
      }

      const updated = await storage.updateWalletBalance(userId, amount);
      await storage.createTransaction({
        userId,
        type: "deposit",
        amount,
        description: `Deposited $${amount.toFixed(2)}`,
      });

      res.json(updated);
    } catch (error) {
      console.error("Error depositing:", error);
      res.status(500).json({ message: "Failed to deposit" });
    }
  });

  app.get("/api/transactions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const txs = await storage.getTransactions(userId);
      res.json(txs);
    } catch (error) {
      console.error("Error getting transactions:", error);
      res.status(500).json({ message: "Failed to get transactions" });
    }
  });

  app.get("/api/cards", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cards = await storage.getUserCards(userId);
      res.json(cards);
    } catch (error) {
      console.error("Error getting cards:", error);
      res.status(500).json({ message: "Failed to get cards" });
    }
  });

  app.get("/api/lineup", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const lineup = await storage.getLineup(userId);
      if (!lineup || !lineup.cardIds || (lineup.cardIds as number[]).length === 0) {
        return res.json({ lineup: { cardIds: [] }, cards: [] });
      }

      const cards: any[] = [];
      for (const cardId of lineup.cardIds as number[]) {
        const card = await storage.getPlayerCardWithPlayer(cardId);
        if (card) cards.push(card);
      }

      res.json({ lineup, cards });
    } catch (error) {
      console.error("Error getting lineup:", error);
      res.status(500).json({ message: "Failed to get lineup" });
    }
  });

  app.post("/api/lineup", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = lineupSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0]?.message || "Invalid input" });
      }
      const { cardIds, captainId } = parsed.data;

      const cards = [];
      for (const cardId of cardIds) {
        const card = await storage.getPlayerCardWithPlayer(cardId);
        if (!card || card.ownerId !== userId) {
          return res.status(400).json({ message: "Invalid card selection" });
        }
        if (card.forSale) {
          return res.status(400).json({ message: "Cannot use a listed card in a lineup" });
        }
        cards.push(card);
      }

      if (!cardIds.includes(captainId)) {
        return res.status(400).json({ message: "Captain must be in the lineup" });
      }

      // Lineup validation: 1 GK, 1 DEF, 1 MID, 1 FWD, 1 Utility (not GK)
      const positions = cards.map(c => c.player.position);
      const counts: Record<string, number> = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
      positions.forEach(p => counts[p]++);

      if (counts.GK !== 1) return res.status(400).json({ message: "Must have exactly 1 Goalkeeper" });
      if (counts.DEF < 1) return res.status(400).json({ message: "Must have at least 1 Defender" });
      if (counts.MID < 1) return res.status(400).json({ message: "Must have at least 1 Midfielder" });
      if (counts.FWD < 1) return res.status(400).json({ message: "Must have at least 1 Forward" });

      const lineup = await storage.createOrUpdateLineup(userId, cardIds, captainId);
      res.json(lineup);
    } catch (error) {
      console.error("Error saving lineup:", error);
      res.status(500).json({ message: "Failed to save lineup" });
    }
  });

  app.get("/api/onboarding/status", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const onboarding = await storage.getOnboarding(userId);
      res.json({ completed: onboarding?.completed || false });
    } catch (error) {
      console.error("Error getting onboarding status:", error);
      res.status(500).json({ message: "Failed to get onboarding status" });
    }
  });

  app.get("/api/onboarding", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let onboarding = await storage.getOnboarding(userId);

      if (onboarding?.completed) {
        return res.json({ packs: [], completed: true });
      }

      if (!onboarding || !onboarding.packCards || (onboarding.packCards as number[][]).length === 0) {
        const randomPlayers = await storage.getRandomPlayers(9);
        const cardIds: number[][] = [[], [], []];

        for (let i = 0; i < randomPlayers.length; i++) {
          const packIdx = Math.floor(i / 3);
          const card = await storage.createPlayerCard({
            playerId: randomPlayers[i].id,
            ownerId: userId,
            rarity: "common",
            level: 1,
            xp: 0,
            last5Scores: randomScores(),
            forSale: false,
            price: 0,
          });
          cardIds[packIdx].push(card.id);
        }

        if (onboarding) {
          onboarding = await storage.updateOnboarding(userId, {
            packCards: cardIds,
          });
        } else {
          onboarding = await storage.createOnboarding({
            userId,
            completed: false,
            packCards: cardIds,
            selectedCards: [],
          });
        }
      }

      const packCardIds = onboarding!.packCards as number[][];
      const packs: any[][] = [[], [], []];

      for (let p = 0; p < packCardIds.length; p++) {
        for (const cardId of packCardIds[p]) {
          const card = await storage.getPlayerCardWithPlayer(cardId);
          if (card) packs[p].push(card);
        }
      }

      res.json({ packs, completed: false });
    } catch (error) {
      console.error("Error getting onboarding:", error);
      res.status(500).json({ message: "Failed to get onboarding" });
    }
  });

  app.post("/api/onboarding/complete", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = completeOnboardingSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0]?.message || "Invalid input" });
      }
      const { cardIds } = parsed.data;

      const onboarding = await storage.getOnboarding(userId);
      if (!onboarding) {
        return res.status(400).json({ message: "No onboarding data found" });
      }

      const allPackCards = (onboarding.packCards as number[][]).flat();
      for (const cardId of cardIds) {
        if (!allPackCards.includes(cardId)) {
          return res.status(400).json({ message: "Invalid card selection" });
        }
      }

      const unselectedCards = allPackCards.filter((id) => !cardIds.includes(id));
      for (const cardId of unselectedCards) {
        await storage.updatePlayerCard(cardId, { ownerId: null });
      }

      await storage.updateOnboarding(userId, {
        completed: true,
        selectedCards: cardIds,
      });

      await storage.createOrUpdateLineup(userId, cardIds, cardIds[0]);

      let wallet = await storage.getWallet(userId);
      if (!wallet) {
        await storage.createWallet({ userId, balance: 100 });
        await storage.createTransaction({
          userId,
          type: "deposit",
          amount: 100,
          description: "Welcome bonus - $100 starter funds",
        });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error completing onboarding:", error);
      res.status(500).json({ message: "Failed to complete onboarding" });
    }
  });

  app.get("/api/marketplace", isAuthenticated, async (req: any, res) => {
    try {
      const listings = await storage.getMarketplaceListings();
      res.json(listings);
    } catch (error) {
      console.error("Error getting marketplace:", error);
      res.status(500).json({ message: "Failed to get marketplace" });
    }
  });

  app.post("/api/marketplace/buy", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = buySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0]?.message || "Invalid input" });
      }
      const { cardId } = parsed.data;

      const card = await storage.getPlayerCard(cardId);
      if (!card || !card.forSale) {
        return res.status(400).json({ message: "Card not available" });
      }
      if (card.ownerId === userId) {
        return res.status(400).json({ message: "Cannot buy your own card" });
      }

      const wallet = await storage.getWallet(userId);
      if (!wallet || wallet.balance < (card.price || 0)) {
        return res.status(400).json({ message: "Insufficient funds" });
      }

      await storage.updateWalletBalance(userId, -(card.price || 0));
      if (card.ownerId) {
        await storage.updateWalletBalance(card.ownerId, card.price || 0);
        await storage.createTransaction({
          userId: card.ownerId,
          type: "sale",
          amount: card.price || 0,
          description: `Sold card #${cardId}`,
        });
      }

      await storage.createTransaction({
        userId,
        type: "purchase",
        amount: card.price || 0,
        description: `Purchased card #${cardId}`,
      });

      await storage.updatePlayerCard(cardId, {
        ownerId: userId,
        forSale: false,
        price: 0,
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error buying card:", error);
      res.status(500).json({ message: "Failed to buy card" });
    }
  });

  app.post("/api/marketplace/sell", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = sellSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0]?.message || "Invalid input" });
      }
      const { cardId, price } = parsed.data;

      const card = await storage.getPlayerCard(cardId);
      if (!card || card.ownerId !== userId) {
        return res.status(400).json({ message: "Card not found" });
      }
      if (card.rarity === "common") {
        return res.status(400).json({ message: "Common cards cannot be sold" });
      }

      await storage.updatePlayerCard(cardId, {
        forSale: true,
        price,
      });

      res.json({ success: true });
    } catch (error) {
      console.error("Error selling card:", error);
      res.status(500).json({ message: "Failed to sell card" });
    }
  });

  return httpServer;
}
