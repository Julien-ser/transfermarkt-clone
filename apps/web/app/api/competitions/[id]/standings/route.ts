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
        // Build where clause for matches
        const matchWhere: any = {
          competitionId,
          status: "FINISHED",
        };

        if (seasonId) {
          matchWhere.seasonId = parseInt(seasonId);
        } else {
          // Default to current season
          const currentSeason = await prisma.season.findFirst({
            where: { isCurrent: true },
          });
          if (currentSeason) {
            matchWhere.seasonId = currentSeason.id;
          }
        }

        // Fetch all finished matches for this competition/season
        const matches = await prisma.match.findMany({
          where: matchWhere,
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
          },
          orderBy: {
            matchDate: "asc",
          },
        });

        // Get the season we're querying
        const targetSeasonId = matchWhere.seasonId;
        
        // Fetch clubs participating in this competition/season via ClubCompetition
        const clubCompetitions = await prisma.clubCompetition.findMany({
          where: {
            competitionId,
            seasonId: targetSeasonId,
          },
          include: {
            club: {
              include: {
                country: true,
              },
            },
            season: true,
          },
        });

        // Fetch ClubSeason data for these clubs in this season
        const clubIds = clubCompetitions.map(cc => cc.clubId);
        const clubSeasons = await prisma.clubSeason.findMany({
          where: {
            seasonId: targetSeasonId,
            clubId: {
              in: clubIds,
            },
          },
        });

        // Create a map for quick lookup
        const clubSeasonMap = new Map<number, typeof clubSeasons[0]>();
        clubSeasons.forEach(cs => clubSeasonMap.set(cs.clubId, cs));

        // Calculate standings for each club
        const standings = clubCompetitions.map((cc) => {
          const clubId = cc.club.id;
          const clubMatches = matches.filter(
            (m) => m.homeClubId === clubId || m.awayClubId === clubId
          );

          // Initialize stats
          const stats = {
            played: 0,
            home: { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0 },
            away: { played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0 },
          };

          // Calculate stats from matches
          clubMatches.forEach((match) => {
            const isHome = match.homeClubId === clubId;
            const clubScore = isHome ? (match.homeScore ?? 0) : (match.awayScore ?? 0);
            const opponentScore = isHome ? (match.awayScore ?? 0) : (match.homeScore ?? 0);

            // Update total played
            stats.played++;

            // Update home/away stats
            if (isHome) {
              stats.home.played++;
              stats.home.gf += clubScore;
              stats.home.ga += opponentScore;
              if (clubScore > opponentScore) {
                stats.home.won++;
              } else if (clubScore === opponentScore) {
                stats.home.drawn++;
              } else {
                stats.home.lost++;
              }
            } else {
              stats.away.played++;
              stats.away.gf += clubScore;
              stats.away.ga += opponentScore;
              if (clubScore > opponentScore) {
                stats.away.won++;
              } else if (clubScore === opponentScore) {
                stats.away.drawn++;
              } else {
                stats.away.lost++;
              }
            }
          });

          // Calculate totals
          const totalWon = stats.home.won + stats.away.won;
          const totalDrawn = stats.home.drawn + stats.away.drawn;
          const totalLost = stats.home.lost + stats.away.lost;
          const totalGf = stats.home.gf + stats.away.gf;
          const totalGa = stats.home.ga + stats.away.ga;
          const totalPoints = totalWon * 3 + totalDrawn;

          // Get form from last 5 matches
          const recentMatches = [...clubMatches]
            .sort((a, b) => new Date(b.matchDate).getTime() - new Date(a.matchDate).getTime())
            .slice(0, 5)
            .map((match) => {
              const isHome = match.homeClubId === clubId;
              const clubScore = isHome ? (match.homeScore ?? 0) : (match.awayScore ?? 0);
              const opponentScore = isHome ? (match.awayScore ?? 0) : (match.homeScore ?? 0);
              
              let result: 'W' | 'D' | 'L' = 'L';
              if (clubScore > opponentScore) result = 'W';
              else if (clubScore === opponentScore) result = 'D';
              
              return {
                result,
                isHome,
                opponent: isHome ? match.awayClub.name : match.homeClub.name,
                date: match.matchDate,
              };
            });

          const clubSeasonData = clubSeasonMap.get(clubId);

          return {
            rank: clubSeasonData?.rank || 0,
            club: {
              id: cc.club.id,
              name: cc.club.name,
              shortName: cc.club.shortName,
              slug: cc.club.slug,
              logoUrl: cc.club.logoUrl,
              country: cc.club.country,
            },
            season: {
              id: cc.season.id,
              year: cc.season.year,
            },
            // Total stats
            played: stats.played,
            won: totalWon,
            drawn: totalDrawn,
            lost: totalLost,
            gf: totalGf,
            ga: totalGa,
            gd: totalGf - totalGa,
            points: clubSeasonData?.points || totalPoints,
            // Home stats
            home: {
              played: stats.home.played,
              won: stats.home.won,
              drawn: stats.home.drawn,
              lost: stats.home.lost,
              gf: stats.home.gf,
              ga: stats.home.ga,
              gd: stats.home.gf - stats.home.ga,
            },
            // Away stats
            away: {
              played: stats.away.played,
              won: stats.away.won,
              drawn: stats.away.drawn,
              lost: stats.away.lost,
              gf: stats.away.gf,
              ga: stats.away.ga,
              gd: stats.away.gf - stats.away.ga,
            },
            // Additional data from ClubSeason
            averageAge: clubSeasonData?.averageAge,
            totalMarketValue: clubSeasonData?.totalMarketValue,
            foreignPlayers: clubSeasonData?.foreignPlayers,
            // Recent form
            form: recentMatches,
          };
        });

        // Sort by points (desc), then goal difference (desc), then goals for (desc)
        standings.sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          if (b.gd !== a.gd) return b.gd - a.gd;
          return b.gf - a.gf;
        });

        // Update ranks after sorting
        standings.forEach((s, index) => {
          s.rank = index + 1;
        });

        return standings;
      }
    );

    return NextResponse.json({ standings, fromCache });
  } catch (error) {
    console.error("Standings fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
