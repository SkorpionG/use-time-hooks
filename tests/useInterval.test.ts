import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { useInterval } from '../src/useInterval';

describe('useInterval', () => {
  it('should execute callback repeatedly at specified interval when started', () => {
    const callback = vi.fn();
    const delay = 1000;

    const { result } = renderHook(() => useInterval(callback, delay));

    expect(callback).not.toHaveBeenCalled();
    expect(result.current.isRunning).toBe(false);

    // Start the interval
    act(() => {
      result.current.start();
    });

    expect(result.current.isRunning).toBe(true);

    // First execution
    act(() => {
      vi.advanceTimersByTime(delay);
    });
    expect(callback).toHaveBeenCalledTimes(1);
    expect(result.current.executionCount).toBe(1);

    // Second execution
    act(() => {
      vi.advanceTimersByTime(delay);
    });
    expect(callback).toHaveBeenCalledTimes(2);
    expect(result.current.executionCount).toBe(2);
  });

  it('should execute callback immediately when immediate is true and started', () => {
    const callback = vi.fn();
    const delay = 1000;

    const { result } = renderHook(() => useInterval(callback, delay, true));

    expect(callback).not.toHaveBeenCalled();
    expect(result.current.isRunning).toBe(false);

    // Start the interval - should execute immediately due to immediate=true
    act(() => {
      result.current.start();
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(result.current.executionCount).toBe(1);
    expect(result.current.isRunning).toBe(true);

    act(() => {
      vi.advanceTimersByTime(delay);
    });

    expect(callback).toHaveBeenCalledTimes(2);
    expect(result.current.executionCount).toBe(2);
  });

  it('should reset interval when delay changes', () => {
    const callback = vi.fn();
    let delay = 1000;

    const { result, rerender } = renderHook(() => useInterval(callback, delay));

    // Start the interval
    act(() => {
      result.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Change delay before first interval completes
    delay = 2000;
    rerender();

    act(() => {
      vi.advanceTimersByTime(1500); // Total 2000ms from rerender
    });

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(500); // Complete the 2000ms interval
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should cleanup interval on unmount', () => {
    const callback = vi.fn();
    const delay = 1000;

    const { unmount } = renderHook(() => useInterval(callback, delay));

    unmount();

    act(() => {
      vi.advanceTimersByTime(delay * 3);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('should update callback without resetting interval', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    const delay = 1000;
    let callback = callback1;

    const { result, rerender } = renderHook(() => useInterval(callback, delay));

    // Start the interval
    act(() => {
      result.current.start();
    });

    // Change callback before first execution
    callback = callback2;
    rerender();

    act(() => {
      vi.advanceTimersByTime(delay);
    });

    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledTimes(1);
  });
});
