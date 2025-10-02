import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { useBatchedUpdates } from '../src/useBatchedUpdates';

describe('useBatchedUpdates', () => {
  it('should initialize with correct default values', () => {
    const mockFlush = vi.fn();
    const { result } = renderHook(() => useBatchedUpdates(mockFlush));

    expect(result.current.pendingUpdates).toEqual([]);
    expect(result.current.batchSize).toBe(0);
    expect(result.current.hasPendingUpdates).toBe(false);
    expect(result.current.timeUntilFlush).toBe(0);
  });

  it('should batch updates and flush after batch window', async () => {
    const mockFlush = vi.fn();
    const { result } = renderHook(() => useBatchedUpdates(mockFlush, {
      batchWindow: 100,
    }));

    // Add multiple updates
    act(() => {
      result.current.addUpdate('update1');
      result.current.addUpdate('update2');
      result.current.addUpdate('update3');
    });

    expect(result.current.pendingUpdates).toEqual(['update1', 'update2', 'update3']);
    expect(result.current.batchSize).toBe(3);
    expect(result.current.hasPendingUpdates).toBe(true);
    expect(mockFlush).not.toHaveBeenCalled();

    // Wait for batch window to complete
    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });

    expect(mockFlush).toHaveBeenCalledWith(['update1', 'update2', 'update3']);
    expect(result.current.pendingUpdates).toEqual([]);
    expect(result.current.batchSize).toBe(0);
    expect(result.current.hasPendingUpdates).toBe(false);
  });

  it('should flush immediately when max batch size is reached', async () => {
    const mockFlush = vi.fn();
    const { result } = renderHook(() => useBatchedUpdates(mockFlush, {
      maxBatchSize: 3,
      batchWindow: 1000,
    }));

    act(() => {
      result.current.addUpdate('update1');
      result.current.addUpdate('update2');
    });

    expect(mockFlush).not.toHaveBeenCalled();
    expect(result.current.batchSize).toBe(2);

    // Adding third update should trigger immediate flush
    act(() => {
      result.current.addUpdate('update3');
    });

    // Wait for setTimeout(0) to complete
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(mockFlush).toHaveBeenCalledWith(['update1', 'update2', 'update3']);
    expect(result.current.pendingUpdates).toEqual([]);
  });

  it('should flush immediately on first update when flushOnFirst is true', async () => {
    const mockFlush = vi.fn();
    const { result } = renderHook(() => useBatchedUpdates(mockFlush, {
      flushOnFirst: true,
      batchWindow: 1000,
    }));

    act(() => {
      result.current.addUpdate('first-update');
    });

    // Wait for setTimeout(0) to complete
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(mockFlush).toHaveBeenCalledWith(['first-update']);
    expect(result.current.pendingUpdates).toEqual([]);

    // Subsequent updates should be batched normally
    act(() => {
      result.current.addUpdate('second-update');
      result.current.addUpdate('third-update');
    });

    expect(result.current.batchSize).toBe(2);
    expect(mockFlush).toHaveBeenCalledTimes(1); // Only the first call
  });

  it('should manually flush pending updates', () => {
    const mockFlush = vi.fn();
    const { result } = renderHook(() => useBatchedUpdates(mockFlush, {
      batchWindow: 1000,
    }));

    act(() => {
      result.current.addUpdate('update1');
      result.current.addUpdate('update2');
    });

    expect(result.current.batchSize).toBe(2);
    expect(mockFlush).not.toHaveBeenCalled();

    // Manual flush
    act(() => {
      result.current.flush();
    });

    expect(mockFlush).toHaveBeenCalledWith(['update1', 'update2']);
    expect(result.current.pendingUpdates).toEqual([]);
    expect(result.current.batchSize).toBe(0);
  });

  it('should clear pending updates without flushing', () => {
    const mockFlush = vi.fn();
    const { result } = renderHook(() => useBatchedUpdates(mockFlush));

    act(() => {
      result.current.addUpdate('update1');
      result.current.addUpdate('update2');
    });

    expect(result.current.batchSize).toBe(2);

    // Clear without flushing
    act(() => {
      result.current.clear();
    });

    expect(result.current.pendingUpdates).toEqual([]);
    expect(result.current.batchSize).toBe(0);
    expect(result.current.hasPendingUpdates).toBe(false);
    expect(result.current.timeUntilFlush).toBe(0);
    expect(mockFlush).not.toHaveBeenCalled();

    // Advance time to ensure no flush happens
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(mockFlush).not.toHaveBeenCalled();
  });

  it('should use custom reducer function', () => {
    const mockFlush = vi.fn();
    const customReducer = vi.fn((accumulated, newUpdate) => {
      // Custom logic: only keep unique updates
      return accumulated.includes(newUpdate) ? accumulated : [...accumulated, newUpdate];
    });

    const { result } = renderHook(() => useBatchedUpdates(mockFlush, {
      reducer: customReducer,
      batchWindow: 100,
    }));

    act(() => {
      result.current.addUpdate('update1');
      result.current.addUpdate('update2');
      result.current.addUpdate('update1'); // Duplicate
    });

    expect(customReducer).toHaveBeenCalledTimes(3);
    expect(result.current.pendingUpdates).toEqual(['update1', 'update2']);

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(mockFlush).toHaveBeenCalledWith(['update1', 'update2']);
  });

  it('should call onFlush callback when flushing', () => {
    const mockFlush = vi.fn();
    const onFlush = vi.fn();

    const { result } = renderHook(() => useBatchedUpdates(mockFlush, {
      onFlush,
      batchWindow: 100,
    }));

    act(() => {
      result.current.addUpdate('update1');
      result.current.addUpdate('update2');
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(onFlush).toHaveBeenCalledWith(['update1', 'update2'], 2);
    expect(mockFlush).toHaveBeenCalledWith(['update1', 'update2']);
  });

  it('should update timeUntilFlush countdown', async () => {
    const mockFlush = vi.fn();
    const { result } = renderHook(() => useBatchedUpdates(mockFlush, {
      batchWindow: 1000,
    }));

    act(() => {
      result.current.addUpdate('update1');
    });

    expect(result.current.timeUntilFlush).toBe(1000);

    // Advance time partially - advance by 500ms to see countdown update
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    // Should be approximately 500ms remaining (with some variance due to 50ms intervals)
    expect(result.current.timeUntilFlush).toBeLessThanOrEqual(500);
    expect(result.current.timeUntilFlush).toBeGreaterThan(0);

    // Complete the batch window
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    expect(result.current.timeUntilFlush).toBe(0);
    expect(mockFlush).toHaveBeenCalled();
  });

  it('should handle different data types', () => {
    const mockFlush = vi.fn();
    const { result } = renderHook(() => useBatchedUpdates(mockFlush, {
      batchWindow: 100,
    }));

    act(() => {
      result.current.addUpdate({ id: 1, name: 'test' });
      result.current.addUpdate({ id: 2, name: 'test2' });
      result.current.addUpdate([1, 2, 3]);
    });

    expect(result.current.batchSize).toBe(3);

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(mockFlush).toHaveBeenCalledWith([
      { id: 1, name: 'test' },
      { id: 2, name: 'test2' },
      [1, 2, 3],
    ]);
  });

  it('should reset first update flag after flush', async () => {
    const mockFlush = vi.fn();
    const { result } = renderHook(() => useBatchedUpdates(mockFlush, {
      flushOnFirst: true,
    }));

    // First update should flush immediately
    act(() => {
      result.current.addUpdate('first');
    });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(mockFlush).toHaveBeenCalledWith(['first']);

    // Add more updates and flush
    act(() => {
      result.current.addUpdate('second');
      result.current.addUpdate('third');
      result.current.flush();
    });

    expect(mockFlush).toHaveBeenCalledWith(['second', 'third']);

    // Next update should again flush immediately (first update flag reset)
    act(() => {
      result.current.addUpdate('fourth');
    });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(mockFlush).toHaveBeenCalledWith(['fourth']);
  });

  it('should not flush empty batch', () => {
    const mockFlush = vi.fn();
    const { result } = renderHook(() => useBatchedUpdates(mockFlush));

    // Try to flush empty batch
    act(() => {
      result.current.flush();
    });

    expect(mockFlush).not.toHaveBeenCalled();
  });

  it('should cancel scheduled flush when manually flushed', () => {
    const mockFlush = vi.fn();
    const { result } = renderHook(() => useBatchedUpdates(mockFlush, {
      batchWindow: 1000,
    }));

    act(() => {
      result.current.addUpdate('update1');
    });

    expect(result.current.timeUntilFlush).toBeGreaterThan(0);

    // Manual flush should cancel the scheduled flush
    act(() => {
      result.current.flush();
    });

    expect(result.current.timeUntilFlush).toBe(0);
    expect(mockFlush).toHaveBeenCalledWith(['update1']);

    // Advance time to ensure no additional flush happens
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(mockFlush).toHaveBeenCalledTimes(1);
  });

  it('should restart batch window for new updates after flush', () => {
    const mockFlush = vi.fn();
    const { result } = renderHook(() => useBatchedUpdates(mockFlush, {
      batchWindow: 500,
    }));

    // First batch
    act(() => {
      result.current.addUpdate('batch1-update1');
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(mockFlush).toHaveBeenCalledWith(['batch1-update1']);

    // Second batch
    act(() => {
      result.current.addUpdate('batch2-update1');
      result.current.addUpdate('batch2-update2');
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(mockFlush).toHaveBeenCalledWith(['batch2-update1', 'batch2-update2']);
    expect(mockFlush).toHaveBeenCalledTimes(2);
  });

  it('should handle rapid successive updates', () => {
    const mockFlush = vi.fn();
    const { result } = renderHook(() => useBatchedUpdates(mockFlush, {
      batchWindow: 100,
      maxBatchSize: 10,
    }));

    // Add many updates rapidly
    act(() => {
      for (let i = 0; i < 5; i++) {
        result.current.addUpdate(`update-${i}`);
      }
    });

    expect(result.current.batchSize).toBe(5);
    expect(mockFlush).not.toHaveBeenCalled();

    // Wait for batch window
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(mockFlush).toHaveBeenCalledWith([
      'update-0',
      'update-1',
      'update-2',
      'update-3',
      'update-4',
    ]);
    expect(result.current.pendingUpdates).toEqual([]);
  });

  it('should cleanup timers on unmount', () => {
    const mockFlush = vi.fn();
    const { result, unmount } = renderHook(() => useBatchedUpdates(mockFlush));

    act(() => {
      result.current.addUpdate('update1');
    });

    expect(result.current.batchSize).toBe(1);

    unmount();

    // Should not throw any errors and timers should be cleaned up
    act(() => {
      vi.advanceTimersByTime(1000);
    });
  });

  it('should flush pending updates on unmount', () => {
    const mockFlush = vi.fn();
    const { result, unmount } = renderHook(() => useBatchedUpdates(mockFlush));

    act(() => {
      result.current.addUpdate('update1');
      result.current.addUpdate('update2');
    });

    expect(mockFlush).not.toHaveBeenCalled();

    unmount();

    // The unmount effect runs synchronously and calls the flush callback
    // Note: This happens in the cleanup effect, so it should be called
    expect(mockFlush).toHaveBeenCalled();
    expect(mockFlush).toHaveBeenCalledWith(['update1', 'update2']);
  });

  it('should handle edge case of zero batch window', () => {
    const mockFlush = vi.fn();
    const { result } = renderHook(() => useBatchedUpdates(mockFlush, {
      batchWindow: 0,
    }));

    act(() => {
      result.current.addUpdate('update1');
      // Advance timers to trigger the flush with 0 delay
      vi.advanceTimersByTime(0);
    });

    // With zero batch window, should flush immediately
    expect(mockFlush).toHaveBeenCalledWith(['update1']);
    expect(result.current.pendingUpdates).toEqual([]);
  });

  it('should handle multiple flushes correctly', () => {
    const mockFlush = vi.fn();
    const { result } = renderHook(() => useBatchedUpdates(mockFlush, {
      batchWindow: 100,
    }));

    // First batch
    act(() => {
      result.current.addUpdate('first-batch');
    });

    act(() => {
      result.current.flush();
    });

    expect(mockFlush).toHaveBeenCalledWith(['first-batch']);

    // Second batch
    act(() => {
      result.current.addUpdate('second-batch-1');
      result.current.addUpdate('second-batch-2');
    });

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(mockFlush).toHaveBeenCalledWith(['second-batch-1', 'second-batch-2']);
    expect(mockFlush).toHaveBeenCalledTimes(2);
  });

  it('should maintain correct state after clear operation', async () => {
    const mockFlush = vi.fn();
    const { result } = renderHook(() => useBatchedUpdates(mockFlush, {
      flushOnFirst: true,
    }));

    // Add update (should flush immediately due to flushOnFirst)
    act(() => {
      result.current.addUpdate('first');
    });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    // Add more updates
    act(() => {
      result.current.addUpdate('second');
      result.current.addUpdate('third');
    });

    expect(result.current.batchSize).toBe(2);

    // Clear
    act(() => {
      result.current.clear();
    });

    // Next update should flush immediately again (first update flag reset)
    act(() => {
      result.current.addUpdate('after-clear');
    });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(mockFlush).toHaveBeenCalledWith(['after-clear']);
  });
});
