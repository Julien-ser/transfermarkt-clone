import { PrismaClient } from "@prisma/client";
import { differenceInYears, subDays, isAfter } from "date-fns";

const prisma = new PrismaClient();

/**
 * Position base values (in EUR) - serve as starting point for market value calculation
 */
const POSITION_BASE_VALUES: Record<string, number> = {
  GK: 10_000_000,    // Goalkeeper
  DEF: 15_000_000,   // Defender
  MID: 20_000_000,   // Midfielder
  FWD: 25_000_000,   // Forward
};

/**
 * League tier multipliers - top leagues have higher multiplier
 */
const LEAGUE_TIERS: Record<string, number> = {
  "Premier League": 1.5,
  "La Liga": 1.4,
  "Bundesliga": 1.3,
  "Serie A": 1.3,
  "Ligue 1": 1.2,
  "Champions League": 1.6,
  "Europa League": 1.3,
  default: 1.0,
};

/**
 * Calculate age category for age factor
 */
function getAgeFactor(birthDate: Date): number {
  const age = differenceInYears(new Date(), birthDate);

  if (age < 21) return 0.7;      // Young - potential but unproven
  if (age >= 21 && age < 25) return 0.9;
  if (age >= 25 && age < 29) return 1.0; // Prime age
  if (age >= 29 && age < 33) return 0.85;
  return 0.7;                    // 33+ - declining
}

/**
 * Calculate performance multiplier based on latest season stats
 */
function calculatePerformanceMultiplier(
  stats: {
    goals: number;
    assists: number;
    appearances: number;
    minutesPlayed: number;
    cleanSheets?: number;
    positionCategory: string;
  } | null
): number {
  if (!stats) return 1.0;

  const { positionCategory, appearances, minutesPlayed } = stats;
  
  // Base performance factor from appearances
  let performanceScore = 1.0;
  
  if (appearances >= 30) {
    performanceScore += 0.2;
  } else if (appearances >= 20) {
    performanceScore += 0.1;
  } else if (appearances < 5) {
    performanceScore -= 0.2;
  }
  
  // Position-specific performance bonuses
  if (positionCategory === "FWD") {
    const goalsPer90 = stats.goals / (minutesPlayed / 90);
    if (goalsPer90 >= 0.5) performanceScore += 0.3;
    else if (goalsPer90 >= 0.3) performanceScore += 0.15;
    if (stats.assists >= 10) performanceScore += 0.1;
  } 
  else if (positionCategory === "MID") {
    const goalsPer90 = stats.goals / (minutesPlayed / 90);
    const assistsPer90 = stats.assists / (minutesPlayed / 90);
    if (goalsPer90 >= 0.3) performanceScore += 0.2;
    if (assistsPer90 >= 0.5) performanceScore += 0.2;
    if (stats.assists >= 10) performanceScore += 0.15;
  }
  else if (positionCategory === "DEF") {
    if (stats.cleanSheets && stats.cleanSheets >= 15) {
      performanceScore += 0.25;
    }
  }
  else if (positionCategory === "GK") {
    if (stats.cleanSheets && stats.cleanSheets >= 15) {
      performanceScore += 0.3;
    }
  }
  
  return Math.max(0.5, Math.min(2.0, performanceScore));
}

/**
 * Calculate new market value for a player
 */
export async function calculatePlayerMarketValue(
  playerId: number
): Promise<{ oldValue: number | null; newValue: number; changePercentage: number } | null> {
  try {
    // Fetch player with related data
    const player = await prisma.player.findUnique({
      where: { id: playerId },
      include: {
        position: true,
        currentClub: {
          include: {
            competitions: {
              include: {
                competition: true;
              }
            }
          }
        },
        stats: {
          take: 1,
          orderBy: {
            season: {
              startDate: "desc"
            }
          }
        },
        marketValue: {
          orderBy: {
            date: "desc"
          },
          take: 1
        }
      }
    });

    if (!player) {
      return null;
    }

    // Get base value from position
    let baseValue = POSITION_BASE_VALUES[player.position.category] || 20_000_000;
    
    // If player has existing market value, use it as base instead
    const oldValue = player.marketValue?.[0]?.value || null;
    if (oldValue) {
      baseValue = oldValue;
    }

    // Calculate age factor
    const ageFactor = getAgeFactor(player.birthDate);

    // Calculate performance multiplier
    const latestStats = player.stats[0] || null;
    const performanceMultiplier = calculatePerformanceMultiplier({
      ...latestStats,
      positionCategory: player.position.category
    });

    // Calculate club/league multiplier
    let clubMultiplier = 1.0;
    if (player.currentClub) {
      const topCompetition = player.currentClub.competitions.find(
        c => c.season.isCurrent
      );
      if (topCompetition) {
        const compName = topCompetition.competition.name;
        clubMultiplier = LEAGUE_TIERS[compName] || 1.0;
      }
    }

    // Calculate new value with random fluctuation (±5%)
    const fluctuation = 0.95 + Math.random() * 0.1;
    let newValue = baseValue * ageFactor * performanceMultiplier * clubMultiplier * fluctuation;

    // Round to nearest 100,000
    newValue = Math.round(newValue / 100_000) * 100_000;

    // Ensure minimum value of 100k
    newValue = Math.max(100_000, newValue);

    // Calculate percentage change
    let changePercentage = 0;
    if (oldValue && oldValue > 0) {
      changePercentage = ((newValue - oldValue) / oldValue) * 100;
    }

    return {
      oldValue,
      newValue,
      changePercentage: Math.round(changePercentage * 100) / 100
    };
  } catch (error) {
    console.error(`Error calculating market value for player ${playerId}:`, error);
    return null;
  }
}

/**
 * Update market values for all players
 */
export async function updateAllMarketValues(): Promise<{
  total: number;
  updated: number;
  errors: number;
  averageChange: number;
}> {
  try {
    // Get all player IDs
    const players = await prisma.player.findMany({
      select: { id: true },
    });

    const total = players.length;
    let updated = 0;
    let errors = 0;
    const changes: number[] = [];

    for (const player of players) {
      const result = await calculatePlayerMarketValue(player.id);
      
      if (result) {
        // Update player's current market value
        await prisma.player.update({
          where: { id: player.id },
          data: {
            marketValue: result.newValue,
            marketValueDate: new Date(),
          }
        });

        // Create historical market value record
        await prisma.marketValue.create({
          data: {
            playerId: player.id,
            value: result.newValue,
            currency: "EUR",
            date: new Date(),
            source: "Automated Update"
          }
        });

        updated++;
        changes.push(result.changePercentage);
      } else {
        errors++;
      }
    }

    const averageChange = changes.length > 0 
      ? changes.reduce((a, b) => a + b, 0) / changes.length 
      : 0;

    return {
      total,
      updated,
      errors,
      averageChange: Math.round(averageChange * 100) / 100
    };
  } catch (error) {
    console.error("Error in updateAllMarketValues:", error);
    throw error;
  }
}

/**
 * Update players that haven't been updated in the last N days
 */
export async function updateStaleMarketValues(daysThreshold: number = 7): Promise<{
  total: number;
  updated: number;
  errors: number;
}> {
  try {
    const cutoffDate = subDays(new Date(), daysThreshold);

    // Get players with stale market values
    const players = await prisma.player.findMany({
      where: {
        OR: [
          { marketValueDate: { lt: cutoffDate } },
          { marketValueDate: null }
        ]
      },
      select: { id: true },
    });

    const total = players.length;
    let updated = 0;
    let errors = 0;

    for (const player of players) {
      const result = await calculatePlayerMarketValue(player.id);
      
      if (result) {
        await prisma.player.update({
          where: { id: player.id },
          data: {
            marketValue: result.newValue,
            marketValueDate: new Date(),
          }
        });

        await prisma.marketValue.create({
          data: {
            playerId: player.id,
            value: result.newValue,
            currency: "EUR",
            date: new Date(),
            source: "Automated Update"
          }
        });

        updated++;
      } else {
        errors++;
      }
    }

    return { total, updated, errors };
  } catch (error) {
    console.error("Error in updateStaleMarketValues:", error);
    throw error;
  }
}