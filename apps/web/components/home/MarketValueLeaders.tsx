"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, Table, TableSkeleton } from "ui";
import { formatMarketValue } from "@/lib/format";
import { useFetch } from "@/lib/use-fetch";
import { ErrorDisplay } from "@/components/ErrorDisplay";

interface Player {
  id: number;
  fullName: string;
  firstName: string;
  lastName: string;
  imageUrl?: string | null;
  marketValue: number | null;
  position: {
    name: string;
  };
  currentClub: {
    id: number;
    name: string;
    logoUrl?: string | null;
  } | null;
  nationality: {
    name: string;
    flagUrl?: string | null;
    code?: string | null;
  } | null;
}

interface PlayersResponse {
  players: Player[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function MarketValueLeaders() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        // Fetch top players by market value, limit to 10
        const response = await fetch(
          "/api/players?limit=10&sortBy=marketValue&sortOrder=desc"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch players");
        }
        const data: PlayersResponse = await response.json();
        setPlayers(data.players || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  const columns = [
    {
      key: 'fullName' as const,
      header: 'Player',
      render: (value: unknown, row: Player) => (
        <div className="flex items-center">
          {row.imageUrl ? (
            <div className="relative w-10 h-10 mr-3 flex-shrink-0">
              <Image
                src={row.imageUrl}
                alt={row.fullName}
                width={40}
                height={40}
                sizes="40px"
                className="rounded-full object-cover"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="w-10 h-10 mr-3 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {row.fullName.charAt(0)}
              </span>
            </div>
          )}
          <div className="min-w-0">
            <Link
              href={`/players/${row.id}`}
              className="font-medium text-blue-600 dark:text-blue-400 hover:underline truncate"
            >
              {row.fullName}
            </Link>
            <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {row.position.name}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'currentClub' as const,
      header: 'Club',
      render: (value: unknown, row: Player) => (
        <div className="flex items-center">
          {row.currentClub?.logoUrl && (
            <div className="relative w-6 h-6 mr-2 flex-shrink-0">
              <Image
                src={row.currentClub.logoUrl}
                alt={row.currentClub.name}
                width={24}
                height={24}
                sizes="24px"
                className="object-contain"
                loading="lazy"
              />
            </div>
          )}
          <span className="truncate">{row.currentClub?.name || 'Free Agent'}</span>
        </div>
      ),
    },
    {
      key: 'nationality' as const,
      header: 'Nation',
      render: (value: unknown, row: Player) => (
        <div className="flex items-center">
          {row.nationality?.flagUrl && (
            <div className="relative w-5 h-3 mr-2 flex-shrink-0 overflow-hidden rounded">
              <Image
                src={row.nationality.flagUrl}
                alt={row.nationality.name}
                width={20}
                height={12}
                sizes="20px"
                className="object-cover"
                loading="lazy"
              />
            </div>
          )}
          <span className="truncate">{row.nationality?.name || 'N/A'}</span>
        </div>
      ),
    },
    {
      key: 'marketValue' as const,
      header: 'Market Value',
      render: (value: unknown, row: Player) => (
        <span className="font-semibold text-green-600 dark:text-green-400">
          {formatMarketValue(row.marketValue || 0)}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600 dark:text-red-400">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 text-blue-600 hover:underline"
          >
            Retry
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Market Value Leaders
        </h3>
        <Link
          href="/players?sortBy=marketValue&sortOrder=desc"
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm"
        >
          View All →
        </Link>
      </div>
      
      {players.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400 text-center py-8">
          No player data available yet.
        </p>
      ) : (
        <Table
          data={players}
          columns={columns}
          rowKey="id"
          striped
          hoverable
          className="min-w-full"
        />
      )}
    </Card>
  );
}
