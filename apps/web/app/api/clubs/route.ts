import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { clubSearchSchema, clubSchema } from "@/lib/validations";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = Object.fromEntries(searchParams.entries());

    // Validate query parameters
    const validatedSearch = clubSearchSchema.parse(search);

    // Build where clause for filtering
    const where: any = {};

    if (search.name) {
      where.OR = [
        { name: { contains: search.name, mode: "insensitive" } },
        { shortName: { contains: search.name, mode: "insensitive" } },
      ];
    }

    if (search.countryId) {
      where.countryId = search.countryId;
    }

    if (search.foundedYearMin || search.foundedYearMax) {
      where.foundedYear = {};
      if (search.foundedYearMin) {
        where.foundedYear.gte = search.foundedYearMin;
      }
      if (search.foundedYearMax) {
        where.foundedYear.lte = search.foundedYearMax;
      }
    }

    // Build orderBy
    const orderBy: any = {};
    if (validatedSearch.sortBy) {
      orderBy[validatedSearch.sortBy] = validatedSearch.sortOrder;
    }

    // Calculate pagination
    const skip = (validatedSearch.page - 1) * validatedSearch.limit;

    // Fetch clubs with pagination, sorting, and includes
    const [clubs, total] = await Promise.all([
      prisma.club.findMany({
        where,
        include: {
          country: true,
          currentPlayers: {
            include: {
              nationality: true,
              position: true,
            },
            take: 25, // Limit current players for performance
          },
        },
        orderBy,
        skip,
        take: validatedSearch.limit,
      }),
      prisma.club.count({ where }),
    ]);

    return NextResponse.json({
      clubs,
      pagination: {
        page: validatedSearch.page,
        limit: validatedSearch.limit,
        total,
        totalPages: Math.ceil(total / validatedSearch.limit),
      },
    });
  } catch (error) {
    console.error("Clubs fetch error:", error);
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
    const validatedData = clubSchema.parse(body);

    // Create club
    const club = await prisma.club.create({
      data: {
        name: validatedData.name,
        shortName: validatedData.shortName,
        slug: validatedData.slug,
        foundedYear: validatedData.foundedYear,
        stadiumName: validatedData.stadiumName,
        stadiumCapacity: validatedData.stadiumCapacity,
        website: validatedData.website,
        logoUrl: validatedData.logoUrl,
        address: validatedData.address,
        phone: validatedData.phone,
        email: validatedData.email,
        countryId: validatedData.countryId,
      },
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

    return NextResponse.json(club, { status: 201 });
  } catch (error) {
    console.error("Club creation error:", error);
    
    if (error instanceof Error && error.message.includes("Validation")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    // Handle unique constraint violations
    if (error instanceof Error && error.message.includes(" Unique")) {
      return NextResponse.json({ error: "A club with this slug already exists" }, { status: 409 });
    }
    
    // Handle foreign key constraint violations
    if (error instanceof Error && (error.message.includes("Foreign") || error.message.includes("referenced"))) {
      return NextResponse.json({ error: "Invalid reference to related entity (countryId)" }, { status: 400 });
    }
    
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
