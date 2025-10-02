import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { useStopwatch } from '../src/useStopwatch';

describe('useStopwatch', () => {
  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useStopwatch());

    expect(result.current.isRunning).toBe(false);
    expect(result.current.elapsedTime).toBe(0);
    expect(result.current.lapTimes).toEqual([]);
    expect(result.current.formattedTime).toBe('00:00.00');
  });

  it('should start and stop correctly', () => {
    const { result } = renderHook(() => useStopwatch());

    // Initially stopped
    expect(result.current.isRunning).toBe(false);

    // Start stopwatch
    act(() => {
      result.current.start();
    });

    expect(result.current.isRunning).toBe(true);

    // Stop stopwatch
    act(() => {
      result.current.stop();
    });

    expect(result.current.isRunning).toBe(false);
  });

  it('should toggle between start and stop', () => {
    const { result } = renderHook(() => useStopwatch());

    // Initially stopped
    expect(result.current.isRunning).toBe(false);

    // Toggle to start
    act(() => {
      result.current.toggle();
    });

    expect(result.current.isRunning).toBe(true);

    // Toggle to stop
    act(() => {
      result.current.toggle();
    });

    expect(result.current.isRunning).toBe(false);
  });

  it('should track elapsed time when running', () => {
    const { result } = renderHook(() => useStopwatch(100)); // 100ms precision for faster testing

    act(() => {
      result.current.start();
    });

    expect(result.current.elapsedTime).toBe(0);

    // Advance time
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.elapsedTime).toBeGreaterThan(900);
    expect(result.current.elapsedTime).toBeLessThan(1100);
  });

  it('should reset to initial state', () => {
    const { result } = renderHook(() => useStopwatch());

    // Start and run for some time
    act(() => {
      result.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    act(() => {
      result.current.stop();
    });

    expect(result.current.elapsedTime).toBeGreaterThan(0);

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.isRunning).toBe(false);
    expect(result.current.elapsedTime).toBe(0);
    expect(result.current.lapTimes).toEqual([]);
    expect(result.current.formattedTime).toBe('00:00.00');
  });

  it('should preserve elapsed time when stopped and restarted', () => {
    const { result } = renderHook(() => useStopwatch());

    // Start and run
    act(() => {
      result.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Stop
    act(() => {
      result.current.stop();
    });

    const elapsedAfterStop = result.current.elapsedTime;
    expect(elapsedAfterStop).toBeGreaterThan(900);

    // Restart
    act(() => {
      result.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Should continue from where it left off
    expect(result.current.elapsedTime).toBeGreaterThan(elapsedAfterStop + 400);
  });

  it('should record lap times correctly', () => {
    const { result } = renderHook(() => useStopwatch());

    act(() => {
      result.current.start();
    });

    // First lap
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    let lapTime;
    act(() => {
      lapTime = result.current.lap();
    });

    expect(lapTime).toEqual({
      lapNumber: 1,
      lapTime: expect.any(Number),
      totalTime: expect.any(Number),
      splitTime: expect.any(Number),
    });

    expect(result.current.lapTimes).toHaveLength(1);
    expect(result.current.lapTimes[0].lapNumber).toBe(1);

    // Second lap
    act(() => {
      vi.advanceTimersByTime(500);
    });

    act(() => {
      lapTime = result.current.lap();
    });

    expect(result.current.lapTimes).toHaveLength(2);
    expect(result.current.lapTimes[1].lapNumber).toBe(2);
    expect(result.current.lapTimes[1].splitTime).toBeGreaterThan(400);
  });

  it('should throw error when trying to lap while stopped', () => {
    const { result } = renderHook(() => useStopwatch());

    expect(() => {
      act(() => {
        result.current.lap();
      });
    }).toThrow('Cannot record lap time when stopwatch is not running');
  });

  it('should clear lap times', () => {
    const { result } = renderHook(() => useStopwatch());

    act(() => {
      result.current.start();
    });

    // Record some laps
    act(() => {
      vi.advanceTimersByTime(1000);
      result.current.lap();
    });

    act(() => {
      vi.advanceTimersByTime(500);
      result.current.lap();
    });

    expect(result.current.lapTimes).toHaveLength(2);

    // Clear laps
    act(() => {
      result.current.clearLaps();
    });

    expect(result.current.lapTimes).toEqual([]);
  });

  it('should format time correctly', () => {
    const { result } = renderHook(() => useStopwatch());

    // Test different time formats
    act(() => {
      result.current.start();
    });

    // Less than a minute
    act(() => {
      vi.advanceTimersByTime(5500); // 5.5 seconds
    });

    expect(result.current.formattedTime).toMatch(/00:05\.\d{2}/);

    // More than a minute
    act(() => {
      vi.advanceTimersByTime(65000); // 65 seconds total (1:10)
    });

    expect(result.current.formattedTime).toMatch(/01:10\.\d{2}/);
  });

  it('should handle different precision values', () => {
    const { result: result10ms } = renderHook(() => useStopwatch(10));
    const { result: result100ms } = renderHook(() => useStopwatch(100));

    // Both should work with different precisions
    act(() => {
      result10ms.current.start();
      result100ms.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result10ms.current.elapsedTime).toBeGreaterThan(900);
    expect(result100ms.current.elapsedTime).toBeGreaterThan(900);
  });

  it('should not start if already running', () => {
    const { result } = renderHook(() => useStopwatch());

    act(() => {
      result.current.start();
    });

    expect(result.current.isRunning).toBe(true);

    // Try to start again - should not affect state
    act(() => {
      result.current.start();
    });

    expect(result.current.isRunning).toBe(true);
  });

  it('should not stop if already stopped', () => {
    const { result } = renderHook(() => useStopwatch());

    expect(result.current.isRunning).toBe(false);

    // Try to stop when already stopped
    act(() => {
      result.current.stop();
    });

    expect(result.current.isRunning).toBe(false);
    expect(result.current.elapsedTime).toBe(0);
  });

  it('should cleanup intervals on unmount', () => {
    const { result, unmount } = renderHook(() => useStopwatch());

    act(() => {
      result.current.start();
    });

    expect(result.current.isRunning).toBe(true);

    unmount();

    // Should not throw any errors
    act(() => {
      vi.advanceTimersByTime(1000);
    });
  });

  it('should calculate split times correctly', () => {
    const { result } = renderHook(() => useStopwatch());

    act(() => {
      result.current.start();
    });

    // First lap at 1 second
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    let lap1;
    act(() => {
      lap1 = result.current.lap();
    });

    expect(lap1.splitTime).toBeGreaterThan(900);
    expect(lap1.splitTime).toBeLessThan(1100);

    // Second lap at 1.5 seconds total (0.5 second split)
    act(() => {
      vi.advanceTimersByTime(500);
    });

    let lap2;
    act(() => {
      lap2 = result.current.lap();
    });

    expect(lap2.splitTime).toBeGreaterThan(400);
    expect(lap2.splitTime).toBeLessThan(600);
    expect(lap2.totalTime).toBeGreaterThan(1400);
    expect(lap2.totalTime).toBeLessThan(1600);
  });

  it('should reset lap reference when clearing laps', () => {
    const { result } = renderHook(() => useStopwatch());

    act(() => {
      result.current.start();
    });

    // Record a lap
    act(() => {
      vi.advanceTimersByTime(1000);
      result.current.lap();
    });

    // Clear laps
    act(() => {
      result.current.clearLaps();
    });

    // Record another lap - should calculate split from beginning
    act(() => {
      vi.advanceTimersByTime(500);
    });

    let newLap;
    act(() => {
      newLap = result.current.lap();
    });

    expect(newLap.splitTime).toBeGreaterThan(1400); // Should be total time since start
  });
});
