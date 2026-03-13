import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Fetch all positions (no pagination needed for dropdown)
    const positions = await prisma.position.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({
      positions,
    });
  } catch (error) {
    console.error("Positions fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
