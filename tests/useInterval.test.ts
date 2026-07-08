import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { useInterval } from '../src/useInterval.js';

describe('useInterval', () => {
  it('should execute callback repeatedly at specified interval when started', () => {
    const callback = vi.fn();
    const delay = 1000;
    const setIntervalSpy = vi.spyOn(globalThis, 'setInterval');

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

    // A single interval should serve the whole run; it must not be torn down and
    // recreated on every tick (which drifts timing and churns timers).
    expect(setIntervalSpy).toHaveBeenCalledTimes(1);
    setIntervalSpy.mockRestore();
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

  it('should cleanup interval on unmount while running', () => {
    const callback = vi.fn();
    const delay = 1000;

    const { result, unmount } = renderHook(() => useInterval(callback, delay));

    // Start so there is a live interval to clean up on unmount
    act(() => {
      result.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(delay);
    });

    expect(callback).toHaveBeenCalledTimes(1);

    unmount();

    // No further callbacks fire after the running component unmounts
    act(() => {
      vi.advanceTimersByTime(delay * 3);
    });

    expect(callback).toHaveBeenCalledTimes(1);
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

  it('should stop the interval and fire no further callbacks', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useInterval(callback, 1000));

    act(() => {
      result.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(callback).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.stop();
    });

    expect(result.current.isRunning).toBe(false);

    // No more callbacks after stopping
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should reset execution count and stop running', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useInterval(callback, 1000));

    act(() => {
      result.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.executionCount).toBe(2);

    act(() => {
      result.current.reset();
    });

    expect(result.current.isRunning).toBe(false);
    expect(result.current.executionCount).toBe(0);

    // Reset also stops, so no further executions
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('should toggle between running and stopped', () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useInterval(callback, 1000));

    expect(result.current.isRunning).toBe(false);

    // Toggle on
    act(() => {
      result.current.toggle();
    });

    expect(result.current.isRunning).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(callback).toHaveBeenCalledTimes(1);

    // Toggle off
    act(() => {
      result.current.toggle();
    });

    expect(result.current.isRunning).toBe(false);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });
});
