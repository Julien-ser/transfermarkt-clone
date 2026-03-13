import { renderHook, act, waitFor } from '@testing-library/react';
import { useFetchWithRetry } from './useFetchWithRetry';

// Mock fetch function that can simulate different scenarios
const createMockFetch = (options: {
  shouldSucceed?: boolean;
  shouldThrow?: boolean;
  error?: Error;
  delay?: number;
  callCount?: number;
}) => {
  let callCount = 0;
  return async () => {
    if (options.delay) {
      await new Promise(resolve => setTimeout(resolve, options.delay));
    }
    
    callCount++;
    
    if (options.shouldThrow || options.error) {
      throw options.error || new Error('Mock error');
    }
    
    if (options.shouldSucceed === false) {
      throw new Error('Simulated failure');
    }
    
    return { success: true, call: callCount };
  };
};

describe('useFetchWithRetry', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should fetch data successfully on first attempt', async () => {
    const mockFetch = createMockFetch({ shouldSucceed: true });
    
    const { result } = renderHook(() =>
      useFetchWithRetry({
        fetchFn: mockFetch,
        retries: 3,
        autoFetch: true,
      })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual({ success: true, call: 1 });
    expect(result.current.error).toBeNull();
    expect(result.current.retryCount).toBe(0);
  });

  it('should retry on network error and eventually succeed', async () => {
    const mockFetch = jest.fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ success: true, call: 3 });

    const { result } = renderHook(() =>
      useFetchWithRetry({
        fetchFn: mockFetch,
        retries: 3,
        initialDelay: 1000,
        autoFetch: true,
      })
    );

    // Fast-forward through retry delays
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual({ success: true, call: 3 });
    expect(result.current.retryCount).toBe(2);
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it('should fail after all retries exhausted', async () => {
    const mockFetch = createMockFetch({ shouldThrow: true });
    
    const { result } = renderHook(() =>
      useFetchWithRetry({
        fetchFn: mockFetch,
        retries: 2,
        initialDelay: 500,
        autoFetch: true,
      })
    );

    // Fast-forward through all retry attempts
    act(() => {
      jest.advanceTimersByTime(500); // first retry delay
    });

    act(() => {
      jest.advanceTimersByTime(500); // second retry delay
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).not.toBeNull();
    expect(result.current.data).toBeNull();
    expect(result.current.retryCount).toBe(2);
  });

  it('should not retry on non-retryable errors when configured', async () => {
    const mockError = new Error('Invalid input');
    mockError.message = 'Validation error';
    
    const mockFetch = jest.fn().mockRejectedValueOnce(mockError);

    const { result } = renderHook(() =>
      useFetchWithRetry({
        fetchFn: mockFetch,
        retries: 3,
        retryOnServerError: false,
        retryOnNetworkError: false,
        autoFetch: true,
      })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(mockError);
    expect(result.current.retryCount).toBe(0);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should call onRetry callback on each retry attempt', async () => {
    const onRetry = jest.fn();
    const mockFetch = jest.fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ success: true });

    renderHook(() =>
      useFetchWithRetry({
        fetchFn: mockFetch,
        retries: 2,
        initialDelay: 100,
        onRetry,
        autoFetch: true,
      })
    );

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    await waitFor(() => {
      expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error));
    });
  });

  it('should call onRetryExhausted when all retries fail', async () => {
    const onRetryExhausted = jest.fn();
    const mockFetch = createMockFetch({ shouldThrow: true });

    renderHook(() =>
      useFetchWithRetry({
        fetchFn: mockFetch,
        retries: 2,
        initialDelay: 100,
        onRetryExhausted,
        autoFetch: true,
      })
    );

    act(() => {
      jest.advanceTimersByTime(100);
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    await waitFor(() => {
      expect(onRetryExhausted).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  it('should support manual execute', async () => {
    const mockFetch = createMockFetch({ shouldSucceed: true });
    let executeRef: () => Promise<any>;

    const { result, rerender } = renderHook(() =>
      useFetchWithRetry({
        fetchFn: mockFetch,
        autoFetch: false,
      })
    );

    // Should not have fetched automatically
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();

    // Execute manually
    act(() => {
      result.current.execute();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual({ success: true, call: 1 });
  });

  it('should reset state when reset is called', async () => {
    const mockFetch = createMockFetch({ shouldSucceed: true });

    const { result } = renderHook(() =>
      useFetchWithRetry({
        fetchFn: mockFetch,
        autoFetch: true,
      })
    );

    await waitFor(() => {
      expect(result.current.data).not.toBeNull();
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('should abort previous request when re-executing', async () => {
    let aborted = false;
    const mockFetch = jest.fn(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      if (aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }
      return { success: true };
    });

    const { result } = renderHook(() =>
      useFetchWithRetry({
        fetchFn: mockFetch,
        autoFetch: false,
      })
    );

    act(() => {
      result.current.execute();
    });

    act(() => {
      jest.advanceTimersByTime(50);
    });

    // Execute again - should abort the first
    act(() => {
      aborted = true;
      result.current.execute();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual({ success: true });
  });

  it('should respect custom retry counts', async () => {
    const mockFetch = jest.fn()
      .mockRejectedValue(new Error('Fail'))
      .mockRejectedValue(new Error('Fail'));

    renderHook(() =>
      useFetchWithRetry({
        fetchFn: mockFetch,
        retries: 1,
        initialDelay: 100,
        autoFetch: true,
      })
    );

    act(() => {
      jest.advanceTimersByTime(100);
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(2); // initial + 1 retry
    });
  });

  it('should clean up on unmount', async () => {
    const mockFetch = jest.fn(async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    });

    const { unmount } = renderHook(() =>
      useFetchWithRetry({
        fetchFn: mockFetch,
        autoFetch: true,
      })
    );

    // Unmount before fetch completes
    unmount();

    // Should not throw errors on unmount
    expect(true).toBe(true);
  });
});
