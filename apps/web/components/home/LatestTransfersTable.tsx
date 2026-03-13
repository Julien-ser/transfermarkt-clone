"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Table, Card } from "ui";
import { formatTransferFee, formatDate } from "@/lib/format";

interface Transfer {
  id: number;
  transferDate: string;
  fee: number | null;
  player: {
    id: number;
    firstName: string;
    lastName: string;
    fullName: string;
    imageUrl?: string | null;
    position: {
      name: string;
    };
  };
  fromClub: {
    id: number;
    name: string;
    logoUrl?: string | null;
  };
  toClub: {
    id: number;
    name: string;
    logoUrl?: string | null;
  };
}

interface TransfersResponse {
  transfers: Transfer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function LatestTransfersTable() {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const observerTarget = useRef<HTMLDivElement>(null);
  const limit = 10;

  const fetchTransfers = useCallback(async (pageNum: number, append: boolean = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const response = await fetch(
        `/api/transfers?page=${pageNum}&limit=${limit}&sortBy=transferDate&sortOrder=desc`
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch transfers");
      }
      
      const data: TransfersResponse = await response.json();
      
      if (append) {
        setTransfers(prev => [...prev, ...data.transfers]);
      } else {
        setTransfers(data.transfers);
      }
      
      setHasMore(pageNum < data.pagination.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchTransfers(1, false);
  }, [fetchTransfers]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchTransfers(nextPage, true);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loadingMore, loading, page, fetchTransfers]);

  const columns = [
    {
      key: 'player' as const,
      header: 'Player',
      render: (_value: unknown, row: Transfer) => (
        <div className="flex items-center">
          {row.player.imageUrl ? (
            <div className="relative w-10 h-10 mr-3 flex-shrink-0">
              <Image
                src={row.player.imageUrl}
                alt={row.player.fullName}
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
                {row.player.fullName.charAt(0)}
              </span>
            </div>
          )}
          <div className="min-w-0">
            <Link
              href={`/players/${row.player.id}`}
              className="font-medium text-blue-600 dark:text-blue-400 hover:underline truncate"
            >
              {row.player.fullName}
            </Link>
            <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
              {row.player.position.name}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'fromClub' as const,
      header: 'From',
      render: (_value: unknown, row: Transfer) => (
        <Link
          href={`/teams/${row.fromClub.id}`}
          className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center"
        >
          {row.fromClub.logoUrl && (
            <div className="relative w-6 h-6 mr-2 flex-shrink-0">
              <Image
                src={row.fromClub.logoUrl}
                alt={row.fromClub.name}
                width={24}
                height={24}
                sizes="24px"
                className="object-contain"
                loading="lazy"
              />
            </div>
          )}
          <span className="truncate">{row.fromClub.name}</span>
        </Link>
      ),
    },
    {
      key: 'toClub' as const,
      header: 'To',
      render: (_value: unknown, row: Transfer) => (
        <Link
          href={`/teams/${row.toClub.id}`}
          className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center"
        >
          {row.toClub.logoUrl && (
            <div className="relative w-6 h-6 mr-2 flex-shrink-0">
              <Image
                src={row.toClub.logoUrl}
                alt={row.toClub.name}
                width={24}
                height={24}
                sizes="24px"
                className="object-contain"
                loading="lazy"
              />
            </div>
          )}
          <span className="truncate">{row.toClub.name}</span>
        </Link>
      ),
    },
    {
      key: 'transferDate' as const,
      header: 'Date',
      render: (_value: unknown, row: Transfer) => (
        <span className="text-gray-600 dark:text-gray-400">
          {formatDate(row.transferDate)}
        </span>
      ),
    },
    {
      key: 'fee' as const,
      header: 'Fee',
      render: (_value: unknown, row: Transfer) => (
        <span className={`font-medium ${
          row.fee ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
        }`}>
          {formatTransferFee(row.fee)}
        </span>
      ),
    },
  ];

  if (loading && transfers.length === 0) {
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

  if (error && transfers.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600 dark:text-red-400">
          <p>{error}</p>
          <button 
            onClick={() => fetchTransfers(1, false)}
            className="mt-2 text-blue-600 hover:underline"
          >
            Retry
          </button>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
          Latest Transfers
        </h3>
        
        {transfers.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 text-center py-8">
            No transfers available yet.
          </p>
        ) : (
          <Table
            data={transfers}
            columns={columns}
            rowKey="id"
            striped
            hoverable
            className="min-w-full"
          />
        )}
      </Card>

      {/* Infinite scroll trigger */}
      {hasMore && transfers.length > 0 && (
        <div ref={observerTarget} className="py-4 flex justify-center">
          {loadingMore && (
            <div className="text-blue-600 dark:text-blue-400">
              Loading more transfers...
            </div>
          )}
        </div>
      )}

      {!hasMore && transfers.length > 0 && (
        <div className="text-center py-4">
          <Link 
            href="/transfers"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            View all transfers →
          </Link>
        </div>
      )}
    </div>
  );
}
