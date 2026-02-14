/**
 * Competitions Service - Handle competition settlement and prize distribution
 * 
 * Features:
 * - Validate lineups (1 GK, 1 DEF, 1 MID, 1 FWD, 1 Utility)
 * - Calculate rankings based on total scores
 * - Distribute prizes (60/30/10 split)
 * - Create notifications for winners
 */

import { db } from "../db";
import { 
  competitions, 
  competitionEntries, 
  playerCards,
  wallets,
  notifications,
  players,
  transactions
} from "@shared/schema";
import { eq, sql, desc, and, inArray } from "drizzle-orm";

interface LineupValidation {
  valid: boolean;
  message?: string;
}

/**
 * Validate lineup composition
 * Must have: 1 GK, 1 DEF, 1 MID, 1 FWD, 1 Utility (any position)
 */
export async function validateLineup(cardIds: number[]): Promise<LineupValidation> {
  if (cardIds.length !== 5) {
    return { valid: false, message: "Lineup must have exactly 5 cards" };
  }

  // Get cards with player info
  const cards = await db
    .select({
      id: playerCards.id,
      position: players.position,
    })
    .from(playerCards)
    .innerJoin(players, eq(playerCards.playerId, players.id))
    .where(inArray(playerCards.id, cardIds));

  if (cards.length !== 5) {
    return { valid: false, message: "Some cards not found" };
  }

  const positions = cards.map((c) => c.position);
  const positionCounts = {
    GK: positions.filter((p) => p === "GK").length,
    DEF: positions.filter((p) => p === "DEF").length,
    MID: positions.filter((p) => p === "MID").length,
    FWD: positions.filter((p) => p === "FWD").length,
  };

  // Must have at least one of each core position
  if (positionCounts.GK < 1) {
    return { valid: false, message: "Must have at least 1 GK" };
  }
  if (positionCounts.DEF < 1) {
    return { valid: false, message: "Must have at least 1 DEF" };
  }
  if (positionCounts.MID < 1) {
    return { valid: false, message: "Must have at least 1 MID" };
  }
  if (positionCounts.FWD < 1) {
    return { valid: false, message: "Must have at least 1 FWD" };
  }

  return { valid: true };
}

/**
 * Calculate total score for a lineup
 * Uses the decisiveScore from each card
 */
export async function calculateLineupScore(cardIds: number[]): Promise<number> {
  const cards = await db
    .select({
      decisiveScore: playerCards.decisiveScore,
    })
    .from(playerCards)
    .where(inArray(playerCards.id, cardIds));

  return cards.reduce((total, card) => total + (card.decisiveScore || 0), 0);
}

/**
 * Settle a competition and distribute prizes
 */
export async function settleCompetition(
  competitionId: number
): Promise<{ success: boolean; message?: string }> {
  // Get competition
  const [competition] = await db
    .select()
    .from(competitions)
    .where(eq(competitions.id, competitionId))
    .limit(1);

  if (!competition) {
    return { success: false, message: "Competition not found" };
  }

  if (competition.status === "completed") {
    return { success: false, message: "Competition already settled" };
  }

  // Get all entries and calculate scores
  const entries = await db
    .select()
    .from(competitionEntries)
    .where(eq(competitionEntries.competitionId, competitionId));

  if (entries.length === 0) {
    return { success: false, message: "No entries to settle" };
  }

  // Calculate scores for each entry
  const scoredEntries = await Promise.all(
    entries.map(async (entry) => {
      const score = await calculateLineupScore(entry.lineupCardIds as number[]);
      return { ...entry, calculatedScore: score };
    })
  );

  // Sort by score (highest first)
  scoredEntries.sort((a, b) => b.calculatedScore - a.calculatedScore);

  // Calculate prize pool
  const totalPrizePool = competition.entryFee * entries.length;
  const firstPrize = Math.round(totalPrizePool * 0.6 * 100) / 100;
  const secondPrize = Math.round(totalPrizePool * 0.3 * 100) / 100;
  const thirdPrize = Math.round(totalPrizePool * 0.1 * 100) / 100;

  // Award prizes in transaction
  await db.transaction(async (tx) => {
    // Update competition status
    await tx
      .update(competitions)
      .set({ status: "completed" })
      .where(eq(competitions.id, competitionId));

    // Update all entry scores and ranks
    for (let i = 0; i < scoredEntries.length; i++) {
      const entry = scoredEntries[i];
      const rank = i + 1;
      let prizeAmount = 0;

      if (rank === 1) prizeAmount = firstPrize;
      else if (rank === 2) prizeAmount = secondPrize;
      else if (rank === 3) prizeAmount = thirdPrize;

      await tx
        .update(competitionEntries)
        .set({
          totalScore: entry.calculatedScore,
          rank,
          prizeAmount,
        })
        .where(eq(competitionEntries.id, entry.id));

      // Award prize money
      if (prizeAmount > 0) {
        await tx
          .update(wallets)
          .set({ balance: sql`${wallets.balance} + ${prizeAmount}` })
          .where(eq(wallets.userId, entry.userId));

        // Create transaction record
        await tx.insert(transactions).values({
          userId: entry.userId,
          type: "prize",
          amount: prizeAmount,
          description: `Competition prize - Rank ${rank}`,
        });

        // Create notification
        await tx.insert(notifications).values({
          userId: entry.userId,
          type: "prize",
          title: `🏆 Competition Prize!`,
          message: `Congratulations! You placed ${rank}${getRankSuffix(rank)} and won ${prizeAmount} credits!`,
          amount: prizeAmount,
          isRead: false,
        });
      }
    }
  });

  return { success: true };
}

/**
 * Get rank suffix (1st, 2nd, 3rd, etc.)
 */
function getRankSuffix(rank: number): string {
  if (rank === 1) return "st";
  if (rank === 2) return "nd";
  if (rank === 3) return "rd";
  return "th";
}

/**
 * Check if user can enter competition (rarity requirements)
 */
export async function checkCompetitionAccess(
  userId: string,
  tier: string
): Promise<{ canAccess: boolean; message?: string }> {
  const userCards = await db
    .select()
    .from(playerCards)
    .where(eq(playerCards.ownerId, userId));

  if (tier === "rare") {
    const hasRareOrBetter = userCards.some((card) =>
      ["rare", "unique", "epic", "legendary"].includes(card.rarity)
    );

    if (!hasRareOrBetter) {
      return {
        canAccess: false,
        message: "You need at least one rare card to enter this competition",
      };
    }
  }

  return { canAccess: true };
}

/**
 * Get competition leaderboard
 */
export async function getCompetitionLeaderboard(competitionId: number) {
  return await db
    .select({
      rank: competitionEntries.rank,
      userId: competitionEntries.userId,
      totalScore: competitionEntries.totalScore,
      prizeAmount: competitionEntries.prizeAmount,
    })
    .from(competitionEntries)
    .where(eq(competitionEntries.competitionId, competitionId))
    .orderBy(desc(competitionEntries.totalScore));
}
