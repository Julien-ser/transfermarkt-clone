import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { clubUpdateSchema } from "@/lib/validations";
import { withCache, CACHE_TTL, CACHE_KEYS, cache } from "@/lib/cache";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const clubId = parseInt(params.id);

    if (isNaN(clubId)) {
      return NextResponse.json({ error: "Invalid club ID" }, { status: 400 });
    }

    // Generate cache key
    const cacheKey = CACHE_KEYS.club(clubId.toString());

    // Try to get from cache first
    const { data: club, fromCache } = await withCache(
      cacheKey,
      CACHE_TTL.CLUB_DETAIL,
      async () => {
        const club = await prisma.club.findUnique({
          where: { id: clubId },
          include: {
            country: true,
            currentPlayers: {
              include: {
                nationality: true,
                position: true,
              },
              orderBy: {
                jerseyNumber: "asc",
              },
            },
            seasons: {
              include: {
                season: true,
              },
              orderBy: {
                season: {
                  startDate: "desc",
                },
              },
            },
            competitions: {
              include: {
                competition: true,
                season: true,
              },
            },
            transfersFrom: {
              include: {
                player: {
                  include: {
                    nationality: true,
                    position: true,
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
              take: 50,
            },
            transfersTo: {
              include: {
                player: {
                  include: {
                    nationality: true,
                    position: true,
                  },
                },
                fromClub: {
                  include: {
                    country: true,
                  },
                },
                season: true,
              },
              orderBy: {
                transferDate: "desc",
              },
              take: 50,
            },
            homeMatches: {
              include: {
                competition: true,
                season: true,
                awayClub: {
                  include: {
                    country: true,
                  },
                },
              },
              orderBy: {
                matchDate: "desc",
              },
              take: 10,
            },
            awayMatches: {
              include: {
                competition: true,
                season: true,
                homeClub: {
                  include: {
                    country: true,
                  },
                },
              },
              orderBy: {
                matchDate: "desc",
              },
              take: 10,
            },
            playerStats: {
              include: {
                player: {
                  include: {
                    nationality: true,
                    position: true,
                  },
                },
                season: true,
              },
              orderBy: {
                season: {
                  startDate: "desc",
                },
              },
            },
          },
        });
        return club;
      }
    );

    if (!club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    return NextResponse.json({ ...club, fromCache });
  } catch (error) {
    console.error("Club fetch error:", error);
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

    const clubId = parseInt(params.id);

    if (isNaN(clubId)) {
      return NextResponse.json({ error: "Invalid club ID" }, { status: 400 });
    }

    const body = await request.json();
    
    // Validate request body
    const validatedData = clubUpdateSchema.parse(body);

    // Check if club exists
    const existingClub = await prisma.club.findUnique({
      where: { id: clubId },
    });

    if (!existingClub) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    // Update club
    const club = await prisma.club.update({
      where: { id: clubId },
      data: validatedData,
      include: {
        country: true,
        currentPlayers: {
          include: {
            nationality: true,
            position: true,
          },
        },
      },
    });

    // Invalidate related caches
    await cache.del(CACHE_KEYS.club(clubId.toString()));
    await cache.invalidatePattern("clubs:*");
    await cache.invalidatePattern("players:*"); // Players list may be filtered by club

    return NextResponse.json(club);
  } catch (error) {
    console.error("Club update error:", error);
    
    if (error instanceof Error && error.message.includes("Validation")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    // Handle unique constraint violations
    if (error instanceof Error && error.message.includes("Unique")) {
      return NextResponse.json({ error: "A club with this slug already exists" }, { status: 409 });
    }
    
    // Handle foreign key constraint violations
    if (error instanceof Error && (error.message.includes("Foreign") || error.message.includes("referenced"))) {
      return NextResponse.json({ error: "Invalid reference to related entity (countryId)" }, { status: 400 });
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

    const clubId = parseInt(params.id);

    if (isNaN(clubId)) {
      return NextResponse.json({ error: "Invalid club ID" }, { status: 400 });
    }

    // Check if club exists
    const existingClub = await prisma.club.findUnique({
      where: { id: clubId },
    });

    if (!existingClub) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    // Delete club
    await prisma.club.delete({
      where: { id: clubId },
    });

    // Invalidate related caches
    await cache.del(CACHE_KEYS.club(clubId.toString()));
    await cache.invalidatePattern("clubs:*");
    await cache.invalidatePattern("players:*"); // Players filtered by currentClubId

    return NextResponse.json({ message: "Club deleted successfully" });
  } catch (error) {
    console.error("Club delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
