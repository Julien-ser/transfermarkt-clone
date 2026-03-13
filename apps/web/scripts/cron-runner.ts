#!/usr/bin/env node

/**
 * Standalone Cron Runner for Market Value Updates
 *
 * Run this script in a separate terminal or as a background process.
 * It will start the market value update scheduler and keep it running.
 */

import { marketValueScheduler } from "../lib/cron-service";

console.log("=".repeat(50));
console.log("Market Value Update Cron Runner");
console.log("=".repeat(50));

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down cron scheduler...");
  marketValueScheduler.stop();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\nShutting down cron scheduler...");
  marketValueScheduler.stop();
  process.exit(0);
});

// Start the scheduler
try {
  marketValueScheduler.start();
  console.log("Scheduler is running. Press Ctrl+C to stop.");
} catch (error) {
  console.error("Failed to start scheduler:", error);
  process.exit(1);
}
