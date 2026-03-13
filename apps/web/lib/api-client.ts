/**
 * API Client with centralized error handling, retry logic, and caching
 * Provides a consistent way to fetch data from the API with proper error management
 */

import { createAppError, classifyError, isRetryable, AppError, ErrorType } from './errors';
import { cache, withCache, CACHE_TTL, generateCacheKey } from './cache';

export interface ApiRequestOptions {
  /** Cache key prefix for this request */
  cacheKey?: string;
  /** Cache TTL in seconds (overrides default) */
  cacheTtl?: number;
  /** Skip cache entirely */
  skipCache?: boolean;
  /** Number of retry attempts for failed requests (default: 3) */
  retries?: number;
  /** Retry delay in ms (default: 1000, uses exponential backoff) */
  retryDelay?: number;
  /** Whether to throw on error (default: true) */
  throwOnError?: boolean;
  /** Additional fetch options */
  fetchOptions?: RequestInit;
}

export interface ApiResponse<T> {
  data: T;
  fromCache: boolean;
  cachedAt?: Date;
}

/**
 * API Client for making HTTP requests with built-in error handling, retry, and caching
 */
export class ApiClient {
  private baseUrl: string;
  private defaultRetries: number;
  private defaultRetryDelay: number;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
    this.defaultRetries = 3;
    this.defaultRetryDelay = 1000;
  }

  /**
   * Make an HTTP request with retry logic
   */
  async request<T>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      cacheKey,
      cacheTtl,
      skipCache = false,
      retries = this.defaultRetries,
      retryDelay = this.defaultRetryDelay,
      throwOnError = true,
      fetchOptions = {},
    } = options;

    const url = `${this.baseUrl}${endpoint}`;
    const shouldCache = cacheKey && !skipCache;
    const finalCacheTtl = cacheTtl || 300; // 5 min default

    // Try cache first if applicable
    if (shouldCache) {
      try {
        const cached = await cache.get<T>(cacheKey);
        if (cached !== null) {
          console.log(`📋 Cache HIT: ${cacheKey}`);
          return { data: cached, fromCache: true };
        }
        console.log(`📋 Cache MISS: ${cacheKey}`);
      } catch (error) {
        console.warn(`Cache read failed for ${cacheKey}:`, error);
        // Continue to fetch even if cache fails
      }
    }

    // Fetch with retry logic
    let lastError: Error | null = null;
    let attempt = 0;

    while (attempt <= retries) {
      try {
        const response = await fetch(url, {
          ...fetchOptions,
          headers: {
            'Content-Type': 'application/json',
            ...fetchOptions.headers,
          },
        });

        // Handle HTTP errors
        if (!response.ok) {
          let errorData: any = null;
          try {
            errorData = await response.json();
          } catch {
            // If response is not JSON, use status text
          }

          const error = new Error(
            errorData?.error?.message || response.statusText || 'Request failed'
          );
          (error as AppError).statusCode = response.status;
          (error as AppError).details = errorData;

          throw error;
        }

        // Parse response data
        let data: T;
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          data = await response.json();
        } else {
          // For non-JSON responses, return text
          data = await response.text() as unknown as T;
        }

        // Cache successful response if applicable
        if (shouldCache && response.ok) {
          try {
            await cache.set(cacheKey, data, finalCacheTtl);
          } catch (error) {
            console.warn(`Cache write failed for ${cacheKey}:`, error);
          }
        }

        return { data, fromCache: false };
      } catch (error: any) {
        lastError = error;

        // Don't retry if error is not retryable
        const errorType = classifyError(error);
        if (!isRetryable(errorType, error.statusCode)) {
          break;
        }

        // Wait before retry (exponential backoff with jitter)
        if (attempt < retries) {
          const delay = Math.min(
            retryDelay * Math.pow(2, attempt) + Math.random() * 1000,
            10000 // Max 10 seconds
          );
          console.log(`Retrying ${endpoint} in ${Math.round(delay)}ms (attempt ${attempt + 1}/${retries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        attempt++;
      }
    }

    // All retries exhausted or non-retryable error
    const appError = createAppError(lastError!, {
      userMessage: this.getUserFriendlyMessage(lastError!),
      retryable: false, // All retries exhausted
    });

    if (throwOnError) {
      throw appError;
    }

    // Return empty data structure if not throwing
    return { data: null as any, fromCache: false };
  }

  /**
   * Get user-friendly error message based on error type
   */
  private getUserFriendlyMessage(error: Error): string {
    // Check if it's an AppError by looking for the type property
    if ('type' in error && error.type && Object.values(ErrorType).includes(error.type as ErrorType)) {
      return (error as any).userMessage || error.message;
    }

    const type = classifyError(error);
    const messages: Record<ErrorType, string> = {
      [ErrorType.NETWORK]: 'Network error. Please check your connection and try again.',
      [ErrorType.VALIDATION]: 'The request contained invalid data.',
      [ErrorType.AUTHENTICATION]: 'Authentication required. Please log in.',
      [ErrorType.AUTHORIZATION]: 'You do not have permission to perform this action.',
      [ErrorType.NOT_FOUND]: 'The requested resource was not found.',
      [ErrorType.SERVER]: 'Server error. Please try again later.',
      [ErrorType.DATABASE]: 'Database error. Please try again.',
      [ErrorType.CACHE]: 'Cache service unavailable, but fetching data directly.',
      [ErrorType.UNKNOWN]: 'An unexpected error occurred. Please try again.',
    };
    return messages[type] || messages[ErrorType.UNKNOWN];
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      fetchOptions: { method: 'GET', ...options.fetchOptions },
    });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      fetchOptions: {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
        ...options.fetchOptions,
      },
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      fetchOptions: {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
        ...options.fetchOptions,
      },
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      fetchOptions: { method: 'DELETE', ...options.fetchOptions },
    });
  }

  /**
   * Invalidate cache for a specific pattern
   */
  async invalidateCache(pattern: string): Promise<number> {
    try {
      const count = await cache.invalidatePattern(pattern);
      console.log(`🗑️  Invalidated ${count} cache keys for pattern: ${pattern}`);
      return count;
    } catch (error) {
      console.error('Cache invalidation failed:', error);
      return 0;
    }
  }

  /**
   * Clear all cache (use with caution)
   */
  async clearCache(): Promise<boolean> {
    try {
      const result = await cache.flush();
      if (result) {
        console.log('🗑️  Cache cleared successfully');
      }
      return result;
    } catch (error) {
      console.error('Cache clear failed:', error);
      return false;
    }
  }
}

// Singleton instance with environment-based configuration
const getDefaultBaseUrl = () => {
  // Use environment variable if set (for separate backend deployments)
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  // For server-side rendering, also check env
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  // Default to relative path for same-origin deployments
  return '/api';
};

export const apiClient = new ApiClient(getDefaultBaseUrl());

/**
 * Factory function to create API client with custom base URL
 */
export function createApiClient(baseUrl: string): ApiClient {
  return new ApiClient(baseUrl);
}
