import cron from "node-cron";
import { updateStaleMarketValues, getMarketValueStats } from "./marketValueUpdater";

/**
 * Market Value Update Scheduler
 *
 * Runs automated market value updates on a schedule.
 * Default: Daily at 2:00 AM UTC (server off-peak)
 * Configurable via MARKET_VALUE_UPDATE_SCHEDULE environment variable
 */
class MarketValueScheduler {
  private isRunning = false;
  private scheduledJob: cron.ScheduledTask | null = null;
  private readonly DEFAULT_SCHEDULE = "0 2 * * *"; // Daily at 2 AM

  constructor(private schedule?: string) {
    // Use provided schedule or fall back to environment variable, then default
    this.schedule = schedule || process.env.MARKET_VALUE_UPDATE_SCHEDULE || this.DEFAULT_SCHEDULE;
  }

  /**
   * Start the cron job scheduler
   */
  start(): void {
    if (this.isRunning) {
      console.log("[MarketValueScheduler] Scheduler already running");
      return;
    }

    console.log(`[MarketValueScheduler] Starting scheduler with cron: ${this.schedule}`);

    this.scheduledJob = cron.schedule(
      this.schedule,
      async () => {
        await this.runUpdate();
      },
      {
        timezone: "UTC", // Use UTC to avoid timezone confusion
      }
    );

    this.isRunning = true;
    console.log("[MarketValueScheduler] Scheduler started successfully");

    // Also run an immediate update on startup if needed (optional)
    // Uncomment the following line if you want an immediate update on startup
    // this.runUpdate().catch(console.error);
  }

  /**
   * Stop the cron job scheduler
   */
  stop(): void {
    if (this.scheduledJob) {
      this.scheduledJob.stop();
      this.scheduledJob.destroy();
      this.scheduledJob = null;
      this.isRunning = false;
      console.log("[MarketValueScheduler] Scheduler stopped");
    }
  }

  /**
   * Run the market value update manually (for testing or manual trigger)
   */
  async runUpdate() {
    console.log(`[MarketValueScheduler] Starting market value update at ${new Date().toISOString()}`);

    try {
      const startTime = Date.now();
      const result = await updateStaleMarketValues(7); // Update players not updated in last 7 days
      const duration = Date.now() - startTime;

      console.log(`[MarketValueScheduler] Update completed in ${duration}ms`);
      console.log(`[MarketValueScheduler] Results: ${JSON.stringify(result, null, 2)}`);

      // Log stats
      const stats = await getMarketValueStats();
      console.log(`[MarketValueScheduler] Current stats: ${JSON.stringify(stats, null, 2)}`);

      return result;
    } catch (error) {
      console.error("[MarketValueScheduler] Update failed:", error);
      throw error;
    }
  }

  /**
   * Check if the scheduler is running
   */
  getIsRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Get the next scheduled run time
   */
  getNextRun(): Date | null {
    if (!this.scheduledJob) return null;
    return this.scheduledJob.nextDates().toDate();
  }
}

// Create a singleton instance that can be imported and used across the app
export const marketValueScheduler = new MarketValueScheduler();

// For testing or manual execution
export async function runManualUpdate() {
  return marketValueScheduler.runUpdate();
}

export default marketValueScheduler;
