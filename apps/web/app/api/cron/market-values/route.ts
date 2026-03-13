import { NextRequest, NextResponse } from "next/server";
import { updateStaleMarketValues, updateAllMarketValues } from "@/lib/marketValueUpdater";

/**
 * Public cron webhook endpoint for automated market value updates
 *
 * This endpoint is designed to be called by external schedulers like:
 * - Vercel Cron Jobs
 * - Railway Cron
 * - GitHub Actions (scheduled workflows)
 * - System cron with curl/wget
 *
 * Security: Uses a secret token in the Authorization header
 * Usage: Authorization: Bearer <CRON_SECRET_TOKEN>
 *
 * Query parameters:
 * - ?all=true (optional) - update all players regardless of last update
 *
 * Returns JSON with update results
 */
export async function POST(request: NextRequest) {
  try {
    // Verify secret token
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Missing or invalid Authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const expectedToken = process.env.CRON_SECRET_TOKEN;

    if (!expectedToken || token !== expectedToken) {
      return NextResponse.json(
        { error: "Invalid secret token" },
        { status: 403 }
      );
    }

    // Check for 'all' query parameter
    const url = new URL(request.url);
    const updateAll = url.searchParams.get("all") === "true";

    // Run the update
    const startTime = Date.now();
    let result;

    if (updateAll) {
      result = await updateAllMarketValues();
    } else {
      result = await updateStaleMarketValues(7);
    }

    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      message: updateAll ? "All players updated" : "Stale players updated",
      result,
      duration,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Cron market value update failed:", error);
    return NextResponse.json(
      {
        error: "Update failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * Health check endpoint for monitoring
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "market-value-cron",
    timestamp: new Date().toISOString(),
    schedule: process.env.MARKET_VALUE_UPDATE_SCHEDULE || "0 2 * * *",
  });
}
