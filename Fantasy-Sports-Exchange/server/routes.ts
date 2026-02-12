import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, registerAuthRoutes } from "./replit_integrations/auth";
import { seedDatabase, seedCompetitions } from "./seed";
import { z } from "zod";
import { SITE_FEE_RATE, RARITY_SUPPLY, calculateDecisiveLevel } from "@shared/schema";
import {
  initialSync, syncStandings, syncFixtures, syncTopPlayers, syncInjuries,
  getEplPlayers, getEplFixtures, getEplInjuries, getEplStandings,
} from "./services/apiFootball";
import { fetchSorarePlayer, fetchSorarePlayersBatch, getSorareImageUrl } from "./services/sorare";

function randomScores(): number[] {
  return Array.from({ length: 5 }, () => Math.floor(Math.random() * 80) + 10);
}

const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS || "").split(",").filter(Boolean);

function isAdmin(req: any, res: any, next: any) {
  if (!req.user || !req.user.claims) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const userId = req.user.claims.sub;
  if (ADMIN_USER_IDS.length > 0 && !ADMIN_USER_IDS.includes(userId)) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

const depositSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  paymentMethod: z.enum(["eft", "ewallet", "bank_transfer", "mobile_money", "other"]).default("eft"),
  externalTransactionId: z.string().optional(),
});

const withdrawalSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  paymentMethod: z.enum(["eft", "ewallet", "bank_transfer", "mobile_money"]),
  bankName: z.string().optional(),
  accountHolder: z.string().optional(),
  accountNumber: z.string().optional(),
  iban: z.string().optional(),
  swiftCode: z.string().optional(),
  ewalletProvider: z.string().optional(),
  ewalletId: z.string().optional(),
});

const adminWithdrawalActionSchema = z.object({
  id: z.number().int().positive(),
  action: z.enum(["approve", "reject"]),
  adminNotes: z.string().optional(),
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

const joinCompetitionSchema = z.object({
  competitionId: z.number().int().positive(),
  cardIds: z.array(z.number()).length(5, "Must select exactly 5 cards"),
  captainId: z.number().int().positive(),
});

const swapOfferSchema = z.object({
  offeredCardId: z.number().int().positive(),
  requestedCardId: z.number().int().positive(),
  topUpAmount: z.number().min(0).default(0),
  topUpDirection: z.enum(["none", "offerer_pays", "receiver_pays"]).default("none"),
});

const respondSwapSchema = z.object({
  offerId: z.number().int().positive(),
  action: z.enum(["accept", "reject"]),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  await setupAuth(app);
  registerAuthRoutes(app);

  await seedDatabase();
  await seedCompetitions();

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
      const { amount, paymentMethod, externalTransactionId } = parsed.data;

      let wallet = await storage.getWallet(userId);
      if (!wallet) {
        wallet = await storage.createWallet({ userId, balance: 0 });
      }

      const fee = +(amount * SITE_FEE_RATE).toFixed(2);
      const netAmount = +(amount - fee).toFixed(2);

      const updated = await storage.updateWalletBalance(userId, netAmount);
      await storage.createTransaction({
        userId,
        type: "deposit",
        amount: netAmount,
        description: `Deposited N$${amount.toFixed(2)} via ${paymentMethod.toUpperCase()} (N$${fee.toFixed(2)} fee)`,
        paymentMethod,
        externalTransactionId: externalTransactionId || null,
      });

      res.json({ ...updated, fee });
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
          const { serialId, serialNumber, maxSupply } = await storage.generateSerialId(randomPlayers[i].id, randomPlayers[i].name, "common");
          const card = await storage.createPlayerCard({
            playerId: randomPlayers[i].id,
            ownerId: userId,
            rarity: "common",
            serialId,
            serialNumber,
            maxSupply,
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

      const price = card.price || 0;
      const fee = +(price * SITE_FEE_RATE).toFixed(2);
      const totalCost = +(price + fee).toFixed(2);

      const wallet = await storage.getWallet(userId);
      if (!wallet || wallet.balance < totalCost) {
        return res.status(400).json({ message: `Insufficient funds. Total cost: N$${totalCost.toFixed(2)} (N$${fee.toFixed(2)} fee)` });
      }

      await storage.updateWalletBalance(userId, -totalCost);
      if (card.ownerId) {
        const sellerFee = +(price * SITE_FEE_RATE).toFixed(2);
        const sellerNet = +(price - sellerFee).toFixed(2);
        await storage.updateWalletBalance(card.ownerId, sellerNet);
        await storage.createTransaction({
          userId: card.ownerId,
          type: "sale",
          amount: sellerNet,
          description: `Sold card #${cardId} for N$${price.toFixed(2)} (N$${sellerFee.toFixed(2)} fee)`,
        });
      }

      await storage.createTransaction({
        userId,
        type: "purchase",
        amount: totalCost,
        description: `Purchased card #${cardId} for N$${price.toFixed(2)} (N$${fee.toFixed(2)} fee)`,
      });

      await storage.updatePlayerCard(cardId, {
        ownerId: userId,
        forSale: false,
        price: 0,
      });

      res.json({ success: true, fee });
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

  // Competition routes
  app.get("/api/competitions", isAuthenticated, async (req: any, res) => {
    try {
      const comps = await storage.getCompetitions();
      const result = [];
      for (const comp of comps) {
        const entries = await storage.getCompetitionEntries(comp.id);
        result.push({ ...comp, entryCount: entries.length, entries });
      }
      res.json(result);
    } catch (error) {
      console.error("Error getting competitions:", error);
      res.status(500).json({ message: "Failed to get competitions" });
    }
  });

  app.get("/api/competitions/:id", isAuthenticated, async (req: any, res) => {
    try {
      const comp = await storage.getCompetition(parseInt(req.params.id));
      if (!comp) return res.status(404).json({ message: "Competition not found" });
      const entries = await storage.getCompetitionEntries(comp.id);
      res.json({ ...comp, entryCount: entries.length, entries });
    } catch (error) {
      console.error("Error getting competition:", error);
      res.status(500).json({ message: "Failed to get competition" });
    }
  });

  app.post("/api/competitions/join", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = joinCompetitionSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0]?.message || "Invalid input" });
      }
      const { competitionId, cardIds, captainId } = parsed.data;

      const comp = await storage.getCompetition(competitionId);
      if (!comp) return res.status(404).json({ message: "Competition not found" });
      if (comp.status !== "open") return res.status(400).json({ message: "Competition is not open for entries" });

      const existing = await storage.getCompetitionEntry(competitionId, userId);
      if (existing) return res.status(400).json({ message: "Already entered this competition" });

      if (!cardIds.includes(captainId)) {
        return res.status(400).json({ message: "Captain must be in the lineup" });
      }

      for (const cardId of cardIds) {
        const card = await storage.getPlayerCardWithPlayer(cardId);
        if (!card || card.ownerId !== userId) {
          return res.status(400).json({ message: "Invalid card selection" });
        }
        if (card.forSale) {
          return res.status(400).json({ message: "Cannot use a listed card in competition" });
        }
      }

      if (comp.entryFee > 0) {
        const wallet = await storage.getWallet(userId);
        if (!wallet || wallet.balance < comp.entryFee) {
          return res.status(400).json({ message: "Insufficient funds for entry fee" });
        }
        await storage.updateWalletBalance(userId, -comp.entryFee);
        await storage.createTransaction({
          userId,
          type: "entry_fee",
          amount: comp.entryFee,
          description: `Entry fee for ${comp.name}`,
        });
      }

      const entry = await storage.createCompetitionEntry({
        competitionId,
        userId,
        lineupCardIds: cardIds,
        captainId,
        totalScore: 0,
      });

      res.json(entry);
    } catch (error) {
      console.error("Error joining competition:", error);
      res.status(500).json({ message: "Failed to join competition" });
    }
  });

  app.get("/api/competitions/:id/results", isAuthenticated, async (req: any, res) => {
    try {
      const comp = await storage.getCompetition(parseInt(req.params.id));
      if (!comp) return res.status(404).json({ message: "Competition not found" });
      const entries = await storage.getCompetitionEntries(comp.id);
      res.json({ competition: comp, entries });
    } catch (error) {
      console.error("Error getting results:", error);
      res.status(500).json({ message: "Failed to get results" });
    }
  });

  app.get("/api/rewards", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const rewards = await storage.getUserRewards(userId);
      const result = [];
      for (const r of rewards) {
        const comp = await storage.getCompetition(r.competitionId);
        let prizeCard = null;
        if (r.prizeCardId) {
          prizeCard = await storage.getPlayerCardWithPlayer(r.prizeCardId);
        }
        result.push({ ...r, competition: comp, prizeCard });
      }
      res.json(result);
    } catch (error) {
      console.error("Error getting rewards:", error);
      res.status(500).json({ message: "Failed to get rewards" });
    }
  });

  // Swap routes
  app.post("/api/swap/offer", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = swapOfferSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0]?.message || "Invalid input" });
      }
      const { offeredCardId, requestedCardId, topUpAmount, topUpDirection } = parsed.data;

      const offeredCard = await storage.getPlayerCard(offeredCardId);
      if (!offeredCard || offeredCard.ownerId !== userId) {
        return res.status(400).json({ message: "You don't own the offered card" });
      }
      if (offeredCard.forSale) {
        return res.status(400).json({ message: "Cannot swap a listed card" });
      }

      const requestedCard = await storage.getPlayerCard(requestedCardId);
      if (!requestedCard || !requestedCard.forSale) {
        return res.status(400).json({ message: "Requested card is not available for swap" });
      }
      if (requestedCard.ownerId === userId) {
        return res.status(400).json({ message: "Cannot swap with yourself" });
      }

      const basePrice = requestedCard.price || 0;
      const swapFee = +(basePrice * SITE_FEE_RATE).toFixed(2);
      const halfFee = +(swapFee / 2).toFixed(2);

      const offererWallet = await storage.getWallet(userId);
      let offererCost = halfFee;
      if (topUpDirection === "offerer_pays") offererCost += topUpAmount;
      if (!offererWallet || offererWallet.balance < offererCost) {
        return res.status(400).json({ message: "Insufficient funds for swap fee" });
      }

      const offer = await storage.createSwapOffer({
        offererUserId: userId,
        receiverUserId: requestedCard.ownerId!,
        offeredCardId,
        requestedCardId,
        topUpAmount,
        topUpDirection,
      });

      res.json(offer);
    } catch (error) {
      console.error("Error creating swap offer:", error);
      res.status(500).json({ message: "Failed to create swap offer" });
    }
  });

  app.post("/api/swap/respond", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = respondSwapSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0]?.message || "Invalid input" });
      }
      const { offerId, action } = parsed.data;

      const offer = await storage.getSwapOffer(offerId);
      if (!offer || offer.receiverUserId !== userId) {
        return res.status(400).json({ message: "Swap offer not found" });
      }
      if (offer.status !== "pending") {
        return res.status(400).json({ message: "Swap offer is no longer pending" });
      }

      if (action === "reject") {
        await storage.updateSwapOffer(offerId, { status: "rejected" });
        return res.json({ success: true });
      }

      const requestedCard = await storage.getPlayerCard(offer.requestedCardId);
      const offeredCard = await storage.getPlayerCard(offer.offeredCardId);
      if (!requestedCard || !offeredCard) {
        return res.status(400).json({ message: "Cards no longer available" });
      }

      const basePrice = requestedCard.price || 0;
      const swapFee = +(basePrice * SITE_FEE_RATE).toFixed(2);
      const halfFee = +(swapFee / 2).toFixed(2);

      await storage.updateWalletBalance(offer.offererUserId, -halfFee);
      await storage.createTransaction({
        userId: offer.offererUserId,
        type: "swap_fee",
        amount: halfFee,
        description: `Swap fee for card #${offer.requestedCardId}`,
      });

      await storage.updateWalletBalance(userId, -halfFee);
      await storage.createTransaction({
        userId,
        type: "swap_fee",
        amount: halfFee,
        description: `Swap fee for card #${offer.offeredCardId}`,
      });

      if (offer.topUpAmount && offer.topUpAmount > 0) {
        if (offer.topUpDirection === "offerer_pays") {
          await storage.updateWalletBalance(offer.offererUserId, -offer.topUpAmount);
          await storage.updateWalletBalance(userId, offer.topUpAmount);
        } else if (offer.topUpDirection === "receiver_pays") {
          await storage.updateWalletBalance(userId, -offer.topUpAmount);
          await storage.updateWalletBalance(offer.offererUserId, offer.topUpAmount);
        }
      }

      await storage.updatePlayerCard(offer.offeredCardId, { ownerId: userId, forSale: false, price: 0 });
      await storage.updatePlayerCard(offer.requestedCardId, { ownerId: offer.offererUserId, forSale: false, price: 0 });

      await storage.updateSwapOffer(offerId, { status: "accepted" });

      res.json({ success: true });
    } catch (error) {
      console.error("Error responding to swap:", error);
      res.status(500).json({ message: "Failed to respond to swap" });
    }
  });

  app.get("/api/swap/offers", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const offers = await storage.getUserSwapOffers(userId);
      const result = [];
      for (const offer of offers) {
        const offeredCard = await storage.getPlayerCardWithPlayer(offer.offeredCardId);
        const requestedCard = await storage.getPlayerCardWithPlayer(offer.requestedCardId);
        result.push({ ...offer, offeredCard, requestedCard });
      }
      res.json(result);
    } catch (error) {
      console.error("Error getting swap offers:", error);
      res.status(500).json({ message: "Failed to get swap offers" });
    }
  });

  app.get("/api/swap/for-card/:cardId", isAuthenticated, async (req: any, res) => {
    try {
      const cardId = parseInt(req.params.cardId);
      const offers = await storage.getSwapOffersForCard(cardId);
      const result = [];
      for (const offer of offers) {
        const offeredCard = await storage.getPlayerCardWithPlayer(offer.offeredCardId);
        result.push({ ...offer, offeredCard });
      }
      res.json(result);
    } catch (error) {
      console.error("Error getting swap offers for card:", error);
      res.status(500).json({ message: "Failed to get swap offers" });
    }
  });

  // Withdrawal request
  app.post("/api/wallet/withdraw", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parsed = withdrawalSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0]?.message || "Invalid input" });
      }
      const { amount, paymentMethod, bankName, accountHolder, accountNumber, iban, swiftCode, ewalletProvider, ewalletId } = parsed.data;

      const wallet = await storage.getWallet(userId);
      if (!wallet || wallet.balance < amount) {
        return res.status(400).json({ message: "Insufficient available balance" });
      }

      const fee = +(amount * SITE_FEE_RATE).toFixed(2);
      const netAmount = +(amount - fee).toFixed(2);

      const locked = await storage.lockFunds(userId, amount);
      if (!locked) {
        return res.status(400).json({ message: "Insufficient available balance" });
      }

      const withdrawalRequest = await storage.createWithdrawalRequest({
        userId,
        amount,
        fee,
        netAmount,
        paymentMethod,
        bankName: bankName || null,
        accountHolder: accountHolder || null,
        accountNumber: accountNumber || null,
        iban: iban || null,
        swiftCode: swiftCode || null,
        ewalletProvider: ewalletProvider || null,
        ewalletId: ewalletId || null,
      });

      await storage.createTransaction({
        userId,
        type: "withdrawal",
        amount: amount,
        description: `Withdrawal request N$${amount.toFixed(2)} via ${paymentMethod.toUpperCase()} (N$${fee.toFixed(2)} fee) - Pending review`,
        paymentMethod,
      });

      res.json(withdrawalRequest);
    } catch (error) {
      console.error("Error creating withdrawal:", error);
      res.status(500).json({ message: "Failed to create withdrawal request" });
    }
  });

  app.get("/api/wallet/withdrawals", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const requests = await storage.getUserWithdrawalRequests(userId);
      res.json(requests);
    } catch (error) {
      console.error("Error getting withdrawals:", error);
      res.status(500).json({ message: "Failed to get withdrawal requests" });
    }
  });

  app.get("/api/admin/check", isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const isAdminUser = ADMIN_USER_IDS.length === 0 || ADMIN_USER_IDS.includes(userId);
    res.json({ isAdmin: isAdminUser });
  });

  // Admin routes
  app.get("/api/admin/withdrawals", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const all = await storage.getAllWithdrawals();
      res.json(all);
    } catch (error) {
      console.error("Error getting admin withdrawals:", error);
      res.status(500).json({ message: "Failed to get withdrawals" });
    }
  });

  app.get("/api/admin/withdrawals/pending", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const pending = await storage.getAllPendingWithdrawals();
      res.json(pending);
    } catch (error) {
      console.error("Error getting pending withdrawals:", error);
      res.status(500).json({ message: "Failed to get pending withdrawals" });
    }
  });

  app.post("/api/admin/withdrawals/action", isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const parsed = adminWithdrawalActionSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0]?.message || "Invalid input" });
      }
      const { id, action, adminNotes } = parsed.data;

      const allWds = await storage.getAllWithdrawals();
      const wr = allWds.find(w => w.id === id);
      if (!wr) return res.status(404).json({ message: "Withdrawal request not found" });

      if (wr.status !== "pending" && wr.status !== "processing") {
        return res.status(400).json({ message: "This withdrawal has already been processed" });
      }

      if (action === "approve") {
        await storage.updateWithdrawalRequest(id, {
          status: "completed",
          adminNotes: adminNotes || "Approved",
          reviewedAt: new Date(),
        });
        await storage.updateWalletLockedBalance(wr.userId, -wr.amount);
      } else {
        await storage.updateWithdrawalRequest(id, {
          status: "rejected",
          adminNotes: adminNotes || "Rejected",
          reviewedAt: new Date(),
        });
        await storage.unlockFunds(wr.userId, wr.amount);
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error processing withdrawal:", error);
      res.status(500).json({ message: "Failed to process withdrawal" });
    }
  });

  initialSync().catch(err => console.error("Initial EPL sync error:", err));

  app.get("/api/epl/standings", isAuthenticated, async (req: any, res) => {
    try {
      const standings = await getEplStandings();
      res.json(standings);
    } catch (error) {
      console.error("Error getting EPL standings:", error);
      res.status(500).json({ message: "Failed to get standings" });
    }
  });

  app.get("/api/epl/fixtures", isAuthenticated, async (req: any, res) => {
    try {
      const status = req.query.status as string | undefined;
      const fixtures = await getEplFixtures(status);
      res.json(fixtures);
    } catch (error) {
      console.error("Error getting EPL fixtures:", error);
      res.status(500).json({ message: "Failed to get fixtures" });
    }
  });

  app.get("/api/epl/players", isAuthenticated, async (req: any, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
      const search = req.query.search as string | undefined;
      const position = req.query.position as string | undefined;
      const players = await getEplPlayers(page, limit, search, position);
      res.json(players);
    } catch (error) {
      console.error("Error getting EPL players:", error);
      res.status(500).json({ message: "Failed to get players" });
    }
  });

  app.get("/api/epl/injuries", isAuthenticated, async (req: any, res) => {
    try {
      const injuries = await getEplInjuries();
      res.json(injuries);
    } catch (error) {
      console.error("Error getting EPL injuries:", error);
      res.status(500).json({ message: "Failed to get injuries" });
    }
  });

  app.post("/api/epl/sync", isAuthenticated, async (req: any, res) => {
    try {
      const type = req.body.type || "all";
      let synced = false;
      if (type === "standings" || type === "all") synced = await syncStandings() || synced;
      if (type === "fixtures" || type === "all") synced = await syncFixtures() || synced;
      if (type === "players" || type === "all") {
        synced = await syncTopPlayers(1) || synced;
        synced = await syncTopPlayers(2) || synced;
      }
      if (type === "injuries" || type === "all") synced = await syncInjuries() || synced;
      res.json({ synced, message: synced ? "Data synced successfully" : "Data is up to date (cached)" });
    } catch (error) {
      console.error("Error syncing EPL data:", error);
      res.status(500).json({ message: "Failed to sync data" });
    }
  });

  app.post("/api/cards/update-scores", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cards = await storage.getUserCards(userId);
      let updated = 0;
      for (const card of cards) {
        const player = card.player;
        if (!player) continue;
        const overallRating = player.overall || 50;
        const estimatedGoals = Math.max(0, Math.floor((overallRating - 60) / 5));
        const estimatedAssists = Math.max(0, Math.floor((overallRating - 55) / 8));
        const isDefOrGK = player.position === "DEF" || player.position === "GK";
        const estimatedCleanSheets = isDefOrGK ? Math.max(0, Math.floor((overallRating - 70) / 4)) : 0;
        const { level: decisiveLevel, points } = calculateDecisiveLevel({
          goals: estimatedGoals,
          assists: estimatedAssists,
          cleanSheets: estimatedCleanSheets,
          penaltySaves: 0,
          redCards: 0,
          ownGoals: 0,
          errorsLeadingToGoal: 0,
        });
        const xpGain = overallRating * 2 + estimatedGoals * 50 + estimatedAssists * 30;
        const newXp = (card.xp || 0) + xpGain;
        const newLevel = Math.max(1, Math.min(5, decisiveLevel + 1));
        if (card.decisiveScore !== points || card.level !== newLevel) {
          await storage.updatePlayerCard(card.id, {
            decisiveScore: points,
            level: newLevel,
            xp: newXp,
          });
          updated++;
        }
      }
      res.json({ updated, message: `Updated ${updated} cards` });
    } catch (error) {
      console.error("Error updating card scores:", error);
      res.status(500).json({ message: "Failed to update scores" });
    }
  });

  app.get("/api/sorare/player", async (req, res) => {
    try {
      const firstName = String(req.query.firstName || "");
      const lastName = String(req.query.lastName || "");
      if (!firstName || !lastName) {
        return res.status(400).json({ message: "firstName and lastName required" });
      }
      const player = await fetchSorarePlayer(firstName, lastName);
      if (!player) {
        return res.status(404).json({ message: "Player not found on Sorare" });
      }
      res.json({
        slug: player.slug,
        displayName: player.displayName,
        imageUrl: getSorareImageUrl(player),
        position: player.position,
        age: player.age,
        club: player.activeClub?.name || null,
        clubLogo: player.activeClub?.pictureUrl || null,
        recentScores: player.so5Scores.map((s: { score: number }) => s.score),
      });
    } catch (error) {
      console.error("Sorare player fetch error:", error);
      res.status(500).json({ message: "Failed to fetch Sorare player data" });
    }
  });

  return httpServer;
}
