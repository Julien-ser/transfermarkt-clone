import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { competitionSearchSchema, competitionSchema } from "@/lib/validations";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = Object.fromEntries(searchParams.entries());

    // Validate query parameters
    const validatedSearch = competitionSearchSchema.parse(search);

    // Build where clause for filtering
    const where: any = {};

    if (search.name) {
      where.name = { contains: search.name, mode: "insensitive" };
    }

    if (search.type) {
      where.type = search.type;
    }

    if (search.countryId) {
      where.countryId = search.countryId;
    }

    // Build orderBy
    const orderBy: any = {};
    if (validatedSearch.sortBy) {
      orderBy[validatedSearch.sortBy] = validatedSearch.sortOrder;
    }

    // Calculate pagination
    const skip = (validatedSearch.page - 1) * validatedSearch.limit;

    // Fetch competitions with pagination, sorting, and includes
    const [competitions, total] = await Promise.all([
      prisma.competition.findMany({
        where,
        include: {
          country: true,
          seasons: {
            orderBy: {
              startDate: "desc",
            },
            take: 5,
          },
        },
        orderBy,
        skip,
        take: validatedSearch.limit,
      }),
      prisma.competition.count({ where }),
    ]);

    return NextResponse.json({
      competitions,
      pagination: {
        page: validatedSearch.page,
        limit: validatedSearch.limit,
        total,
        totalPages: Math.ceil(total / validatedSearch.limit),
      },
    });
  } catch (error) {
    console.error("Competitions fetch error:", error);
    return NextResponse.json(
      { error: "Invalid query parameters or internal server error" },
      { status: error instanceof Error && error.message.includes("Invalid") ? 400 : 500 }
    );
  }
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
    const validatedData = competitionSchema.parse(body);

    // Create competition
    const competition = await prisma.competition.create({
      data: {
        name: validatedData.name,
        type: validatedData.type,
        countryId: validatedData.countryId,
        externalId: validatedData.externalId,
        logoUrl: validatedData.logoUrl,
      },
      include: {
        country: true,
        seasons: true,
      },
    });

    return NextResponse.json(competition, { status: 201 });
  } catch (error) {
    console.error("Competition creation error:", error);
    
    if (error instanceof Error && error.message.includes("Validation")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    // Handle unique constraint violations (externalId)
    if (error instanceof Error && error.message.includes("Unique")) {
      return NextResponse.json({ error: "A competition with this external ID already exists" }, { status: 409 });
    }
    
    // Handle foreign key constraint violations
    if (error instanceof Error && (error.message.includes("Foreign") || error.message.includes("referenced"))) {
      return NextResponse.json({ error: "Invalid reference to related entity (countryId)" }, { status: 400 });
    }
    
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
