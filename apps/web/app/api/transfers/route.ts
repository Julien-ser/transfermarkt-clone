import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { transferSearchSchema } from "@/lib/validations";
import { withCache, CACHE_TTL, generateCacheKey } from "@/lib/cache";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = Object.fromEntries(searchParams.entries());

    // Validate query parameters
    const validatedSearch = transferSearchSchema.parse(search);

    // Generate cache key based on query parameters
    const cacheKey = generateCacheKey("transfers", {
      page: validatedSearch.page,
      limit: validatedSearch.limit,
      playerId: search.playerId || "",
      fromClubId: search.fromClubId || "",
      toClubId: search.toClubId || "",
      seasonId: search.seasonId || "",
      minFee: search.minFee || "",
      maxFee: search.maxFee || "",
      minDate: search.minDate || "",
      maxDate: search.maxDate || "",
      sortBy: validatedSearch.sortBy || "",
      sortOrder: validatedSearch.sortOrder || "",
    });

    // Try to get from cache first
    const { data, fromCache } = await withCache(
      cacheKey,
      CACHE_TTL.TRANSFERS_LIST,
      async () => {
        // Build where clause for filtering
        const where: any = {};

        if (search.playerId) {
          where.playerId = search.playerId;
        }

        if (search.fromClubId) {
          where.fromClubId = search.fromClubId;
        }

        if (search.toClubId) {
          where.toClubId = search.toClubId;
        }

        if (search.seasonId) {
          where.seasonId = search.seasonId;
        }

        // Fee filtering (handle null for free transfers)
        if (search.minFee !== undefined || search.maxFee !== undefined) {
          where.fee = {};
          if (search.minFee) {
            where.fee.gte = search.minFee;
          }
          if (search.maxFee) {
            where.fee.lte = search.maxFee;
          }
        }

        // Date filtering
        if (search.minDate || search.maxDate) {
          where.transferDate = {};
          if (search.minDate) {
            where.transferDate.gte = new Date(search.minDate);
          }
          if (search.maxDate) {
            where.transferDate.lte = new Date(search.maxDate);
          }
        }

        // Build orderBy
        const orderBy: any = {};
        if (validatedSearch.sortBy) {
          orderBy[validatedSearch.sortBy] = validatedSearch.sortOrder;
        }

        // Calculate pagination
        const skip = (validatedSearch.page - 1) * validatedSearch.limit;

        // Fetch transfers with pagination, sorting, and includes
        const [transfers, total] = await Promise.all([
          prisma.transfer.findMany({
            where,
            include: {
              player: {
                include: {
                  nationality: true,
                  position: true,
                  currentClub: {
                    include: {
                      country: true,
                    },
                  },
                },
              },
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
            orderBy,
            skip,
            take: validatedSearch.limit,
          }),
          prisma.transfer.count({ where }),
        ]);

        return {
          transfers,
          pagination: {
            page: validatedSearch.page,
            limit: validatedSearch.limit,
            total,
            totalPages: Math.ceil(total / validatedSearch.limit),
          },
        };
      }
    );

    // Add cache metadata to response
    const response = { ...data, fromCache };
    return NextResponse.json(response);
  } catch (error) {
    console.error("Transfers fetch error:", error);
    return NextResponse.json(
      { error: "Invalid query parameters or internal server error" },
      { status: error instanceof Error && error.message.includes("Invalid") ? 400 : 500 }
    );
  }
}