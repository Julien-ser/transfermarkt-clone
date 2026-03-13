import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { updateStaleMarketValues, updateAllMarketValues, getMarketValueStats } from "@/lib/marketValueUpdater";

/**
 * POST /api/admin/market-values/update
 * Manually trigger market value update for all players or only stale ones
 *
 * Query parameters:
 * - ?all=true (optional) - update all players regardless of last update
 *
 * Requires admin authentication
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has admin role
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const url = new URL(request.url);
    const updateAll = url.searchParams.get("all") === "true";

    // Run the update
    const startTime = Date.now();
    let result;

    if (updateAll) {
      result = await updateAllMarketValues();
    } else {
      result = await updateStaleMarketValues(7); // Default: update players not updated in 7 days
    }

    const duration = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      message: updateAll ? "All players updated successfully" : "Stale players updated successfully",
      result,
      duration,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Manual market value update failed:", error);
    return NextResponse.json(
      { error: "Update failed", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/market-values/update
 * Get market value statistics and update status
 *
 * Requires admin authentication
 */
export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has admin role
    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const stats = await getMarketValueStats();

    return NextResponse.json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Failed to fetch market value stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
