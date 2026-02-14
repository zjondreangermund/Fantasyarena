/**
 * Stat Scaling Service
 * 
 * Apply rarity multipliers to card stats based on their rarity tier.
 * Uses the STAT_MULTIPLIERS from shared game-rules.
 */

import { STAT_MULTIPLIERS } from "@shared/game-rules";

export type Rarity = "Common" | "Rare" | "Unique" | "Epic" | "Legendary";

/**
 * Apply rarity multiplier to a single stat value
 * @param stat - The base stat value
 * @param rarity - The card rarity
 * @returns The scaled stat value (rounded to 1 decimal place)
 */
export function applyRarityMultiplier(stat: number, rarity: string): number {
  // Normalize rarity to match STAT_MULTIPLIERS keys (capitalize first letter)
  const normalizedRarity = rarity.charAt(0).toUpperCase() + rarity.slice(1).toLowerCase();
  const multiplier = STAT_MULTIPLIERS[normalizedRarity as Rarity] || 1.0;
  
  // Use toFixed for reliable rounding to 1 decimal place
  return parseFloat((stat * multiplier).toFixed(1));
}

/**
 * Apply rarity multipliers to all stats of a card
 * @param card - The card object with stats
 * @returns The card with scaled stats
 */
export function applyCardStatMultipliers(card: any): any {
  if (!card || !card.rarity) {
    return card;
  }

  const rarity = card.rarity;
  const scaledCard = { ...card };

  // Apply multiplier to numeric stats
  if (typeof card.xp === 'number') {
    scaledCard.xp = Math.round(applyRarityMultiplier(card.xp, rarity));
  }

  if (typeof card.decisiveScore === 'number') {
    scaledCard.decisiveScore = Math.round(applyRarityMultiplier(card.decisiveScore, rarity));
  }

  if (typeof card.level === 'number') {
    // Level doesn't get multiplied, but affects other stats
    scaledCard.level = card.level;
  }

  // Apply multiplier to last 5 scores if present
  if (Array.isArray(card.last5Scores)) {
    scaledCard.last5Scores = card.last5Scores.map((score: number) =>
      Math.round(applyRarityMultiplier(score, rarity))
    );
  }

  // Add multiplier info for display
  const normalizedRarity = rarity.charAt(0).toUpperCase() + rarity.slice(1).toLowerCase();
  scaledCard.rarityMultiplier = STAT_MULTIPLIERS[normalizedRarity as Rarity] || 1.0;

  return scaledCard;
}

/**
 * Apply rarity multipliers to an array of cards
 * @param cards - Array of card objects
 * @returns Array of cards with scaled stats
 */
export function applyMultipliersToCards(cards: any[]): any[] {
  if (!Array.isArray(cards)) {
    return [];
  }

  return cards.map(card => applyCardStatMultipliers(card));
}

/**
 * Calculate effective stat with rarity multiplier
 * Useful for displaying "base stat" vs "effective stat"
 * @param baseStat - The base stat value
 * @param rarity - The card rarity
 * @returns Object with base and effective values
 */
export function getEffectiveStat(baseStat: number, rarity: string): { base: number; effective: number; multiplier: number } {
  const normalizedRarity = rarity.charAt(0).toUpperCase() + rarity.slice(1).toLowerCase();
  const multiplier = STAT_MULTIPLIERS[normalizedRarity as Rarity] || 1.0;
  const effective = applyRarityMultiplier(baseStat, rarity);

  return {
    base: baseStat,
    effective,
    multiplier,
  };
}

/**
 * Get the rarity multiplier for a given rarity tier
 * @param rarity - The card rarity
 * @returns The multiplier value
 */
export function getRarityMultiplier(rarity: string): number {
  const normalizedRarity = rarity.charAt(0).toUpperCase() + rarity.slice(1).toLowerCase();
  return STAT_MULTIPLIERS[normalizedRarity as Rarity] || 1.0;
}
