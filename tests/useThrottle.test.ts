import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { useThrottle } from '../src/useThrottle';

describe('useThrottle', () => {
  it('should execute callback immediately on first call', () => {
    const callback = vi.fn();
    const delay = 1000;

    const { result } = renderHook(() => useThrottle(callback, delay));

    act(() => {
      result.current();
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should throttle subsequent calls within delay period', () => {
    const callback = vi.fn();
    const delay = 1000;

    const { result } = renderHook(() => useThrottle(callback, delay));

    // First call - should execute immediately
    act(() => {
      result.current();
    });
    expect(callback).toHaveBeenCalledTimes(1);

    // Second call within delay - should not execute immediately
    act(() => {
      result.current();
    });
    expect(callback).toHaveBeenCalledTimes(1);

    // Advance time to complete throttle delay
    act(() => {
      vi.advanceTimersByTime(delay);
    });
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('should pass arguments to callback', () => {
    const callback = vi.fn();
    const delay = 1000;

    const { result } = renderHook(() => useThrottle(callback, delay));

    act(() => {
      result.current('arg1', 'arg2', 123);
    });

    expect(callback).toHaveBeenCalledWith('arg1', 'arg2', 123);
  });

  it('should update throttled function when callback changes', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    const delay = 1000;
    let callback = callback1;

    const { result, rerender } = renderHook(() => useThrottle(callback, delay));

    // First call with callback1
    act(() => {
      result.current();
    });
    expect(callback1).toHaveBeenCalledTimes(1);

    // Change callback
    callback = callback2;
    rerender();

    // Call again - should use new callback
    act(() => {
      vi.advanceTimersByTime(delay + 100);
      result.current();
    });

    expect(callback2).toHaveBeenCalledTimes(1);
    expect(callback1).toHaveBeenCalledTimes(1); // Should not be called again
  });

  it('should update throttle delay when delay changes', () => {
    const callback = vi.fn();
    let delay = 1000;

    const { result, rerender } = renderHook(() => useThrottle(callback, delay));

    // First call
    act(() => {
      result.current();
    });
    expect(callback).toHaveBeenCalledTimes(1);

    // Change delay
    delay = 500;
    rerender();

    // Second call - should be throttled by new delay
    act(() => {
      result.current();
    });
    expect(callback).toHaveBeenCalledTimes(1);

    // Advance by new delay
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('should cleanup timeout on unmount', () => {
    const callback = vi.fn();
    const delay = 1000;

    const { result, unmount } = renderHook(() => useThrottle(callback, delay));

    // First call - executes immediately
    act(() => {
      result.current();
    });
    expect(callback).toHaveBeenCalledTimes(1);

    // Second call - gets throttled
    act(() => {
      result.current();
    });
    expect(callback).toHaveBeenCalledTimes(1);

    // Unmount before throttled call can execute
    unmount();

    // Advance time - throttled callback should not execute due to cleanup
    act(() => {
      vi.advanceTimersByTime(delay);
    });

    expect(callback).toHaveBeenCalledTimes(1); // Only the first immediate call
  });

  it('should handle rapid successive calls correctly', () => {
    const callback = vi.fn();
    const delay = 1000;

    const { result } = renderHook(() => useThrottle(callback, delay));

    // Multiple rapid calls
    act(() => {
      result.current(); // Should execute immediately
      result.current(); // Should be throttled
      result.current(); // Should be throttled
      result.current(); // Should be throttled
    });

    expect(callback).toHaveBeenCalledTimes(1);

    // Advance time to trigger the throttled call
    act(() => {
      vi.advanceTimersByTime(delay);
    });

    expect(callback).toHaveBeenCalledTimes(2); // Only one more call from throttling
  });
});
