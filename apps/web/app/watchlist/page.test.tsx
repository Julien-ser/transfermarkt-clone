import { render, screen, waitFor } from "@testing-library/react";
import WatchlistPage from "@/app/watchlist/page";
import { useSession } from "next-auth/react";

// Mock the fetch API
global.fetch = jest.fn();

// Mock next-auth
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
}));

// Mock Link from next/link
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => 
    <a href={href} data-testid="link">{children}</a>,
}));

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
  {
    id: 2,
    fullName: "Cristiano Ronaldo",
    position: { name: "Forward" },
    nationality: { name: "Portugal" },
    marketValue: 60000000,
    imageUrl: null,
    currentClub: { id: 2, name: "Al Nassr", logoUrl: null },
  },
];

const mockClubs = [
  {
    id: 1,
    name: "Real Madrid",
    slug: "real-madrid",
    country: { name: "Spain" },
    logoUrl: "https://example.com/real-madrid.png",
  },
  {
    id: 2,
    name: "Barcelona",
    slug: "barcelona",
    country: { name: "Spain" },
    logoUrl: null,
  },
];

describe("WatchlistPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading state initially when session is loading", () => {
    (useSession as jest.Mock).mockReturnValue({ data: null, status: "loading" });

    render(<WatchlistPage />);

    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });

  it("shows access denied message when user is not authenticated", async () => {
    (useSession as jest.Mock).mockReturnValue({ data: null, status: "unauthenticated" });
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ players: [], clubs: [] }),
    });

    render(<WatchlistPage />);

    await waitFor(() => {
      expect(screen.getByText("Access Denied")).toBeInTheDocument();
      expect(screen.getByText(/You must be signed in to view your watchlist/i)).toBeInTheDocument();
      expect(screen.getByText("Sign in")).toBeInTheDocument();
    });
  });

  it("loads and displays watchlist items when authenticated", async () => {
    (useSession as jest.Mock).mockReturnValue({ 
      data: { user: { id: "1", email: "test@example.com", name: "Test User" } }, 
      status: "authenticated" 
    });
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ players: mockPlayers, clubs: mockClubs }),
    });

    render(<WatchlistPage />);

    await waitFor(() => {
      expect(screen.getByText("My Watchlist")).toBeInTheDocument();
    });

    // Check players are displayed
    expect(screen.getByText("Lionel Messi")).toBeInTheDocument();
    expect(screen.getByText("Cristiano Ronaldo")).toBeInTheDocument();

    // Check clubs are displayed
    expect(screen.getByText("Real Madrid")).toBeInTheDocument();
    expect(screen.getByText("Barcelona")).toBeInTheDocument();

    // Check tab counts
    expect(screen.getByText(`Players (${mockPlayers.length})`)).toBeInTheDocument();
    expect(screen.getByText(`Clubs (${mockClubs.length})`)).toBeInTheDocument();
  });

  it("displays empty state when watchlist has no players", async () => {
    (useSession as jest.Mock).mockReturnValue({ 
      data: { user: { id: "1", email: "test@example.com" } }, 
      status: "authenticated" 
    });
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ players: [], clubs: [] }),
    });

    render(<WatchlistPage />);

    await waitFor(() => {
      expect(screen.getByText("My Watchlist")).toBeInTheDocument();
    });

    // Click on players tab
    const playersTab = screen.getByText(/Players \(0\)/);
    playersTab.click();

    await waitFor(() => {
      expect(screen.getByText(/No players in your watchlist/i)).toBeInTheDocument();
      expect(screen.getByText("Browse players")).toBeInTheDocument();
    });
  });

  it("displays empty state when watchlist has no clubs", async () => {
    (useSession as jest.Mock).mockReturnValue({ 
      data: { user: { id: "1", email: "test@example.com" } }, 
      status: "authenticated" 
    });
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ players: mockPlayers, clubs: [] }),
    });

    render(<WatchlistPage />);

    await waitFor(() => {
      expect(screen.getByText("My Watchlist")).toBeInTheDocument();
    });

    // Click on clubs tab
    const clubsTab = screen.getByText(/Clubs \(0\)/);
    clubsTab.click();

    await waitFor(() => {
      expect(screen.getByText(/No clubs in your watchlist/i)).toBeInTheDocument();
      expect(screen.getByText("Browse teams")).toBeInTheDocument();
    });
  });

  it("switches between players and clubs tabs", async () => {
    (useSession as jest.Mock).mockReturnValue({ 
      data: { user: { id: "1", email: "test@example.com" } }, 
      status: "authenticated" 
    });
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ players: mockPlayers, clubs: mockClubs }),
    });

    render(<WatchlistPage />);

    await waitFor(() => {
      expect(screen.getByText("Lionel Messi")).toBeInTheDocument();
    });

    // Click on clubs tab
    const clubsTab = screen.getByText(/Clubs \(2\)/);
    clubsTab.click();

    await waitFor(() => {
      expect(screen.queryByText("Lionel Messi")).not.toBeInTheDocument();
      expect(screen.getByText("Real Madrid")).toBeInTheDocument();
    });

    // Click back to players tab
    const playersTab = screen.getByText(/Players \(2\)/);
    playersTab.click();

    await waitFor(() => {
      expect(screen.getByText("Lionel Messi")).toBeInTheDocument();
      expect(screen.queryByText("Real Madrid")).not.toBeInTheDocument();
    });
  });

  it("removes player from watchlist when remove button is clicked", async () => {
    (useSession as jest.Mock).mockReturnValue({ 
      data: { user: { id: "1", email: "test@example.com" } }, 
      status: "authenticated" 
    });
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ players: mockPlayers, clubs: [] }),
      })
      .mockResolvedValueOnce({ // DELETE request
        ok: true,
        json: async () => ({ message: "Player removed from watchlist" }),
      });

    render(<WatchlistPage />);

    await waitFor(() => {
      expect(screen.getByText("Lionel Messi")).toBeInTheDocument();
    });

    // Click remove button for first player
    const removeButtons = screen.getAllByText("Remove");
    removeButtons[0].click();

    await waitFor(() => {
      expect(screen.queryByText("Lionel Messi")).not.toBeInTheDocument();
      expect(screen.getByText("Cristiano Ronaldo")).toBeInTheDocument();
    });
  });

  it("removes club from watchlist when remove button is clicked", async () => {
    (useSession as jest.Mock).mockReturnValue({ 
      data: { user: { id: "1", email: "test@example.com" } }, 
      status: "authenticated" 
    });
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ players: [], clubs: mockClubs }),
      })
      .mockResolvedValueOnce({ // DELETE request
        ok: true,
        json: async () => ({ message: "Club removed from watchlist" }),
      });

    render(<WatchlistPage />);

    await waitFor(() => {
      expect(screen.getByText("Real Madrid")).toBeInTheDocument();
    });

    // Click remove button for first club
    const removeButtons = screen.getAllByText("Remove");
    removeButtons[0].click();

    await waitFor(() => {
      expect(screen.queryByText("Real Madrid")).not.toBeInTheDocument();
      expect(screen.getByText("Barcelona")).toBeInTheDocument();
    });
  });

  it("displays player market values correctly", async () => {
    (useSession as jest.Mock).mockReturnValue({ 
      data: { user: { id: "1", email: "test@example.com" } }, 
      status: "authenticated" 
    });
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ players: mockPlayers, clubs: [] }),
    });

    render(<WatchlistPage />);

    await waitFor(() => {
      expect(screen.getByText("€50.0M")).toBeInTheDocument();
      expect(screen.getByText("€60.0M")).toBeInTheDocument();
    });
  });

  it("displays player positions and nationalities", async () => {
    (useSession as jest.Mock).mockReturnValue({ 
      data: { user: { id: "1", email: "test@example.com" } }, 
      status: "authenticated" 
    });
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ players: mockPlayers, clubs: [] }),
    });

    render(<WatchlistPage />);

    await waitFor(() => {
      expect(screen.getByText("Forward • Argentina • Inter Miami")).toBeInTheDocument();
      expect(screen.getByText("Forward • Portugal • Al Nassr")).toBeInTheDocument();
    });
  });

  it("links to player and team pages correctly", async () => {
    (useSession as jest.Mock).mockReturnValue({ 
      data: { user: { id: "1", email: "test@example.com" } }, 
      status: "authenticated" 
    });
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ players: mockPlayers, clubs: mockClubs }),
    });

    render(<WatchlistPage />);

    await waitFor(() => {
      const links = screen.getAllByTestId("link");
      
      // Check player links
      const playerLinks = links.filter(link => 
        link.getAttribute("href")?.startsWith("/players/")
      );
      expect(playerLinks.length).toBeGreaterThan(0);
      expect(playerLinks[0]).toHaveAttribute("href", "/players/1");

      // Check club links  
      const clubLinks = links.filter(link => 
        link.getAttribute("href")?.startsWith("/teams/")
      );
      expect(clubLinks.length).toBeGreaterThan(0);
      expect(clubLinks[0]).toHaveAttribute("href", "/teams/1");
    });
  });

  it("handles API fetch errors gracefully", async () => {
    (useSession as jest.Mock).mockReturnValue({ 
      data: { user: { id: "1", email: "test@example.com" } }, 
      status: "authenticated" 
    });
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    render(<WatchlistPage />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch watchlist/i)).toBeInTheDocument();
    });
  });

  it("shows back to home link", async () => {
    (useSession as jest.Mock).mockReturnValue({ 
      data: { user: { id: "1", email: "test@example.com" } }, 
      status: "authenticated" 
    });
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ players: mockPlayers, clubs: mockClubs }),
    });

    render(<WatchlistPage />);

    await waitFor(() => {
      const backLink = screen.getByText("← Back to home");
      expect(backLink).toHaveAttribute("href", "/");
    });
  });
});
