// Real-World Scoring XP Constants
export const XP_CONSTANTS = {
    LEVEL_UP: 1000,
    DAILY_LOGIN: 50,
    QUEST_COMPLETE: 100,
};

// Stat Multipliers Per Rarity
export const RARITY_MULTIPLIERS = {
    COMMON: 1.0,
    UNCOMMON: 1.5,
    RARE: 2.0,
    EPIC: 2.5,
    LEGENDARY: 3.0,
};

// Marketplace Price Limits
export const MARKETPLACE_PRICE_LIMITS = {
    MIN_PRICE: 10, // Minimum price in game currency
    MAX_PRICE: 1000, // Maximum price in game currency
};

// Rate-Limiting Tables
export const RATE_LIMITING = {
    REQUESTS_PER_MINUTE: 60,
    ACTIONS_PER_SECOND: 5,
};

// Validation Functions
export const validateXP = (xp: number): boolean => {
    return xp >= 0; // XP cannot be negative
};

export const validateMarketplacePrice = (price: number): boolean => {
    return price >= MARKETPLACE_PRICE_LIMITS.MIN_PRICE && 
           price <= MARKETPLACE_PRICE_LIMITS.MAX_PRICE;
};

// Additional validation functions can be added as needed