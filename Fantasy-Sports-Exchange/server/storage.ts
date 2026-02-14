import {
  type Player, type InsertPlayer,
  type PlayerCard, type InsertPlayerCard,
  type Wallet, type InsertWallet,
  type Transaction, type InsertTransaction,
  type Lineup, type InsertLineup,
  type UserOnboarding, type InsertOnboarding,
  type PlayerCardWithPlayer,
  type Competition, type InsertCompetition,
  type CompetitionEntry, type InsertCompetitionEntry,
  type SwapOffer, type InsertSwapOffer,
  type WithdrawalRequest, type InsertWithdrawalRequest,
  type UserTradeHistory, type InsertUserTradeHistory,
  type MarketplaceTrade, type InsertMarketplaceTrade,
  type Notification, type InsertNotification,
  type User,
  players, playerCards, wallets, transactions, lineups, userOnboarding,
  competitions, competitionEntries, swapOffers, withdrawalRequests,
  userTradeHistory, marketplaceTrades, notifications,
  users,
  RARITY_SUPPLY,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql, desc, gte } from "drizzle-orm";

export interface IStorage {
  getUser(userId: string): Promise<User | undefined>;
  getPlayers(): Promise<Player[]>;
  getPlayer(id: number): Promise<Player | undefined>;
  createPlayer(player: InsertPlayer): Promise<Player>;

  getPlayerCard(id: number): Promise<PlayerCard | undefined>;
  getPlayerCardWithPlayer(id: number): Promise<PlayerCardWithPlayer | undefined>;
  getUserCards(userId: string): Promise<PlayerCardWithPlayer[]>;
  createPlayerCard(card: InsertPlayerCard): Promise<PlayerCard>;
  updatePlayerCard(id: number, updates: Partial<PlayerCard>): Promise<PlayerCard | undefined>;
  getMarketplaceListings(): Promise<PlayerCardWithPlayer[]>;

  getWallet(userId: string): Promise<Wallet | undefined>;
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  updateWalletBalance(userId: string, amount: number): Promise<Wallet | undefined>;
  updateWalletLockedBalance(userId: string, amount: number): Promise<Wallet | undefined>;
  lockFunds(userId: string, amount: number): Promise<Wallet | undefined>;
  unlockFunds(userId: string, amount: number): Promise<Wallet | undefined>;

  getTransactions(userId: string): Promise<Transaction[]>;
  createTransaction(tx: InsertTransaction): Promise<Transaction>;

  getLineup(userId: string): Promise<Lineup | undefined>;
  createOrUpdateLineup(userId: string, cardIds: number[], captainId: number): Promise<Lineup>;

  getOnboarding(userId: string): Promise<UserOnboarding | undefined>;
  createOnboarding(data: InsertOnboarding): Promise<UserOnboarding>;
  updateOnboarding(userId: string, updates: Partial<UserOnboarding>): Promise<UserOnboarding | undefined>;

  getPlayerCount(): Promise<number>;
  getRandomPlayers(count: number): Promise<Player[]>;
  getRandomPlayersByPosition(position: string, count: number): Promise<Player[]>;

  getCompetitions(): Promise<Competition[]>;
  getCompetition(id: number): Promise<Competition | undefined>;
  createCompetition(comp: InsertCompetition): Promise<Competition>;
  updateCompetition(id: number, updates: Partial<Competition>): Promise<Competition | undefined>;
  getCompetitionEntries(competitionId: number): Promise<CompetitionEntry[]>;
  getCompetitionEntry(competitionId: number, userId: string): Promise<CompetitionEntry | undefined>;
  createCompetitionEntry(entry: InsertCompetitionEntry): Promise<CompetitionEntry>;
  updateCompetitionEntry(id: number, updates: Partial<CompetitionEntry>): Promise<CompetitionEntry | undefined>;
  getUserCompetitions(userId: string): Promise<CompetitionEntry[]>;
  getUserRewards(userId: string): Promise<CompetitionEntry[]>;

  getSwapOffer(id: number): Promise<SwapOffer | undefined>;
  getSwapOffersForCard(cardId: number): Promise<SwapOffer[]>;
  getUserSwapOffers(userId: string): Promise<SwapOffer[]>;
  createSwapOffer(offer: InsertSwapOffer): Promise<SwapOffer>;
  updateSwapOffer(id: number, updates: Partial<SwapOffer>): Promise<SwapOffer | undefined>;

  createWithdrawalRequest(req: InsertWithdrawalRequest): Promise<WithdrawalRequest>;
  getUserWithdrawalRequests(userId: string): Promise<WithdrawalRequest[]>;
  getAllPendingWithdrawals(): Promise<WithdrawalRequest[]>;
  getAllWithdrawals(): Promise<WithdrawalRequest[]>;
  updateWithdrawalRequest(id: number, updates: Partial<WithdrawalRequest>): Promise<WithdrawalRequest | undefined>;

  getUserTradeHistory(userId: string, hours: number): Promise<UserTradeHistory[]>;
  createUserTradeHistory(trade: InsertUserTradeHistory): Promise<UserTradeHistory>;

  createMarketplaceTrade(trade: InsertMarketplaceTrade): Promise<MarketplaceTrade>;
  getMarketplaceTrades(limit?: number): Promise<MarketplaceTrade[]>;

  getNotifications(userId: string): Promise<Notification[]>;
  getUnreadNotifications(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  updateNotification(id: number, updates: Partial<Notification>): Promise<Notification | undefined>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;

  generateSerialId(playerId: number, playerName: string, rarity?: string): Promise<{ serialId: string; serialNumber: number; maxSupply: number }>;
  getSupplyCount(playerId: number, rarity: string): Promise<number>;
  backfillSerialIds(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(userId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    return user || undefined;
  }

  async getPlayers(): Promise<Player[]> {
    return db.select().from(players);
  }

  async getPlayer(id: number): Promise<Player | undefined> {
    const [player] = await db.select().from(players).where(eq(players.id, id));
    return player || undefined;
  }

  async createPlayer(player: InsertPlayer): Promise<Player> {
    const [created] = await db.insert(players).values(player as any).returning();
    return created;
  }

  async getPlayerCard(id: number): Promise<PlayerCard | undefined> {
    const [card] = await db.select().from(playerCards).where(eq(playerCards.id, id));
    return card || undefined;
  }

  async getPlayerCardWithPlayer(id: number): Promise<PlayerCardWithPlayer | undefined> {
    const [result] = await db
      .select()
      .from(playerCards)
      .innerJoin(players, eq(playerCards.playerId, players.id))
      .where(eq(playerCards.id, id));
    if (!result) return undefined;
    return { ...result.player_cards, player: result.players };
  }

  async getUserCards(userId: string): Promise<PlayerCardWithPlayer[]> {
    const results = await db
      .select()
      .from(playerCards)
      .innerJoin(players, eq(playerCards.playerId, players.id))
      .where(eq(playerCards.ownerId, userId));
    return results.map((r) => ({ ...r.player_cards, player: r.players }));
  }

  async createPlayerCard(card: InsertPlayerCard): Promise<PlayerCard> {
    const rarity = card.rarity || "common";
    const maxSupply = RARITY_SUPPLY[rarity] || 0;
    if (maxSupply > 0 && card.playerId) {
      const currentCount = await this.getSupplyCount(card.playerId, rarity);
      if (currentCount >= maxSupply) {
        throw new Error(`Supply cap reached for this player's ${rarity} cards (${maxSupply} max)`);
      }
    }
    const [created] = await db.insert(playerCards).values(card as any).returning();
    return created;
  }

  async updatePlayerCard(id: number, updates: Partial<PlayerCard>): Promise<PlayerCard | undefined> {
    const [updated] = await db
      .update(playerCards)
      .set(updates)
      .where(eq(playerCards.id, id))
      .returning();
    return updated || undefined;
  }

  async getMarketplaceListings(): Promise<PlayerCardWithPlayer[]> {
    const results = await db
      .select()
      .from(playerCards)
      .innerJoin(players, eq(playerCards.playerId, players.id))
      .where(eq(playerCards.forSale, true));
    return results.map((r) => ({ ...r.player_cards, player: r.players }));
  }

  async getWallet(userId: string): Promise<Wallet | undefined> {
    const [w] = await db.select().from(wallets).where(eq(wallets.userId, userId));
    return w || undefined;
  }

  async createWallet(wallet: InsertWallet): Promise<Wallet> {
    const [created] = await db.insert(wallets).values(wallet as any).returning();
    return created;
  }

  async updateWalletBalance(userId: string, amount: number): Promise<Wallet | undefined> {
    const [updated] = await db
      .update(wallets)
      .set({ balance: sql`${wallets.balance} + ${amount}` })
      .where(eq(wallets.userId, userId))
      .returning();
    return updated || undefined;
  }

  async updateWalletLockedBalance(userId: string, amount: number): Promise<Wallet | undefined> {
    const [updated] = await db
      .update(wallets)
      .set({ lockedBalance: sql`${wallets.lockedBalance} + ${amount}` })
      .where(eq(wallets.userId, userId))
      .returning();
    return updated || undefined;
  }

  async lockFunds(userId: string, amount: number): Promise<Wallet | undefined> {
    const [updated] = await db
      .update(wallets)
      .set({
        balance: sql`${wallets.balance} - ${amount}`,
        lockedBalance: sql`${wallets.lockedBalance} + ${amount}`
      })
      .where(eq(wallets.userId, userId))
      .returning();
    return updated || undefined;
  }

  async unlockFunds(userId: string, amount: number): Promise<Wallet | undefined> {
    const [updated] = await db
      .update(wallets)
      .set({
        balance: sql`${wallets.balance} + ${amount}`,
        lockedBalance: sql`${wallets.lockedBalance} - ${amount}`
      })
      .where(eq(wallets.userId, userId))
      .returning();
    return updated || undefined;
  }

  async getTransactions(userId: string): Promise<Transaction[]> {
    // Fix: Ensure 'desc' is used as a function to sort by the 'createdAt' column
    return db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt)); // Correct usage of the desc keyword
  }

  async createTransaction(tx: InsertTransaction): Promise<Transaction> {
    const [created] = await db.insert(transactions).values(tx as any).returning();
    return created;
  }

  async getLineup(userId: string): Promise<Lineup | undefined> {
    const [l] = await db.select().from(lineups).where(eq(lineups.userId, userId));
    return l || undefined;
  }

  async createOrUpdateLineup(userId: string, cardIds: number[], captainId: number): Promise<Lineup> {
    const [existing] = await db.select().from(lineups).where(eq(lineups.userId, userId));
    if (existing) {
      const [updated] = await db.update(lineups).set({ cardIds, captainId, updatedAt: new Date() }).where(eq(lineups.id, existing.id)).returning();
      return updated;
    }
    const [created] = await db.insert(lineups).values({ userId, cardIds, captainId } as any).returning();
    return created;
  }

  async getOnboarding(userId: string): Promise<UserOnboarding | undefined> {
    const [o] = await db.select().from(userOnboarding).where(eq(userOnboarding.userId, userId));
    return o || undefined;
  }

  async createOnboarding(data: InsertOnboarding): Promise<UserOnboarding> {
    const [created] = await db.insert(userOnboarding).values(data as any).returning();
    return created;
  }

  async updateOnboarding(userId: string, updates: Partial<UserOnboarding>): Promise<UserOnboarding | undefined> {
    const [updated] = await db.update(userOnboarding).set(updates).where(eq(userOnboarding.userId, userId)).returning();
    return updated || undefined;
  }

  async getPlayerCount(): Promise<number> {
    const [result] = await db.select({ count: sql<number>`count(*)` }).from(players);
    return result.count;
  }

  async getRandomPlayers(count: number): Promise<Player[]> {
    return db.select().from(players).orderBy(sql`RANDOM()`).limit(count);
  }

  async getRandomPlayersByPosition(position: string, count: number): Promise<Player[]> {
    return db.select().from(players).where(eq(players.position, position)).orderBy(sql`RANDOM()`).limit(count);
  }

  async getCompetitions(): Promise<Competition[]> {
    return db.select().from(competitions).orderBy(desc(competitions.startTime));
  }

  async getCompetition(id: number): Promise<Competition | undefined> {
    const [comp] = await db.select().from(competitions).where(eq(competitions.id, id));
    return comp || undefined;
  }

  async createCompetition(comp: InsertCompetition): Promise<Competition> {
    const [created] = await db.insert(competitions).values(comp as any).returning();
    return created;
  }

  async updateCompetition(id: number, updates: Partial<Competition>): Promise<Competition | undefined> {
    const [updated] = await db.update(competitions).set(updates).where(eq(competitions.id, id)).returning();
    return updated || undefined;
  }

  async getCompetitionEntries(competitionId: number): Promise<CompetitionEntry[]> {
    return db.select().from(competitionEntries).where(eq(competitionEntries.competitionId, competitionId));
  }

  async getCompetitionEntry(competitionId: number, userId: string): Promise<CompetitionEntry | undefined> {
    const [entry] = await db.select().from(competitionEntries).where(and(eq(competitionEntries.competitionId, competitionId), eq(competitionEntries.userId, userId)));
    return entry || undefined;
  }

  async createCompetitionEntry(entry: InsertCompetitionEntry): Promise<CompetitionEntry> {
    const [created] = await db.insert(competitionEntries).values(entry as any).returning();
    return created;
  }

  async updateCompetitionEntry(id: number, updates: Partial<CompetitionEntry>): Promise<CompetitionEntry | undefined> {
    const [updated] = await db.update(competitionEntries).set(updates).where(eq(competitionEntries.id, id)).returning();
    return updated || undefined;
  }

  async getUserCompetitions(userId: string): Promise<CompetitionEntry[]> {
    return db.select().from(competitionEntries).where(eq(competitionEntries.userId, userId));
  }

  async getUserRewards(userId: string): Promise<CompetitionEntry[]> {
    return db.select().from(competitionEntries).where(and(eq(competitionEntries.userId, userId), sql`${competitionEntries.rewardAmount} > 0`));
  }

  async getSwapOffer(id: number): Promise<SwapOffer | undefined> {
    const [offer] = await db.select().from(swapOffers).where(eq(swapOffers.id, id));
    return offer || undefined;
  }

  async getSwapOffersForCard(cardId: number): Promise<SwapOffer[]> {
    return db.select().from(swapOffers).where(eq(swapOffers.offeredCardId, cardId));
  }

  async getUserSwapOffers(userId: string): Promise<SwapOffer[]> {
    return db.select().from(swapOffers).where(eq(swapOffers.senderId, userId));
  }

  async createSwapOffer(offer: InsertSwapOffer): Promise<SwapOffer> {
    const [created] = await db.insert(swapOffers).values(offer as any).returning();
    return created;
  }

  async updateSwapOffer(id: number, updates: Partial<SwapOffer>): Promise<SwapOffer | undefined> {
    const [updated] = await db.update(swapOffers).set(updates).where(eq(swapOffers.id, id)).returning();
    return updated || undefined;
  }

  async createWithdrawalRequest(req: InsertWithdrawalRequest): Promise<WithdrawalRequest> {
    const [created] = await db.insert(withdrawalRequests).values(req as any).returning();
    return created;
  }

  async getUserWithdrawalRequests(userId: string): Promise<WithdrawalRequest[]> {
    return db.select().from(withdrawalRequests).where(eq(withdrawalRequests.userId, userId));
  }

  async getAllPendingWithdrawals(): Promise<WithdrawalRequest[]> {
    return db.select().from(withdrawalRequests).where(eq(withdrawalRequests.status, "pending"));
  }

  async getAllWithdrawals(): Promise<WithdrawalRequest[]> {
    return db.select().from(withdrawalRequests).orderBy(desc(withdrawalRequests.createdAt));
  }

  async updateWithdrawalRequest(id: number, updates: Partial<WithdrawalRequest>): Promise<WithdrawalRequest | undefined> {
    const [updated] = await db.update(withdrawalRequests).set(updates).where(eq(withdrawalRequests.id, id)).returning();
    return updated || undefined;
  }

  async generateSerialId(playerId: number, playerName: string, rarity: string = "common"): Promise<{ serialId: string; serialNumber: number; maxSupply: number }> {
    const maxSupply = RARITY_SUPPLY[rarity] || 0;
    const currentCount = await this.getSupplyCount(playerId, rarity);
    const nextNumber = currentCount + 1;
    const initials = playerName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 3);
    const serialId = `${initials}-${rarity[0].toUpperCase()}-${nextNumber.toString().padStart(4, '0')}`;
    return { serialId, serialNumber: nextNumber, maxSupply };
  }

  async getSupplyCount(playerId: number, rarity: string): Promise<number> {
    const [result] = await db.select({ count: sql<number>`count(*)` }).from(playerCards).where(and(eq(playerCards.playerId, playerId), eq(playerCards.rarity, rarity)));
    return result.count;
  }

  async backfillSerialIds(): Promise<void> {
    const allCards = await db.select().from(playerCards);
    for (const card of allCards) {
      if (!card.serialId && card.playerId) {
        const [player] = await db.select().from(players).where(eq(players.id, card.playerId));
        if (player) {
          const { serialId, serialNumber } = await this.generateSerialId(player.id, player.name, card.rarity || "common");
          await db.update(playerCards).set({ serialId, serialNumber }).where(eq(playerCards.id, card.id));
        }
      }
    }
  }

  // User Trade History methods
  async getUserTradeHistory(userId: string, hours: number): Promise<UserTradeHistory[]> {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
    return db
      .select()
      .from(userTradeHistory)
      .where(
        and(
          eq(userTradeHistory.userId, userId),
          gte(userTradeHistory.timestamp, cutoffTime)
        )
      )
      .orderBy(desc(userTradeHistory.timestamp));
  }

  async createUserTradeHistory(trade: InsertUserTradeHistory): Promise<UserTradeHistory> {
    const [created] = await db.insert(userTradeHistory).values(trade as any).returning();
    return created;
  }

  // Marketplace Trade methods
  async createMarketplaceTrade(trade: InsertMarketplaceTrade): Promise<MarketplaceTrade> {
    const [created] = await db.insert(marketplaceTrades).values(trade as any).returning();
    return created;
  }

  async getMarketplaceTrades(limit: number = 100): Promise<MarketplaceTrade[]> {
    return db
      .select()
      .from(marketplaceTrades)
      .orderBy(desc(marketplaceTrades.timestamp))
      .limit(limit);
  }

  // Notification methods
  async getNotifications(userId: string): Promise<Notification[]> {
    return db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async getUnreadNotifications(userId: string): Promise<Notification[]> {
    return db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        )
      )
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [created] = await db.insert(notifications).values(notification as any).returning();
    return created;
  }

  async updateNotification(id: number, updates: Partial<Notification>): Promise<Notification | undefined> {
    const [updated] = await db
      .update(notifications)
      .set(updates)
      .where(eq(notifications.id, id))
      .returning();
    return updated || undefined;
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    return this.updateNotification(id, { isRead: true });
  }
}

export const storage = new DatabaseStorage();