export * from "./models/auth";

import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, real, boolean, timestamp, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";

export const rarityEnum = pgEnum("rarity", ["common", "rare", "unique", "epic", "legendary"]);
export const positionEnum = pgEnum("position", ["GK", "DEF", "MID", "FWD"]);
export const transactionTypeEnum = pgEnum("transaction_type", ["deposit", "withdrawal", "purchase", "sale"]);

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

export const insertPlayerSchema = createInsertSchema(players).omit({ id: true });
export const insertPlayerCardSchema = createInsertSchema(playerCards).omit({ id: true, acquiredAt: true });
export const insertWalletSchema = createInsertSchema(wallets).omit({ id: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, createdAt: true });
export const insertLineupSchema = createInsertSchema(lineups).omit({ id: true });
export const insertOnboardingSchema = createInsertSchema(userOnboarding).omit({ id: true });

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

export type PlayerCardWithPlayer = PlayerCard & { player: Player };
