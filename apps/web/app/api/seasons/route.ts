import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Fetch all seasons ordered by start date descending (most recent first)
    const seasons = await prisma.season.findMany({
      orderBy: {
        startDate: "desc",
      },
    });

    return NextResponse.json({
      seasons,
    });
  } catch (error) {
    console.error("Seasons fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
