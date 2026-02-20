/**
 * Scoring Service - Calculate player XP from real-world performance
 * 
 * This service provides functions to convert real-world player statistics
 * (goals, assists, appearances, etc.) into XP points for player cards.
 */

import { XP_SCORING, calculateXPFromStats } from "@shared/schema";

export interface PlayerStats {
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
}

/**
 * Calculate player XP from real-world statistics
 * 
 * Mapping:
 * - Goal = 100 XP
 * - Assist = 60 XP
 * - Appearance = 30 XP
 * - Clean Sheet = 50 XP
 * - Penalty Save = 80 XP
 * - Yellow Card = -10 XP
 * - Red Card = -20 XP
 * - Own Goal = -20 XP
 * - Error Leading to Goal = -15 XP
 * - Per 10 minutes played = 1 XP
 * 
 * @param stats - Player statistics from EPL data
 * @returns Calculated XP (minimum 0)
 */
export function calculatePlayerXP(stats: PlayerStats): number {
  return calculateXPFromStats(stats);
}

/**
 * Calculate XP gain for a single match performance
 * This is useful for tracking match-by-match XP gains
 * 
 * @param matchStats - Stats from a single match
 * @returns XP earned in the match
 */
export function calculateMatchXP(matchStats: PlayerStats): number {
  return calculatePlayerXP(matchStats);
}

/**
 * Get XP breakdown for display purposes
 * Shows how XP was calculated from each stat category
 * 
 * @param stats - Player statistics
 * @returns Breakdown object with XP per category
 */
export function getXPBreakdown(stats: PlayerStats): {
  total: number;
  breakdown: Array<{ category: string; value: number; xp: number }>;
} {
  const breakdown: Array<{ category: string; value: number; xp: number }> = [];
  
  if (stats.goals) {
    breakdown.push({
      category: 'Goals',
      value: stats.goals,
      xp: stats.goals * XP_SCORING.GOAL
    });
  }
  
  if (stats.assists) {
    breakdown.push({
      category: 'Assists',
      value: stats.assists,
      xp: stats.assists * XP_SCORING.ASSIST
    });
  }
  
  if (stats.appearances) {
    breakdown.push({
      category: 'Appearances',
      value: stats.appearances,
      xp: stats.appearances * XP_SCORING.APPEARANCE
    });
  }
  
  if (stats.cleanSheets) {
    breakdown.push({
      category: 'Clean Sheets',
      value: stats.cleanSheets,
      xp: stats.cleanSheets * XP_SCORING.CLEAN_SHEET
    });
  }
  
  if (stats.penaltySaves) {
    breakdown.push({
      category: 'Penalty Saves',
      value: stats.penaltySaves,
      xp: stats.penaltySaves * XP_SCORING.PENALTY_SAVE
    });
  }
  
  if (stats.yellowCards) {
    breakdown.push({
      category: 'Yellow Cards',
      value: stats.yellowCards,
      xp: stats.yellowCards * XP_SCORING.YELLOW_CARD
    });
  }
  
  if (stats.redCards) {
    breakdown.push({
      category: 'Red Cards',
      value: stats.redCards,
      xp: stats.redCards * XP_SCORING.RED_CARD
    });
  }
  
  if (stats.ownGoals) {
    breakdown.push({
      category: 'Own Goals',
      value: stats.ownGoals,
      xp: stats.ownGoals * XP_SCORING.OWN_GOAL
    });
  }
  
  if (stats.errorsLeadingToGoal) {
    breakdown.push({
      category: 'Errors Leading to Goal',
      value: stats.errorsLeadingToGoal,
      xp: stats.errorsLeadingToGoal * XP_SCORING.ERROR_LEADING_TO_GOAL
    });
  }
  
  if (stats.minutes) {
    const minutesXP = Math.floor(stats.minutes / 10) * XP_SCORING.PER_10_MINUTES;
    breakdown.push({
      category: 'Minutes Played',
      value: stats.minutes,
      xp: minutesXP
    });
  }
  
  const total = Math.max(0, calculatePlayerXP(stats));
  
  return { total, breakdown };
}

export { XP_SCORING };
