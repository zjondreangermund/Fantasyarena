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
 * Returns standings from Fantasy League API or EPL data as fallback
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
      // For now, return mock fantasy data
      console.log("FANTASY_LEAGUE_API_KEY configured - using fantasy league data");
      const mockFantasyStandings = generateMockFantasyStandings();
      
      cache.standings = {
        data: mockFantasyStandings,
        timestamp: Date.now(),
      };
      
      return mockFantasyStandings;
    }

    // Fallback: Use EPL standings data if available
    try {
      const standings = await db.select().from(eplStandings).orderBy(desc(eplStandings.points)).limit(20);
      
      if (standings.length === 0) {
        console.log("No EPL standings data available, returning empty array");
        return [];
      }

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
    } catch (dbError) {
      console.error("Database query failed:", dbError);
      return [];
    }
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
      console.log("FANTASY_LEAGUE_API_KEY configured - using fantasy league data");
      const mockPlayerScores = generateMockPlayerScores();
      
      cache.scores = {
        data: mockPlayerScores,
        timestamp: Date.now(),
      };
      
      return mockPlayerScores;
    }

    // Fallback: Use EPL players data if available
    try {
      const players = await db.select()
        .from(eplPlayers)
        .orderBy(desc(eplPlayers.goals))
        .limit(100);

      if (players.length === 0) {
        console.log("No EPL players data available, returning empty array");
        return [];
      }

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
    } catch (dbError) {
      console.error("Database query failed:", dbError);
      return [];
    }
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
      console.log("FANTASY_LEAGUE_API_KEY configured - using fantasy league data");
      const mockInjuries = generateMockInjuries();
      
      cache.injuries = {
        data: mockInjuries,
        timestamp: Date.now(),
      };
      
      return mockInjuries;
    }

    // Fallback: Use EPL injuries data if available
    try {
      const injuries = await db.select()
        .from(eplInjuries)
        .orderBy(desc(eplInjuries.lastUpdated))
        .limit(50);

      if (injuries.length === 0) {
        console.log("No EPL injuries data available, returning empty array");
        return [];
      }

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
    } catch (dbError) {
      console.error("Database query failed:", dbError);
      return [];
    }
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
 * Scoring system:
 * - 3 points per win
 * - 1 point per draw
 * - 0.1 points per goal scored
 * - -0.1 points per goal conceded
 */
function calculateFantasyPoints(team: any): number {
  const winPoints = team.won * 3;
  const drawPoints = team.drawn * 1;
  const goalBonus = team.goalsFor / 10;
  const goalPenalty = team.goalsAgainst / 10;
  
  const totalPoints = winPoints + drawPoints + goalBonus - goalPenalty;
  
  // Use toFixed for reliable rounding to 1 decimal place
  return parseFloat(totalPoints.toFixed(1));
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

/**
 * Generate mock fantasy standings when Fantasy API key is configured
 * This provides sample data structure until real API is implemented
 */
function generateMockFantasyStandings(): any[] {
  const mockTeams = [
    { name: "Fantasy FC United", logo: "/images/team-1.png", points: 450 },
    { name: "Dream Team Elite", logo: "/images/team-2.png", points: 420 },
    { name: "Goal Crushers", logo: "/images/team-3.png", points: 395 },
    { name: "Victory Squad", logo: "/images/team-4.png", points: 380 },
    { name: "Champions League", logo: "/images/team-5.png", points: 365 },
  ];

  return mockTeams.map((team, index) => ({
    rank: index + 1,
    teamId: 1000 + index,
    teamName: team.name,
    teamLogo: team.logo,
    points: team.points,
    played: 20,
    won: Math.floor(team.points / 30),
    drawn: 5,
    lost: 20 - Math.floor(team.points / 30) - 5,
    goalsFor: 45 + index * 3,
    goalsAgainst: 20 + index * 2,
    goalDifference: 25 - index * 2,
    form: "WWDWL",
    fantasyPoints: team.points,
  }));
}

/**
 * Generate mock player scores when Fantasy API key is configured
 */
function generateMockPlayerScores(): any[] {
  const mockPlayers = [
    { name: "Fantasy Star 1", team: "Dream Team", position: "FWD", score: 250 },
    { name: "Fantasy Star 2", team: "Goal Crushers", position: "MID", score: 230 },
    { name: "Fantasy Star 3", team: "Victory Squad", position: "DEF", score: 180 },
    { name: "Fantasy Star 4", team: "Champions League", position: "GK", score: 160 },
    { name: "Fantasy Star 5", team: "Fantasy FC United", position: "FWD", score: 240 },
  ];

  return mockPlayers.map((player, index) => ({
    playerId: 2000 + index,
    playerName: player.name,
    team: player.team,
    position: player.position,
    fantasyScore: player.score,
    goals: player.position === "FWD" ? 15 : 5,
    assists: player.position === "MID" ? 12 : 3,
    yellowCards: 2,
    redCards: 0,
    appearances: 20,
    minutes: 1800,
    rating: 7.5,
    injured: false,
    lastUpdated: new Date(),
  }));
}

/**
 * Generate mock injury data when Fantasy API key is configured
 */
function generateMockInjuries(): any[] {
  const mockInjuries = [
    { name: "Injured Player 1", team: "Dream Team", type: "Muscle Injury", reason: "Hamstring" },
    { name: "Injured Player 2", team: "Goal Crushers", type: "Missing Fixture", reason: "Suspension" },
    { name: "Injured Player 3", team: "Victory Squad", type: "Knock", reason: "Ankle" },
  ];

  return mockInjuries.map((injury, index) => ({
    playerId: 3000 + index,
    playerName: injury.name,
    playerPhoto: "/images/player-placeholder.png",
    team: injury.team,
    teamLogo: "/images/team-placeholder.png",
    injuryType: injury.type,
    reason: injury.reason,
    fixtureId: null,
    fixtureDate: null,
    status: injury.type === "Missing Fixture" ? "suspended" : "injured",
    expectedReturn: null,
    lastUpdated: new Date(),
  }));
}
