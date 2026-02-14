export * from "./models/auth";

import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, boolean, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";

export const rarityEnum = pgEnum("rarity", ["common", "rare", "unique", "epic", "legendary"]);
export const positionEnum = pgEnum("position", ["GK", "DEF", "MID", "FWD"]);
export const transactionTypeEnum = pgEnum("transaction_type", ["deposit", "withdrawal", "purchase", "sale", "entry_fee", "prize", "swap_fee"]);
export const competitionTierEnum = pgEnum("competition_tier", ["common", "rare"]);
export const competitionStatusEnum = pgEnum("competition_status", ["open", "active", "completed"]);
export const swapStatusEnum = pgEnum("swap_status", ["pending", "accepted", "rejected", "cancelled"]);
export const withdrawalStatusEnum = pgEnum("withdrawal_status", ["pending", "processing", "completed", "rejected"]);
export const paymentMethodEnum = pgEnum("payment_method", ["eft", "ewallet", "bank_transfer", "mobile_money", "other"]);
export const tradeTypeEnum = pgEnum("trade_type", ["sell", "buy", "swap"]);
export const notificationTypeEnum = pgEnum("notification_type", ["reward", "prize", "trade", "competition", "system"]);

export const players = pgTable("players", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  team: text("team").notNull(),
  league: text("league").notNull(),
  position: positionEnum("position").notNull(),
  nationality: text("nationality").notNull(),
  age: integer("age").notNull(),
  overall: integer("overall").notNull(),
  imageUrl: text("image_url"),
});

export const RARITY_SUPPLY: Record<string, number> = {
  common: 0,
  rare: 100,
  unique: 1,
  epic: 10,
  legendary: 5,
};

// XP Scoring Constants - Real-world performance to XP mapping
export const XP_SCORING = {
  GOAL: 100,
  ASSIST: 60,
  APPEARANCE: 30,
  CLEAN_SHEET: 50,
  PENALTY_SAVE: 80,
  YELLOW_CARD: -10,
  RED_CARD: -20,
  OWN_GOAL: -20,
  ERROR_LEADING_TO_GOAL: -15,
  PER_10_MINUTES: 1,
} as const;

// Stat Multiplier per Rarity - Applied to displayed stats (not XP gain)
export const STAT_MULTIPLIERS: Record<string, number> = {
  common: 1.0,
  rare: 1.1,
  unique: 1.2,
  epic: 1.35,
  legendary: 1.5,
};

// Marketplace Price Limits per Rarity (in currency units)
export const PRICE_LIMITS: Record<string, { min: number; max: number }> = {
  common: { min: 1, max: 50 },
  rare: { min: 5, max: 500 },
  unique: { min: 50, max: 5000 },
  epic: { min: 200, max: 20000 },
  legendary: { min: 1000, max: 100000 },
};

// Trade Rate Limiting Constants (per 24-hour rolling window)
export const TRADE_LIMITS = {
  MAX_SELLS_PER_DAY: 5,
  MAX_BUYS_PER_DAY: 10,
  MAX_SWAPS_PER_DAY: 10,
  WINDOW_HOURS: 24,
} as const;

export const DECISIVE_LEVELS: { level: number; points: number }[] = [
  { level: 0, points: 35 },
  { level: 1, points: 60 },
  { level: 2, points: 70 },
  { level: 3, points: 80 },
  { level: 4, points: 90 },
  { level: 5, points: 100 },
];

export function calculateDecisiveLevel(stats: { goals?: number; assists?: number; cleanSheets?: number; penaltySaves?: number; redCards?: number; ownGoals?: number; errorsLeadingToGoal?: number }): { level: number; points: number } {
  const positives = (stats.goals ?? 0) + (stats.assists ?? 0) + (stats.cleanSheets ?? 0) + (stats.penaltySaves ?? 0);
  const negatives = (stats.redCards ?? 0) + (stats.ownGoals ?? 0) + (stats.errorsLeadingToGoal ?? 0);
  const rawLevel = Math.max(0, Math.min(5, positives - negatives));
  return DECISIVE_LEVELS[rawLevel];
}

export const playerCards = pgTable("player_cards", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  playerId: integer("player_id").notNull().references(() => players.id),
  ownerId: varchar("owner_id").references(() => users.id),
  rarity: rarityEnum("rarity").notNull().default("common"),
  serialId: text("serial_id").unique(),
  serialNumber: integer("serial_number"),
  maxSupply: integer("max_supply").default(0),
  level: integer("level").notNull().default(1),
  xp: integer("xp").notNull().default(0),
  decisiveScore: integer("decisive_score").default(35),
  last5Scores: jsonb("last_5_scores").$type<number[]>().default([0, 0, 0, 0, 0]),
  statMultiplier: real("stat_multiplier").notNull().default(1.0),
  forSale: boolean("for_sale").notNull().default(false),
  price: real("price").default(0),
  acquiredAt: timestamp("acquired_at").defaultNow(),
});

export const wallets = pgTable("wallets", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  balance: real("balance").notNull().default(0),
  lockedBalance: real("locked_balance").notNull().default(0),
});

export const transactions = pgTable("transactions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: transactionTypeEnum("type").notNull(),
  amount: real("amount").notNull(),
  description: text("description"),
  paymentMethod: text("payment_method"),
  externalTransactionId: text("external_transaction_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const lineups = pgTable("lineups", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  cardIds: jsonb("card_ids").$type<number[]>().notNull().default([]),
  captainId: integer("captain_id").references(() => playerCards.id),
});

export const userOnboarding = pgTable("user_onboarding", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  completed: boolean("completed").notNull().default(false),
  packCards: jsonb("pack_cards").$type<number[][]>().default([]),
  selectedCards: jsonb("selected_cards").$type<number[]>().default([]),
});

export const competitions = pgTable("competitions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  tier: competitionTierEnum("tier").notNull(),
  entryFee: real("entry_fee").notNull().default(0),
  status: competitionStatusEnum("status").notNull().default("open"),
  gameWeek: integer("game_week").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  prizeCardRarity: rarityEnum("prize_card_rarity"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const competitionEntries = pgTable("competition_entries", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  competitionId: integer("competition_id").notNull().references(() => competitions.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  lineupCardIds: jsonb("lineup_card_ids").$type<number[]>().notNull().default([]),
  captainId: integer("captain_id"),
  totalScore: real("total_score").notNull().default(0),
  rank: integer("rank"),
  prizeAmount: real("prize_amount").default(0),
  prizeCardId: integer("prize_card_id").references(() => playerCards.id),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const swapOffers = pgTable("swap_offers", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  offererUserId: varchar("offerer_user_id").notNull().references(() => users.id),
  receiverUserId: varchar("receiver_user_id").notNull().references(() => users.id),
  offeredCardId: integer("offered_card_id").notNull().references(() => playerCards.id),
  requestedCardId: integer("requested_card_id").notNull().references(() => playerCards.id),
  topUpAmount: real("top_up_amount").default(0),
  topUpDirection: text("top_up_direction").default("none"),
  status: swapStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const withdrawalRequests = pgTable("withdrawal_requests", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: real("amount").notNull(),
  fee: real("fee").notNull().default(0),
  netAmount: real("net_amount").notNull(),
  paymentMethod: text("payment_method").notNull(),
  bankName: text("bank_name"),
  accountHolder: text("account_holder"),
  accountNumber: text("account_number"),
  iban: text("iban"),
  swiftCode: text("swift_code"),
  ewalletProvider: text("ewallet_provider"),
  ewalletId: text("ewallet_id"),
  status: withdrawalStatusEnum("status").notNull().default("pending"),
  adminNotes: text("admin_notes"),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Trade History - Track trades per user per day for rate limiting
export const userTradeHistory = pgTable("user_trade_history", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").notNull().references(() => users.id),
  tradeType: tradeTypeEnum("trade_type").notNull(),
  cardId: integer("card_id").references(() => playerCards.id),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// Marketplace Trades - Store all trades with timestamps
export const marketplaceTrades = pgTable("marketplace_trades", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  sellerId: varchar("seller_id").notNull().references(() => users.id),
  buyerId: varchar("buyer_id").references(() => users.id),
  cardId: integer("card_id").notNull().references(() => playerCards.id),
  price: real("price").notNull(),
  tradeType: tradeTypeEnum("trade_type").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// Notifications - Inbox system for rewards and prizes
export const notifications = pgTable("notifications", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: notificationTypeEnum("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  cardId: integer("card_id").references(() => playerCards.id),
  amount: real("amount"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const SITE_FEE_RATE = 0.08;

export const eplPlayers = pgTable("epl_players", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  apiId: integer("api_id").notNull().unique(),
  name: text("name").notNull(),
  firstname: text("firstname"),
  lastname: text("lastname"),
  age: integer("age"),
  nationality: text("nationality"),
  photo: text("photo"),
  team: text("team"),
  teamLogo: text("team_logo"),
  teamId: integer("team_id"),
  position: text("epl_position"),
  number: integer("number"),
  goals: integer("goals").default(0),
  assists: integer("assists").default(0),
  yellowCards: integer("yellow_cards").default(0),
  redCards: integer("red_cards").default(0),
  appearances: integer("appearances").default(0),
  minutes: integer("minutes").default(0),
  rating: text("rating"),
  injured: boolean("injured").default(false),
  season: integer("season").notNull().default(2024),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const eplFixtures = pgTable("epl_fixtures", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  apiId: integer("api_id").notNull().unique(),
  homeTeam: text("home_team").notNull(),
  homeTeamLogo: text("home_team_logo"),
  homeTeamId: integer("home_team_id"),
  awayTeam: text("away_team").notNull(),
  awayTeamLogo: text("away_team_logo"),
  awayTeamId: integer("away_team_id"),
  homeGoals: integer("home_goals"),
  awayGoals: integer("away_goals"),
  status: text("fixture_status").notNull().default("NS"),
  statusLong: text("status_long").default("Not Started"),
  elapsed: integer("elapsed"),
  venue: text("venue"),
  referee: text("referee"),
  round: text("round"),
  matchDate: timestamp("match_date").notNull(),
  season: integer("season").notNull().default(2024),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const eplInjuries = pgTable("epl_injuries", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  playerApiId: integer("player_api_id").notNull(),
  playerName: text("player_name").notNull(),
  playerPhoto: text("player_photo"),
  team: text("team").notNull(),
  teamLogo: text("team_logo"),
  type: text("injury_type"),
  reason: text("reason"),
  fixtureApiId: integer("fixture_api_id"),
  fixtureDate: timestamp("fixture_date"),
  season: integer("season").notNull().default(2024),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const eplStandings = pgTable("epl_standings", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  teamId: integer("team_id").notNull().unique(),
  teamName: text("team_name").notNull(),
  teamLogo: text("team_logo"),
  rank: integer("rank").notNull(),
  points: integer("points").notNull().default(0),
  played: integer("played").notNull().default(0),
  won: integer("won").notNull().default(0),
  drawn: integer("drawn").notNull().default(0),
  lost: integer("lost").notNull().default(0),
  goalsFor: integer("goals_for").notNull().default(0),
  goalsAgainst: integer("goals_against").notNull().default(0),
  goalDiff: integer("goal_diff").notNull().default(0),
  form: text("form"),
  season: integer("season").notNull().default(2024),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const eplSyncLog = pgTable("epl_sync_log", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  endpoint: text("endpoint").notNull(),
  syncedAt: timestamp("synced_at").defaultNow(),
  recordCount: integer("record_count").default(0),
});

export const playersRelations = relations(players, ({ many }) => ({
  cards: many(playerCards),
}));

export const playerCardsRelations = relations(playerCards, ({ one }) => ({
  player: one(players, { fields: [playerCards.playerId], references: [players.id] }),
  owner: one(users, { fields: [playerCards.ownerId], references: [users.id] }),
}));

export const walletsRelations = relations(wallets, ({ one }) => ({
  user: one(users, { fields: [wallets.userId], references: [users.id] }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, { fields: [transactions.userId], references: [users.id] }),
}));

export const lineupsRelations = relations(lineups, ({ one }) => ({
  user: one(users, { fields: [lineups.userId], references: [users.id] }),
}));

export const userOnboardingRelations = relations(userOnboarding, ({ one }) => ({
  user: one(users, { fields: [userOnboarding.userId], references: [users.id] }),
}));

export const competitionsRelations = relations(competitions, ({ many }) => ({
  entries: many(competitionEntries),
}));

export const competitionEntriesRelations = relations(competitionEntries, ({ one }) => ({
  competition: one(competitions, { fields: [competitionEntries.competitionId], references: [competitions.id] }),
  user: one(users, { fields: [competitionEntries.userId], references: [users.id] }),
}));

export const swapOffersRelations = relations(swapOffers, ({ one }) => ({
  offerer: one(users, { fields: [swapOffers.offererUserId], references: [users.id] }),
}));

export const withdrawalRequestsRelations = relations(withdrawalRequests, ({ one }) => ({
  user: one(users, { fields: [withdrawalRequests.userId], references: [users.id] }),
}));

export const userTradeHistoryRelations = relations(userTradeHistory, ({ one }) => ({
  user: one(users, { fields: [userTradeHistory.userId], references: [users.id] }),
}));

export const marketplaceTradesRelations = relations(marketplaceTrades, ({ one }) => ({
  seller: one(users, { fields: [marketplaceTrades.sellerId], references: [users.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

export const insertPlayerSchema = createInsertSchema(players);
export const insertPlayerCardSchema = createInsertSchema(playerCards);
export const insertWalletSchema = createInsertSchema(wallets);
export const insertTransactionSchema = createInsertSchema(transactions);
export const insertLineupSchema = createInsertSchema(lineups);
export const insertOnboardingSchema = createInsertSchema(userOnboarding);
export const insertCompetitionSchema = createInsertSchema(competitions);
export const insertCompetitionEntrySchema = createInsertSchema(competitionEntries);
export const insertSwapOfferSchema = createInsertSchema(swapOffers);
export const insertWithdrawalRequestSchema = createInsertSchema(withdrawalRequests);
export const insertUserTradeHistorySchema = createInsertSchema(userTradeHistory);
export const insertMarketplaceTradeSchema = createInsertSchema(marketplaceTrades);
export const insertNotificationSchema = createInsertSchema(notifications);

export type Player = typeof players.$inferSelect;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type PlayerCard = typeof playerCards.$inferSelect;
export type InsertPlayerCard = z.infer<typeof insertPlayerCardSchema>;
export type Wallet = typeof wallets.$inferSelect;
export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Lineup = typeof lineups.$inferSelect;
export type InsertLineup = z.infer<typeof insertLineupSchema>;
export type UserOnboarding = typeof userOnboarding.$inferSelect;
export type InsertOnboarding = z.infer<typeof insertOnboardingSchema>;
export type Competition = typeof competitions.$inferSelect;
export type InsertCompetition = z.infer<typeof insertCompetitionSchema>;
export type CompetitionEntry = typeof competitionEntries.$inferSelect;
export type InsertCompetitionEntry = z.infer<typeof insertCompetitionEntrySchema>;
export type SwapOffer = typeof swapOffers.$inferSelect;
export type InsertSwapOffer = z.infer<typeof insertSwapOfferSchema>;
export type WithdrawalRequest = typeof withdrawalRequests.$inferSelect;
export type InsertWithdrawalRequest = z.infer<typeof insertWithdrawalRequestSchema>;
export type UserTradeHistory = typeof userTradeHistory.$inferSelect;
export type InsertUserTradeHistory = z.infer<typeof insertUserTradeHistorySchema>;
export type MarketplaceTrade = typeof marketplaceTrades.$inferSelect;
export type InsertMarketplaceTrade = z.infer<typeof insertMarketplaceTradeSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

export type PlayerCardWithPlayer = PlayerCard & { player: Player };
export type CompetitionWithEntries = Competition & { entries: CompetitionEntry[]; entryCount: number };

export type EplPlayer = typeof eplPlayers.$inferSelect;
export type EplFixture = typeof eplFixtures.$inferSelect;
export type EplInjury = typeof eplInjuries.$inferSelect;
export type EplStanding = typeof eplStandings.$inferSelect;

// Validation Functions

/**
 * Calculate XP from real-world player stats
 */
export function calculateXPFromStats(stats: {
  goals?: number;
  assists?: number;
  appearances?: number;
  cleanSheets?: number;
  penaltySaves?: number;
  yellowCards?: number;
  redCards?: number;
  ownGoals?: number;
  errorsLeadingToGoal?: number;
  minutes?: number;
}): number {
  let xp = 0;
  
  xp += (stats.goals ?? 0) * XP_SCORING.GOAL;
  xp += (stats.assists ?? 0) * XP_SCORING.ASSIST;
  xp += (stats.appearances ?? 0) * XP_SCORING.APPEARANCE;
  xp += (stats.cleanSheets ?? 0) * XP_SCORING.CLEAN_SHEET;
  xp += (stats.penaltySaves ?? 0) * XP_SCORING.PENALTY_SAVE;
  xp += (stats.yellowCards ?? 0) * XP_SCORING.YELLOW_CARD;
  xp += (stats.redCards ?? 0) * XP_SCORING.RED_CARD;
  xp += (stats.ownGoals ?? 0) * XP_SCORING.OWN_GOAL;
  xp += (stats.errorsLeadingToGoal ?? 0) * XP_SCORING.ERROR_LEADING_TO_GOAL;
  xp += Math.floor((stats.minutes ?? 0) / 10) * XP_SCORING.PER_10_MINUTES;
  
  return Math.max(0, xp);
}

/**
 * Apply stat multiplier based on rarity to base stats
 */
export function applyStatMultiplier(baseStats: {
  pac?: number;
  sho?: number;
  pas?: number;
  def?: number;
  phy?: number;
}, rarity: string): {
  pac: number;
  sho: number;
  pas: number;
  def: number;
  phy: number;
} {
  const multiplier = STAT_MULTIPLIERS[rarity] ?? 1.0;
  
  return {
    pac: Math.round((baseStats.pac ?? 0) * multiplier),
    sho: Math.round((baseStats.sho ?? 0) * multiplier),
    pas: Math.round((baseStats.pas ?? 0) * multiplier),
    def: Math.round((baseStats.def ?? 0) * multiplier),
    phy: Math.round((baseStats.phy ?? 0) * multiplier),
  };
}

/**
 * Validate marketplace listing price against rarity limits
 */
export function validateMarketplacePrice(price: number, rarity: string): { valid: boolean; error?: string } {
  const limits = PRICE_LIMITS[rarity];
  
  if (!limits) {
    return { valid: false, error: `Invalid rarity: ${rarity}` };
  }
  
  if (price < limits.min) {
    return { valid: false, error: `Price must be at least ${limits.min} for ${rarity} cards` };
  }
  
  if (price > limits.max) {
    return { valid: false, error: `Price cannot exceed ${limits.max} for ${rarity} cards` };
  }
  
  return { valid: true };
}

/**
 * Check if user has exceeded trade rate limits
 * Returns trade history counts for the last 24 hours
 */
export function checkTradeRateLimitFromHistory(tradeHistory: UserTradeHistory[]): {
  canSell: boolean;
  canBuy: boolean;
  canSwap: boolean;
  sellCount: number;
  buyCount: number;
  swapCount: number;
  nextResetTime: Date;
} {
  const now = new Date();
  const windowStart = new Date(now.getTime() - TRADE_LIMITS.WINDOW_HOURS * 60 * 60 * 1000);
  
  // Filter trades within the last 24 hours
  const recentTrades = tradeHistory.filter(trade => 
    trade.timestamp >= windowStart
  );
  
  const sellCount = recentTrades.filter(t => t.tradeType === 'sell').length;
  const buyCount = recentTrades.filter(t => t.tradeType === 'buy').length;
  const swapCount = recentTrades.filter(t => t.tradeType === 'swap').length;
  
  // Find the earliest trade timestamp to calculate next reset
  const earliestTrade = recentTrades.reduce((earliest, trade) => 
    !earliest || trade.timestamp < earliest ? trade.timestamp : earliest,
    null as Date | null
  );
  
  const nextResetTime = earliestTrade 
    ? new Date(earliestTrade.getTime() + TRADE_LIMITS.WINDOW_HOURS * 60 * 60 * 1000)
    : now;
  
  return {
    canSell: sellCount < TRADE_LIMITS.MAX_SELLS_PER_DAY,
    canBuy: buyCount < TRADE_LIMITS.MAX_BUYS_PER_DAY,
    canSwap: swapCount < TRADE_LIMITS.MAX_SWAPS_PER_DAY,
    sellCount,
    buyCount,
    swapCount,
    nextResetTime,
  };
}
