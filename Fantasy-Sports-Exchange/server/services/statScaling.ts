/**
 * Stat Scaling Service - Apply rarity multipliers to card stats
 * 
 * Rarity multipliers:
 * - common: 1.0x
 * - rare: 1.1x
 * - unique: 1.25x
 * - epic: 1.35x
 * - legendary: 1.5x
 */

export type Rarity = "common" | "rare" | "unique" | "epic" | "legendary";

export const RARITY_MULTIPLIERS: Record<Rarity, number> = {
  common: 1.0,
  rare: 1.1,
  unique: 1.25,
  epic: 1.35,
  legendary: 1.5,
};

export interface BaseStats {
  overall: number;
  xp?: number;
  decisiveScore?: number;
}

export interface ScaledStats extends BaseStats {
  scaledOverall: number;
  scaledXP?: number;
  scaledDecisiveScore?: number;
  multiplier: number;
}

/**
 * Apply rarity multiplier to card stats
 */
export function applyRarityMultiplier(
  stats: BaseStats,
  rarity: Rarity
): ScaledStats {
  const multiplier = RARITY_MULTIPLIERS[rarity] || 1.0;

  return {
    ...stats,
    scaledOverall: Math.round(stats.overall * multiplier),
    scaledXP: stats.xp ? Math.round(stats.xp * multiplier) : undefined,
    scaledDecisiveScore: stats.decisiveScore
      ? Math.round(stats.decisiveScore * multiplier)
      : undefined,
    multiplier,
  };
}

/**
 * Calculate effective card power (for sorting/comparison)
 */
export function calculateCardPower(
  overall: number,
  rarity: Rarity,
  level: number = 1
): number {
  const multiplier = RARITY_MULTIPLIERS[rarity];
  const levelBonus = (level - 1) * 2; // +2 overall per level
  return Math.round((overall + levelBonus) * multiplier);
}

/**
 * Get XP required for next level
 */
export function getXPForNextLevel(currentLevel: number): number {
  // Exponential XP requirement: 100 * (1.5 ^ level)
  return Math.floor(100 * Math.pow(1.5, currentLevel));
}

/**
 * Calculate level from total XP
 */
export function calculateLevel(totalXP: number): { level: number; currentXP: number; nextLevelXP: number } {
  let level = 1;
  let xpForCurrentLevel = 0;

  while (xpForCurrentLevel + getXPForNextLevel(level) <= totalXP) {
    xpForCurrentLevel += getXPForNextLevel(level);
    level++;
  }

  const currentXP = totalXP - xpForCurrentLevel;
  const nextLevelXP = getXPForNextLevel(level);

  return { level, currentXP, nextLevelXP };
}
