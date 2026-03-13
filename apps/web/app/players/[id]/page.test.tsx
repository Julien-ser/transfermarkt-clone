import { render, screen, waitFor } from "@testing-library/react";
import PlayerPage from "@/app/players/[id]/page";
import { PlayerData } from "@/app/players/[id]/page";

// Mock the fetch API
global.fetch = jest.fn();

// Mock Recharts components to avoid rendering issues in tests
jest.mock("recharts", () => ({
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
}));

// Mock UI components
jest.mock("ui", () => ({
  Card: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => <div data-testid="card" {...props}>{children}</div>,
  Tabs: ({ children, tabs, activeKey, onTabChange }: { children: React.ReactNode; tabs: Array<{key: string; label: string}>; activeKey: string; onTabChange: (key: string) => void }) => (
    <div data-testid="tabs">
      {tabs.map(tab => (
        <button
          key={tab.key}
          data-testid={`tab-${tab.key}`}
          className={activeKey === tab.key ? "active" : ""}
          onClick={() => onTabChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
      {children}
    </div>
  ),
  Badge: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => <span data-testid="badge" {...props}>{children}</span>,
  Avatar: ({ src, alt, size }: { src: string; alt: string; size: string }) => 
    <img data-testid="avatar" src={src} alt={alt} data-size={size} />,
  Table: {
    Row: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => <tr data-testid="table-row" {...props}>{children}</tr>,
    Cell: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => <td data-testid="table-cell" {...props}>{children}</td>,
    Head: ({ children }: { children: React.ReactNode }) => <thead>{children}</thead>,
    Body: ({ children }: { children: React.ReactNode }) => <tbody>{children}</tbody>,
    Header: ({ children }: { children: React.ReactNode }) => <th>{children}</th>,
  },
}));

// Mock Link from next/link
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => 
    <a href={href} data-testid="link">{children}</a>,
}));

const mockPlayerData: PlayerData = {
  id: 1,
  firstName: "Lionel",
  lastName: "Messi",
  fullName: "Lionel Messi",
  birthDate: "1987-06-24T00:00:00.000Z",
  nationality: {
    id: 1,
    name: "Argentina",
  },
  position: {
    id: 1,
    name: "Forward",
    category: "FWD",
  },
  height: 170,
  weight: 72,
  foot: "LEFT",
  jerseyNumber: 10,
  imageUrl: "https://example.com/messi.jpg",
  contractUntil: "2025-12-31T00:00:00.000Z",
  marketValue: 50000000,
  marketValueDate: "2024-01-15T00:00:00.000Z",
  currentClub: {
    id: 1,
    name: "Inter Miami",
    shortName: "IM",
    logoUrl: "https://example.com/inter-miami.png",
    country: {
      id: 1,
      name: "USA",
    },
  },
  birthPlace: {
    id: 1,
    name: "Rosario",
  },
  clubs: [
    {
      id: 1,
      playerId: 1,
      clubId: 1,
      seasonId: 1,
      joinedDate: "2023-01-01T00:00:00.000Z",
      leftDate: null,
      contractStart: "2023-01-01T00:00:00.000Z",
      contractEnd: "2025-12-31T00:00:00.000Z",
      jerseyNumber: 10,
      isOnLoan: false,
      appearances: 30,
      goals: 15,
      assists: 10,
      minutesPlayed: 2700,
      club: {
        id: 1,
        name: "Inter Miami",
        shortName: "IM",
        logoUrl: "https://example.com/inter-miami.png",
        country: {
          id: 1,
          name: "USA",
        },
      },
      season: {
        id: 1,
        year: "2023/2024",
        startDate: "2023-08-01T00:00:00.000Z",
        endDate: "2024-05-31T00:00:00.000Z",
      },
    },
  ],
  transfers: [
    {
      id: 1,
      transferDate: "2021-08-05T00:00:00.000Z",
      fee: 0,
      currency: "EUR",
      type: "FREE",
      isUndisclosed: false,
      fromClub: {
        id: 2,
        name: "Barcelona",
        logoUrl: "https://example.com/barca.png",
        country: {
          id: 2,
          name: "Spain",
        },
      },
      toClub: {
        id: 3,
        name: "Paris Saint-Germain",
        logoUrl: "https://example.com/psg.png",
        country: {
          id: 2,
          name: "France",
        },
      },
    },
  ],
  stats: [
    {
      id: 1,
      playerId: 1,
      clubId: 1,
      seasonId: 1,
      competitionType: "LEAGUE",
      appearances: 30,
      starts: 30,
      minutesPlayed: 2700,
      goals: 15,
      assists: 10,
      yellowCards: 2,
      redCards: 0,
      shots: 80,
      shotsOnTarget: 40,
      passes: 300,
      keyPasses: 20,
      tackles: 10,
      interceptions: 5,
      foulsDrawn: 25,
      foulsCommitted: 8,
      cleanSheets: 0,
      goalsConceded: 0,
      saves: 0,
      penaltyGoals: 5,
      penaltyMissed: 1,
      club: {
        id: 1,
        name: "Inter Miami",
      },
      season: {
        id: 1,
        year: "2023/2024",
      },
    },
  ],
  marketValues: [
    {
      id: 1,
      playerId: 1,
      value: 60000000,
      currency: "EUR",
      date: "2023-06-01T00:00:00.000Z",
      source: "Transfermarkt",
    },
    {
      id: 2,
      playerId: 1,
      value: 55000000,
      currency: "EUR",
      date: "2023-09-01T00:00:00.000Z",
      source: "Transfermarkt",
    },
    {
      id: 3,
      playerId: 1,
      value: 50000000,
      currency: "EUR",
      date: "2024-01-15T00:00:00.000Z",
      source: "Transfermarkt",
    },
  ],
};

describe("PlayerPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading state initially", () => {
    // Mock fetch to never resolve
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<PlayerPage params={{ id: "1" }} />);

    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  it("renders player data successfully", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPlayerData,
    });

    render(<PlayerPage params={{ id: "1" }} />);

    await waitFor(() => {
      expect(screen.getByText("Lionel Messi")).toBeInTheDocument();
    });

    expect(screen.getByText("Forward")).toBeInTheDocument();
    expect(screen.getByText("Argentina")).toBeInTheDocument();
    expect(screen.getByText("€50.0m")).toBeInTheDocument();
  });

  it("renders error state when player not found", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    render(<PlayerPage params={{ id: "999" }} />);

    await waitFor(() => {
      expect(screen.getByText(/The requested resource was not found\./i)).toBeInTheDocument();
    });
  });

  it("displays market value chart when data available", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPlayerData,
    });

    render(<PlayerPage params={{ id: "1" }} />);

    await waitFor(() => {
      expect(screen.getByText("Market Value History")).toBeInTheDocument();
    });

    expect(screen.getByTestId("line-chart")).toBeInTheDocument();
  });

  it("switches between tabs correctly", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPlayerData,
    });

    render(<PlayerPage params={{ id: "1" }} />);

    // Initially on overview tab
    await waitFor(() => {
      expect(screen.getByText("Market Value History")).toBeInTheDocument();
    });

    // Click on Statistics tab
    const statsTab = screen.getByTestId("tab-stats");
    statsTab.click();

    await waitFor(() => {
      expect(screen.getByText("Season-by-Season Statistics")).toBeInTheDocument();
    });

    // Click on Transfer History tab
    const transfersTab = screen.getByTestId("tab-transfers");
    transfersTab.click();

    await waitFor(() => {
      expect(screen.getByText("Transfer Timeline")).toBeInTheDocument();
    });

    // Click on Career History tab
    const historyTab = screen.getByTestId("tab-history");
    historyTab.click();

    await waitFor(() => {
      expect(screen.getByText("Career History")).toBeInTheDocument();
    });
  });

  it("displays position-specific stats for Forward", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPlayerData,
    });

    render(<PlayerPage params={{ id: "1" }} />);

    await waitFor(() => {
      expect(screen.getByText("Shots")).toBeInTheDocument();
      expect(screen.getByText("Shots on Track")).toBeInTheDocument();
      expect(screen.getByText("Fouls Drawn")).toBeInTheDocument();
    });
  });

  it("displays transfer history", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPlayerData,
    });

    render(<PlayerPage params={{ id: "1" }} />);

    // Switch to transfers tab
    const transfersTab = screen.getByTestId("tab-transfers");
    transfersTab.click();

    await waitFor(() => {
      expect(screen.getByText("Barcelona")).toBeInTheDocument();
      expect(screen.getByText("Paris Saint-Germain")).toBeInTheDocument();
    });
  });

  it("displays career history table", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPlayerData,
    });

    render(<PlayerPage params={{ id: "1" }} />);

    // Switch to history tab
    const historyTab = screen.getByTestId("tab-history");
    historyTab.click();

    await waitFor(() => {
      expect(screen.getByText("Inter Miami")).toBeInTheDocument();
      expect(screen.getByText("USA")).toBeInTheDocument();
    });
  });

  it("calculates career totals correctly", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPlayerData,
    });

    render(<PlayerPage params={{ id: "1" }} />);

    await waitFor(() => {
      // 30 appearances from clubs
      expect(screen.getByText("30")).toBeInTheDocument();
      // 15 goals from clubs
      expect(screen.getByText("15")).toBeInTheDocument();
      // 10 assists from clubs
      expect(screen.getByText("10")).toBeInTheDocument();
    });
  });

  it("displays player details correctly", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPlayerData,
    });

    render(<PlayerPage params={{ id: "1" }} />);

    await waitFor(() => {
      expect(screen.getByText("Lionel Messi")).toBeInTheDocument();
      expect(screen.getByText("24 Jun 1987")).toBeInTheDocument();
      expect(screen.getByText("170 cm")).toBeInTheDocument();
      expect(screen.getByText("72 kg")).toBeInTheDocument();
      expect(screen.getByText("LEFT")).toBeInTheDocument();
      expect(screen.getByText("#10")).toBeInTheDocument();
      expect(screen.getByText("Rosario")).toBeInTheDocument();
    });
  });

  it("handles API errors gracefully", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    render(<PlayerPage params={{ id: "1" }} />);

    await waitFor(() => {
      // Expect server error message from comprehensive error handling
      expect(screen.getByText(/Server error\. Please try again later\./i)).toBeInTheDocument();
    });
  });

  it("links to team page from current club badge", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockPlayerData,
    });

    render(<PlayerPage params={{ id: "1" }} />);

    await waitFor(() => {
      const clubLink = screen.getByTestId("link");
      expect(clubLink).toHaveAttribute("href", "/teams/1");
    });
  });
});
