/**
 * Scoring Service - Calculate XP from real-world player stats
 * 
 * XP is calculated based on:
 * - Goals: 10 XP each
 * - Assists: 7 XP each
 * - Appearances: 2 XP each
 * - Clean sheets: 5 XP each (GK/DEF)
 * - Yellow cards: -2 XP each
 * - Red cards: -5 XP each
 * - Own goals: -5 XP each
 * - Minutes played: 1 XP per 90 minutes
 */

export interface PlayerStats {
  goals?: number;
  assists?: number;
  appearances?: number;
  cleanSheets?: number;
  yellowCards?: number;
  redCards?: number;
  ownGoals?: number;
  minutes?: number;
  position?: string;
}

export function calculateXP(stats: PlayerStats): number {
  const {
    goals = 0,
    assists = 0,
    appearances = 0,
    cleanSheets = 0,
    yellowCards = 0,
    redCards = 0,
    ownGoals = 0,
    minutes = 0,
    position = "FWD",
  } = stats;

  let xp = 0;

  // Positive contributions
  xp += goals * 10;
  xp += assists * 7;
  xp += appearances * 2;
  
  // Clean sheets for GK and DEF only
  if (position === "GK" || position === "DEF") {
    xp += cleanSheets * 5;
  }
  
  // Minutes played bonus (1 XP per 90 minutes)
  xp += Math.floor(minutes / 90);

  // Negative contributions
  xp -= yellowCards * 2;
  xp -= redCards * 5;
  xp -= ownGoals * 5;

  // Minimum XP is 0
  return Math.max(0, xp);
}

/**
 * Calculate XP gain for a single match performance
 */
export function calculateMatchXP(matchStats: {
  goals?: number;
  assists?: number;
  minutesPlayed?: number;
  cleanSheet?: boolean;
  yellowCard?: boolean;
  redCard?: boolean;
  ownGoal?: boolean;
  position?: string;
}): number {
  const {
    goals = 0,
    assists = 0,
    minutesPlayed = 0,
    cleanSheet = false,
    yellowCard = false,
    redCard = false,
    ownGoal = false,
    position = "FWD",
  } = matchStats;

  let xp = 0;

  // Match performance
  xp += goals * 10;
  xp += assists * 7;
  xp += Math.floor(minutesPlayed / 90);

  if (cleanSheet && (position === "GK" || position === "DEF")) {
    xp += 5;
  }

  if (yellowCard) xp -= 2;
  if (redCard) xp -= 5;
  if (ownGoal) xp -= 5;

  // Playing bonus (appeared in match)
  if (minutesPlayed > 0) {
    xp += 2;
  }

  return Math.max(0, xp);
}
