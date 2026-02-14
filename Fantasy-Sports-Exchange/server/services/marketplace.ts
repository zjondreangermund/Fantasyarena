/**
 * Marketplace Service - Price validation and rate limiting for trades
 * 
 * This service enforces marketplace safeguards including:
 * - Price floor/ceiling validation per rarity
 * - Trade rate limiting (5 sells, 10 buys/swaps per 24h)
 * - Trade history tracking
 */

import { 
  PRICE_LIMITS, 
  TRADE_LIMITS, 
  validateMarketplacePrice,
  checkTradeRateLimitFromHistory,
  type UserTradeHistory 
} from "@shared/schema";
import { storage } from "../storage";

export interface PriceValidationResult {
  valid: boolean;
  error?: string;
}

export interface RateLimitResult {
  canSell: boolean;
  canBuy: boolean;
  canSwap: boolean;
  sellCount: number;
  buyCount: number;
  swapCount: number;
  nextResetTime: Date;
  error?: string;
}

/**
 * Validate listing price against rarity-specific limits
 * 
 * Price Limits per Rarity:
 * - Common: 1-50
 * - Rare: 5-500
 * - Unique: 50-5000
 * - Epic: 200-20000
 * - Legendary: 1000-100000
 * 
 * @param price - Proposed listing price
 * @param rarity - Card rarity
 * @returns Validation result
 */
export function validateListingPrice(price: number, rarity: string): PriceValidationResult {
  if (price <= 0) {
    return { valid: false, error: 'Price must be greater than 0' };
  }
  
  return validateMarketplacePrice(price, rarity);
}

/**
 * Check if user has exceeded trade rate limits
 * 
 * Limits (per 24-hour rolling window):
 * - Max 5 sells per day
 * - Max 10 buys per day
 * - Max 10 swaps per day
 * 
 * @param userId - User ID to check
 * @returns Rate limit status with counts and next reset time
 */
export async function checkTradeRateLimit(userId: string): Promise<RateLimitResult> {
  try {
    // Get user's trade history from the last 24 hours
    const tradeHistory = await storage.getUserTradeHistory(userId, TRADE_LIMITS.WINDOW_HOURS);
    
    // Use the shared validation function
    const result = checkTradeRateLimitFromHistory(tradeHistory);
    
    return {
      ...result,
    };
  } catch (error) {
    console.error('Error checking trade rate limit:', error);
    return {
      canSell: false,
      canBuy: false,
      canSwap: false,
      sellCount: 0,
      buyCount: 0,
      swapCount: 0,
      nextResetTime: new Date(),
      error: 'Failed to check rate limit',
    };
  }
}

/**
 * Record a trade in the history for rate limiting
 * 
 * @param userId - User ID
 * @param tradeType - Type of trade (sell, buy, swap)
 * @param cardId - Card ID involved in trade
 */
export async function recordTrade(
  userId: string,
  tradeType: 'sell' | 'buy' | 'swap',
  cardId: number
): Promise<void> {
  try {
    await storage.createUserTradeHistory({
      userId,
      tradeType,
      cardId,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Error recording trade:', error);
    throw new Error('Failed to record trade');
  }
}

/**
 * Log a marketplace trade for analytics and tracking
 * 
 * @param sellerId - Seller user ID
 * @param buyerId - Buyer user ID (null for listings)
 * @param cardId - Card ID
 * @param price - Sale price
 * @param tradeType - Type of trade
 */
export async function logMarketplaceTrade(
  sellerId: string,
  buyerId: string | null,
  cardId: number,
  price: number,
  tradeType: 'sell' | 'buy' | 'swap'
): Promise<void> {
  try {
    await storage.createMarketplaceTrade({
      sellerId,
      buyerId,
      cardId,
      price,
      tradeType,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Error logging marketplace trade:', error);
    // Log to monitoring/metrics system if available
    // TODO: Add monitoring alert for failed trade logging
    // Don't throw - logging should not block trades
  }
}

/**
 * Get price limits for a specific rarity
 * 
 * @param rarity - Card rarity
 * @returns Min and max price limits
 */
export function getPriceLimits(rarity: string): { min: number; max: number } | null {
  return PRICE_LIMITS[rarity] ?? null;
}

/**
 * Get all price limits
 * 
 * @returns Object with all rarity price limits
 */
export function getAllPriceLimits(): Record<string, { min: number; max: number }> {
  return PRICE_LIMITS;
}

/**
 * Get trade limits configuration
 * 
 * @returns Trade limits object
 */
export function getTradeLimits(): typeof TRADE_LIMITS {
  return TRADE_LIMITS;
}

/**
 * Validate sell request
 * Checks both price validity and rate limits
 * 
 * @param userId - User ID
 * @param price - Listing price
 * @param rarity - Card rarity
 * @returns Validation result with detailed error if invalid
 */
export async function validateSellRequest(
  userId: string,
  price: number,
  rarity: string
): Promise<{ valid: boolean; error?: string }> {
  // Check price
  const priceCheck = validateListingPrice(price, rarity);
  if (!priceCheck.valid) {
    return priceCheck;
  }
  
  // Check rate limit
  const rateLimit = await checkTradeRateLimit(userId);
  if (!rateLimit.canSell) {
    return {
      valid: false,
      error: `Sell limit reached (${rateLimit.sellCount}/${TRADE_LIMITS.MAX_SELLS_PER_DAY}). Reset at ${rateLimit.nextResetTime.toLocaleString()}`,
    };
  }
  
  return { valid: true };
}

/**
 * Validate buy request
 * Checks rate limits
 * 
 * @param userId - User ID
 * @returns Validation result with detailed error if invalid
 */
export async function validateBuyRequest(userId: string): Promise<{ valid: boolean; error?: string }> {
  const rateLimit = await checkTradeRateLimit(userId);
  
  if (!rateLimit.canBuy) {
    return {
      valid: false,
      error: `Buy limit reached (${rateLimit.buyCount}/${TRADE_LIMITS.MAX_BUYS_PER_DAY}). Reset at ${rateLimit.nextResetTime.toLocaleString()}`,
    };
  }
  
  return { valid: true };
}

/**
 * Validate swap request
 * Checks rate limits
 * 
 * @param userId - User ID
 * @returns Validation result with detailed error if invalid
 */
export async function validateSwapRequest(userId: string): Promise<{ valid: boolean; error?: string }> {
  const rateLimit = await checkTradeRateLimit(userId);
  
  if (!rateLimit.canSwap) {
    return {
      valid: false,
      error: `Swap limit reached (${rateLimit.swapCount}/${TRADE_LIMITS.MAX_SWAPS_PER_DAY}). Reset at ${rateLimit.nextResetTime.toLocaleString()}`,
    };
  }
  
  return { valid: true };
}

export { PRICE_LIMITS, TRADE_LIMITS };
