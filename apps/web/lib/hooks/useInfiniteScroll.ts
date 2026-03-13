import { useState, useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions<T> {
  /**
   * Function to fetch the next page of data
   * @param page - The page number to fetch
   * @param signal - AbortSignal for cancellation
   * @returns Promise resolving to array of items
   */
  fetchFn: (page: number, signal: AbortSignal) => Promise<T[]>;
  /**
   * Initial page number (default: 1)
   */
  initialPage?: number;
  /**
   * Trigger distance from bottom in pixels (default: 100)
   */
  threshold?: number;
  /**
   * Items per page
   */
  limit: number;
}

/**
 * Custom hook for implementing infinite scroll.
 * Automatically fetches more data when scrolling near bottom.
 *
 * @returns Object containing data, loading state, error, and ref to attach to sentinel element
 *
 * @example
 * const { data, loading, error, sentinelRef } = useInfiniteScroll({
 *   fetchFn: async (page, signal) => {
 *     const res = await fetch(`/api/transfers?page=${page}&limit=20`, { signal });
 *     return res.json();
 *   },
 *   limit: 20,
 * });
 */
export function useInfiniteScroll<T>({
  fetchFn,
  initialPage = 1,
  threshold = 100,
  limit,
}: UseInfiniteScrollOptions<T>) {
  const [data, setData] = useState<T[]>([]);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async (pageNum: number, signal: AbortSignal) => {
    try {
      const newItems = await fetchFn(pageNum, signal);
      return newItems;
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return []; // Silently abort
      }
      throw err;
    }
  }, [fetchFn]);

  useEffect(() => {
    // Reset state when limit changes (re-init)
    setData([]);
    setPage(initialPage);
    setHasMore(true);
    setError(null);
  }, [limit, initialPage]);

  useEffect(() => {
    // Abort any ongoing fetch on unmount or dependency change
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    if (!hasMore) return;

    const loadMore = async () => {
      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      setLoading(true);
      setError(null);

      try {
        const newItems = await fetchData(page, abortControllerRef.current.signal);

        setData(prev => [...prev, ...newItems]);
        setHasMore(newItems.length === limit);
        setPage(prev => prev + 1);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setError(err instanceof Error ? err : new Error('Failed to fetch data'));
        }
      } finally {
        setLoading(false);
      }
    };

    loadMore();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, fetchData]);

  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !loading && hasMore) {
          setPage(prev => prev + 1);
        }
      },
      {
        root: null,
        rootMargin: `${threshold}px`,
        threshold: 0.1,
      }
    );

    const sentinel = sentinelRef.current;
    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => {
      if (sentinel) {
        observer.unobserve(sentinel);
      }
    };
  }, [loading, hasMore, threshold]);

  return {
    data,
    loading,
    error,
    sentinelRef,
    reset: useCallback(() => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      setData([]);
      setPage(initialPage);
      setHasMore(true);
      setError(null);
    }, [initialPage]),
  };
}
