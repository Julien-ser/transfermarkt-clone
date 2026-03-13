import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);

    // Get user's watchlist with proper includes
    const [userPlayerList, userClubList] = await Promise.all([
      prisma.userPlayer.findMany({
        where: { userId },
        include: {
          player: {
            include: {
              nationality: true,
              position: true,
            },
          },
        },
        orderBy: {
          addedAt: 'desc',
        },
      }),
      prisma.userClub.findMany({
        where: { userId },
        include: {
          club: {
            include: {
              country: true,
            },
          },
        },
        orderBy: {
          addedAt: 'desc',
        },
      }),
    ]);

    // For players, we need to manually get currentClub separately to avoid include issues
    const players = await Promise.all(
      userPlayerList.map(async (up) => {
        const player = up.player;
        // Get current club via player's PlayerClub entries
        const currentPlayerClub = await prisma.playerClub.findFirst({
          where: {
            playerId: player.id,
            leftDate: null,
          },
          include: {
            club: true,
          },
        });
        return {
          ...player,
          currentClub: currentPlayerClub?.club || null,
        };
      })
    );

    // Extract club objects
    const clubs = userClubList.map((uc) => uc.club);

    return NextResponse.json({
      players,
      clubs,
    });
  } catch (error) {
    console.error("Watchlist fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, id } = body;

    if (!type || !id) {
      return NextResponse.json(
        { error: "Missing required fields: type, id" },
        { status: 400 }
      );
    }

    const userId = parseInt(session.user.id);

    if (type === "player") {
      // Check if player exists
      const player = await prisma.player.findUnique({
        where: { id },
      });

      if (!player) {
        return NextResponse.json({ error: "Player not found" }, { status: 404 });
      }

      // Check if already in watchlist
      const existing = await prisma.userPlayer.findUnique({
        where: {
          userId_playerId: {
            userId,
            playerId: id,
          },
        },
      });

      if (existing) {
        return NextResponse.json(
          { message: "Player already in watchlist" },
          { status: 200 }
        );
      }

      // Add to watchlist
      await prisma.userPlayer.create({
        data: {
          userId,
          playerId: id,
        },
      });

      return NextResponse.json({ message: "Player added to watchlist" });
    } else if (type === "club") {
      // Check if club exists
      const club = await prisma.club.findUnique({
        where: { id },
      });

      if (!club) {
        return NextResponse.json({ error: "Club not found" }, { status: 404 });
      }

      // Check if already in watchlist
      const existing = await prisma.userClub.findUnique({
        where: {
          userId_clubId: {
            userId,
            clubId: id,
          },
        },
      });

      if (existing) {
        return NextResponse.json(
          { message: "Club already in watchlist" },
          { status: 200 }
        );
      }

      // Add to watchlist
      await prisma.userClub.create({
        data: {
          userId,
          clubId: id,
        },
      });

      return NextResponse.json({ message: "Club added to watchlist" });
    } else {
      return NextResponse.json({ error: "Invalid type. Use 'player' or 'club'" }, { status: 400 });
    }
  } catch (error) {
    console.error("Watchlist add error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type, id } = body;

    if (!type || !id) {
      return NextResponse.json(
        { error: "Missing required fields: type, id" },
        { status: 400 }
      );
    }

    const userId = parseInt(session.user.id);

    if (type === "player") {
      await prisma.userPlayer.delete({
        where: {
          userId_playerId: {
            userId,
            playerId: id,
          },
        },
      });

      return NextResponse.json({ message: "Player removed from watchlist" });
    } else if (type === "club") {
      await prisma.userClub.delete({
        where: {
          userId_clubId: {
            userId,
            clubId: id,
          },
        },
      });

      return NextResponse.json({ message: "Club removed from watchlist" });
    } else {
      return NextResponse.json({ error: "Invalid type. Use 'player' or 'club'" }, { status: 400 });
    }
  } catch (error) {
    console.error("Watchlist remove error:", error);
    // If record doesn't exist, return success anyway
    if (error instanceof Error && error.message.includes("Record to delete does not exist")) {
      return NextResponse.json({ message: "Item removed from watchlist" });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
