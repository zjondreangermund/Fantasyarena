/**
 * Marketplace Service - Handle card buying, selling, and trading
 * 
 * Features:
 * - Price validation per rarity
 * - Rate limiting (5 sells + 10 buys/swaps per 24h)
 * - Fee calculation (8%)
 * - Trade history tracking
 */

import { db } from "../db";
import { playerCards, userTradeHistory, marketplaceTrades, wallets } from "@shared/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import type { Rarity } from "./statScaling";

export const SITE_FEE_RATE = 0.08;

// Price ranges per rarity
export const PRICE_RANGES: Record<Rarity, { min: number; max: number }> = {
  common: { min: 1, max: 10 },
  rare: { min: 11, max: 50 },
  unique: { min: 51, max: 200 },
  epic: { min: 201, max: 1000 },
  legendary: { min: 1001, max: 5000 },
};

// Rate limits per 24 hours
export const RATE_LIMITS = {
  SELL: 5,
  BUY_SWAP: 10,
};

/**
 * Validate price is within rarity bounds
 */
export function validatePrice(price: number, rarity: Rarity): boolean {
  const range = PRICE_RANGES[rarity];
  return price >= range.min && price <= range.max;
}

/**
 * Calculate marketplace fee
 */
export function calculateFee(price: number): number {
  return Math.round(price * SITE_FEE_RATE * 100) / 100;
}

/**
 * Check if user has exceeded sell rate limit
 */
export async function checkSellRateLimit(userId: string): Promise<boolean> {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const sellCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(userTradeHistory)
    .where(
      and(
        eq(userTradeHistory.userId, userId),
        eq(userTradeHistory.tradeType, "sell"),
        gte(userTradeHistory.createdAt, twentyFourHoursAgo)
      )
    );

  const count = Number(sellCount[0]?.count || 0);
  return count < RATE_LIMITS.SELL;
}

/**
 * Check if user has exceeded buy/swap rate limit
 */
export async function checkBuySwapRateLimit(userId: string): Promise<boolean> {
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const tradeCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(userTradeHistory)
    .where(
      and(
        eq(userTradeHistory.userId, userId),
        sql`${userTradeHistory.tradeType} IN ('buy', 'swap')`,
        gte(userTradeHistory.createdAt, twentyFourHoursAgo)
      )
    );

  const count = Number(tradeCount[0]?.count || 0);
  return count < RATE_LIMITS.BUY_SWAP;
}

/**
 * Record a trade in history
 */
export async function recordTrade(
  userId: string,
  tradeType: "sell" | "buy" | "swap",
  cardId: number,
  amount: number
) {
  await db.insert(userTradeHistory).values({
    userId,
    tradeType,
    cardId,
    amount,
  });
}

/**
 * Record a marketplace trade for audit
 */
export async function recordMarketplaceTrade(
  sellerId: string,
  buyerId: string,
  cardId: number,
  price: number,
  fee: number
) {
  await db.insert(marketplaceTrades).values({
    sellerId,
    buyerId,
    cardId,
    price,
    fee,
    totalAmount: price + fee,
  });
}

/**
 * List a card for sale
 */
export async function listCardForSale(
  userId: string,
  cardId: number,
  price: number
): Promise<{ success: boolean; message?: string }> {
  // Check rate limit
  const canSell = await checkSellRateLimit(userId);
  if (!canSell) {
    return { success: false, message: "Sell rate limit exceeded (5 per 24h)" };
  }

  // Get card and verify ownership
  const [card] = await db
    .select()
    .from(playerCards)
    .where(eq(playerCards.id, cardId))
    .limit(1);

  if (!card) {
    return { success: false, message: "Card not found" };
  }

  if (card.ownerId !== userId) {
    return { success: false, message: "You don't own this card" };
  }

  if (card.forSale) {
    return { success: false, message: "Card is already listed" };
  }

  // Validate price
  if (!validatePrice(price, card.rarity as Rarity)) {
    const range = PRICE_RANGES[card.rarity as Rarity];
    return {
      success: false,
      message: `Price must be between ${range.min} and ${range.max} for ${card.rarity} cards`,
    };
  }

  // List the card
  await db
    .update(playerCards)
    .set({ forSale: true, price })
    .where(eq(playerCards.id, cardId));

  // Record trade
  await recordTrade(userId, "sell", cardId, price);

  return { success: true };
}

/**
 * Buy a card from marketplace
 */
export async function buyCard(
  buyerId: string,
  cardId: number
): Promise<{ success: boolean; message?: string; totalCost?: number }> {
  // Check rate limit
  const canBuy = await checkBuySwapRateLimit(buyerId);
  if (!canBuy) {
    return { success: false, message: "Buy/swap rate limit exceeded (10 per 24h)" };
  }

  // Get card
  const [card] = await db
    .select()
    .from(playerCards)
    .where(eq(playerCards.id, cardId))
    .limit(1);

  if (!card) {
    return { success: false, message: "Card not found" };
  }

  if (!card.forSale) {
    return { success: false, message: "Card is not for sale" };
  }

  if (card.ownerId === buyerId) {
    return { success: false, message: "You cannot buy your own card" };
  }

  const sellerId = card.ownerId!;
  const price = card.price || 0;
  const fee = calculateFee(price);
  const totalCost = price + fee;

  // Check buyer balance
  const [buyerWallet] = await db
    .select()
    .from(wallets)
    .where(eq(wallets.userId, buyerId))
    .limit(1);

  if (!buyerWallet || buyerWallet.balance < totalCost) {
    return { success: false, message: "Insufficient balance" };
  }

  // Execute transaction
  await db.transaction(async (tx) => {
    // Transfer card
    await tx
      .update(playerCards)
      .set({ ownerId: buyerId, forSale: false, price: 0 })
      .where(eq(playerCards.id, cardId));

    // Update buyer wallet
    await tx
      .update(wallets)
      .set({ balance: sql`${wallets.balance} - ${totalCost}` })
      .where(eq(wallets.userId, buyerId));

    // Update seller wallet
    await tx
      .update(wallets)
      .set({ balance: sql`${wallets.balance} + ${price}` })
      .where(eq(wallets.userId, sellerId));

    // Record trade
    await recordTrade(buyerId, "buy", cardId, totalCost);
    await recordMarketplaceTrade(sellerId, buyerId, cardId, price, fee);
  });

  return { success: true, totalCost };
}

/**
 * Cancel listing
 */
export async function cancelListing(
  userId: string,
  cardId: number
): Promise<{ success: boolean; message?: string }> {
  const [card] = await db
    .select()
    .from(playerCards)
    .where(eq(playerCards.id, cardId))
    .limit(1);

  if (!card) {
    return { success: false, message: "Card not found" };
  }

  if (card.ownerId !== userId) {
    return { success: false, message: "You don't own this card" };
  }

  if (!card.forSale) {
    return { success: false, message: "Card is not listed" };
  }

  await db
    .update(playerCards)
    .set({ forSale: false, price: 0 })
    .where(eq(playerCards.id, cardId));

  return { success: true };
}
