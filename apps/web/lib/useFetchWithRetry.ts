"use client";

import { useState, useCallback, useEffect, useRef } from "react";

interface UseFetchWithRetryOptions<T> {
  /**
   * The fetch function to execute
   */
  fetchFn: () => Promise<T>;
  /**
   * Number of retry attempts on failure
   * @default 3
   */
  retries?: number;
  /**
   * Initial delay before first retry in milliseconds
   * @default 1000
   */
  initialDelay?: number;
  /**
   * Maximum delay between retries in milliseconds
   * @default 10000
   */
  maxDelay?: number;
  /**
   * Whether to retry on 5xx errors only
   * @default true
   */
  retryOnServerError?: boolean;
  /**
   * Whether to retry on network errors
   * @default true
   */
  retryOnNetworkError?: boolean;
  /**
   * Callback executed before each retry
   */
  onRetry?: (attempt: number, error: Error) => void;
  /**
   * Callback when all retries exhausted
   */
  onRetryExhausted?: (error: Error) => void;
  /**
   * Whether to fetch immediately on mount
   * @default true
   */
  autoFetch?: boolean;
}

interface UseFetchWithRetryResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  retryCount: number;
  maxRetries: number;
  execute: () => Promise<T | null>;
  reset: () => void;
}

/**
 * Custom hook for fetching data with automatic retry logic and exponential backoff.
 * Handles network failures, server errors, and provides consistent error handling.
 *
 * @example
 * ```tsx
 * const { data, loading, error, execute } = useFetchWithRetry({
 *   fetchFn: () => fetch('/api/data').then(r => r.json()),
 *   retries: 3,
 *   initialDelay: 1000,
 * });
 *
 * if (loading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage error={error} onRetry={execute} />;
 * return <DataView data={data} />;
 * ```
 */
export function useFetchWithRetry<T>({
  fetchFn,
  retries = 3,
  initialDelay = 1000,
  maxDelay = 10000,
  retryOnServerError = true,
  retryOnNetworkError = true,
  onRetry,
  onRetryExhausted,
  autoFetch = true,
}: UseFetchWithRetryOptions<T>): UseFetchWithRetryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  const shouldRetry = useCallback((err: Error, attempt: number): boolean => {
    if (attempt >= retries) return false;

    const isServerError = err.message.includes("5xx") || 
                          (err instanceof Error && "status" in err && (err as any).status >= 500);
    const isNetworkError = err.message.includes("NetworkError") ||
                           err.message.includes("Failed to fetch") ||
                           err.message.includes("ECONNREFUSED");

    if (retryOnServerError && isServerError) return true;
    if (retryOnNetworkError && isNetworkError) return true;

    return false;
  }, [retries, retryOnServerError, retryOnNetworkError]);

  const calculateDelay = useCallback((attempt: number): number => {
    // Exponential backoff with jitter
    const delay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay);
    const jitter = Math.random() * 0.1 * delay;
    return Math.floor(delay + jitter);
  }, [initialDelay, maxDelay]);

  const execute = useCallback(async (): Promise<T | null> => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    let attempt = 0;

    while (attempt <= retries) {
      try {
        const result = await fetchFn();
        
        if (isMountedRef.current) {
          setData(result);
          setRetryCount(0);
          setLoading(false);
        }
        
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        
        // Don't retry if component unmounted or manually aborted
        if (!isMountedRef.current || (error.name === 'AbortError')) {
          setLoading(false);
          throw error;
        }

        // Check if we should retry
        if (shouldRetry(error, attempt)) {
          attempt++;
          
          if (isMountedRef.current) {
            setRetryCount(attempt);
            onRetry?.(attempt, error);
          }

          const delay = calculateDelay(attempt);
          
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        // No more retries or shouldn't retry
        if (isMountedRef.current) {
          setError(error);
          setLoading(false);
          if (attempt >= retries) {
            onRetryExhausted?.(error);
          }
        }
        
        throw error;
      }
    }

    return null;
  }, [fetchFn, retries, shouldRetry, calculateDelay, onRetry, onRetryExhausted]);

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setData(null);
    setError(null);
    setRetryCount(0);
    setLoading(false);
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      execute();
    }

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [execute, autoFetch]);

  return {
    data,
    loading,
    error,
    retryCount,
    maxRetries: retries,
    execute,
    reset,
  };
}
