import { Redis } from "ioredis";

// Cache TTL values (in seconds)
export const CACHE_TTL = {
  PLAYERS_LIST: 300, // 5 minutes
  PLAYER_DETAIL: 1800, // 30 minutes
  CLUBS_LIST: 600, // 10 minutes
  CLUB_DETAIL: 1800, // 30 minutes
  COMPETITIONS_LIST: 1800, // 30 minutes
  COMPETITION_DETAIL: 3600, // 1 hour
  LEAGUE_STANDINGS: 300, // 5 minutes
  MARKET_VALUES: 1800, // 30 minutes
  SQUAD_ROSTER: 600, // 10 minutes
  TRANSFERS_LIST: 300, // 5 minutes
};

// Cache key generators
export const CACHE_KEYS = {
  players: (params: string) => `players:${params}`,
  player: (id: string) => `player:${id}`,
  clubs: (params: string) => `clubs:${params}`,
  club: (id: string) => `club:${id}`,
  competitions: (params: string) => `competitions:${params}`,
  competition: (id: string) => `competition:${id}`,
  standings: (competitionId: string) => `standings:${competitionId}`,
  marketValues: (playerId: string) => `marketValue:${playerId}`,
  squad: (clubId: string) => `squad:${clubId}`,
};

class CacheClient {
  private client: Redis | null = null;
  private isConnected = false;

  private parseRedisUrl(url: string): { host: string; port: number } {
    const match = url.match(/redis:\/\/([^:]+):(\d+)/);
    if (match) {
      return {
        host: match[1],
        port: parseInt(match[2], 10),
      };
    }
    return { host: "localhost", port: 6379 };
  }

  async connect(): Promise<void> {
    if (this.isConnected) return;

    try {
      const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
      const { host, port } = this.parseRedisUrl(redisUrl);

      this.client = new Redis({
        host,
        port,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
      });

      // Test connection
      await this.client.ping();
      this.isConnected = true;
      console.log("✅ Redis cache connected successfully");
    } catch (error) {
      console.error("❌ Redis connection failed:", error);
      this.isConnected = false;
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.client || !this.isConnected) {
      return null;
    }

    try {
      const data = await this.client.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      console.error(`Cache get error for key "${key}":`, error);
      return null;
    }
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      return false;
    }

    try {
      const serialized = JSON.stringify(value);
      await this.client.setex(key, ttl, serialized);
      return true;
    } catch (error) {
      console.error(`Cache set error for key "${key}":`, error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      return false;
    }

    try {
      const result = await this.client.del(key);
      return result > 0;
    } catch (error) {
      console.error(`Cache delete error for key "${key}":`, error);
      return false;
    }
  }

  async invalidatePattern(pattern: string): Promise<number> {
    if (!this.client || !this.isConnected) {
      return 0;
    }

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
        return keys.length;
      }
      return 0;
    } catch (error) {
      console.error(`Cache invalidate pattern error for "${pattern}":`, error);
      return 0;
    }
  }

  async flush(): Promise<boolean> {
    if (!this.client || !this.isConnected) {
      return false;
    }

    try {
      await this.client.flushdb();
      return true;
    } catch (error) {
      console.error("Cache flush error:", error);
      return false;
    }
  }

  isReady(): boolean {
    return this.isConnected && this.client !== null;
  }
}

// Singleton instance
export const cache = new CacheClient();

// Helper function to generate cache key from query params
export function generateCacheKey(prefix: string, params: Record<string, any>): string {
  // Sort params to ensure consistent key generation
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {} as Record<string, any>);

  const paramString = Object.entries(sortedParams)
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return `${prefix}:${paramString}`;
}

// Higher-order function to cache API responses
export async function withCache<T>(
  key: string,
  ttl: number,
  fetchFn: () => Promise<T>
): Promise<{ data: T; fromCache: boolean }> {
  try {
    // Try to get from cache first
    const cached = await cache.get<T>(key);
    if (cached !== null) {
      console.log(`📋 Cache HIT: ${key}`);
      return { data: cached, fromCache: true };
    }

    console.log(`📋 Cache MISS: ${key}`);
    
    // Fetch fresh data
    const data = await fetchFn();
    
    // Store in cache
    await cache.set(key, data, ttl);
    
    return { data, fromCache: false };
  } catch (error) {
    console.error("Cache operation failed, falling back to direct fetch:", error);
    // If cache fails, still try to fetch data
    const data = await fetchFn();
    return { data, fromCache: false };
  }
}

// Initialize cache connection on module load
// This ensures Redis is ready when API routes first use it
cache.connect().catch((error) => {
  console.warn("⚠️ Redis cache not available, running without cache:", error.message);
});
