import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Return type for the useDelayedState hook
 */
export interface UseDelayedStateReturn<T> {
  /** Current value (may be delayed) */
  value: T;
  /** Immediate value (not delayed) */
  immediateValue: T;
  /** Set the value with delay */
  setValue: (newValue: T | ((prev: T) => T)) => void;
  /** Set the value immediately without delay */
  setImmediate: (newValue: T | ((prev: T) => T)) => void;
  /** Cancel any pending delayed update */
  cancel: () => void;
  /** Whether there's a pending delayed update */
  isPending: boolean;
  /** Time remaining until the delayed update (in milliseconds) */
  timeRemaining: number;
}

/**
 * A React hook that provides state with delayed updates, useful for optimistic UI updates or debouncing state changes.
 *
 * @param initialValue - The initial state value
 * @param delay - Delay in milliseconds before the state update takes effect
 * @param immediate - Whether the first update should be immediate (default: false)
 *
 * @returns An object with delayed state value and control methods
 *
 * @example
 * ```tsx
 * function DelayedStateDemo() {
 *   const {
 *     value,
 *     immediateValue,
 *     setValue,
 *     setImmediate,
 *     cancel,
 *     isPending,
 *     timeRemaining
 *   } = useDelayedState('', 2000);
 *
 *   const [input, setInput] = useState('');
 *
 *   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 *     const newValue = e.target.value;
 *     setInput(newValue);
 *     setValue(newValue); // Will update 'value' after 2 seconds
 *   };
 *
 *   return (
 *     <div>
 *       <input
 *         value={input}
 *         onChange={handleInputChange}
 *         placeholder="Type something..."
 *       />
 *
 *       <div>
 *         <p>Immediate: {immediateValue}</p>
 *         <p>Delayed: {value}</p>
 *         {isPending && (
 *           <p>Update in: {(timeRemaining / 1000).toFixed(1)}s</p>
 *         )}
 *       </div>
 *
 *       <div>
 *         <button onClick={() => setImmediate(input)}>
 *           Apply Immediately
 *         </button>
 *         <button onClick={cancel} disabled={!isPending}>
 *           Cancel Pending
 *         </button>
 *       </div>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * // Optimistic UI updates
 * ```tsx
 * function OptimisticDemo() {
 *   const [serverData, setServerData] = useState('saved data');
 *   const {
 *     value: displayValue,
 *     setValue: setOptimisticValue,
 *     cancel: cancelOptimistic,
 *     isPending
 *   } = useDelayedState(serverData, 3000);
 *
 *   const handleSave = async (newValue: string) => {
 *     // Show optimistic update immediately
 *     setOptimisticValue(newValue);
 *
 *     try {
 *       await saveToServer(newValue);
 *       setServerData(newValue); // Success - sync with server
 *     } catch (error) {
 *       cancelOptimistic(); // Revert on error
 *       alert('Save failed!');
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       <p>Display: {displayValue} {isPending && '(saving...)'}</p>
 *       <button onClick={() => handleSave('new data')}>
 *         Save New Data
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useDelayedState<T>(
  initialValue: T,
  delay: number,
  immediate: boolean = false
): UseDelayedStateReturn<T> {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const pendingValueRef = useRef<T | null>(null);
  const isFirstUpdateRef = useRef<boolean>(true);

  const [value, setValue_internal] = useState<T>(initialValue);
  const [immediateValue, setImmediateValue] = useState<T>(initialValue);
  const [isPending, setIsPending] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  // Use ref to track pending state
  const isPendingRef = useRef(isPending);
  useEffect(() => {
    isPendingRef.current = isPending;
  }, [isPending]);

  // Update countdown timer - stable function using refs
  const updateCountdown = useCallback(() => {
    if (!isPendingRef.current) return;

    const elapsed = Date.now() - startTimeRef.current;
    const remaining = Math.max(0, delay - elapsed);

    setTimeRemaining(remaining);

    if (remaining > 0) {
      countdownRef.current = setTimeout(updateCountdown, 100);
    }
  }, [delay]);

  // Start countdown
  const startCountdown = useCallback(() => {
    startTimeRef.current = Date.now();
    setTimeRemaining(delay);
    updateCountdown();
  }, [delay, updateCountdown]);

  // Clear all timers
  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (countdownRef.current) {
      clearTimeout(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  // Set value with delay
  const setValue = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      const resolvedValue =
        typeof newValue === 'function'
          ? (newValue as (prev: T) => T)(immediateValue)
          : newValue;

      // Update immediate value right away
      setImmediateValue(resolvedValue);
      pendingValueRef.current = resolvedValue;

      // Clear any existing timeout
      clearTimers();

      // Check if this is the first update and should be immediate
      if (immediate && isFirstUpdateRef.current) {
        setValue_internal(resolvedValue);
        isFirstUpdateRef.current = false;
        return;
      }

      isFirstUpdateRef.current = false;

      // Set up delayed update
      setIsPending(true);
      isPendingRef.current = true;
      startCountdown();

      timeoutRef.current = setTimeout(() => {
        setValue_internal(resolvedValue);
        setIsPending(false);
        isPendingRef.current = false;
        setTimeRemaining(0);
        pendingValueRef.current = null;
      }, delay);
    },
    [immediateValue, delay, immediate, clearTimers, startCountdown]
  );

  // Set value immediately without delay
  const setImmediate = useCallback(
    (newValue: T | ((prev: T) => T)) => {
      const resolvedValue =
        typeof newValue === 'function'
          ? (newValue as (prev: T) => T)(immediateValue)
          : newValue;

      // Clear any pending delayed update
      clearTimers();

      // Update both values immediately
      setValue_internal(resolvedValue);
      setImmediateValue(resolvedValue);
      setIsPending(false);
      isPendingRef.current = false;
      setTimeRemaining(0);
      pendingValueRef.current = null;
    },
    [immediateValue, clearTimers]
  );

  // Cancel pending delayed update
  const cancel = useCallback(() => {
    if (!isPending) return;

    clearTimers();

    // Revert immediate value to current delayed value
    setImmediateValue(value);
    setIsPending(false);
    isPendingRef.current = false;
    setTimeRemaining(0);
    pendingValueRef.current = null;
  }, [isPending, value, clearTimers]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  // Sync immediate value with delayed value when not pending
  useEffect(() => {
    if (!isPending && immediateValue !== value) {
      setImmediateValue(value);
    }
  }, [value, isPending, immediateValue]);

  return {
    value,
    immediateValue,
    setValue,
    setImmediate,
    cancel,
    isPending,
    timeRemaining,
  };
}
