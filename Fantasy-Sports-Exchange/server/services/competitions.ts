/**
 * Competitions Service - Handle competition logic, tier enforcement, and prize distribution
 * 
 * This service manages:
 * - Competition tier requirements (Common: only common cards, Rare: 5+ rare cards)
 * - Prize distribution (1st: 60% + card, 2nd: 30%, 3rd: 10%)
 * - Notification creation for winners
 * - Auto-distribution of rewards
 */

import { storage } from "../storage";
import type { PlayerCard, Competition, CompetitionEntry } from "@shared/schema";

export interface TierValidationResult {
  valid: boolean;
  error?: string;
}

export interface PrizeDistribution {
  rank: number;
  userId: string;
  prizeAmount: number;
  prizeCard?: {
    rarity: string;
  };
}

/**
 * Validate if user's cards meet Common tier requirements
 * Common Tier: Only users with ONLY common cards can enter
 * 
 * @param userCards - User's card collection
 * @returns Validation result
 */
export function validateCommonTierEntry(userCards: PlayerCard[]): TierValidationResult {
  const hasNonCommonCards = userCards.some(card => card.rarity !== 'common');
  
  if (hasNonCommonCards) {
    return {
      valid: false,
      error: 'Common tier is only for players with common cards only',
    };
  }
  
  return { valid: true };
}

/**
 * Validate if lineup meets Rare tier requirements
 * Rare Tier: Require exactly 5 cards, all Rare or higher (no commons)
 * 
 * @param lineupCards - Cards in the user's lineup
 * @returns Validation result
 */
export function validateRareTierEntry(lineupCards: PlayerCard[]): TierValidationResult {
  if (lineupCards.length !== 5) {
    return {
      valid: false,
      error: 'Rare tier requires exactly 5 cards in lineup',
    };
  }
  
  const hasCommonCards = lineupCards.some(card => card.rarity === 'common');
  
  if (hasCommonCards) {
    return {
      valid: false,
      error: 'Rare tier requires all cards to be Rare or higher (no common cards)',
    };
  }
  
  return { valid: true };
}

/**
 * Calculate prize distribution for a competition
 * 1st: 60% of pot + card of rarity above entry tier
 * 2nd: 30% of pot
 * 3rd: 10% of pot
 * 
 * @param competition - Competition details
 * @param entries - All competition entries sorted by rank
 * @returns Prize distribution array
 */
export function calculatePrizeDistribution(
  competition: Competition,
  entries: CompetitionEntry[]
): PrizeDistribution[] {
  const sortedEntries = [...entries].sort((a, b) => (a.rank ?? Infinity) - (b.rank ?? Infinity));
  
  // Calculate total prize pool
  const totalPot = competition.entryFee * entries.length;
  
  const prizes: PrizeDistribution[] = [];
  
  // 1st place: 60% + card
  if (sortedEntries[0]) {
    prizes.push({
      rank: 1,
      userId: sortedEntries[0].userId,
      prizeAmount: totalPot * 0.6,
      prizeCard: {
        rarity: getPrizeCardRarity(competition.tier),
      },
    });
  }
  
  // 2nd place: 30%
  if (sortedEntries[1]) {
    prizes.push({
      rank: 2,
      userId: sortedEntries[1].userId,
      prizeAmount: totalPot * 0.3,
    });
  }
  
  // 3rd place: 10%
  if (sortedEntries[2]) {
    prizes.push({
      rank: 3,
      userId: sortedEntries[2].userId,
      prizeAmount: totalPot * 0.1,
    });
  }
  
  return prizes;
}

/**
 * Get the prize card rarity for a competition tier
 * Common tier winners get Rare cards
 * Rare tier winners get Unique cards
 * 
 * @param tier - Competition tier
 * @returns Prize card rarity
 */
function getPrizeCardRarity(tier: string): string {
  switch (tier) {
    case 'common':
      return 'rare';
    case 'rare':
      return 'unique';
    default:
      return 'rare';
  }
}

/**
 * Settle competition and distribute prizes
 * - Calculate prize distribution
 * - Award currency prizes
 * - Award card prizes
 * - Create notifications for winners
 * 
 * @param competitionId - Competition ID to settle
 * @returns Success status with distribution details
 */
export async function settleCompetition(competitionId: number): Promise<{
  success: boolean;
  error?: string;
  distribution?: PrizeDistribution[];
}> {
  try {
    // Get competition and entries
    const competition = await storage.getCompetition(competitionId);
    if (!competition) {
      return { success: false, error: 'Competition not found' };
    }
    
    if (competition.status !== 'active' && competition.status !== 'open') {
      return { success: false, error: 'Competition is not active' };
    }
    
    const entries = await storage.getCompetitionEntries(competitionId);
    if (entries.length === 0) {
      return { success: false, error: 'No entries in competition' };
    }
    
    // Calculate prizes
    const distribution = calculatePrizeDistribution(competition, entries);
    
    // Distribute prizes
    for (const prize of distribution) {
      const entry = entries.find(e => e.userId === prize.userId);
      if (!entry) continue;
      
      // Award currency
      if (prize.prizeAmount > 0) {
        await storage.updateWalletBalance(prize.userId, prize.prizeAmount);
        await storage.createTransaction({
          userId: prize.userId,
          type: 'prize',
          amount: prize.prizeAmount,
          description: `${competition.name} - Rank ${prize.rank} prize`,
        });
      }
      
      // Award card for 1st place
      if (prize.prizeCard) {
        // Get a random player for the prize card
        const players = await storage.getRandomPlayers(1);
        if (players.length > 0) {
          const prizeCard = await storage.createPlayerCard({
            playerId: players[0].id,
            ownerId: prize.userId,
            rarity: prize.prizeCard.rarity as any,
            level: 1,
            xp: 0,
            forSale: false,
          });
          
          // Update entry with prize card
          await storage.updateCompetitionEntry(entry.id, {
            prizeCardId: prizeCard.id,
          });
          
          // Create notification for card prize
          await storage.createNotification({
            userId: prize.userId,
            type: 'prize',
            title: `${competition.name} - 1st Place!`,
            message: `Congratulations! You won a ${prize.prizeCard.rarity} card!`,
            cardId: prizeCard.id,
            isRead: false,
          });
        }
      }
      
      // Update entry with prize amount
      await storage.updateCompetitionEntry(entry.id, {
        prizeAmount: prize.prizeAmount,
        rank: prize.rank,
      });
      
      // Create notification for currency prize
      if (prize.prizeAmount > 0) {
        await storage.createNotification({
          userId: prize.userId,
          type: 'prize',
          title: `${competition.name} - Rank ${prize.rank}`,
          message: `You earned N$${prize.prizeAmount.toFixed(2)} from the competition!`,
          amount: prize.prizeAmount,
          isRead: false,
        });
      }
    }
    
    // Update competition status
    await storage.updateCompetition(competitionId, {
      status: 'completed',
    });
    
    return {
      success: true,
      distribution,
    };
  } catch (error) {
    console.error('Error settling competition:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Validate competition entry based on tier requirements
 * 
 * @param tier - Competition tier
 * @param userCards - User's card collection
 * @param lineupCards - Cards in user's lineup
 * @returns Validation result
 */
export async function validateCompetitionEntry(
  tier: string,
  userCards: PlayerCard[],
  lineupCards: PlayerCard[]
): Promise<TierValidationResult> {
  if (tier === 'common') {
    return validateCommonTierEntry(userCards);
  }
  
  if (tier === 'rare') {
    return validateRareTierEntry(lineupCards);
  }
  
  return {
    valid: false,
    error: `Unknown competition tier: ${tier}`,
  };
}

/**
 * Get competition tier requirements as human-readable text
 * 
 * @param tier - Competition tier
 * @returns Requirements description
 */
export function getTierRequirements(tier: string): string {
  switch (tier) {
    case 'common':
      return 'Only players with common cards only can enter. Free entry.';
    case 'rare':
      return 'Requires exactly 5 Rare or higher cards in lineup (no commons). Entry fee: N$20.';
    default:
      return 'Unknown tier';
  }
}

/**
 * Calculate total prize pool for a competition
 * 
 * @param entryFee - Entry fee per player
 * @param entryCount - Number of entries
 * @returns Total prize pool
 */
export function calculatePrizePool(entryFee: number, entryCount: number): number {
  return entryFee * entryCount;
}
