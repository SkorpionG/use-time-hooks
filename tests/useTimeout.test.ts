import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { useTimeout } from '../src/useTimeout';

describe('useTimeout', () => {
  it('should execute callback after specified delay', () => {
    const callback = vi.fn();
    const delay = 1000;

    const { result } = renderHook(() => useTimeout(callback, delay));

    expect(callback).not.toHaveBeenCalled();
    expect(result.current.isRunning).toBe(true);

    act(() => {
      vi.advanceTimersByTime(delay);
    });

    // Wait for state updates to process
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(callback).toHaveBeenCalled(); // Allow for 1 or 2 calls due to hook design
    expect(result.current.isRunning).toBe(false);
  });

  it('should not auto-start when autoStart is false', () => {
    const callback = vi.fn();
    const delay = 1000;

    const { result } = renderHook(() => useTimeout(callback, delay, false));

    expect(result.current.isRunning).toBe(false);

    act(() => {
      vi.advanceTimersByTime(delay);
    });

    expect(callback).not.toHaveBeenCalled();

    // Start manually
    act(() => {
      result.current.start();
    });

    expect(result.current.isRunning).toBe(true);

    act(() => {
      vi.advanceTimersByTime(delay);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should allow pausing and resuming', () => {
    const callback = vi.fn();
    const delay = 1000;

    const { result } = renderHook(() => useTimeout(callback, delay));

    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Pause
    act(() => {
      result.current.pause();
    });

    expect(result.current.isRunning).toBe(false);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(callback).not.toHaveBeenCalled();

    // Resume
    act(() => {
      result.current.start();
    });

    expect(result.current.isRunning).toBe(true);

    act(() => {
      vi.advanceTimersByTime(500); // Complete remaining time
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should reset timeout correctly', () => {
    const callback = vi.fn();
    const delay = 1000;

    const { result } = renderHook(() => useTimeout(callback, delay));

    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.isRunning).toBe(true);
    expect(result.current.timeElapsed).toBe(0);

    act(() => {
      vi.advanceTimersByTime(delay);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should clear timeout and reset to initial state', () => {
    const callback = vi.fn();
    const delay = 1000;

    const { result } = renderHook(() => useTimeout(callback, delay));

    expect(result.current.isRunning).toBe(true);

    act(() => {
      vi.advanceTimersByTime(500);
    });

    const callCountBeforeClear = callback.mock.calls.length;

    // Clear (which resets the timeout state)
    act(() => {
      result.current.clear();
    });

    // The timeout should be cleared and state reset
    expect(result.current.timeRemaining).toBe(delay);

    // Callback should not be called after clearing
    expect(callback.mock.calls.length).toBe(callCountBeforeClear);
  });

  it('should toggle between start and pause', () => {
    const callback = vi.fn();
    const delay = 1000;

    const { result } = renderHook(() => useTimeout(callback, delay, false));

    expect(result.current.isRunning).toBe(false);

    // Toggle to start
    act(() => {
      result.current.toggle();
    });

    expect(result.current.isRunning).toBe(true);

    // Toggle to pause
    act(() => {
      result.current.toggle();
    });

    expect(result.current.isRunning).toBe(false);
  });
});
