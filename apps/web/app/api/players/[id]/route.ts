import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { playerUpdateSchema } from "@/lib/validations";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const playerId = parseInt(params.id);

    if (isNaN(playerId)) {
      return NextResponse.json({ error: "Invalid player ID" }, { status: 400 });
    }

    const player = await prisma.player.findUnique({
      where: { id: playerId },
      include: {
        nationality: true,
        position: true,
        currentClub: {
          include: {
            country: true,
          },
        },
        birthPlace: true,
        clubs: {
          include: {
            club: {
              include: {
                country: true,
              },
            },
            season: true,
          },
          orderBy: {
            joinedDate: "desc",
          },
        },
        transfers: {
          include: {
            fromClub: {
              include: {
                country: true,
              },
            },
            toClub: {
              include: {
                country: true,
              },
            },
            season: true,
          },
          orderBy: {
            transferDate: "desc",
          },
        },
        stats: {
          include: {
            club: true,
            season: true,
          },
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
          take: 50,
        },
      },
    });

    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    return NextResponse.json(player);
  } catch (error) {
    console.error("Player fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Optional: Check if user has admin role
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const playerId = parseInt(params.id);

    if (isNaN(playerId)) {
      return NextResponse.json({ error: "Invalid player ID" }, { status: 400 });
    }

    const body = await request.json();
    
    // Validate request body (all fields optional for update)
    const validatedData = playerUpdateSchema.parse(body);

    // Check if player exists
    const existingPlayer = await prisma.player.findUnique({
      where: { id: playerId },
    });

    if (!existingPlayer) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    // If updating name, recalculate fullName and slug
    let updateData: any = { ...validatedData };
    if (validatedData.firstName || validatedData.lastName) {
      const firstName = validatedData.firstName ?? existingPlayer.firstName;
      const lastName = validatedData.lastName ?? existingPlayer.lastName;
      updateData.fullName = `${firstName} ${lastName}`;
      updateData.slug = `${firstName}-${lastName}`.toLowerCase().replace(/\s+/g, "-");
    }

    // Update player
    const player = await prisma.player.update({
      where: { id: playerId },
      data: updateData,
      include: {
        nationality: true,
        position: true,
        currentClub: {
          include: {
            country: true,
          },
        },
        birthPlace: true,
      },
    });

    return NextResponse.json(player);
  } catch (error) {
    console.error("Player update error:", error);
    
    if (error instanceof Error && error.message.includes("Validation")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    // Handle unique constraint violations
    if (error instanceof Error && error.message.includes("Unique")) {
      return NextResponse.json({ error: "A player with this slug already exists" }, { status: 409 });
    }
    
    // Handle foreign key constraint violations
    if (error instanceof Error && (error.message.includes("Foreign") || error.message.includes("referenced"))) {
      return NextResponse.json({ error: "Invalid reference to related entity" }, { status: 400 });
    }
    
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Optional: Check if user has admin role
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const playerId = parseInt(params.id);

    if (isNaN(playerId)) {
      return NextResponse.json({ error: "Invalid player ID" }, { status: 400 });
    }

    // Check if player exists
    const existingPlayer = await prisma.player.findUnique({
      where: { id: playerId },
    });

    if (!existingPlayer) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    // Delete player
    await prisma.player.delete({
      where: { id: playerId },
    });

    return NextResponse.json({ message: "Player deleted successfully" });
  } catch (error) {
    console.error("Player delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
