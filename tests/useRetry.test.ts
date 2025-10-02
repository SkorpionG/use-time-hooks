import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { useRetry } from '../src/useRetry';

describe('useRetry', () => {
  it('should initialize with correct default state', () => {
    const mockOperation = vi.fn().mockResolvedValue('success');
    const { result } = renderHook(() => useRetry(mockOperation));

    expect(result.current.state).toEqual({
      isRetrying: false,
      currentAttempt: 0,
      lastError: null,
      timeUntilNextRetry: 0,
      totalAttempts: 0,
    });
  });

  it('should execute operation successfully on first attempt', async () => {
    const mockOperation = vi.fn().mockResolvedValue('success');
    const { result } = renderHook(() => useRetry(mockOperation));

    let executeResult;
    await act(async () => {
      executeResult = await result.current.execute();
    });

    expect(executeResult).toBe('success');
    expect(mockOperation).toHaveBeenCalledTimes(1);
    expect(result.current.state.isRetrying).toBe(false);
    expect(result.current.state.totalAttempts).toBe(1);
  });

  it('should retry on failure and succeed', async () => {
    const mockOperation = vi
      .fn()
      .mockRejectedValueOnce(new Error('First failure'))
      .mockResolvedValueOnce('success');

    const { result } = renderHook(() => useRetry(mockOperation, {
      maxAttempts: 2,
      initialDelay: 100,
    }));

    let executeResult;
    await act(async () => {
      const promise = result.current.execute();
      
      // Advance timers to trigger retry
      await vi.advanceTimersByTimeAsync(100);
      
      executeResult = await promise;
    });

    expect(executeResult).toBe('success');
    expect(mockOperation).toHaveBeenCalledTimes(2);
    expect(result.current.state.isRetrying).toBe(false);
    expect(result.current.state.totalAttempts).toBe(2);
  });

  it('should fail after exhausting all retry attempts', async () => {
    const error = new Error('Persistent failure');
    const mockOperation = vi.fn().mockRejectedValue(error);
    const onMaxAttemptsReached = vi.fn();

    const { result } = renderHook(() => useRetry(mockOperation, {
      maxAttempts: 2,
      initialDelay: 100,
      onMaxAttemptsReached,
    }));

    let caughtError;
    await act(async () => {
      const promise = result.current.execute().catch((e) => {
        caughtError = e;
        return e; // Return instead of throwing to prevent unhandled rejection
      });
      
      // Advance timers for first retry
      await vi.advanceTimersByTimeAsync(100);
      
      // Advance timers for second retry
      await vi.advanceTimersByTimeAsync(200); // Exponential backoff: 100 * 2
      
      await promise;
    });

    expect(caughtError).toBe(error);
    expect(mockOperation).toHaveBeenCalledTimes(3); // Initial + 2 retries
    expect(onMaxAttemptsReached).toHaveBeenCalledWith(error, 3);
    expect(result.current.state.isRetrying).toBe(false);
    expect(result.current.state.lastError).toBe(error);
  });

  it('should cancel ongoing retry operation', async () => {
    const mockOperation = vi.fn().mockRejectedValue(new Error('Failure'));

    const { result } = renderHook(() => useRetry(mockOperation, {
      maxAttempts: 3,
      initialDelay: 1000,
    }));

    await act(async () => {
      // Execute and catch the rejection to prevent unhandled error
      result.current.execute().catch(() => {});
    });
    
    // Cancel before first retry completes
    act(() => {
      result.current.cancel();
    });

    expect(result.current.state.isRetrying).toBe(false);
    expect(result.current.state.timeUntilNextRetry).toBe(0);
  });

  it('should reset state correctly', async () => {
    const mockOperation = vi.fn().mockRejectedValue(new Error('Failure'));

    const { result } = renderHook(() => useRetry(mockOperation, {
      maxAttempts: 2,
      initialDelay: 100,
    }));

    // Execute operation to change state
    await act(async () => {
      // Catch the rejection to prevent unhandled error
      result.current.execute().catch(() => {});
    });

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.state).toEqual({
      isRetrying: false,
      currentAttempt: 0,
      lastError: null,
      timeUntilNextRetry: 0,
      totalAttempts: 0,
    });
  });

  it('should handle operation with arguments', async () => {
    const mockOperation = vi.fn().mockResolvedValue('success');
    const { result } = renderHook(() => useRetry(mockOperation));

    await act(async () => {
      await (result.current.execute as any)('arg1', 'arg2', 123);
    });

    expect(mockOperation).toHaveBeenCalledWith('arg1', 'arg2', 123);
  });

  it('should cleanup timeouts on unmount', async () => {
    const mockOperation = vi.fn().mockRejectedValue(new Error('Failure'));
    const { result, unmount } = renderHook(() => useRetry(mockOperation));

    await act(async () => {
      // Catch the rejection to prevent unhandled error
      result.current.execute().catch(() => {});
    });

    unmount();

    // Should not throw any errors
    act(() => {
      vi.advanceTimersByTime(5000);
    });
  });
});
