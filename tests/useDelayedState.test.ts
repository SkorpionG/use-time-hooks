import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { useDelayedState } from '../src/useDelayedState';

describe('useDelayedState', () => {
  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useDelayedState('initial', 1000));

    expect(result.current.value).toBe('initial');
    expect(result.current.immediateValue).toBe('initial');
    expect(result.current.isPending).toBe(false);
    expect(result.current.timeRemaining).toBe(0);
  });

  it('should update immediate value instantly and delayed value after delay', () => {
    const { result } = renderHook(() => useDelayedState('initial', 1000));

    act(() => {
      result.current.setValue('updated');
    });

    // Immediate value should update right away
    expect(result.current.immediateValue).toBe('updated');
    expect(result.current.value).toBe('initial'); // Still old value
    expect(result.current.isPending).toBe(true);
    expect(result.current.timeRemaining).toBeGreaterThan(0);

    // After delay, value should update
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.value).toBe('updated');
    expect(result.current.immediateValue).toBe('updated');
    expect(result.current.isPending).toBe(false);
    expect(result.current.timeRemaining).toBe(0);
  });

  it('should handle function updates', () => {
    const { result } = renderHook(() => useDelayedState(10, 1000));

    act(() => {
      result.current.setValue((prev) => prev + 5);
    });

    expect(result.current.immediateValue).toBe(15);
    expect(result.current.value).toBe(10);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.value).toBe(15);
  });

  it('should apply first update immediately when immediate option is true', () => {
    const { result } = renderHook(() => useDelayedState('initial', 1000, true));

    act(() => {
      result.current.setValue('first-update');
    });

    // First update should be immediate
    expect(result.current.value).toBe('first-update');
    expect(result.current.immediateValue).toBe('first-update');
    expect(result.current.isPending).toBe(false);

    // Second update should be delayed
    act(() => {
      result.current.setValue('second-update');
    });

    expect(result.current.immediateValue).toBe('second-update');
    expect(result.current.value).toBe('first-update');
    expect(result.current.isPending).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.value).toBe('second-update');
  });

  it('should set value immediately with setImmediate', () => {
    const { result } = renderHook(() => useDelayedState('initial', 1000));

    act(() => {
      result.current.setImmediate('immediate-update');
    });

    expect(result.current.value).toBe('immediate-update');
    expect(result.current.immediateValue).toBe('immediate-update');
    expect(result.current.isPending).toBe(false);
    expect(result.current.timeRemaining).toBe(0);
  });

  it('should cancel pending delayed update', () => {
    const { result } = renderHook(() => useDelayedState('initial', 1000));

    act(() => {
      result.current.setValue('updated');
    });

    expect(result.current.immediateValue).toBe('updated');
    expect(result.current.value).toBe('initial');
    expect(result.current.isPending).toBe(true);

    // Cancel the pending update
    act(() => {
      result.current.cancel();
    });

    expect(result.current.immediateValue).toBe('initial'); // Reverted
    expect(result.current.value).toBe('initial');
    expect(result.current.isPending).toBe(false);
    expect(result.current.timeRemaining).toBe(0);

    // Advance time to ensure no update happens
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.value).toBe('initial');
  });

  it('should not cancel when not pending', () => {
    const { result } = renderHook(() => useDelayedState('initial', 1000));

    expect(result.current.isPending).toBe(false);

    // Cancel when not pending should not affect anything
    act(() => {
      result.current.cancel();
    });

    expect(result.current.value).toBe('initial');
    expect(result.current.immediateValue).toBe('initial');
    expect(result.current.isPending).toBe(false);
  });

  it('should override pending update with new setValue call', () => {
    const { result } = renderHook(() => useDelayedState('initial', 1000));

    // First update
    act(() => {
      result.current.setValue('first-update');
    });

    expect(result.current.immediateValue).toBe('first-update');
    expect(result.current.isPending).toBe(true);

    // Advance time partially
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Second update should override the first
    act(() => {
      result.current.setValue('second-update');
    });

    expect(result.current.immediateValue).toBe('second-update');
    expect(result.current.value).toBe('initial'); // Still original
    expect(result.current.isPending).toBe(true);

    // Complete the new delay
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.value).toBe('second-update'); // Should be second update, not first
  });

  it('should cancel pending update with setImmediate', () => {
    const { result } = renderHook(() => useDelayedState('initial', 1000));

    // Start delayed update
    act(() => {
      result.current.setValue('delayed-update');
    });

    expect(result.current.isPending).toBe(true);

    // Use setImmediate to cancel and apply different value
    act(() => {
      result.current.setImmediate('immediate-override');
    });

    expect(result.current.value).toBe('immediate-override');
    expect(result.current.immediateValue).toBe('immediate-override');
    expect(result.current.isPending).toBe(false);

    // Advance time to ensure no delayed update happens
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.value).toBe('immediate-override');
  });

  it('should update timeRemaining correctly during countdown', async () => {
    const { result } = renderHook(() => useDelayedState('initial', 1000));

    act(() => {
      result.current.setValue('updated');
    });

    expect(result.current.timeRemaining).toBe(1000);

    // Advance time partially to trigger countdown update
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    // Time remaining should be reduced (approximately, due to 100ms update interval)
    expect(result.current.timeRemaining).toBeLessThanOrEqual(500);
    expect(result.current.timeRemaining).toBeGreaterThan(0);

    // Complete the delay
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    expect(result.current.timeRemaining).toBe(0);
  });

  it('should handle different data types', () => {
    const { result: numberResult } = renderHook(() => useDelayedState(42, 100));
    const { result: objectResult } = renderHook(() => 
      useDelayedState({ name: 'test' }, 100)
    );
    const { result: arrayResult } = renderHook(() => 
      useDelayedState([1, 2, 3], 100)
    );

    expect(numberResult.current.value).toBe(42);
    expect(objectResult.current.value).toEqual({ name: 'test' });
    expect(arrayResult.current.value).toEqual([1, 2, 3]);

    // Test updates
    act(() => {
      numberResult.current.setValue(100);
      objectResult.current.setValue({ name: 'updated' });
      arrayResult.current.setValue([4, 5, 6]);
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(numberResult.current.value).toBe(100);
    expect(objectResult.current.value).toEqual({ name: 'updated' });
    expect(arrayResult.current.value).toEqual([4, 5, 6]);
  });

  it('should handle function updates with setImmediate', () => {
    const { result } = renderHook(() => useDelayedState(10, 1000));

    act(() => {
      result.current.setImmediate((prev) => prev * 2);
    });

    expect(result.current.value).toBe(20);
    expect(result.current.immediateValue).toBe(20);
  });

  it('should sync immediate value with delayed value when not pending', () => {
    const { result } = renderHook(() => useDelayedState('initial', 1000));

    // Set immediate value directly (simulating external change to delayed value)
    act(() => {
      result.current.setImmediate('synced-value');
    });

    expect(result.current.value).toBe('synced-value');
    expect(result.current.immediateValue).toBe('synced-value');
    expect(result.current.isPending).toBe(false);
  });

  it('should cleanup timers on unmount', () => {
    const { result, unmount } = renderHook(() => useDelayedState('initial', 1000));

    act(() => {
      result.current.setValue('updated');
    });

    expect(result.current.isPending).toBe(true);

    unmount();

    // Should not throw any errors and timers should be cleaned up
    act(() => {
      vi.advanceTimersByTime(1000);
    });
  });

  it('should handle rapid successive updates', () => {
    const { result } = renderHook(() => useDelayedState('initial', 1000));

    // Rapid updates
    act(() => {
      result.current.setValue('update1');
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    act(() => {
      result.current.setValue('update2');
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    act(() => {
      result.current.setValue('final-update');
    });

    expect(result.current.immediateValue).toBe('final-update');
    expect(result.current.value).toBe('initial');
    expect(result.current.isPending).toBe(true);

    // Complete the delay - should apply the final update
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.value).toBe('final-update');
  });

  it('should handle zero delay', () => {
    const { result } = renderHook(() => useDelayedState('initial', 0));

    act(() => {
      result.current.setValue('updated');
      // Advance timers to trigger the 0ms timeout
      vi.advanceTimersByTime(0);
    });

    // With zero delay, should update after the timeout completes
    expect(result.current.value).toBe('updated');
    expect(result.current.immediateValue).toBe('updated');
    expect(result.current.isPending).toBe(false);
  });

  it('should maintain correct state after multiple operations', () => {
    const { result } = renderHook(() => useDelayedState('initial', 500));

    // Set delayed value
    act(() => {
      result.current.setValue('delayed');
    });

    expect(result.current.isPending).toBe(true);

    // Cancel it
    act(() => {
      result.current.cancel();
    });

    expect(result.current.isPending).toBe(false);
    expect(result.current.value).toBe('initial');

    // Set immediate value
    act(() => {
      result.current.setImmediate('immediate');
    });

    expect(result.current.value).toBe('immediate');
    expect(result.current.immediateValue).toBe('immediate');

    // Set another delayed value
    act(() => {
      result.current.setValue('final');
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current.value).toBe('final');
  });
});
