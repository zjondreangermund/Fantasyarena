/**
 * Fantasy League API Service
 * 
 * Provides live fantasy league data tracking including:
 * - League standings
 * - Live player performance scores
 * - Injury/suspension updates
 * 
 * Cache strategy: 30min for standings, 5min for scores
 */

import { db } from "../db";
import { eplPlayers, eplStandings, eplInjuries } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

const FANTASY_API_KEY = process.env.FANTASY_LEAGUE_API_KEY;

// Cache TTL in milliseconds
const CACHE_TTL = {
  standings: 30 * 60 * 1000, // 30 minutes
  scores: 5 * 60 * 1000,      // 5 minutes
  injuries: 30 * 60 * 1000,   // 30 minutes
};

// In-memory cache
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = {
  standings: null as CacheEntry<any[]> | null,
  scores: null as CacheEntry<any[]> | null,
  injuries: null as CacheEntry<any[]> | null,
};

/**
 * Check if cached data is still valid
 */
function isCacheValid<T>(entry: CacheEntry<T> | null, ttl: number): boolean {
  if (!entry) return false;
  return Date.now() - entry.timestamp < ttl;
}

/**
 * Fetch live league standings
 * Returns standings from EPL data with fantasy-style formatting
 */
export async function fetchLeagueStandings(): Promise<any[]> {
  try {
    // Check cache first
    if (isCacheValid(cache.standings, CACHE_TTL.standings)) {
      console.log("Returning cached league standings");
      return cache.standings!.data;
    }

    // If Fantasy League API key is configured, use real API
    if (FANTASY_API_KEY) {
      // TODO: Implement real API call when credentials are available
      console.log("FANTASY_LEAGUE_API_KEY configured but real API not yet implemented");
    }

    // Fallback: Use EPL standings data
    const standings = await db.select().from(eplStandings).orderBy(eplStandings.rank).limit(20);
    
    // Transform to fantasy league format
    const fantasyStandings = standings.map((team, index) => ({
      rank: index + 1,
      teamId: team.teamId,
      teamName: team.teamName,
      teamLogo: team.teamLogo,
      points: team.points,
      played: team.played,
      won: team.won,
      drawn: team.drawn,
      lost: team.lost,
      goalsFor: team.goalsFor,
      goalsAgainst: team.goalsAgainst,
      goalDifference: team.goalDiff,
      form: team.form,
      fantasyPoints: calculateFantasyPoints(team),
    }));

    // Update cache
    cache.standings = {
      data: fantasyStandings,
      timestamp: Date.now(),
    };

    return fantasyStandings;
  } catch (error) {
    console.error("Error fetching league standings:", error);
    // Return cached data if available, even if expired
    if (cache.standings) {
      console.log("Returning expired cache due to error");
      return cache.standings.data;
    }
    // Return empty array as final fallback
    return [];
  }
}

/**
 * Fetch live player performance scores
 * Returns player stats with real-time performance metrics
 */
export async function fetchPlayerScores(): Promise<any[]> {
  try {
    // Check cache first
    if (isCacheValid(cache.scores, CACHE_TTL.scores)) {
      console.log("Returning cached player scores");
      return cache.scores!.data;
    }

    // If Fantasy League API key is configured, use real API
    if (FANTASY_API_KEY) {
      // TODO: Implement real API call when credentials are available
      console.log("FANTASY_LEAGUE_API_KEY configured but real API not yet implemented");
    }

    // Fallback: Use EPL players data
    const players = await db.select()
      .from(eplPlayers)
      .orderBy(desc(eplPlayers.goals))
      .limit(100);

    // Transform to fantasy scores format
    const playerScores = players.map((player) => ({
      playerId: player.apiId,
      playerName: player.name,
      team: player.team,
      position: player.position,
      fantasyScore: calculatePlayerFantasyScore(player),
      goals: player.goals || 0,
      assists: player.assists || 0,
      yellowCards: player.yellowCards || 0,
      redCards: player.redCards || 0,
      appearances: player.appearances || 0,
      minutes: player.minutes || 0,
      rating: player.rating ? parseFloat(player.rating) : 0,
      injured: player.injured,
      lastUpdated: player.lastUpdated,
    }));

    // Update cache
    cache.scores = {
      data: playerScores,
      timestamp: Date.now(),
    };

    return playerScores;
  } catch (error) {
    console.error("Error fetching player scores:", error);
    // Return cached data if available, even if expired
    if (cache.scores) {
      console.log("Returning expired cache due to error");
      return cache.scores.data;
    }
    // Return empty array as final fallback
    return [];
  }
}

/**
 * Fetch injury and suspension updates
 * Returns current injury list with details
 */
export async function fetchInjuryUpdates(): Promise<any[]> {
  try {
    // Check cache first
    if (isCacheValid(cache.injuries, CACHE_TTL.injuries)) {
      console.log("Returning cached injury updates");
      return cache.injuries!.data;
    }

    // If Fantasy League API key is configured, use real API
    if (FANTASY_API_KEY) {
      // TODO: Implement real API call when credentials are available
      console.log("FANTASY_LEAGUE_API_KEY configured but real API not yet implemented");
    }

    // Fallback: Use EPL injuries data
    const injuries = await db.select()
      .from(eplInjuries)
      .orderBy(desc(eplInjuries.lastUpdated))
      .limit(50);

    // Transform to fantasy injury format
    const injuryUpdates = injuries.map((injury) => ({
      playerId: injury.playerApiId,
      playerName: injury.playerName,
      playerPhoto: injury.playerPhoto,
      team: injury.team,
      teamLogo: injury.teamLogo,
      injuryType: injury.type,
      reason: injury.reason,
      fixtureId: injury.fixtureApiId,
      fixtureDate: injury.fixtureDate,
      status: injury.type === "Missing Fixture" ? "suspended" : "injured",
      expectedReturn: null, // Not available in current data
      lastUpdated: injury.lastUpdated,
    }));

    // Update cache
    cache.injuries = {
      data: injuryUpdates,
      timestamp: Date.now(),
    };

    return injuryUpdates;
  } catch (error) {
    console.error("Error fetching injury updates:", error);
    // Return cached data if available, even if expired
    if (cache.injuries) {
      console.log("Returning expired cache due to error");
      return cache.injuries.data;
    }
    // Return empty array as final fallback
    return [];
  }
}

/**
 * Calculate fantasy points for a team based on performance
 */
function calculateFantasyPoints(team: any): number {
  // Simple formula: wins * 3 + draws * 1 + (goals for / 10) - (goals against / 10)
  const winPoints = team.won * 3;
  const drawPoints = team.drawn * 1;
  const goalBonus = team.goalsFor / 10;
  const goalPenalty = team.goalsAgainst / 10;
  
  return Math.round((winPoints + drawPoints + goalBonus - goalPenalty) * 10) / 10;
}

/**
 * Calculate fantasy score for a player based on performance
 */
function calculatePlayerFantasyScore(player: any): number {
  const goals = player.goals || 0;
  const assists = player.assists || 0;
  const appearances = player.appearances || 0;
  const yellowCards = player.yellowCards || 0;
  const redCards = player.redCards || 0;
  const rating = player.rating ? parseFloat(player.rating) : 6.0;
  
  // Fantasy scoring formula
  let score = 0;
  score += goals * 10;        // 10 points per goal
  score += assists * 6;        // 6 points per assist
  score += appearances * 2;    // 2 points per appearance
  score += (rating - 6.0) * 5; // Rating bonus (baseline 6.0)
  score -= yellowCards * 1;    // -1 per yellow card
  score -= redCards * 3;       // -3 per red card
  
  return Math.round(score * 10) / 10;
}

/**
 * Clear cache (useful for testing or manual refresh)
 */
export function clearCache(): void {
  cache.standings = null;
  cache.scores = null;
  cache.injuries = null;
  console.log("Fantasy League API cache cleared");
}
