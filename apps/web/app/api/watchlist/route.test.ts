import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

// Mock Prisma client
const mockPrisma = {
  userPlayer: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  userClub: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
  player: {
    findUnique: jest.fn(),
  },
  club: {
    findUnique: jest.fn(),
  },
  playerClub: {
    findFirst: jest.fn(),
  },
};

// Mock getServerSession
jest.mock("next-auth", () => ({
  getServerSession: jest.fn(),
}));

// Mock PrismaClient
jest.mock("@prisma/client", () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

const { GET, POST, DELETE } = require("@/app/api/watchlist/route");

describe("Watchlist API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getServerSession as jest.Mock).mockResolvedValue(null);
  });

  describe("GET", () => {
    it("returns 401 when user is not authenticated", async () => {
      const request = new NextRequest("http://localhost:3000/api/watchlist");
      const response = await GET(request);

      expect(response.status).toBe(401);
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: "Unauthorized" },
        { status: 401 }
      );
    });

    it("returns user's watchlist when authenticated", async () => {
      const userId = 1;
      const mockSession = {
        user: { id: userId.toString(), email: "test@example.com" },
      };
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      const mockPlayers = [
        {
          id: 1,
          fullName: "Lionel Messi",
          position: { name: "Forward" },
          nationality: { name: "Argentina" },
          marketValue: 50000000,
          imageUrl: "https://example.com/messi.jpg",
          currentClub: { id: 1, name: "Inter Miami", logoUrl: null },
        },
      ];

      const mockClubs = [
        {
          id: 1,
          name: "Real Madrid",
          country: { name: "Spain" },
          logoUrl: "https://example.com/real-madrid.png",
        },
      ];

      mockPrisma.userPlayer.findMany.mockResolvedValue([
        { player: mockPlayers[0], userId, playerId: 1, addedAt: new Date() },
      ]);
      mockPrisma.userClub.findMany.mockResolvedValue([
        { club: mockClubs[0], userId, clubId: 1, addedAt: new Date() },
      ]);
      mockPrisma.playerClub.findFirst.mockResolvedValue({
        club: { id: 1, name: "Inter Miami", logoUrl: null },
      });

      const request = new NextRequest("http://localhost:3000/api/watchlist");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.players).toHaveLength(1);
      expect(data.clubs).toHaveLength(1);
      expect(data.players[0].fullName).toBe("Lionel Messi");
      expect(data.clubs[0].name).toBe("Real Madrid");
    });

    it("handles empty watchlist", async () => {
      const userId = 1;
      const mockSession = {
        user: { id: userId.toString(), email: "test@example.com" },
      };
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      mockPrisma.userPlayer.findMany.mockResolvedValue([]);
      mockPrisma.userClub.findMany.mockResolvedValue([]);

      const request = new NextRequest("http://localhost:3000/api/watchlist");
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.players).toEqual([]);
      expect(data.clubs).toEqual([]);
    });

    it("handles server errors gracefully", async () => {
      const userId = 1;
      const mockSession = {
        user: { id: userId.toString(), email: "test@example.com" },
      };
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      mockPrisma.userPlayer.findMany.mockRejectedValue(new Error("Database error"));

      const request = new NextRequest("http://localhost:3000/api/watchlist");
      const response = await GET(request);

      expect(response.status).toBe(500);
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: "Internal server error" },
        { status: 500 }
      );
    });
  });

  describe("POST", () => {
    it("returns 401 when user is not authenticated", async () => {
      const request = new NextRequest("http://localhost:3000/api/watchlist", {
        method: "POST",
        body: JSON.stringify({ type: "player", id: 1 }),
      });
      const response = await POST(request);

      expect(response.status).toBe(401);
    });

    it("returns 400 when type or id is missing", async () => {
      const userId = 1;
      const mockSession = {
        user: { id: userId.toString(), email: "test@example.com" },
      };
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      const request = new NextRequest("http://localhost:3000/api/watchlist", {
        method: "POST",
        body: JSON.stringify({ type: "player" }),
      });
      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it("returns 404 when player does not exist", async () => {
      const userId = 1;
      const mockSession = {
        user: { id: userId.toString(), email: "test@example.com" },
      };
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      mockPrisma.player.findUnique.mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/watchlist", {
        method: "POST",
        body: JSON.stringify({ type: "player", id: 999 }),
      });
      const response = await POST(request);

      expect(response.status).toBe(404);
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: "Player not found" },
        { status: 404 }
      );
    });

    it("adds player to watchlist successfully", async () => {
      const userId = 1;
      const mockSession = {
        user: { id: userId.toString(), email: "test@example.com" },
      };
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      mockPrisma.player.findUnique.mockResolvedValue({ id: 1, fullName: "Lionel Messi" });
      mockPrisma.userPlayer.findUnique.mockResolvedValue(null);
      mockPrisma.userPlayer.create.mockResolvedValue({});

      const request = new NextRequest("http://localhost:3000/api/watchlist", {
        method: "POST",
        body: JSON.stringify({ type: "player", id: 1 }),
      });
      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockPrisma.userPlayer.create).toHaveBeenCalledWith({
        data: { userId, playerId: 1 },
      });
    });

    it("returns 200 when player already in watchlist", async () => {
      const userId = 1;
      const mockSession = {
        user: { id: userId.toString(), email: "test@example.com" },
      };
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      mockPrisma.player.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.userPlayer.findUnique.mockResolvedValue({ userId, playerId: 1 });

      const request = new NextRequest("http://localhost:3000/api/watchlist", {
        method: "POST",
        body: JSON.stringify({ type: "player", id: 1 }),
      });
      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(NextResponse.json).toHaveBeenCalledWith(
        { message: "Player already in watchlist" },
        { status: 200 }
      );
    });

    it("adds club to watchlist successfully", async () => {
      const userId = 1;
      const mockSession = {
        user: { id: userId.toString(), email: "test@example.com" },
      };
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      mockPrisma.club.findUnique.mockResolvedValue({ id: 1, name: "Real Madrid" });
      mockPrisma.userClub.findUnique.mockResolvedValue(null);
      mockPrisma.userClub.create.mockResolvedValue({});

      const request = new NextRequest("http://localhost:3000/api/watchlist", {
        method: "POST",
        body: JSON.stringify({ type: "club", id: 1 }),
      });
      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(mockPrisma.userClub.create).toHaveBeenCalledWith({
        data: { userId, clubId: 1 },
      });
    });

    it("returns 400 for invalid type", async () => {
      const userId = 1;
      const mockSession = {
        user: { id: userId.toString(), email: "test@example.com" },
      };
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      const request = new NextRequest("http://localhost:3000/api/watchlist", {
        method: "POST",
        body: JSON.stringify({ type: "invalid", id: 1 }),
      });
      const response = await POST(request);

      expect(response.status).toBe(400);
      expect(NextResponse.json).toHaveBeenCalledWith(
        { error: "Invalid type. Use 'player' or 'club'" },
        { status: 400 }
      );
    });
  });

  describe("DELETE", () => {
    it("returns 401 when user is not authenticated", async () => {
      const request = new NextRequest("http://localhost:3000/api/watchlist", {
        method: "DELETE",
        body: JSON.stringify({ type: "player", id: 1 }),
      });
      const response = await DELETE(request);

      expect(response.status).toBe(401);
    });

    it("returns 400 when type or id is missing", async () => {
      const userId = 1;
      const mockSession = {
        user: { id: userId.toString(), email: "test@example.com" },
      };
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      const request = new NextRequest("http://localhost:3000/api/watchlist", {
        method: "DELETE",
        body: JSON.stringify({ type: "player" }),
      });
      const response = await DELETE(request);

      expect(response.status).toBe(400);
    });

    it("removes player from watchlist successfully", async () => {
      const userId = 1;
      const mockSession = {
        user: { id: userId.toString(), email: "test@example.com" },
      };
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      mockPrisma.userPlayer.delete.mockResolvedValue({});

      const request = new NextRequest("http://localhost:3000/api/watchlist", {
        method: "DELETE",
        body: JSON.stringify({ type: "player", id: 1 }),
      });
      const response = await DELETE(request);

      expect(response.status).toBe(200);
      expect(mockPrisma.userPlayer.delete).toHaveBeenCalledWith({
        where: { userId_playerId: { userId, playerId: 1 } },
      });
    });

    it("removes club from watchlist successfully", async () => {
      const userId = 1;
      const mockSession = {
        user: { id: userId.toString(), email: "test@example.com" },
      };
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      mockPrisma.userClub.delete.mockResolvedValue({});

      const request = new NextRequest("http://localhost:3000/api/watchlist", {
        method: "DELETE",
        body: JSON.stringify({ type: "club", id: 1 }),
      });
      const response = await DELETE(request);

      expect(response.status).toBe(200);
      expect(mockPrisma.userClub.delete).toHaveBeenCalledWith({
        where: { userId_clubId: { userId, clubId: 1 } },
      });
    });

    it("handles deletion of non-existent item gracefully", async () => {
      const userId = 1;
      const mockSession = {
        user: { id: userId.toString(), email: "test@example.com" },
      };
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      const deleteError = new Error("Record to delete does not exist");
      mockPrisma.userPlayer.delete.mockRejectedValue(deleteError);

      const request = new NextRequest("http://localhost:3000/api/watchlist", {
        method: "DELETE",
        body: JSON.stringify({ type: "player", id: 999 }),
      });
      const response = await DELETE(request);

      expect(response.status).toBe(200);
      expect(NextResponse.json).toHaveBeenCalledWith(
        { message: "Item removed from watchlist" },
        { status: 200 }
      );
    });

    it("returns 400 for invalid type on delete", async () => {
      const userId = 1;
      const mockSession = {
        user: { id: userId.toString(), email: "test@example.com" },
      };
      (getServerSession as jest.Mock).mockResolvedValue(mockSession);

      const request = new NextRequest("http://localhost:3000/api/watchlist", {
        method: "DELETE",
        body: JSON.stringify({ type: "invalid", id: 1 }),
      });
      const response = await DELETE(request);

      expect(response.status).toBe(400);
    });
  });
});
