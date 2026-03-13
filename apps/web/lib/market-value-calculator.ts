import { PrismaClient, Player, Position, PlayerStats, Transfer } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Market value calculator that simulates realistic market value changes
 * based on age, performance, position, and market trends.
 */
export class MarketValueCalculator {
  /**
   * Calculate new market value for a player based on multiple factors.
   */
  async calculateNewValue(playerId: number, playerPositionId?: number, playerBirthDate?: Date, currentMarketValue?: number | null): Promise<{ value: number; factors: Record<string, number> }> {
    const factors: Record<string, number> = {};
    let multiplier = 1;

    // Fetch player with position relation if positionId provided
    let playerWithPosition: Player & { position?: Position } | null = null;
    if (playerPositionId) {
      playerWithPosition = await prisma.player.findUnique({
        where: { id: playerId },
        include: { position: true },
      });
    }

    const position = playerWithPosition?.position;
    const birthDate = playerBirthDate || new Date();
    const age = this.getAge(birthDate);

    // 1. Age factor (peak at 27-28, declines after 30, grows before 25)
    const ageFactor = this.calculateAgeFactor(age);
    multiplier *= ageFactor;
    factors.age = ageFactor;

    // 2. Current performance factor
    const performanceFactor = await this.calculatePerformanceFactor(playerId);
    multiplier *= performanceFactor;
    factors.performance = performanceFactor;

    // 3. Position factor (some positions more valuable)
    const positionFactor = this.calculatePositionFactor(position);
    multiplier *= positionFactor;
    factors.position = positionFactor;

    // 4. Recent transfer impact (if transferred recently)
    const transferFactor = await this.calculateTransferImpact(playerId);
    multiplier *= transferFactor;
    factors.transfer = transferFactor;

    // 5. Market trend factor (simulates overall market movement)
    const marketTrendFactor = this.getRandomMarketTrend();
    multiplier *= marketTrendFactor;
    factors.marketTrend = marketTrendFactor;

    // 6. Daily volatility (±2% random)
    const dailyVolatility = 0.98 + Math.random() * 0.04;
    multiplier *= dailyVolatility;
    factors.dailyVolatility = dailyVolatility;

    // Base value: use current market value or fallback to position average
    const baseValue = currentMarketValue || (position ? await this.getPositionAverageValue(position.id) : 10000000);

    const newValue = Math.round(baseValue * multiplier);

    return {
      value: Math.max(10000, newValue), // Minimum €10k
      factors,
    };
  }

  /**
   * Calculate age-based multiplier.
   * Players peak at 27-28, grow until 25, decline after 30.
   */
  private calculateAgeFactor(age: number): number {
    if (age < 20) {
      // Rapid growth for young players
      return 1 + (age - 18) * 0.08;
    } else if (age < 25) {
      // Steady growth
      return 1 + (age - 20) * 0.04;
    } else if (age <= 28) {
      // Peak years (slight increase)
      return 1.20 + (age - 25) * 0.01;
    } else if (age <= 32) {
      // Early decline
      return 1.23 - (age - 28) * 0.025;
    } else {
      // Significant decline after 32
      return 1.13 - (age - 32) * 0.03;
    }
  }

  /**
   * Calculate performance factor based on recent stats.
   */
  private async calculatePerformanceFactor(playerId: number): Promise<number> {
    // Get most recent season stats
    const recentStats = await prisma.playerStats.findFirst({
      where: { playerId },
      orderBy: { season: { startDate: "desc" } },
      include: { season: true },
    });

    if (!recentStats) return 1;

    const season = recentStats.season;
    const now = new Date();
    const seasonEnd = new Date(season.endDate);
    const seasonStart = new Date(season.startDate);
    const seasonProgress = Math.max(0, Math.min(1, (now.getTime() - seasonStart.getTime()) / (seasonEnd.getTime() - seasonStart.getTime())));

    // Need player's position for proper calculation
    const player = await prisma.player.findUnique({
      where: { id: playerId },
      include: { position: true },
    });

    if (!player?.position) return 1;

    // Position-specific performance metrics
    let performanceScore = 0;
    let weightSum = 0;

    switch (player.position.category) {
      case "GK":
        performanceScore = (recentStats.cleanSheets || 0) * 2 + (recentStats.appearances * 0.5);
        weightSum = (recentStats.appearances || 1) * 2;
        break;
      case "DEF":
        performanceScore = (recentStats.cleanSheets || 0) * 1.5 + recentStats.interceptions + recentStats.tackles + (recentStats.appearances * 0.3);
        weightSum = (recentStats.appearances || 1) * 3;
        break;
      case "MID":
        performanceScore = recentStats.goals + (recentStats.assists * 0.7) + recentStats.keyPasses + (recentStats.passes * 0.01);
        weightSum = (recentStats.appearances || 1) * 4;
        break;
      case "FWD":
        performanceScore = recentStats.goals * 2 + recentStats.assists * 0.5 + (recentStats.shotsOnTarget * 0.2);
        weightSum = (recentStats.appearances || 1) * 3;
        break;
    }

    const per90Factor = recentStats.minutesPlayed > 0 ? (performanceScore / weightSum) * (90 / recentStats.minutesPlayed) * 10 : 0;
    const normalizedFactor = Math.min(2, 0.8 + per90Factor);

    // Adjust for season progress (not full season yet)
    if (seasonProgress < 0.5) {
      return 0.9 + (normalizedFactor - 1) * 0.5;
    }

    return normalizedFactor;
  }

  /**
   * Position-based multiplier (certain positions more valuable).
   */
  private calculatePositionFactor(position?: Position): number {
    if (!position) return 1;
    const positionWeights: Record<string, number> = {
      GK: 0.95,
      DEF: 0.9,
      MID: 1.05,
      FWD: 1.15, // Forwards generally higher market values
    };
    return positionWeights[position.category] || 1;
  }

  /**
   * Get average market value for a position as fallback.
   */
   private async getPositionAverageValue(positionId: number): Promise<number> {
     const result = await prisma.player.aggregate({
       where: { positionId },
       _avg: {
         marketValue: true
       }
     });
     return result._avg?.marketValue || 10000000; // Fallback to €10m
   }

  /**
   * Calculate impact of recent transfers.
   */
  private async calculateTransferImpact(playerId: number): Promise<number> {
    // Check last 6 months transfers
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentTransfer = await prisma.transfer.findFirst({
      where: {
        playerId,
        transferDate: { gte: sixMonthsAgo },
      },
      orderBy: { transferDate: "desc" },
    });

    if (!recentTransfer) return 1;

    // Transfer to a better league increases value, vice versa
    // Simplified: just use a fixed factor for demo
    return 1.1; // 10% boost for recent transfer activity
  }

  /**
   * Get random market trend factor (simulates overall market movement).
   */
  private getRandomMarketTrend(): number {
    // Slight upward bias in market overall
    return 0.98 + Math.random() * 0.04; // 98-102%
  }

  /**
   * Calculate age from birth date.
   */
  private getAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  /**
   * Update market value for a single player.
   */
  async updatePlayerMarketValue(playerId: number): Promise<{ success: boolean; oldValue: number | null; newValue: number; factors: Record<string, number> }> {
    const player = await prisma.player.findUnique({ where: { id: playerId } });

    if (!player) {
      throw new Error(`Player ${playerId} not found`);
    }

    const { value: newValue, factors } = await this.calculateNewValue(playerId, player.positionId, player.birthDate, player.marketValue);
    const oldValue = player.marketValue;

    // Store historical value
    await prisma.marketValue.create({
      data: {
        playerId: player.id,
        value: newValue,
        date: new Date(),
        source: "auto-calculated",
      },
    });

    // Update player's current market value
    await prisma.player.update({
      where: { id: playerId },
      data: {
        marketValue: newValue,
        marketValueDate: new Date(),
      },
    });

    return {
      success: true,
      oldValue,
      newValue,
      factors,
    };
  }

  /**
   * Run batch update for all players (or filtered subset).
   */
  async updateAllPlayers(batchSize?: number): Promise<{
    total: number;
    updated: number;
    errors: Array<{ playerId: number; error: string }>;
  }> {
    const where: any = {};
    // Optionally only update players with recent activity
    // where: { updatedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }

    const players = await prisma.player.findMany({
      where,
      take: batchSize,
    });

    let updated = 0;
    const errors: Array<{ playerId: number; error: string }> = [];

    for (const player of players) {
      try {
        await this.updatePlayerMarketValue(player.id);
        updated++;
      } catch (error) {
        errors.push({ playerId: player.id, error: error instanceof Error ? error.message : "Unknown error" });
      }
    }

    return {
      total: players.length,
      updated,
      errors,
    };
  }
}

// Run as standalone script
async function main() {
  const calculator = new MarketValueCalculator();

  console.log("Starting market value update...");

  const result = await calculator.updateAllPlayers();

  console.log(`Update complete: ${result.updated}/${result.total} players updated`);
  if (result.errors.length > 0) {
    console.log(`Errors: ${result.errors.length}`);
    result.errors.forEach((err) => console.error(`  Player ${err.playerId}: ${err.error}`));
  }

  await prisma.$disconnect();
}

// Check if running as standalone script (Node.js)
if (require.main === module) {
  main().catch(console.error);
}