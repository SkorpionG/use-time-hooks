import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Return type for the useInterval hook
 */
export interface UseIntervalReturn {
  start: () => void;
  stop: () => void;
  reset: () => void;
  toggle: () => void;
  isRunning: boolean;
  executionCount: number;
}

/**
 * A React hook that executes a callback function at specified intervals.
 *
 * @param callback - The function to execute at each interval
 * @param delay - The delay in milliseconds between executions
 * @param immediate - Whether to execute the callback immediately on mount (default: false)
 * @returns An object containing start, stop functions and executionCount
 *
 * @example
 * ```tsx
 * function Timer() {
 *   const [count, setCount] = useState(0);
 *   const { toggle, reset, isRunning, executionCount } = useInterval(() => {
 *     setCount(count => count + 1);
 *   }, 1000);
 *
 *   return (
 *     <div>
 *       <div>Count: {count}</div>
 *       <div>Executions: {executionCount}</div>
 *       <div>Status: {isRunning ? 'Running' : 'Stopped'}</div>
 *       <button onClick={toggle}>
 *         {isRunning ? 'Stop' : 'Start'}
 *       </button>
 *       <button onClick={reset}>Reset</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useInterval(
  callback: () => void,
  delay: number,
  immediate: boolean = false
): UseIntervalReturn {
  const savedCallback = useRef<() => void>();
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [executionCount, setExecutionCount] = useState(0);

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Start function
  const start = useCallback(() => {
    if (!isRunning && intervalIdRef.current === null) {
      setIsRunning(true);
    }
  }, [isRunning]);

  // Stop function
  const stop = useCallback(() => {
    if (intervalIdRef.current !== null) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
    setIsRunning(false);
  }, []);

  // Reset function
  const reset = useCallback(() => {
    if (intervalIdRef.current !== null) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
    setExecutionCount(0);
    setIsRunning(false);
  }, []);

  // Toggle function
  const toggle = useCallback(() => {
    if (isRunning) {
      stop();
    } else {
      start();
    }
  }, [isRunning, start, stop]);

  // Set up the interval
  useEffect(() => {
    function tick() {
      if (savedCallback.current) {
        savedCallback.current();
        setExecutionCount((prev) => prev + 1);
      }
    }

    if (isRunning) {
      // Execute immediately if requested
      if (immediate && executionCount === 0) {
        tick();
      }

      intervalIdRef.current = setInterval(tick, delay);

      return () => {
        if (intervalIdRef.current !== null) {
          clearInterval(intervalIdRef.current);
          intervalIdRef.current = null;
        }
      };
    }
  }, [delay, immediate, isRunning, executionCount]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalIdRef.current !== null) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, []);

  return { start, stop, reset, toggle, isRunning, executionCount };
}
