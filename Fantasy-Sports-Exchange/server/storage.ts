import {
  type Player, type InsertPlayer,
  type PlayerCard, type InsertPlayerCard,
  type Wallet, type InsertWallet,
  type Transaction, type InsertTransaction,
  type Lineup, type InsertLineup,
  type UserOnboarding, type InsertOnboarding,
  type PlayerCardWithPlayer,
  players, playerCards, wallets, transactions, lineups, userOnboarding,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";

export interface IStorage {
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

  getTransactions(userId: string): Promise<Transaction[]>;
  createTransaction(tx: InsertTransaction): Promise<Transaction>;

  getLineup(userId: string): Promise<Lineup | undefined>;
  createOrUpdateLineup(userId: string, cardIds: number[], captainId: number): Promise<Lineup>;

  getOnboarding(userId: string): Promise<UserOnboarding | undefined>;
  createOnboarding(data: InsertOnboarding): Promise<UserOnboarding>;
  updateOnboarding(userId: string, updates: Partial<UserOnboarding>): Promise<UserOnboarding | undefined>;

  getPlayerCount(): Promise<number>;
  getRandomPlayers(count: number): Promise<Player[]>;
}

export class DatabaseStorage implements IStorage {
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

  async getTransactions(userId: string): Promise<Transaction[]> {
    const results = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(sql`${transactions.createdAt} DESC`);
    return results;
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
    const existing = await this.getLineup(userId);
    if (existing) {
      const [updated] = await db
        .update(lineups)
        .set({ cardIds, captainId } as any)
        .where(eq(lineups.userId, userId))
        .returning();
      return updated;
    }
    const [created] = await db
      .insert(lineups)
      .values({ userId, cardIds, captainId } as any)
      .returning();
    return created;
  }

  async getOnboarding(userId: string): Promise<UserOnboarding | undefined> {
    const [o] = await db
      .select()
      .from(userOnboarding)
      .where(eq(userOnboarding.userId, userId));
    return o || undefined;
  }

  async createOnboarding(data: InsertOnboarding): Promise<UserOnboarding> {
    const [created] = await db.insert(userOnboarding).values(data as any).returning();
    return created;
  }

  async updateOnboarding(userId: string, updates: Partial<UserOnboarding>): Promise<UserOnboarding | undefined> {
    const [updated] = await db
      .update(userOnboarding)
      .set(updates)
      .where(eq(userOnboarding.userId, userId))
      .returning();
    return updated || undefined;
  }

  async getPlayerCount(): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(players);
    return result?.count || 0;
  }

  async getRandomPlayers(count: number): Promise<Player[]> {
    return db
      .select()
      .from(players)
      .orderBy(sql`RANDOM()`)
      .limit(count);
  }
}

export const storage = new DatabaseStorage();
