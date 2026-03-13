import { render, screen, waitFor } from "@testing-library/react";
import TeamPage from "@/app/teams/[id]/page";
import { TeamData } from "@/app/teams/[id]/page";

// Mock the fetch API
global.fetch = jest.fn();

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
  Select: ({ value, onChange, options }: { value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: Array<{value: string; label: string}> }) => 
    <select data-testid="select" value={value} onChange={onChange}>
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>,
  Button: ({ children, onClick, ...props }: { children: React.ReactNode; onClick: () => void; [key: string]: unknown }) => 
    <button data-testid="button" onClick={onClick} {...props}>{children}</button>,
  Table: {
    Row: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => <tr data-testid="table-row" {...props}>{children}</tr>,
    Cell: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => <td data-testid="table-cell" {...props}>{children}</td>,
    Head: ({ children }: { children: React.ReactNode }) => <thead>{children}</thead>,
    Body: ({ children }: { children: React.ReactNode }) => <tbody>{children}</tbody>,
    Header: ({ children, ...props }: { children: React.ReactNode; [key: string]: unknown }) => <th {...props}>{children}</th>,
  },
}));

// Mock Link from next/link
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => 
    <a href={href} data-testid="link">{children}</a>,
}));

const mockTeamData: TeamData = {
  id: 1,
  name: "Real Madrid",
  shortName: "RM",
  slug: "real-madrid",
  foundedYear: 1902,
  stadiumName: "Santiago Bernabéu",
  stadiumCapacity: 81044,
  website: "https://realmadrid.com",
  logoUrl: "https://example.com/real-madrid.png",
  country: {
    id: 1,
    name: "Spain",
    code: "ESP",
    flagUrl: "https://example.com/spain.png",
  },
  currentPlayers: [
    {
      id: 1,
      firstName: "Thibaut",
      lastName: "Courtois",
      fullName: "Thibaut Courtois",
      birthDate: "1992-05-11T00:00:00.000Z",
      nationality: {
        id: 1,
        name: "Belgium",
      },
      position: {
        id: 1,
        name: "Goalkeeper",
        category: "GK",
      },
      height: 200,
      weight: 96,
      foot: "LEFT",
      jerseyNumber: 1,
      imageUrl: "https://example.com/courtois.jpg",
      contractUntil: "2026-06-30T00:00:00.000Z",
      marketValue: 30000000,
      marketValueDate: "2024-01-15T00:00:00.000Z",
      PlayerClub: [
        {
          id: 1,
          appearances: 30,
          goals: 0,
          assists: 0,
          minutesPlayed: 2700,
          season: {
            id: 1,
            year: "2023/2024",
          },
        },
      ],
    },
    {
      id: 2,
      firstName: "Vinícius",
      lastName: "Júnior",
      fullName: "Vinícius Júnior",
      birthDate: "2000-07-12T00:00:00.000Z",
      nationality: {
        id: 2,
        name: "Brazil",
      },
      position: {
        id: 2,
        name: "Forward",
        category: "FWD",
      },
      height: 176,
      weight: 73,
      foot: "RIGHT",
      jerseyNumber: 7,
      imageUrl: "https://example.com/vini.jpg",
      contractUntil: "2027-06-30T00:00:00.000Z",
      marketValue: 150000000,
      marketValueDate: "2024-01-15T00:00:00.000Z",
      PlayerClub: [
        {
          id: 2,
          appearances: 35,
          goals: 20,
          assists: 15,
          minutesPlayed: 3150,
          season: {
            id: 1,
            year: "2023/2024",
          },
        },
      ],
    },
    {
      id: 3,
      firstName: "Jude",
      lastName: "Bellingham",
      fullName: "Jude Bellingham",
      birthDate: "2003-06-29T00:00:00.000Z",
      nationality: {
        id: 3,
        name: "England",
      },
      position: {
        id: 3,
        name: "Midfielder",
        category: "MID",
      },
      height: 186,
      weight: 74,
      foot: "RIGHT",
      jerseyNumber: 5,
      imageUrl: "https://example.com/bellingham.jpg",
      contractUntil: "2029-06-30T00:00:00.000Z",
      marketValue: 120000000,
      marketValueDate: "2024-01-15T00:00:00.000Z",
      PlayerClub: [
        {
          id: 3,
          appearances: 32,
          goals: 18,
          assists: 8,
          minutesPlayed: 2880,
          season: {
            id: 1,
            year: "2023/2024",
          },
        },
      ],
    },
  ],
  transfersFrom: [
    {
      id: 1,
      transferDate: "2023-06-15T00:00:00.000Z",
      fee: 103000000,
      currency: "EUR",
      type: "PERMANENT",
      isUndisclosed: false,
      loanDuration: null,
      optionToBuy: false,
      fromClub: {
        id: 2,
        name: "Borussia Dortmund",
        logoUrl: "https://example.com/dortmund.png",
        country: {
          id: 4,
          name: "Germany",
        },
      },
      toClub: {
        id: 1,
        name: "Real Madrid",
        logoUrl: "https://example.com/real-madrid.png",
        country: {
          id: 1,
          name: "Spain",
        },
      },
      player: {
        id: 3,
        firstName: "Jude",
        lastName: "Bellingham",
        fullName: "Jude Bellingham",
        position: {
          id: 3,
          name: "Midfielder",
          category: "MID",
        },
        imageUrl: "https://example.com/bellingham.jpg",
      },
    },
  ],
  transfersTo: [
    {
      id: 2,
      transferDate: "2022-08-01T00:00:00.000Z",
      fee: 45000000,
      currency: "EUR",
      type: "PERMANENT",
      isUndisclosed: false,
      loanDuration: null,
      optionToBuy: false,
      fromClub: {
        id: 3,
        name: "Real Madrid",
        logoUrl: "https://example.com/real-madrid.png",
        country: {
          id: 1,
          name: "Spain",
        },
      },
      toClub: {
        id: 4,
        name: "Manchester United",
        logoUrl: "https://example.com/manutd.png",
        country: {
          id: 2,
          name: "England",
        },
      },
      player: {
        id: 4,
        firstName: "Casemiro",
        lastName: "Casemiro",
        fullName: "Casemiro",
        position: {
          id: 3,
          name: "Midfielder",
          category: "MID",
        },
        imageUrl: "https://example.com/casemiro.jpg",
      },
    },
  ],
  playerStats: [
    {
      id: 1,
      player: {
        id: 2,
        firstName: "Vinícius",
        lastName: "Júnior",
        fullName: "Vinícius Júnior",
        position: {
          id: 2,
          name: "Forward",
          category: "FWD",
        },
        imageUrl: "https://example.com/vini.jpg",
      },
      season: {
        id: 1,
        year: "2023/2024",
      },
      appearances: 35,
      goals: 20,
      assists: 15,
      minutesPlayed: 3150,
      competitionType: "LEAGUE",
    },
    {
      id: 2,
      player: {
        id: 3,
        firstName: "Jude",
        lastName: "Bellingham",
        fullName: "Jude Bellingham",
        position: {
          id: 3,
          name: "Midfielder",
          category: "MID",
        },
        imageUrl: "https://example.com/bellingham.jpg",
      },
      season: {
        id: 1,
        year: "2023/2024",
      },
      appearances: 32,
      goals: 18,
      assists: 8,
      minutesPlayed: 2880,
      competitionType: "LEAGUE",
    },
  ],
  seasons: [
    {
      id: 1,
      season: {
        id: 1,
        year: "2023/2024",
      },
      rank: 1,
      points: 90,
      averageAge: 26.5,
      foreignPlayers: 12,
      totalMarketValue: 950000000,
    },
  ],
};

describe("TeamPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading state initially", () => {
    // Mock fetch to never resolve
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<TeamPage params={{ id: "1" }} />);

    expect(screen.getByTestId("card")).toBeInTheDocument();
  });

  it("renders team data successfully", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTeamData,
    });

    render(<TeamPage params={{ id: "1" }} />);

    await waitFor(() => {
      expect(screen.getByText("Real Madrid")).toBeInTheDocument();
    });

    expect(screen.getByText("RM")).toBeInTheDocument();
    expect(screen.getByText("Spain")).toBeInTheDocument();
    expect(screen.getByText("Founded 1902")).toBeInTheDocument();
    expect(screen.getByText("Santiago Bernabéu")).toBeInTheDocument();
  });

  it("displays squad statistics correctly", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTeamData,
    });

    render(<TeamPage params={{ id: "1" }} />);

    await waitFor(() => {
      expect(screen.getByText("3")).toBeInTheDocument(); // Squad size
    });

    expect(screen.getByText("€300.0m")).toBeInTheDocument(); // Total market value
    expect(screen.getByText(/years/)).toBeInTheDocument(); // Average age
    expect(screen.getByText("2 / 3")).toBeInTheDocument(); // Foreign players
  });

  it("renders error state when team not found", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    render(<TeamPage params={{ id: "999" }} />);

    await waitFor(() => {
      expect(screen.getByText(/Team not found/i)).toBeInTheDocument();
    });
  });

  it("displays all three tabs", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTeamData,
    });

    render(<TeamPage params={{ id: "1" }} />);

    await waitFor(() => {
      expect(screen.getByTestId("tab-overview")).toBeInTheDocument();
      expect(screen.getByText("Squad")).toBeInTheDocument();
    });

    expect(screen.getByTestId("tab-stats")).toBeInTheDocument();
    expect(screen.getByText("Statistics")).toBeInTheDocument();
    expect(screen.getByTestId("tab-transfers")).toBeInTheDocument();
    expect(screen.getByText("Transfer History")).toBeInTheDocument();
  });

  it("switches between tabs correctly", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTeamData,
    });

    render(<TeamPage params={{ id: "1" }} />);

    // Initially on squad tab
    await waitFor(() => {
      expect(screen.getByText(/Current Squad/)).toBeInTheDocument();
    });

    // Click on Statistics tab
    const statsTab = screen.getByTestId("tab-stats");
    statsTab.click();

    await waitFor(() => {
      expect(screen.getByText("Squad Composition by Position")).toBeInTheDocument();
    });

    // Click on Transfer History tab
    const transfersTab = screen.getByTestId("tab-transfers");
    transfersTab.click();

    await waitFor(() => {
      expect(screen.getByText("Inbound Transfers")).toBeInTheDocument();
      expect(screen.getByText("Outbound Transfers")).toBeInTheDocument();
    });
  });

  it("displays squad table with players", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTeamData,
    });

    render(<TeamPage params={{ id: "1" }} />);

    await waitFor(() => {
      expect(screen.getByText("Thibaut Courtois")).toBeInTheDocument();
      expect(screen.getByText("Vinícius Júnior")).toBeInTheDocument();
      expect(screen.getByText("Jude Bellingham")).toBeInTheDocument();
    });

    expect(screen.getByText("Goalkeeper")).toBeInTheDocument();
    expect(screen.getByText("Forward")).toBeInTheDocument();
    expect(screen.getByText("Midfielder")).toBeInTheDocument();
  });

  it("filters players by position", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTeamData,
    });

    render(<TeamPage params={{ id: "1" }} />);

    await waitFor(() => {
      expect(screen.getByText("Thibaut Courtois")).toBeInTheDocument();
    });

    const select = screen.getByTestId("select");
    select.value = "GK";

    // Trigger change event
    fireEvent.change(select, { target: { value: "GK" } });

    await waitFor(() => {
      expect(screen.getByText("Thibaut Courtois")).toBeInTheDocument();
      expect(screen.queryByText("Vinícius Júnior")).not.toBeInTheDocument();
    });
  });

  it("sorts players by jersey number", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTeamData,
    });

    render(<TeamPage params={{ id: "1" }} />);

    await waitFor(() => {
      expect(screen.getByText("Thibaut Courtois")).toBeInTheDocument();
    });

    const sortButton = screen.getByText(/Sort by Jersey/i);
    sortButton.click();

    await waitFor(() => {
      expect(screen.getByText("Sort by Jersey ↑")).toBeInTheDocument();
    });
  });

  it("sorts players by market value", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTeamData,
    });

    render(<TeamPage params={{ id: "1" }} />);

    await waitFor(() => {
      expect(screen.getByText("Vinícius Júnior")).toBeInTheDocument();
    });

    const sortButton = screen.getByText(/Sort by Value/i);
    sortButton.click();

    await waitFor(() => {
      expect(screen.getByText("Sort by Value ↑")).toBeInTheDocument();
    });
  });

  it("displays position breakdown in statistics tab", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTeamData,
    });

    render(<TeamPage params={{ id: "1" }} />);

    // Switch to stats tab
    const statsTab = screen.getByTestId("tab-stats");
    statsTab.click();

    await waitFor(() => {
      expect(screen.getByText("Squad Composition by Position")).toBeInTheDocument();
    });

    expect(screen.getByText("GK")).toBeInTheDocument();
    expect(screen.getByText("DEF")).toBeInTheDocument();
    expect(screen.getByText("MID")).toBeInTheDocument();
    expect(screen.getByText("FWD")).toBeInTheDocument();
  });

  it("displays season statistics table", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTeamData,
    });

    render(<TeamPage params={{ id: "1" }} />);

    // Switch to stats tab
    const statsTab = screen.getByTestId("tab-stats");
    statsTab.click();

    await waitFor(() => {
      expect(screen.getByText("Season Statistics")).toBeInTheDocument();
    });

    expect(screen.getByText("2023/2024")).toBeInTheDocument();
    expect(screen.getByText("Vinícius Júnior")).toBeInTheDocument();
    expect(screen.getByText("35")).toBeInTheDocument(); // appearances
    expect(screen.getByText("20")).toBeInTheDocument(); // goals
  });

  it("displays inbound transfers", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTeamData,
    });

    render(<TeamPage params={{ id: "1" }} />);

    // Switch to transfers tab
    const transfersTab = screen.getByTestId("tab-transfers");
    transfersTab.click();

    await waitFor(() => {
      expect(screen.getByText("Inbound Transfers")).toBeInTheDocument();
    });

    expect(screen.getByText("Jude Bellingham")).toBeInTheDocument();
    expect(screen.getByText("Borussia Dortmund")).toBeInTheDocument();
    expect(screen.getByText("€103.0m")).toBeInTheDocument();
  });

  it("displays outbound transfers", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTeamData,
    });

    render(<TeamPage params={{ id: "1" }} />);

    // Switch to transfers tab
    const transfersTab = screen.getByTestId("tab-transfers");
    transfersTab.click();

    await waitFor(() => {
      expect(screen.getByText("Outbound Transfers")).toBeInTheDocument();
    });

    expect(screen.getByText("Casemiro")).toBeInTheDocument();
    expect(screen.getByText("Manchester United")).toBeInTheDocument();
    expect(screen.getByText("€45.0m")).toBeInTheDocument();
  });

  it("displays team badge with fallback", async () => {
    const teamWithoutLogo: TeamData = {
      ...mockTeamData,
      logoUrl: null,
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => teamWithoutLogo,
    });

    render(<TeamPage params={{ id: "1" }} />);

    await waitFor(() => {
      expect(screen.getByText("R")).toBeInTheDocument(); // First letter of Real Madrid
    });
  });

  it("handles API errors gracefully", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    render(<TeamPage params={{ id: "1" }} />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch team data/i)).toBeInTheDocument();
    });
  });

  it("calculates average age correctly", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTeamData,
    });

    render(<TeamPage params={{ id: "1" }} />);

    await waitFor(() => {
      expect(screen.getByText(/years/)).toBeInTheDocument();
    });

    // Ages: Courtois (32), Vinícius (23), Bellingham (20) = average ~25
    const ageElement = screen.getByText(/\d+\.\d+ years/);
    expect(ageElement).toBeInTheDocument();
  });

  it("displays foreign players count", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTeamData,
    });

    render(<TeamPage params={{ id: "1" }} />);

    await waitFor(() => {
      expect(screen.getByText("2 / 3")).toBeInTheDocument();
    });
  });

  it("displays stadium capacity", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTeamData,
    });

    render(<TeamPage params={{ id: "1" }} />);

    await waitFor(() => {
      expect(screen.getByText("81,044")).toBeInTheDocument();
    });
  });

  it("links to player pages from squad table", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTeamData,
    });

    render(<TeamPage params={{ id: "1" }} />);

    await waitFor(() => {
      const links = screen.getAllByTestId("link");
      const playerLinks = links.filter(link => 
        link.getAttribute("href")?.startsWith("/players/")
      );
      expect(playerLinks.length).toBeGreaterThan(0);
    });
  });

  it("displays transfer details with proper formatting", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockTeamData,
    });

    render(<TeamPage params={{ id: "1" }} />);

    const transfersTab = screen.getByTestId("tab-transfers");
    transfersTab.click();

    await waitFor(() => {
      expect(screen.getByText(/Borussia Dortmund/)).toBeInTheDocument();
      expect(screen.getByText(/€103\.0m/)).toBeInTheDocument();
      expect(screen.getByText(/15 Jun 2023/)).toBeInTheDocument();
    });
  });
});
