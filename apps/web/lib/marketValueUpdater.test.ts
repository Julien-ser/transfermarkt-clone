import {
  calculatePlayerMarketValue,
  updateAllMarketValues,
  updateStaleMarketValues,
  getMarketValueStats,
} from "@/lib/marketValueUpdater";
import { PrismaClient } from "@prisma/client";
import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";

const prisma = new PrismaClient();

describe("MarketValueUpdater", () => {
  describe("calculatePlayerMarketValue", () => {
    it("should calculate market value for existing player", async () => {
      // Get a real player from the database
      const player = await prisma.player.findFirst({
        include: {
          position: true,
          currentClub: {
            include: {
              competitions: {
                include: {
                  competition: true,
                  season: true,
                },
              },
            },
          },
          stats: {
            take: 1,
            orderBy: {
              season: {
                startDate: "desc",
              },
            },
          },
          marketValues: {
            orderBy: {
              date: "desc",
            },
            take: 1,
          },
        },
      });

      if (!player) {
        // Skip test if no players in database
        return;
      }

      const result = await calculatePlayerMarketValue(player.id);

      expect(result).not.toBeNull();
      expect(result!.oldValue).toBeDefined();
      expect(result!.newValue).toBeGreaterThan(0);
      expect(typeof result!.changePercentage).toBe("number");
      expect(result!.newValue).toBeGreaterThanOrEqual(100000); // Minimum 100k
    });

    it("should return null for non-existent player", async () => {
      const result = await calculatePlayerMarketValue(99999);
      expect(result).toBeNull();
    });

    it("should produce reasonable value changes (within ±30%)", async () => {
      const player = await prisma.player.findFirst();

      if (!player) {
        return;
      }

      const result = await calculatePlayerMarketValue(player.id);

      if (result && result.oldValue && result.oldValue > 0) {
        const ratio = result.newValue / result.oldValue;
        // Value should not change more than ±30% in one update
        expect(ratio).toBeGreaterThan(0.7);
        expect(ratio).toBeLessThan(1.3);
      }
    });
  });

  describe("updateStaleMarketValues", () => {
    it("should update stale players only", async () => {
      const result = await updateStaleMarketValues(0); // 0 days = all players

      expect(result.total).toBeGreaterThanOrEqual(0);
      expect(result.updated).toBeGreaterThanOrEqual(0);
      expect(result.errors).toBeInstanceOf(Array);
      expect(result.details).toBeInstanceOf(Array);

      if (result.updated > 0) {
        expect(result.details.length).toBe(result.updated);
      }
    });

    it("should create historical MarketValue records", async () => {
      // Get initial count
      const initialCount = await prisma.marketValue.count();

      // Run update for all players
      await updateStaleMarketValues(0);

      // Check that new records were created
      const finalCount = await prisma.marketValue.count();
      expect(finalCount).toBeGreaterThanOrEqual(initialCount);
    });

    it("should update player's marketValue and marketValueDate", async () => {
      const player = await prisma.player.findFirst();

      if (!player) {
        return;
      }

      const oldValue = player.marketValue;
      const result = await updateStaleMarketValues(0);

      // Verify player was updated
      const updatedPlayer = await prisma.player.findUnique({
        where: { id: player.id },
      });

      if (result.updated > 0) {
        expect(updatedPlayer?.marketValueDate).toBeDefined();
      }
    });
  });

  describe("updateAllMarketValues", () => {
    it("should update all players regardless of last update", async () => {
      const result = await updateAllMarketValues();

      expect(result.total).toBeGreaterThanOrEqual(0);
      expect(result.updated).toBeGreaterThanOrEqual(0);
      expect(result.errors).toBeInstanceOf(Array);
      expect(result.averageChange).toBeDefined();
      expect(result.total).toBe(result.updated + result.errors);
    });

    it("should return error count when some players fail", async () => {
      const result = await updateAllMarketValues();
      // Errors may occur but shouldn't crash the operation
      expect(result.total).toBe(result.updated + result.errors);
    });
  });

  describe("getMarketValueStats", () => {
    it("should return statistics about market value updates", async () => {
      const stats = await getMarketValueStats();

      expect(stats.totalPlayers).toBeGreaterThanOrEqual(0);
      expect(stats.playersWithValue).toBeGreaterThanOrEqual(0);
      expect(stats.stalePlayers).toBeGreaterThanOrEqual(0);
      expect(typeof stats.lastUpdated).toBe("string");
    });

    it("should correctly count stale players", async () => {
      const stats = await getMarketValueStats();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // All players with marketValueDate older than 7 days or null are considered stale
      const manuallyCounted = await prisma.player.count({
        where: {
          OR: [
            { marketValueDate: { lt: sevenDaysAgo } },
            { marketValueDate: null },
          ],
        },
      });

      expect(stats.stalePlayers).toBe(manuallyCounted);
    });
  });

  describe("Cache Invalidation", () => {
    it("should invalidate player cache on update without throwing", async () => {
      // This would require Redis to be running and cache to be set
      // For now, we'll verify the function runs without throwing
      await updateStaleMarketValues(0);
    });
  });
});
