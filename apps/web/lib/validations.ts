import { z } from "zod";

// Player validation schemas
export const playerSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  birthDate: z.string().datetime(),
  nationalityId: z.number().int().positive(),
  positionId: z.number().int().positive(),
  birthPlaceId: z.number().int().positive().optional().nullable(),
  height: z.number().int().positive().optional().nullable(),
  weight: z.number().int().positive().optional().nullable(),
  foot: z.enum(["LEFT", "RIGHT", "BOTH"]).optional().nullable(),
  jerseyNumber: z.number().int().positive().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  contractUntil: z.string().datetime().optional().nullable(),
  marketValue: z.number().positive().optional().nullable(),
  currentClubId: z.number().int().positive().optional().nullable(),
});

export const playerUpdateSchema = playerSchema.partial();

export const playerSearchSchema = z.object({
  name: z.string().optional(),
  positionId: z.number().int().positive().optional(),
  nationalityId: z.number().int().positive().optional(),
  currentClubId: z.number().int().positive().optional(),
  minMarketValue: z.number().positive().optional(),
  maxMarketValue: z.number().positive().optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
  sortBy: z.enum(["firstName", "lastName", "marketValue", "birthDate"]).optional().default("marketValue"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

// Club validation schemas
export const clubSchema = z.object({
  name: z.string().min(1).max(200),
  shortName: z.string().max(50).optional().nullable(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  foundedYear: z.number().int().positive().optional().nullable(),
  stadiumName: z.string().max(200).optional().nullable(),
  stadiumCapacity: z.number().int().positive().optional().nullable(),
  website: z.string().url().optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  email: z.string().email().optional().nullable(),
  countryId: z.number().int().positive(),
});

export const clubUpdateSchema = clubSchema.partial();

export const clubSearchSchema = z.object({
  name: z.string().optional(),
  countryId: z.number().int().positive().optional(),
  foundedYearMin: z.number().int().positive().optional(),
  foundedYearMax: z.number().int().positive().optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
  sortBy: z.enum(["name", "foundedYear", "stadiumCapacity"]).optional().default("name"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
});

// Competition validation schemas
export const competitionSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.enum(["LEAGUE", "CUP", "CHAMPIONS_LEAGUE", "EUROPA_LEAGUE", "CONFERENCE_LEAGUE", "OTHER"]),
  countryId: z.number().int().positive().optional().nullable(),
  externalId: z.string().optional().nullable(),
  logoUrl: z.string().url().optional().nullable(),
});

export const competitionUpdateSchema = competitionSchema.partial();

export const competitionSearchSchema = z.object({
  name: z.string().optional(),
  type: z.enum(["LEAGUE", "CUP", "CHAMPIONS_LEAGUE", "EUROPA_LEAGUE", "CONFERENCE_LEAGUE", "OTHER"]).optional(),
  countryId: z.number().int().positive().optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
  sortBy: z.enum(["name", "type"]).optional().default("name"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
});

// Transfer validation schemas
export const transferSearchSchema = z.object({
  playerId: z.number().int().positive().optional(),
  fromClubId: z.number().int().positive().optional(),
  toClubId: z.number().int().positive().optional(),
  competitionId: z.number().int().positive().optional(),
  seasonId: z.number().int().positive().optional(),
  minFee: z.number().positive().optional(),
  maxFee: z.number().positive().optional(),
  minDate: z.string().datetime().optional(),
  maxDate: z.string().datetime().optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(20),
  sortBy: z.enum(["transferDate", "fee"]).optional().default("transferDate"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});
