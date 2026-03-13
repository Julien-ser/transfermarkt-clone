"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Card, Table, Badge, Input, Select, Button, Pagination, Avatar } from "ui";
import Link from "next/link";
import { formatDate, formatMarketValue } from "@/lib/format";

interface Transfer {
  id: number;
  transferDate: string;
  fee: number | null;
  currency: string;
  type: string;
  isUndisclosed: boolean;
  loanDuration?: number | null;
  optionToBuy: boolean;
  fromClub: {
    id: number;
    name: string;
    logoUrl?: string | null;
    country: { id: number; name: string };
  };
  toClub: {
    id: number;
    name: string;
    logoUrl?: string | null;
    country: { id: number; name: string };
  };
  player: {
    id: number;
    firstName: string;
    lastName: string;
    fullName: string;
    position: { id: number; name: string; category: string };
    imageUrl?: string | null;
  };
  season?: { id: number; year: string } | null;
}

interface Club {
  id: number;
  name: string;
}

interface Position {
  id: number;
  name: string;
  category: string;
}

interface Competition {
  id: number;
  name: string;
  type: string;
}

interface TransfersResponse {
  transfers: Transfer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  fromCache: boolean;
}

// Simple debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export default function TransfersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Initialize filters from URL
  const [filters, setFilters] = useState<{
    search: string;
    position: string;
    competitionId: string;
    fromClubId: string;
    toClubId: string;
    minFee: string;
    maxFee: string;
    minDate: string;
    maxDate: string;
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: string;
  }>({
    search: searchParams.get("search") || "",
    position: searchParams.get("position") || "",
    competitionId: searchParams.get("competitionId") || "",
    fromClubId: searchParams.get("fromClub") || "",
    toClubId: searchParams.get("toClub") || "",
    minFee: searchParams.get("minFee") || "",
    maxFee: searchParams.get("maxFee") || "",
    minDate: searchParams.get("minDate") || "",
    maxDate: searchParams.get("maxDate") || "",
    page: parseInt(searchParams.get("page") || "1", 10),
    limit: parseInt(searchParams.get("limit") || "20", 10),
    sortBy: searchParams.get("sortBy") || "transferDate",
    sortOrder: searchParams.get("sortOrder") || "desc",
  });

  const [transfersData, setTransfersData] = useState<TransfersResponse | null>(null);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce search input
  const debouncedSearch = useDebounce(filters.search, 500);
  const searchRef = useRef(filters.search);

  // Sync debounced search to filter when it changes
  useEffect(() => {
    if (debouncedSearch !== searchRef.current) {
      searchRef.current = debouncedSearch;
      setFilters(prev => ({ ...prev, search: debouncedSearch, page: 1 }));
    }
  }, [debouncedSearch]);

  // Fetch clubs, positions, and competitions for filter dropdowns
  useEffect(() => {
    async function fetchFilterData() {
      try {
        const [clubsRes, positionsRes, competitionsRes] = await Promise.all([
          fetch("/api/clubs?limit=100"),
          fetch("/api/positions"),
          fetch("/api/competitions?type=LEAGUE&limit=100"),
        ]);

        if (clubsRes.ok) {
          const clubsData = await clubsRes.json();
          setClubs(clubsData.clubs || []);
        }
        if (positionsRes.ok) {
          const positionsData = await positionsRes.json();
          setPositions(positionsData.positions || []);
        }
        if (competitionsRes.ok) {
          const competitionsData = await competitionsRes.json();
          setCompetitions(competitionsData.competitions || []);
        }
      } catch (err) {
        console.error("Failed to fetch filter data:", err);
      }
    }
    fetchFilterData();
  }, []);

  // Update URL when filters change
  const updateURL = useCallback((newFilters: typeof filters) => {
    const params = new URLSearchParams();

    if (newFilters.search) params.set("search", newFilters.search);
    if (newFilters.position) params.set("position", newFilters.position);
    if (newFilters.competitionId) params.set("competitionId", newFilters.competitionId);
    if (newFilters.fromClubId) params.set("fromClub", newFilters.fromClubId);
    if (newFilters.toClubId) params.set("toClub", newFilters.toClubId);
    if (newFilters.minFee) params.set("minFee", newFilters.minFee);
    if (newFilters.maxFee) params.set("maxFee", newFilters.maxFee);
    if (newFilters.minDate) params.set("minDate", newFilters.minDate);
    if (newFilters.maxDate) params.set("maxDate", newFilters.maxDate);
    if (newFilters.page > 1) params.set("page", newFilters.page.toString());
    if (newFilters.limit !== 20) params.set("limit", newFilters.limit.toString());
    params.set("sortBy", newFilters.sortBy);
    params.set("sortOrder", newFilters.sortOrder);

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [router, pathname]);

  // Fetch transfers data
  const fetchTransfers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.search) params.set("playerName", filters.search);
      if (filters.position) params.set("positionId", filters.position);
      if (filters.competitionId) params.set("competitionId", filters.competitionId);
      if (filters.fromClubId) params.set("fromClubId", filters.fromClubId);
      if (filters.toClubId) params.set("toClubId", filters.toClubId);
      if (filters.minFee) params.set("minFee", filters.minFee);
      if (filters.maxFee) params.set("maxFee", filters.maxFee);
      if (filters.minDate) params.set("minDate", filters.minDate);
      if (filters.maxDate) params.set("maxDate", filters.maxDate);
      params.set("page", filters.page.toString());
      params.set("limit", filters.limit.toString());
      params.set("sortBy", filters.sortBy);
      params.set("sortOrder", filters.sortOrder);

      const response = await fetch(`/api/transfers?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch transfers");
      }

      const data: TransfersResponse = await response.json();
      setTransfersData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Fetch data when debounced search or filters change
  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  // Handle filter changes
  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    updateURL(newFilters);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = parseInt(e.target.value, 10);
    const newFilters = { ...filters, limit: value, page: 1 };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: typeof filters = {
      search: "",
      position: "",
      competitionId: "",
      fromClubId: "",
      toClubId: "",
      minFee: "",
      maxFee: "",
      minDate: "",
      maxDate: "",
      page: 1,
      limit: 20,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    };
    setFilters(clearedFilters);
    updateURL(clearedFilters);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.position) count++;
    if (filters.competitionId) count++;
    if (filters.fromClubId) count++;
    if (filters.toClubId) count++;
    if (filters.minFee) count++;
    if (filters.maxFee) count++;
    if (filters.minDate) count++;
    if (filters.maxDate) count++;
    return count;
  }, [filters]);

  // Prepare table columns with proper typing
  const columns = useMemo(() => [
    {
      key: 'player' as keyof Transfer,
      header: 'Player',
      render: (_: unknown, row: Transfer) => (
        <div className="flex items-center gap-3">
          {row.player.imageUrl ? (
            <Avatar src={row.player.imageUrl} alt={row.player.fullName} size="small" />
          ) : (
            <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-xs font-bold">
              {row.player.firstName[0]}{row.player.lastName[0]}
            </div>
          )}
          <div>
            <Link
              href={`/players/${row.player.id}`}
              className="font-medium text-gray-900 dark:text-white hover:underline"
            >
              {row.player.fullName}
            </Link>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <Badge variant="primary" size="small">{row.player.position.name}</Badge>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'fromClub' as keyof Transfer,
      header: 'From',
      render: (_: unknown, row: Transfer) => (
        <div className="flex items-center gap-2">
          {row.fromClub.logoUrl && (
            <Avatar src={row.fromClub.logoUrl} alt={row.fromClub.name} size="small" />
          )}
          <div>
            <div className="font-medium text-gray-900 dark:text-white">{row.fromClub.name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{row.fromClub.country.name}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'toClub' as keyof Transfer,
      header: 'To',
      render: (_: unknown, row: Transfer) => (
        <div className="flex items-center gap-2">
          {row.toClub.logoUrl && (
            <Avatar src={row.toClub.logoUrl} alt={row.toClub.name} size="small" />
          )}
          <div>
            <div className="font-medium text-gray-900 dark:text-white">{row.toClub.name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{row.toClub.country.name}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'transferDate' as keyof Transfer,
      header: 'Date',
      render: (value: unknown) => formatDate(value as string),
    },
    {
      key: 'type' as keyof Transfer,
      header: 'Type',
      render: (_: unknown, row: Transfer) => (
        <Badge
          variant={row.type === "TRANSFER" ? "primary" : row.type === "LOAN" ? "warning" : "default"}
          size="small"
        >
          {row.type}
          {row.isUndisclosed && " (Undiscl.)"}
        </Badge>
      ),
    },
    {
      key: 'fee' as keyof Transfer,
      header: 'Fee',
      render: (_: unknown, row: Transfer) => (
        <div>
          {row.fee ? (
            <span className="font-bold text-green-600 dark:text-green-400">
              {formatMarketValue(row.fee, row.currency)}
            </span>
          ) : (
            <span className="text-gray-500">Free</span>
          )}
          {row.loanDuration && (
            <div className="text-xs text-gray-500 dark:text-gray-400">{row.loanDuration} months</div>
          )}
          {row.optionToBuy && (
            <div className="text-xs text-blue-600 dark:text-blue-400">Option to buy</div>
          )}
        </div>
      ),
    },
    {
      key: 'season' as keyof Transfer,
      header: 'Season',
      render: (_: unknown, row: Transfer) =>
        row.season ? (
          <Badge variant="default" size="small">{row.season.year}</Badge>
        ) : (
          <span className="text-gray-500">-</span>
        ),
    },
  ], []);

  const positionOptions = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(positions.map(p => p.category).filter(Boolean))
    ).sort();
    return [
      { value: "", label: "All Positions" },
      ...uniqueCategories.map(cat => ({ value: cat, label: cat })),
    ];
  }, [positions]);

  const clubOptions = useMemo(() => {
    return clubs
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(club => ({ value: club.id.toString(), label: club.name }));
  }, [clubs]);

  const competitionOptions = useMemo(() => {
    return competitions
      .filter(c => c.type === "LEAGUE")
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(comp => ({ value: comp.id.toString(), label: comp.name }));
  }, [competitions]);

  if (loading && !transfersData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-6">
          <div className="text-center text-red-600 dark:text-red-400">
            <p>{error}</p>
            <Button variant="primary" onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Filters Card */}
      <Card variant="outlined" padding="large" className="mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-1">
            <Input
              label="Search Player"
              name="search"
              placeholder="Enter player name..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              helperText="Debounced (500ms)"
            />
          </div>

          {/* Position */}
          <div>
            <Select
              label="Position"
              value={filters.position}
              onChange={(value) => handleFilterChange('position', value)}
              options={positionOptions}
              placeholder="All Positions"
            />
          </div>

          {/* From Club */}
          <div>
            <Select
              label="From Club"
              value={filters.fromClubId}
              onChange={(value) => handleFilterChange('fromClubId', value)}
              options={clubOptions}
              placeholder="All Clubs"
            />
          </div>

          {/* To Club */}
          <div>
            <Select
              label="To Club"
              value={filters.toClubId}
              onChange={(value) => handleFilterChange('toClubId', value)}
              options={clubOptions}
              placeholder="All Clubs"
            />
          </div>
        </div>

        {/* Second Row - Fee & Date Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {/* Min Fee */}
          <div>
            <Input
              label="Min Fee (€)"
              name="minFee"
              type="number"
              placeholder="e.g., 1000000"
              value={filters.minFee}
              onChange={(e) => handleFilterChange('minFee', e.target.value)}
            />
          </div>

          {/* Max Fee */}
          <div>
            <Input
              label="Max Fee (€)"
              name="maxFee"
              type="number"
              placeholder="e.g., 100000000"
              value={filters.maxFee}
              onChange={(e) => handleFilterChange('maxFee', e.target.value)}
            />
          </div>

          {/* Min Date */}
          <div>
            <Input
              label="From Date"
              name="minDate"
              type="text"
              placeholder="YYYY-MM-DD"
              value={filters.minDate}
              onChange={(e) => handleFilterChange('minDate', e.target.value)}
              helperText="Format: YYYY-MM-DD"
            />
          </div>

          {/* Max Date */}
          <div>
            <Input
              label="To Date"
              name="maxDate"
              type="text"
              placeholder="YYYY-MM-DD"
              value={filters.maxDate}
              onChange={(e) => handleFilterChange('maxDate', e.target.value)}
              helperText="Format: YYYY-MM-DD"
            />
          </div>
        </div>

        {/* Third Row - League Filter */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div>
            <Select
              label="League"
              value={filters.competitionId}
              onChange={(value) => handleFilterChange('competitionId', value)}
              options={competitionOptions}
              placeholder="All Leagues"
            />
          </div>
          <div></div>
          <div></div>
          <div></div>
        </div>

        {/* Fourth Row - Sort & Pagination */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {/* Items per page */}
          <div>
            <Select
              label="Per Page"
              value={filters.limit.toString()}
              onChange={(value) => handleLimitChange({ target: { value } } as any)}
              options={[
                { value: "10", label: "10 per page" },
                { value: "20", label: "20 per page" },
                { value: "50", label: "50 per page" },
                { value: "100", label: "100 per page" },
              ]}
            />
          </div>

          {/* Sort By */}
          <div>
            <Select
              label="Sort By"
              value={filters.sortBy}
              onChange={(value) => handleFilterChange('sortBy', value)}
              options={[
                { value: "transferDate", label: "Transfer Date" },
                { value: "fee", label: "Transfer Fee" },
              ]}
            />
          </div>

          {/* Sort Order */}
          <div>
            <Select
              label="Order"
              value={filters.sortOrder}
              onChange={(value) => handleFilterChange('sortOrder', value)}
              options={[
                { value: "desc", label: "Descending" },
                { value: "asc", label: "Ascending" },
              ]}
            />
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            {activeFiltersCount > 0 && (
              <Button variant="outline" onClick={clearFilters} className="w-full">
                Clear Filters ({activeFiltersCount})
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Results Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {transfersData && (
            <span>
              Showing {transfersData.transfers.length} of {transfersData.pagination.total} transfers
              {activeFiltersCount > 0 && <span> (filtered)</span>}
            </span>
          )}
        </div>
      </div>

      {/* Transfers Table */}
      <Card variant="elevated" padding="large">
        {transfersData && transfersData.transfers.length > 0 ? (
          <>
            <Table
              data={transfersData.transfers}
              columns={columns}
              rowKey="id"
              striped
              hoverable
              containerClassName="overflow-x-auto"
            />

            {/* Pagination */}
            <div className="mt-6">
              <Pagination
                currentPage={transfersData.pagination.page}
                totalPages={transfersData.pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {loading ? "Loading transfers..." : "No transfers found"}
            </p>
            {activeFiltersCount > 0 && !loading && (
              <p className="text-gray-500 dark:text-gray-500 mt-2">
                Try adjusting your filters to see more results
              </p>
            )}
          </div>
        )}
      </Card>

      {/* Legend */}
      <Card variant="outlined" padding="medium" className="mt-6">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Legend</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Badge variant="primary" size="small">TRANSFER</Badge>
            <span className="text-gray-600 dark:text-gray-400">Permanent transfer</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="warning" size="small">LOAN</Badge>
            <span className="text-gray-600 dark:text-gray-400">Loan deal</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="success" size="small">€Xm</Badge>
            <span className="text-gray-600 dark:text-gray-400">Transfer fee</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="default" size="small">Free</Badge>
            <span className="text-gray-600 dark:text-gray-400">Free transfer</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
