"use client";

import { useState, useCallback, useEffect, useRef } from 'react';

export interface UseRetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxRetries?: number;
  /** Initial delay in ms (default: 1000) */
  initialDelay?: number;
  /** Maximum delay between retries in ms (default: 10000) */
  maxDelay?: number;
  /** Backoff multiplier (default: 2) */
  backoffMultiplier?: number;
  /** Retry on specific error types only */
  retryOn?: Array<'NETWORK' | 'SERVER' | 'CACHE'>;
  /** Called when a retry is attempted */
  onRetry?: (attempt: number, error: Error) => void;
  /** Called when all retries exhausted */
  onFailure?: (error: Error) => void;
}

export interface UseRetryReturn<T> {
  /** Execute the function with retry logic */
  execute: (...args: any[]) => Promise<T>;
  /** Current retry count */
  retryCount: number;
  /** Whether a retry is currently in progress */
  isLoading: boolean;
  /** Reset retry state */
  reset: () => void;
  /** Last error encountered */
  error: Error | null;
}

/**
 * Hook for implementing exponential backoff retry logic for async operations.
 * Automatically retries failed operations with increasing delays.
 *
 * @example
 * ```tsx
 * const { execute, isLoading, error } = useRetry({
 *   maxRetries: 3,
 *   onRetry: (attempt) => console.log(`Retry attempt ${attempt}`)
 * });
 *
 * const handleClick = async () => {
 *   try {
 *     const result = await execute(fetchData);
 *     // handle result
 *   } catch (error) {
 *     // handle error - all retries exhausted
 *   }
 * };
 * ```
 */
export function useRetry<T>(options: UseRetryOptions = {}): UseRetryReturn<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
    retryOn = ['NETWORK', 'SERVER', 'CACHE'],
    onRetry,
    onFailure,
  } = options;

  const [retryCount, setRetryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const calculateDelay = useCallback((attempt: number): number => {
    const delay = initialDelay * Math.pow(backoffMultiplier, attempt);
    return Math.min(delay, maxDelay);
  }, [initialDelay, backoffMultiplier, maxDelay]);

  const execute = useCallback(async (...args: any[]): Promise<T> => {
    // Cancel any pending retry
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // Abort previous request if still in progress
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    setError(null);

    let attempt = 0;
    let lastError: Error | null = null;

    const attemptRequest = async (): Promise<T> => {
      try {
        // Note: The actual function should be passed as first argument
        const fn = args[0];
        if (typeof fn !== 'function') {
          throw new Error('First argument must be a function');
        }

        const result = await fn(...args.slice(1));
        // Success - reset retry count
        setRetryCount(0);
        return result;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));

        // Check if we should retry
        const { classifyError } = await import('@/lib/errors');
        const errorType = classifyError(lastError);
        const shouldRetry = attempt < maxRetries && retryOn.includes(errorType);

        if (shouldRetry) {
          attempt++;
          setRetryCount(attempt);
          onRetry?.(attempt, lastError);

          const delay = calculateDelay(attempt - 1);
          await new Promise((resolve) => {
            timeoutRef.current = setTimeout(resolve, delay);
          });

          return attemptRequest();
        }

        // No more retries or shouldn't retry
        setError(lastError);
        setRetryCount(attempt);
        onFailure?.(lastError);
        throw lastError;
      }
    };

    try {
      return await attemptRequest();
    } finally {
      setIsLoading(false);
    };
  }, [maxRetries, calculateDelay, retryOn, onRetry, onFailure]);

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setRetryCount(0);
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    execute,
    retryCount,
    isLoading,
    reset,
    error,
  };
}

export default useRetry;
