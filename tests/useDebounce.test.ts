import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { useDebounce } from '../src/useDebounce';

describe('useDebounce', () => {
  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 1000));

    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', () => {
    let value = 'initial';
    const delay = 1000;

    const { result, rerender } = renderHook(() => useDebounce(value, delay));

    expect(result.current).toBe('initial');

    // Change value
    value = 'updated';
    rerender();

    // Value should not change immediately
    expect(result.current).toBe('initial');

    // Advance time but not enough to trigger debounce
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe('initial');

    // Complete the debounce delay
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current).toBe('updated');
  });

  it('should reset debounce timer on rapid changes', () => {
    let value = 'initial';
    const delay = 1000;

    const { result, rerender } = renderHook(() => useDebounce(value, delay));

    // First change
    value = 'change1';
    rerender();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Second change before first debounce completes
    value = 'change2';
    rerender();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Should still be initial value
    expect(result.current).toBe('initial');

    // Complete the debounce delay for second change
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe('change2');
  });

  it('should handle different data types', () => {
    const { result: numberResult } = renderHook(() => useDebounce(42, 100));
    const { result: objectResult } = renderHook(() =>
      useDebounce({ name: 'test' }, 100)
    );
    const { result: arrayResult } = renderHook(() =>
      useDebounce([1, 2, 3], 100)
    );

    expect(numberResult.current).toBe(42);
    expect(objectResult.current).toEqual({ name: 'test' });
    expect(arrayResult.current).toEqual([1, 2, 3]);
  });

  it('should cleanup timeout on unmount', () => {
    let value = 'initial';
    const delay = 1000;

    const { result, rerender, unmount } = renderHook(() =>
      useDebounce(value, delay)
    );

    value = 'updated';
    rerender();

    unmount();

    act(() => {
      vi.advanceTimersByTime(delay);
    });

    // Value should remain initial since component unmounted
    expect(result.current).toBe('initial');
  });
});
