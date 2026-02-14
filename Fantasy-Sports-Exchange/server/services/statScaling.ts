/**
 * Stat Scaling Service - Apply rarity-based multipliers to player stats
 * 
 * This service handles the stat multiplier system where higher rarity cards
 * get better base stats through rarity multipliers.
 * 
 * Multipliers:
 * - Common: 1.0x
 * - Rare: 1.1x
 * - Unique: 1.2x
 * - Epic: 1.35x
 * - Legendary: 1.5x
 * 
 * NOTE: Stat multipliers affect displayed stats (PAC, SHO, PAS, DEF, PHY),
 * NOT the XP gain from real-world performance.
 */

import { STAT_MULTIPLIERS, applyStatMultiplier } from "@shared/schema";

export interface PlayerBaseStats {
  pac?: number;  // Pace
  sho?: number;  // Shooting
  pas?: number;  // Passing
  def?: number;  // Defending
  phy?: number;  // Physical
  dri?: number;  // Dribbling
}

export interface ScaledStats {
  pac: number;
  sho: number;
  pas: number;
  def: number;
  phy: number;
  dri?: number;
}

/**
 * Get the stat multiplier for a given rarity
 * 
 * @param rarity - Card rarity (common, rare, unique, epic, legendary)
 * @returns Multiplier value (1.0 to 1.5)
 */
export function getStatMultiplier(rarity: string): number {
  return STAT_MULTIPLIERS[rarity] ?? 1.0;
}

/**
 * Apply rarity multiplier to base stats
 * 
 * @param baseStats - Original player stats
 * @param rarity - Card rarity
 * @returns Scaled stats with multiplier applied
 */
export function applyMultiplierToStats(baseStats: PlayerBaseStats, rarity: string): ScaledStats {
  const multipliedStats = applyStatMultiplier(baseStats, rarity);
  
  // Handle dribbling separately as it's not in the shared function
  const multiplier = getStatMultiplier(rarity);
  const dri = baseStats.dri ? Math.round(baseStats.dri * multiplier) : undefined;
  
  return {
    ...multipliedStats,
    ...(dri !== undefined && { dri }),
  };
}

/**
 * Calculate overall rating from stats
 * 
 * @param stats - Player stats
 * @returns Overall rating (0-99)
 */
export function calculateOverallRating(stats: PlayerBaseStats): number {
  const statArray = [
    stats.pac ?? 0,
    stats.sho ?? 0,
    stats.pas ?? 0,
    stats.def ?? 0,
    stats.phy ?? 0,
    stats.dri ?? 0,
  ];
  
  const sum = statArray.reduce((acc, val) => acc + val, 0);
  const count = statArray.filter(val => val > 0).length;
  
  return count > 0 ? Math.round(sum / count) : 0;
}

/**
 * Get stat comparison between base and scaled stats
 * Useful for UI to show the rarity bonus
 * 
 * @param baseStats - Original stats
 * @param rarity - Card rarity
 * @returns Object with base, scaled, and difference values
 */
export function getStatComparison(baseStats: PlayerBaseStats, rarity: string): {
  base: ScaledStats;
  scaled: ScaledStats;
  difference: ScaledStats;
  multiplier: number;
} {
  const base = applyMultiplierToStats(baseStats, 'common');
  const scaled = applyMultiplierToStats(baseStats, rarity);
  const multiplier = getStatMultiplier(rarity);
  
  const difference: ScaledStats = {
    pac: scaled.pac - base.pac,
    sho: scaled.sho - base.sho,
    pas: scaled.pas - base.pas,
    def: scaled.def - base.def,
    phy: scaled.phy - base.phy,
  };
  
  if (base.dri !== undefined && scaled.dri !== undefined) {
    difference.dri = scaled.dri - base.dri;
  }
  
  return { base, scaled, difference, multiplier };
}

/**
 * Validate rarity value
 * 
 * @param rarity - Rarity string to validate
 * @returns True if valid rarity
 */
export function isValidRarity(rarity: string): boolean {
  return rarity in STAT_MULTIPLIERS;
}

/**
 * Get all available rarities with their multipliers
 * 
 * @returns Array of rarity info objects
 */
export function getAllRarityMultipliers(): Array<{ rarity: string; multiplier: number }> {
  return Object.entries(STAT_MULTIPLIERS).map(([rarity, multiplier]) => ({
    rarity,
    multiplier,
  }));
}

export { STAT_MULTIPLIERS };
