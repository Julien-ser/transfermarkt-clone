import { render, screen, waitFor } from "@testing-library/react";
import LeaguePage from "@/app/leagues/[id]/page";

// Mock the fetch API
global.fetch = jest.fn();

// Mock UI components (corrected: use commas)
jest.mock("ui", () => ({
  Card: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => <div data-testid="card" {...props}>{children}</div>,
  Badge: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => <span data-testid="badge" {...props}>{children}</span>,
  Avatar: ({ src, alt, size }: { src: string; alt: string; size: string }) => 
    <img data-testid="avatar" src={src} alt={alt} data-size={size} />,
  Button: ({ children, onClick, ...props }: { children: React.ReactNode; onClick: () => void; [key: string]: unknown }) => 
    <button data-testid="button" onClick={onClick} {...props}>{children}</button>,
}));

// Mock Link from next/link
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => 
    <a href={href} data-testid="link">{children}</a>,
}));

// Mock data
const mockCompetition = {
  id: 1,
  name: "Premier League",
  type: "League",
  country: {
    id: 1,
    name: "England",
    code: "ENG",
    flagUrl: "https://example.com/england.png",
  },
  logoUrl: "https://example.com/premier-league.png",
};

const mockStandings = [
  {
    rank: 1,
    club: {
      id: 1,
      name: "Manchester City",
      shortName: "MCI",
      slug: "manchester-city",
      logoUrl: "https://example.com/mci.png",
      country: { id: 1, name: "England" },
    },
    season: { id: 1, year: "2024/2025" },
    played: 38,
    won: 28,
    drawn: 7,
    lost: 3,
    gf: 89,
    ga: 33,
    gd: 56,
    points: 91,
    home: { played: 19, won: 16, drawn: 3, lost: 0, gf: 48, ga: 15, gd: 33 },
    away: { played: 19, won: 12, drawn: 4, lost: 3, gf: 41, ga: 18, gd: 23 },
    averageAge: 25.4,
    totalMarketValue: 1500000000,
    foreignPlayers: 12,
    form: [
      { result: 'W', isHome: true, opponent: "Chelsea", date: "2025-05-11T00:00:00.000Z" },
      { result: 'W', isHome: false, opponent: "Liverpool", date: "2025-05-04T00:00:00.000Z" },
      { result: 'D', isHome: true, opponent: "Arsenal", date: "2025-04-27T00:00:00.000Z" },
      { result: 'W', isHome: false, opponent: "Man United", date: "2025-04-20T00:00:00.000Z" },
      { result: 'L', isHome: true, opponent: "Tottenham", date: "2025-04-13T00:00:00.000Z" },
    ],
  },
  {
    rank: 2,
    club: {
      id: 2,
      name: "Arsenal",
      shortName: "ARS",
      slug: "arsenal",
      logoUrl: "https://example.com/ars.png",
      country: { id: 1, name: "England" },
    },
    season: { id: 1, year: "2024/2025" },
    played: 38,
    won: 27,
    drawn: 5,
    lost: 6,
    gf: 85,
    ga: 35,
    gd: 50,
    points: 86,
    home: { played: 19, won: 15, drawn: 2, lost: 2, gf: 46, ga: 18, gd: 28 },
    away: { played: 19, won: 12, drawn: 3, lost: 4, gf: 39, ga: 17, gd: 22 },
    averageAge: 24.8,
    totalMarketValue: 1200000000,
    foreignPlayers: 10,
    form: [
      { result: 'W', isHome: false, opponent: "Leicester", date: "2025-05-11T00:00:00.000Z" },
      { result: 'D', isHome: true, opponent: "Everton", date: "2025-05-04T00:00:00.000Z" },
      { result: 'W', isHome: false, opponent: "Newcastle", date: "2025-04-27T00:00:00.000Z" },
      { result: 'L', isHome: true, opponent: "City", date: "2025-04-20T00:00:00.000Z" },
      { result: 'W', isHome: false, opponent: "Fulham", date: "2025-04-13T00:00:00.000Z" },
    ],
  },
  {
    rank: 3,
    club: {
      id: 3,
      name: "Liverpool",
      shortName: "LIV",
      slug: "liverpool",
      logoUrl: "https://example.com/liv.png",
      country: { id: 1, name: "England" },
    },
    season: { id: 1, year: "2024/2025" },
    played: 38,
    won: 25,
    drawn: 8,
    lost: 5,
    gf: 80,
    ga: 40,
    gd: 40,
    points: 83,
    home: { played: 19, won: 14, drawn: 3, lost: 2, gf: 45, ga: 20, gd: 25 },
    away: { played: 19, won: 11, drawn: 5, lost: 3, gf: 35, ga: 20, gd: 15 },
    averageAge: 26.1,
    totalMarketValue: 1100000000,
    foreignPlayers: 11,
    form: [
      { result: 'L', isHome: true, opponent: "Man City", date: "2025-05-04T00:00:00.000Z" },
      { result: 'W', isHome: false, opponent: "Brentford", date: "2025-04-28T00:00:00.000Z" },
      { result: 'D', isHome: true, opponent: "Aston Villa", date: "2025-04-21T00:00:00.000Z" },
      { result: 'W', isHome: false, opponent: "Fulham", date: "2025-04-14T00:00:00.000Z" },
      { result: 'W', isHome: true, opponent: "Everton", date: "2025-04-07T00:00:00.000Z" },
    ],
  },
];

describe("LeaguePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading skeleton initially", () => {
    fetch.mockImplementation(() => new Promise(() => {})); // never resolves
    render(<LeaguePage params={{ id: "1" }} />);
    const skeletons = document.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("handles competition not found", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => null,
    });
    render(<LeaguePage params={{ id: "999" }} />);
    await waitFor(() => {
      expect(screen.getByText(/Competition not found/i)).toBeInTheDocument();
    });
  });

  it("handles standings API error", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCompetition,
    });
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: "Server error" }),
    });
    render(<LeaguePage params={{ id: "1" }} />);
    await waitFor(() => {
      expect(screen.getByText(/Server error/i)).toBeInTheDocument();
    });
  });

  it("displays competition header with correct info", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCompetition,
    });
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ standings: mockStandings, fromCache: false }),
    });
    render(<LeaguePage params={{ id: "1" }} />);
    await waitFor(() => {
      expect(screen.getByText("Premier League")).toBeInTheDocument();
    });
    expect(screen.getByText("England")).toBeInTheDocument();
    expect(screen.getByText("League")).toBeInTheDocument();
  });

  it("renders standings table with club names", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCompetition,
    });
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ standings: mockStandings, fromCache: false }),
    });
    render(<LeaguePage params={{ id: "1" }} />);
    await waitFor(() => {
      expect(screen.getByText("Manchester City")).toBeInTheDocument();
      expect(screen.getByText("Arsenal")).toBeInTheDocument();
      expect(screen.getByText("Liverpool")).toBeInTheDocument();
    });
  });

  it("displays correct statistics for clubs", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCompetition,
    });
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ standings: mockStandings, fromCache: false }),
    });
    render(<LeaguePage params={{ id: "1" }} />);
    await waitFor(() => {
      // Check totals for Manchester City (first row)
      const rows = screen.getAllByTestId("table-row");
      expect(rows[0]).toHaveTextContent("38"); // played
      expect(rows[0]).toHaveTextContent("28"); // won
      expect(rows[0]).toHaveTextContent("7"); // drawn
      expect(rows[0]).toHaveTextContent("3"); // lost
      expect(rows[0]).toHaveTextContent("89"); // gf
      expect(rows[0]).toHaveTextContent("33"); // ga
      expect(rows[0]).toHaveTextContent("91"); // points
    });
  });

  it("shows home/away columns when toggled", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCompetition,
    });
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ standings: mockStandings, fromCache: false }),
    });
    render(<LeaguePage params={{ id: "1" }} />);
    await waitFor(() => {
      expect(screen.getByText("Manchester City")).toBeInTheDocument();
    });
    // Initially hidden
    expect(screen.queryByText("HP")).not.toBeInTheDocument();
    expect(screen.queryByText("AP")).not.toBeInTheDocument();
    // Toggle
    const toggleBtn = screen.getByText("Show Home/Away");
    toggleBtn.click();
    await waitFor(() => {
      expect(screen.getByText("HP")).toBeInTheDocument();
      expect(screen.getByText("AP")).toBeInTheDocument();
    });
  });

  it("displays form badges for each club", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCompetition,
    });
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ standings: mockStandings, fromCache: false }),
    });
    render(<LeaguePage params={{ id: "1" }} />);
    await waitFor(() => {
      const badges = screen.getAllByText(/(W|D|L)/);
      expect(badges.length).toBeGreaterThanOrEqual(3); // at least one per club
    });
  });

  it("exports CSV when export button clicked", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCompetition,
    });
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ standings: mockStandings, fromCache: false }),
    });
    const mockClick = jest.fn();
    const mockCreateObjectURL = jest.fn(() => "blob:mock");
    global.URL.createObjectURL = mockCreateObjectURL;
    document.createElement = jest.fn().mockReturnValue({
      setAttribute: jest.fn(),
      click: mockClick,
      style: {},
    });
    render(<LeaguePage params={{ id: "1" }} />);
    await waitFor(() => {
      expect(screen.getByText("Manchester City")).toBeInTheDocument();
    });
    const exportBtn = screen.getByText("Export CSV");
    exportBtn.click();
    await waitFor(() => {
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(mockClick).toHaveBeenCalled();
    });
  });

  it("sorts by points by default", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCompetition,
    });
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ standings: mockStandings, fromCache: false }),
    });
    render(<LeaguePage params={{ id: "1" }} />);
    await waitFor(() => {
      const rows = screen.getAllByTestId("table-row");
      expect(rows[0]).toHaveTextContent("1");
      expect(rows[1]).toHaveTextContent("2");
      expect(rows[2]).toHaveTextContent("3");
    });
  });

  it("sorts by club name when column header clicked", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockCompetition,
    });
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ standings: mockStandings, fromCache: false }),
    });
    render(<LeaguePage params={{ id: "1" }} />);
    await waitFor(() => {
      expect(screen.getByText("Manchester City")).toBeInTheDocument();
    });
    const clubHeader = screen.getByText("Club↑"); // default sort is rank, so after clicking it'll have indicator
    // Actually get by text content? Better: find the th that has text "Club" and click
    const headers = screen.getAllByRole("columnheader");
    const clubHeaderEl = headers.find(h => h.textContent?.includes("Club"));
    if (clubHeaderEl) {
      clubHeaderEl.click();
    }
    await waitFor(() => {
      const rows = screen.getAllByTestId("table-row");
      // After sorting by name ascending, Arsenal should be first
      expect(rows[0]).toHaveTextContent("Arsenal");
    });
  });
});
