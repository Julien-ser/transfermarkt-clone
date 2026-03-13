import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { withCache, CACHE_TTL, CACHE_KEYS } from "@/lib/cache";

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

    const searchParams = request.nextUrl.searchParams;
    const seasonId = searchParams.get("seasonId");

    // Build cache key
    const cacheKey = seasonId
      ? CACHE_KEYS.standings(`${competitionId}:${seasonId}`)
      : CACHE_KEYS.standings(competitionId.toString());

    // Try to get from cache first
    const { data: standings, fromCache } = await withCache(
      cacheKey,
      CACHE_TTL.LEAGUE_STANDINGS,
      async () => {
        // Build where clause
        const where: any = {
          competitionId,
        };

        if (seasonId) {
          where.seasonId = parseInt(seasonId);
        } else {
          // Default to current season
          const currentSeason = await prisma.season.findFirst({
            where: { isCurrent: true },
          });
          if (currentSeason) {
            where.seasonId = currentSeason.id;
          }
        }

        // Fetch club seasons with club and season data
        const clubSeasons = await prisma.clubSeason.findMany({
          where,
          include: {
            club: {
              include: {
                country: true,
              },
            },
            season: true,
          },
          orderBy: {
            rank: "asc",
          },
        });

        // Transform data for standings format
        const standings = clubSeasons.map((cs) => ({
          rank: cs.rank,
          club: {
            id: cs.club.id,
            name: cs.club.name,
            shortName: cs.club.shortName,
            slug: cs.club.slug,
            logoUrl: cs.club.logoUrl,
            country: cs.club.country,
          },
          season: {
            id: cs.season.id,
            year: cs.season.year,
          },
          points: cs.points || 0,
          averageAge: cs.averageAge,
          totalMarketValue: cs.totalMarketValue,
          foreignPlayers: cs.foreignPlayers,
        }));

        return standings;
      }
    );

    return NextResponse.json({ standings, fromCache });
  } catch (error) {
    console.error("Standings fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
