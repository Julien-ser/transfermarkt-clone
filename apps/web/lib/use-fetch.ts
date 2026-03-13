/**
 * useFetch - A comprehensive React hook for data fetching with error handling, loading states, and retry logic
 * Provides a consistent interface for API calls across the application
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { apiClient, ApiRequestOptions } from './api-client';
import { createAppError, classifyError, ErrorType } from './errors';

export interface UseFetchResult<T> {
  /** The fetched data */
  data: T | null;
  /** Whether the request is in progress */
  loading: boolean;
  /** Error if the request failed */
  error: Error | null;
  /** Whether the data is from cache */
  fromCache: boolean;
  /** Function to manually retry the fetch */
  refetch: () => Promise<void>;
  /** Function to clear the error and reset state */
  clearError: () => void;
  /** Timestamp of when the data was last fetched */
  lastFetched?: Date;
}

export interface UseFetchOptions<T> extends ApiRequestOptions {
  /** Whether to fetch data immediately on mount (default: true) */
  immediate?: boolean;
  /** Callback when data is successfully fetched */
  onSuccess?: (data: T) => void;
  /** Callback when an error occurs */
  onError?: (error: Error) => void;
  /** Callback when loading state changes */
  onLoadingChange?: (loading: boolean) => void;
  /** Whether to throw errors instead of setting error state (default: false) */
  throwOnError?: boolean;
}

/**
 * A powerful React hook for fetching data with comprehensive error handling
 *
 * @param endpoint - API endpoint to fetch (without base URL)
 * @param options - Configuration options
 *
 * @returns Object with data, loading, error, and control functions
 *
 * @example
 * ```tsx
 * const { data, loading, error, refetch } = useFetch<User[]>('/api/users', {
 *   cacheKey: 'users-list',
 *   cacheTtl: 600,
 *   onSuccess: (users) => console.log('Loaded', users.length, 'users')
 * });
 *
 * if (loading) return <UserListSkeleton />;
 * if (error) return <ErrorDisplay error={error} onRetry={refetch} />;
 * return <UserList users={data} />;
 * ```
 */
export function useFetch<T>(endpoint: string, options: UseFetchOptions<T> = {}): UseFetchResult<T> {
  const {
    immediate = true,
    onSuccess,
    onError,
    onLoadingChange,
    throwOnError = false,
    ...apiOptions
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [fromCache, setFromCache] = useState(false);
  const [lastFetched, setLastFetched] = useState<Date>();
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  const fetchData = useCallback(async (): Promise<void> => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    isMountedRef.current = true;

    setLoading(true);
    setError(null);
    onLoadingChange?.(true);

    try {
      const response = await apiClient.request<T>(endpoint, {
        ...apiOptions,
        fetchOptions: {
          ...apiOptions.fetchOptions,
          signal: abortControllerRef.current.signal,
        },
      });

      if (isMountedRef.current) {
        setData(response.data);
        setFromCache(response.fromCache);
        setLastFetched(new Date());
        onSuccess?.(response.data);
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        const appError = err instanceof Error ? createAppError(err) : err;
        setError(appError);
        onError?.(appError);

        if (throwOnError) {
          throw appError;
        }
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        onLoadingChange?.(false);
      }
    }
  }, [endpoint, JSON.stringify(apiOptions), onSuccess, onError, onLoadingChange, throwOnError]);

  const refetch = useCallback(async (): Promise<void> => {
    // Invalidate cache if cacheKey is specified
    if (apiOptions.cacheKey && !apiOptions.skipCache) {
      await apiClient.invalidateCache(apiOptions.cacheKey);
    }
    await fetchData();
  }, [fetchData, apiOptions.cacheKey, apiOptions.skipCache]);

  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData, immediate]);

  return {
    data,
    loading,
    error,
    fromCache,
    refetch,
    clearError,
    lastFetched,
  };
}

/**
 * Hook for fetching data with a key that can be manually controlled
 * Useful for refetching when certain dependencies change
 */
export function useManualFetch<T>(options: UseFetchOptions<T> = {}): UseFetchResult<T> & {
  execute: (endpoint: string) => Promise<void>;
} {
  const [endpoint, setEndpoint] = useState<string | null>(null);
  
  const fetchResult = useFetch<T>(endpoint || '', {
    immediate: false,
    ...options,
  });

  const execute = useCallback(async (newEndpoint: string): Promise<void> => {
    setEndpoint(newEndpoint);
    await fetchResult.refetch();
  }, [fetchResult]);

  return {
    ...fetchResult,
    execute,
  };
}

/**
 * Hook for fetching data that depends on a condition (e.g., authenticated user)
 */
export function useConditionalFetch<T>(
  endpoint: string | null,
  condition: boolean,
  options: UseFetchOptions<T> = {}
): UseFetchResult<T> {
  const shouldFetch = condition && endpoint !== null;

  return useFetch<T>(endpoint || '', {
    immediate: shouldFetch,
    ...options,
  });
}
