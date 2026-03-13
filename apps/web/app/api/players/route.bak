import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { playerSearchSchema, playerSchema } from "@/lib/validations";
import { withCache, CACHE_TTL, generateCacheKey, cache } from "@/lib/cache";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = Object.fromEntries(searchParams.entries());

    // Validate query parameters
    const validatedSearch = playerSearchSchema.parse(search);

    // Generate cache key based on query parameters
    const cacheKey = generateCacheKey("players", {
      page: validatedSearch.page,
      limit: validatedSearch.limit,
      name: search.name || "",
      positionId: search.positionId || "",
      nationalityId: search.nationalityId || "",
      currentClubId: search.currentClubId || "",
      minMarketValue: search.minMarketValue || "",
      maxMarketValue: search.maxMarketValue || "",
      sortBy: validatedSearch.sortBy || "",
      sortOrder: validatedSearch.sortOrder || "",
    });

    // Try to get from cache first
    const { data, fromCache } = await withCache(
      cacheKey,
      CACHE_TTL.PLAYERS_LIST,
      async () => {
        // Build where clause for filtering
        const where: any = {};

        if (search.name) {
          where.OR = [
            { firstName: { contains: search.name, mode: "insensitive" } },
            { lastName: { contains: search.name, mode: "insensitive" } },
            { fullName: { contains: search.name, mode: "insensitive" } },
          ];
        }

        if (search.positionId) {
          where.positionId = search.positionId;
        }

        if (search.nationalityId) {
          where.nationalityId = search.nationalityId;
        }

        if (search.currentClubId) {
          where.currentClubId = search.currentClubId;
        }

        if (search.minMarketValue !== undefined || search.maxMarketValue !== undefined) {
          where.marketValue = {};
          if (search.minMarketValue) {
            where.marketValue.gte = search.minMarketValue;
          }
          if (search.maxMarketValue) {
            where.marketValue.lte = search.maxMarketValue;
          }
        }

        // Build orderBy
        const orderBy: any = {};
        if (validatedSearch.sortBy) {
          orderBy[validatedSearch.sortBy] = validatedSearch.sortOrder;
        }

        // Calculate pagination
        const skip = (validatedSearch.page - 1) * validatedSearch.limit;

        // Fetch players with pagination, sorting, and includes
        const [players, total] = await Promise.all([
          prisma.player.findMany({
            where,
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
            orderBy,
            skip,
            take: validatedSearch.limit,
          }),
          prisma.player.count({ where }),
        ]);

        return {
          players,
          pagination: {
            page: validatedSearch.page,
            limit: validatedSearch.limit,
            total,
            totalPages: Math.ceil(total / validatedSearch.limit),
          },
          cached: false,
        };
      }
    );

    // Add cache metadata to response
    const response = { ...data, fromCache };
    return NextResponse.json(response);
  } catch (error) {
    console.error("Players fetch error:", error);
    return NextResponse.json(
      { error: "Invalid query parameters or internal server error" },
      { status: error instanceof Error && error.message.includes("Invalid") ? 400 : 500 }
    );
  }

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    
    // Validate request body
    const validatedData = playerSchema.parse(body);

    // Create player
    const player = await prisma.player.create({
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        fullName: `${validatedData.firstName} ${validatedData.lastName}`,
        birthDate: validatedData.birthDate,
        nationalityId: validatedData.nationalityId,
        positionId: validatedData.positionId,
        birthPlaceId: validatedData.birthPlaceId,
        height: validatedData.height,
        weight: validatedData.weight,
        foot: validatedData.foot,
        jerseyNumber: validatedData.jerseyNumber,
        imageUrl: validatedData.imageUrl,
        contractUntil: validatedData.contractUntil,
        marketValue: validatedData.marketValue,
        currentClubId: validatedData.currentClubId,
        slug: `${validatedData.firstName}-${validatedData.lastName}`.toLowerCase().replace(/\s+/g, "-"),
      },
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

    return NextResponse.json(player, { status: 201 });
  } catch (error) {
    console.error("Player creation error:", error);
    
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
