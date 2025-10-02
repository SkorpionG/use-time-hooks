import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useSequentialExecution, ExecutionStep } from '../src/useSequentialExecution';

describe('useSequentialExecution', () => {
  it('should throw error with empty steps array', () => {
    expect(() => {
      renderHook(() => useSequentialExecution([]));
    }).toThrow('useSequentialExecution: steps array cannot be empty');
  });

  it('should initialize with correct default values', () => {
    const steps: ExecutionStep[] = [
      { fn: vi.fn(), timeout: 1000, id: 'step1' }
    ];

    const { result } = renderHook(() => useSequentialExecution(steps));

    expect(result.current.isRunning).toBe(false);
    expect(result.current.currentStepIndex).toBe(0);
    expect(result.current.cyclesCompleted).toBe(0);
    expect(result.current.timeRemaining).toBe(0);
    expect(result.current.currentStep).toEqual(steps[0]);
  });

  it('should auto-start when autoStart is true', () => {
    const steps: ExecutionStep[] = [
      { fn: vi.fn(), timeout: 1000, id: 'step1' }
    ];

    const { result } = renderHook(() => useSequentialExecution(steps, true, true));

    // Auto-start should set isRunning to true
    expect(result.current.isRunning).toBe(true);
    expect(result.current.currentStepIndex).toBe(0);
  });

  it('should start and stop execution correctly', () => {
    const steps: ExecutionStep[] = [
      { fn: vi.fn(), timeout: 1000, id: 'step1' }
    ];

    const { result } = renderHook(() => useSequentialExecution(steps));

    // Initially stopped
    expect(result.current.isRunning).toBe(false);

    // Start execution
    act(() => {
      result.current.start();
    });

    expect(result.current.isRunning).toBe(true);
    expect(result.current.timeRemaining).toBeGreaterThan(0);

    // Stop execution
    act(() => {
      result.current.stop();
    });

    expect(result.current.isRunning).toBe(false);
    expect(result.current.timeRemaining).toBe(0);
  });

  it('should toggle between start and stop', () => {
    const steps: ExecutionStep[] = [
      { fn: vi.fn(), timeout: 1000, id: 'step1' }
    ];

    const { result } = renderHook(() => useSequentialExecution(steps));

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

  it('should execute steps sequentially', async () => {
    const mockFn1 = vi.fn();
    const mockFn2 = vi.fn();
    const mockFn3 = vi.fn();

    const steps: ExecutionStep[] = [
      { fn: mockFn1, timeout: 100, id: 'step1' },
      { fn: mockFn2, timeout: 200, id: 'step2' },
      { fn: mockFn3, timeout: 150, id: 'step3' }
    ];

    const { result } = renderHook(() => useSequentialExecution(steps));

    act(() => {
      result.current.start();
    });

    expect(result.current.isRunning).toBe(true);
    expect(result.current.currentStepIndex).toBe(0);

    // Execute first step
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });

    expect(mockFn1).toHaveBeenCalledTimes(1);

    // Execute second step
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });

    expect(mockFn2).toHaveBeenCalledTimes(1);

    // Execute third step
    await act(async () => {
      await vi.advanceTimersByTimeAsync(150);
    });

    expect(mockFn3).toHaveBeenCalledTimes(1);
    expect(result.current.cyclesCompleted).toBe(1);
  });

  it('should stop after one cycle when loop is false', async () => {
    const mockFn1 = vi.fn();
    const mockFn2 = vi.fn();

    const steps: ExecutionStep[] = [
      { fn: mockFn1, timeout: 100, id: 'step1' },
      { fn: mockFn2, timeout: 200, id: 'step2' }
    ];

    const { result } = renderHook(() => useSequentialExecution(steps, false));

    act(() => {
      result.current.start();
    });

    // Execute first step
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });

    expect(mockFn1).toHaveBeenCalledTimes(1);
    expect(result.current.isRunning).toBe(true);

    // Execute second step
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });

    expect(mockFn2).toHaveBeenCalledTimes(1);
    expect(result.current.isRunning).toBe(false); // Should stop
    expect(result.current.cyclesCompleted).toBe(1);
  });

  it('should reset to initial state', () => {
    const steps: ExecutionStep[] = [
      { fn: vi.fn(), timeout: 100, id: 'step1' },
      { fn: vi.fn(), timeout: 200, id: 'step2' }
    ];

    const { result } = renderHook(() => useSequentialExecution(steps));

    act(() => {
      result.current.start();
    });

    // Advance to next step
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current.cyclesCompleted).toBe(0);

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.isRunning).toBe(false);
    expect(result.current.currentStepIndex).toBe(0);
    expect(result.current.cyclesCompleted).toBe(0);
    expect(result.current.timeRemaining).toBe(0);
  });

  it('should handle async functions', async () => {
    const asyncFn = vi.fn().mockResolvedValue('success');
    const steps: ExecutionStep[] = [
      { fn: asyncFn, timeout: 100, id: 'asyncStep' }
    ];

    const { result } = renderHook(() => useSequentialExecution(steps));

    act(() => {
      result.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(asyncFn).toHaveBeenCalledTimes(1);
  });

  it('should handle function errors gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const errorFn = vi.fn().mockImplementation(() => {
      throw new Error('Test error');
    });

    const steps: ExecutionStep[] = [
      { fn: errorFn, timeout: 100, id: 'errorStep' }
    ];

    const { result } = renderHook(() => useSequentialExecution(steps));

    act(() => {
      result.current.start();
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(errorFn).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith('Error executing step 0:', expect.any(Error));

    consoleSpy.mockRestore();
  });

  it('should update time remaining correctly', () => {
    const steps: ExecutionStep[] = [
      { fn: vi.fn(), timeout: 1000, id: 'step1' }
    ];

    const { result } = renderHook(() => useSequentialExecution(steps));

    act(() => {
      result.current.start();
    });

    expect(result.current.timeRemaining).toBe(1000);

    // Advance time partially
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Time remaining should be updated (approximately, due to 100ms interval)
    expect(result.current.timeRemaining).toBeLessThan(1000);
    expect(result.current.timeRemaining).toBeGreaterThan(0);
  });

  it('should cleanup timeouts on unmount', () => {
    const steps: ExecutionStep[] = [
      { fn: vi.fn(), timeout: 1000, id: 'step1' }
    ];

    const { result, unmount } = renderHook(() => useSequentialExecution(steps));

    act(() => {
      result.current.start();
    });

    expect(result.current.isRunning).toBe(true);

    unmount();

    // Should not throw any errors and timeouts should be cleaned up
    act(() => {
      vi.advanceTimersByTime(1000);
    });
  });

  it('should not start if already running', () => {
    const steps: ExecutionStep[] = [
      { fn: vi.fn(), timeout: 1000, id: 'step1' }
    ];

    const { result } = renderHook(() => useSequentialExecution(steps));

    act(() => {
      result.current.start();
    });

    expect(result.current.isRunning).toBe(true);
    const initialTimeRemaining = result.current.timeRemaining;

    // Try to start again
    act(() => {
      result.current.start();
    });

    // Should still be running with same time remaining
    expect(result.current.isRunning).toBe(true);
    expect(result.current.timeRemaining).toBe(initialTimeRemaining);
  });
});
