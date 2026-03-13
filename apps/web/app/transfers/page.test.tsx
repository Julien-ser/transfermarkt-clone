import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import TransfersPage from "@/app/transfers/page";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import React from "react";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useSearchParams: jest.fn(),
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

// Mock recharts
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
  Card: ({ children, ...props }: any) => <div data-testid="card" {...props}>{children}</div>,
  Badge: ({ children, ...props }: any) => <span data-testid="badge" {...props}>{children}</span>,
  Avatar: ({ src, alt, size }: any) => <img data-testid="avatar" src={src} alt={alt} data-size={size} />,
  Input: ({ label, ...props }: any) => (
    <div>
      <label>{label}</label>
      <input {...props} data-testid={`input-${label?.toLowerCase().replace(/\s/g, '-')}`} />
    </div>
  ),
  Select: ({ label, value, onChange, options, placeholder }: any) => (
    <div>
      <label>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} data-testid={`select-${label?.toLowerCase().replace(/\s/g, '-')}`}>
        <option value="">{placeholder}</option>
        {options.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </div>
  ),
  Button: ({ children, onClick, ...props }: any) => <button onClick={onClick} {...props} data-testid="button">{children}</button>,
  Pagination: ({ currentPage, totalPages, onPageChange }: any) => (
    <div data-testid="pagination">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1}>Previous</button>
      <span>{currentPage}</span>
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages}>Next</button>
    </div>
  ),
  Table: {
    Row: ({ children, ...props }: any) => <tr data-testid="table-row" {...props}>{children}</tr>,
    Cell: ({ children, ...props }: any) => <td data-testid="table-cell" {...props}>{children}</td>,
    Head: ({ children }: any) => <thead>{children}</thead>,
    Body: ({ children }: any) => <tbody>{children}</tbody>,
    Header: ({ children }: any) => <th>{children}</th>,
  },
}));

// Mock next/link
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href} data-testid="link">{children}</a>,
}));

// Mock format utilities
jest.mock("@/lib/format", () => ({
  formatDate: (date: string | Date) => new Date(date).toLocaleDateString(),
  formatMarketValue: (value: number, currency: string) => `€${value.toLocaleString()}`,
}));

// Mock data
const mockClubs = [
  { id: 1, name: "Manchester United" },
  { id: 2, name: "Real Madrid" },
];

const mockPositions = [
  { id: 1, name: "Forward", category: "FWD" },
  { id: 2, name: "Midfielder", category: "MID" },
];

const mockCompetitions = [
  { id: 1, name: "Premier League", type: "LEAGUE" },
  { id: 2, name: "La Liga", type: "LEAGUE" },
];

const mockTransfers = [
  {
    id: 1,
    transferDate: "2024-01-15T00:00:00.000Z",
    fee: 100000000,
    currency: "EUR",
    type: "PERMANENT",
    isUndisclosed: false,
    fromClub: { id: 1, name: "Manchester United", logoUrl: null, country: { id: 1, name: "England" } },
    toClub: { id: 2, name: "Real Madrid", logoUrl: null, country: { id: 2, name: "Spain" } },
    player: { id: 1, firstName: "John", lastName: "Doe", fullName: "John Doe", position: { id: 1, name: "Forward", category: "FWD" }, imageUrl: null },
    season: { id: 1, year: "2024/2025" },
  },
];

const mockTransfersResponse = {
  transfers: mockTransfers,
  pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
  fromCache: false,
};

describe("TransfersPage", () => {
  let mockPush: jest.Mock;
  let mockGet: jest.Mock;
  let mockPathname: string;

  beforeEach(() => {
    mockPush = jest.fn();
    mockGet = jest.fn(() => null);
    mockPathname = "/transfers";

    (useSearchParams as jest.Mock).mockReturnValue({
      get: mockGet,
      toString: () => "",
    });
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (usePathname as jest.Mock).mockReturnValue(mockPathname);

    (global.fetch as jest.Mock).mockClear();
  });

  it("renders loading state initially", () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

    render(<TransfersPage />);

    expect(screen.getByText(/Loading transfers.../i)).toBeInTheDocument();
  });

  it("loads and displays transfers", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ clubs: mockClubs }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ positions: mockPositions }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ competitions: mockCompetitions }) })
      .mockResolvedValueOnce({ ok: true, json: async () => mockTransfersResponse });

    render(<TransfersPage />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    expect(screen.getByText("Manchester United")).toBeInTheDocument();
    expect(screen.getByText("Real Madrid")).toBeInTheDocument();
    expect(screen.getByLabelText(/Search Player/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Position/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/From Club/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/To Club/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/League/i)).toBeInTheDocument();
    expect(screen.getByText(/Clear Filters/)).toBeInTheDocument();
  });

  it("shows empty state when no transfers found", async () => {
    const emptyResponse = { ...mockTransfersResponse, transfers: [] };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ clubs: mockClubs }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ positions: mockPositions }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ competitions: mockCompetitions }) })
      .mockResolvedValueOnce({ ok: true, json: async () => emptyResponse });

    render(<TransfersPage />);

    await waitFor(() => {
      expect(screen.getByText(/No transfers found/)).toBeInTheDocument();
    });
  });

  it("displays error state on fetch failure", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ clubs: mockClubs }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ positions: mockPositions }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ competitions: mockCompetitions }) })
      .mockResolvedValueOnce({ ok: false, status: 500 });

    render(<TransfersPage />);

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch transfers|An error occurred/)).toBeInTheDocument();
    });
  });

  it("updates URL when search input changes", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ clubs: mockClubs }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ positions: mockPositions }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ competitions: mockCompetitions }) })
      .mockResolvedValueOnce({ ok: true, json: async () => mockTransfersResponse });

    render(<TransfersPage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/Search Player/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByLabelText(/Search Player/i);
    fireEvent.change(searchInput, { target: { value: "Messi" } });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining("search=Messi"),
        { scroll: false }
      );
    });
  });

  it("clears all filters when clear button is clicked", async () => {
    mockGet.mockImplementation((key: string) => {
      const filters: Record<string, string | null> = {
        search: "test",
        position: "FWD",
        competitionId: "1",
        fromClubId: "1",
        toClubId: "2",
        minFee: "1000",
        maxFee: "50000",
      };
      return filters[key] || null;
    });

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ clubs: mockClubs }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ positions: mockPositions }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ competitions: mockCompetitions }) })
      .mockResolvedValueOnce({ ok: true, json: async () => mockTransfersResponse });

    render(<TransfersPage />);

    await waitFor(() => {
      expect(screen.getByText(/Clear Filters/)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText(/Clear Filters/));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringMatching(/[?]sortBy=transferDate&sortOrder=desc/),
        { scroll: false }
      );
    });
  });

  it("shows correct active filters count", async () => {
    mockGet.mockImplementation((key: string) => {
      const active: Record<string, string | null> = {
        position: "FWD",
        competitionId: "1",
        fromClubId: "2",
      };
      return active[key] || null;
    });

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ clubs: mockClubs }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ positions: mockPositions }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ competitions: mockCompetitions }) })
      .mockResolvedValueOnce({ ok: true, json: async () => mockTransfersResponse });

    render(<TransfersPage />);

    await waitFor(() => {
      expect(screen.getByText(/Clear Filters \(3\)/)).toBeInTheDocument();
    });
  });

  it("applies competition filter when selection changes", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ clubs: mockClubs }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ positions: mockPositions }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ competitions: mockCompetitions }) })
      .mockResolvedValueOnce({ ok: true, json: async () => mockTransfersResponse });

    render(<TransfersPage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/League/i)).toBeInTheDocument();
    });

    const leagueSelect = screen.getByLabelText(/League/i);
    fireEvent.change(leagueSelect, { target: { value: "2" } });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenLastCalledWith(
        expect.stringContaining("competitionId=2")
      );
    });
  });

  it("handles pagination correctly", async () => {
    const pagedResponse = {
      ...mockTransfersResponse,
      pagination: { page: 1, limit: 1, total: 2, totalPages: 2 },
      transfers: [mockTransfers[0]],
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ clubs: mockClubs }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ positions: mockPositions }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ competitions: mockCompetitions }) })
      .mockResolvedValueOnce({ ok: true, json: async () => pagedResponse });

    render(<TransfersPage />);

    await waitFor(() => {
      expect(screen.getByTestId("pagination")).toBeInTheDocument();
    });

    const nextButton = screen.getByText("Next");
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenLastCalledWith(
        expect.stringContaining("page=2")
      );
    });
  });

  it("combines multiple filters correctly", async () => {
    mockGet.mockImplementation((key: string) => {
      const map: Record<string, string> = {
        position: "FWD",
        competitionId: "1",
        minFee: "10000",
        maxFee: "500000",
      };
      return map[key] || null;
    });

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ clubs: mockClubs }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ positions: mockPositions }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ competitions: mockCompetitions }) })
      .mockResolvedValueOnce({ ok: true, json: async () => mockTransfersResponse });

    render(<TransfersPage />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenLastCalledWith(
        expect.stringContaining("positionId=FWD&competitionId=1&minFee=10000&maxFee=500000")
      );
    });
  });
});
