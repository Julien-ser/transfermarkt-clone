import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { competitionUpdateSchema } from "@/lib/validations";
import { withCache, CACHE_TTL, CACHE_KEYS, cache } from "@/lib/cache";

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const competitionId = parseInt(params.id);

    if (isNaN(competitionId)) {
      return NextResponse.json({ error: "Invalid competition ID" }, { status: 400 });
    }

    // Generate cache key
    const cacheKey = CACHE_KEYS.competition(competitionId.toString());

    // Try to get from cache first
    const { data: competition, fromCache } = await withCache(
      cacheKey,
      CACHE_TTL.COMPETITION_DETAIL,
      async () => {
        const competition = await prisma.competition.findUnique({
          where: { id: competitionId },
          include: {
            country: true,
            seasons: {
              orderBy: { startDate: "desc" },
            },
            clubs: {
              include: {
                club: {
                  include: {
                    country: true,
                  },
                },
                season: true,
              },
            },
            matches: {
              include: {
                homeClub: {
                  include: {
                    country: true,
                  },
                },
                awayClub: {
                  include: {
                    country: true,
                  },
                },
                season: true,
              },
              orderBy: {
                matchDate: "desc",
              },
              take: 50,
            },
          },
        });
        return competition;
      }
    );

    if (!competition) {
      return NextResponse.json({ error: "Competition not found" }, { status: 404 });
    }

    return NextResponse.json({ ...competition, fromCache });
  } catch (error) {
    console.error("Competition fetch error:", error);
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

    const competitionId = parseInt(params.id);

    if (isNaN(competitionId)) {
      return NextResponse.json({ error: "Invalid competition ID" }, { status: 400 });
    }

    const body = await request.json();
    
    // Validate request body
    const validatedData = competitionUpdateSchema.parse(body);

    // Check if competition exists
    const existingCompetition = await prisma.competition.findUnique({
      where: { id: competitionId },
    });

    if (!existingCompetition) {
      return NextResponse.json({ error: "Competition not found" }, { status: 404 });
    }

    // Update competition
    const competition = await prisma.competition.update({
      where: { id: competitionId },
      data: validatedData,
      include: {
        country: true,
        seasons: true,
      },
    });

    // Invalidate related caches
    await cache.del(CACHE_KEYS.competition(competitionId.toString()));
    await cache.invalidatePattern("competitions:*");
    await cache.invalidatePattern("clubs:*"); // Club-competition relationships may change

    return NextResponse.json(competition);
  } catch (error) {
    console.error("Competition update error:", error);
    
    if (error instanceof Error && error.message.includes("Validation")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    // Handle unique constraint violations
    if (error instanceof Error && error.message.includes("Unique")) {
      return NextResponse.json({ error: "A competition with this external ID already exists" }, { status: 409 });
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

    const competitionId = parseInt(params.id);

    if (isNaN(competitionId)) {
      return NextResponse.json({ error: "Invalid competition ID" }, { status: 400 });
    }

    // Check if competition exists
    const existingCompetition = await prisma.competition.findUnique({
      where: { id: competitionId },
    });

    if (!existingCompetition) {
      return NextResponse.json({ error: "Competition not found" }, { status: 404 });
    }

    // Delete competition
    await prisma.competition.delete({
      where: { id: competitionId },
    });

    // Invalidate related caches
    await cache.del(CACHE_KEYS.competition(competitionId.toString()));
    await cache.invalidatePattern("competitions:*");
    await cache.invalidatePattern("clubs:*"); // Club-competition relationships

    return NextResponse.json({ message: "Competition deleted successfully" });
  } catch (error) {
    console.error("Competition delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
