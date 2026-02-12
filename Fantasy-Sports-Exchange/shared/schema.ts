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

export const playerCards = pgTable("player_cards", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  playerId: integer("player_id").notNull().references(() => players.id),
  ownerId: varchar("owner_id").references(() => users.id),
  rarity: rarityEnum("rarity").notNull().default("common"),
  level: integer("level").notNull().default(1),
  xp: integer("xp").notNull().default(0),
  last5Scores: jsonb("last_5_scores").$type<number[]>().default([0, 0, 0, 0, 0]),
  forSale: boolean("for_sale").notNull().default(false),
  price: real("price").default(0),
  acquiredAt: timestamp("acquired_at").defaultNow(),
});

export const wallets = pgTable("wallets", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  balance: real("balance").notNull().default(0),
});

export const transactions = pgTable("transactions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: transactionTypeEnum("type").notNull(),
  amount: real("amount").notNull(),
  description: text("description"),
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

export const SITE_FEE_RATE = 0.08;

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

export const insertPlayerSchema = createInsertSchema(players);
export const insertPlayerCardSchema = createInsertSchema(playerCards);
export const insertWalletSchema = createInsertSchema(wallets);
export const insertTransactionSchema = createInsertSchema(transactions);
export const insertLineupSchema = createInsertSchema(lineups);
export const insertOnboardingSchema = createInsertSchema(userOnboarding);
export const insertCompetitionSchema = createInsertSchema(competitions);
export const insertCompetitionEntrySchema = createInsertSchema(competitionEntries);
export const insertSwapOfferSchema = createInsertSchema(swapOffers);

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

export type PlayerCardWithPlayer = PlayerCard & { player: Player };
export type CompetitionWithEntries = Competition & { entries: CompetitionEntry[]; entryCount: number };
