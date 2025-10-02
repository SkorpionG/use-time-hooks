import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Return type for the useTimeout hook
 */
export interface UseTimeoutReturn {
  start: () => void;
  pause: () => void;
  reset: () => void;
  clear: () => void;
  toggle: () => void;
  isRunning: boolean;
  timeRemaining: number;
  timeElapsed: number;
}

/**
 * A React hook that executes a callback function after a specified delay with full control.
 *
 * @param callback - The function to execute after the delay
 * @param delay - The delay in milliseconds before execution
 * @param autoStart - Whether to start the timeout immediately (default: true)
 *
 * @returns An object with methods and state to control the timeout
 *
 * @example
 * ```tsx
 * function DelayedMessage() {
 *   const [message, setMessage] = useState('');
 *
 *   const { start, pause, toggle, isRunning, timeRemaining } = useTimeout(() => {
 *     setMessage('Hello after 3 seconds!');
 *   }, 3000, false);
 *
 *   return (
 *     <div>
 *       <p>{message}</p>
 *       <p>Time remaining: {(timeRemaining / 1000).toFixed(1)}s</p>
 *       <p>Status: {isRunning ? 'Running' : 'Paused'}</p>
 *       <button onClick={toggle}>{isRunning ? 'Pause' : 'Start'}</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useTimeout(
  callback: () => void,
  delay: number,
  autoStart: boolean = true
): UseTimeoutReturn {
  const savedCallback = useRef<() => void>();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const remainingTimeRef = useRef<number>(delay);

  const [isRunning, setIsRunning] = useState(autoStart);
  const [timeRemaining, setTimeRemaining] = useState(delay);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Update time remaining every 100ms when running
  useEffect(() => {
    if (!isRunning) return;

    const intervalId = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, remainingTimeRef.current - elapsed);

      setTimeRemaining(remaining);
      setTimeElapsed(delay - remaining);

      if (remaining === 0) {
        setIsRunning(false);
      }
    }, 100);

    return () => clearInterval(intervalId);
  }, [isRunning, delay]);

  // Start function
  const start = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    startTimeRef.current = Date.now();
    remainingTimeRef.current = timeRemaining;

    timeoutRef.current = setTimeout(() => {
      if (savedCallback.current) {
        savedCallback.current();
      }
      setIsRunning(false);
      setTimeRemaining(0);
      setTimeElapsed(delay);
    }, remainingTimeRef.current);

    setIsRunning(true);
  }, [timeRemaining, delay]);

  // Pause function
  const pause = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const elapsed = Date.now() - startTimeRef.current;
    remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);

    setTimeRemaining(remainingTimeRef.current);
    setTimeElapsed(delay - remainingTimeRef.current);
    setIsRunning(false);
  }, [delay]);

  // Reset function
  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    remainingTimeRef.current = delay;
    setTimeRemaining(delay);
    setTimeElapsed(0);
    setIsRunning(false);
  }, [delay]);

  // Clear function (alias for reset)
  const clear = useCallback(() => {
    reset();
  }, [reset]);

  // Toggle function
  const toggle = useCallback(() => {
    if (isRunning) {
      pause();
    } else {
      start();
    }
  }, [isRunning, pause, start]);

  // Auto-start on mount if enabled
  useEffect(() => {
    if (autoStart) {
      start();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [autoStart, start]);

  return {
    start,
    pause,
    reset,
    clear,
    toggle,
    isRunning,
    timeRemaining,
    timeElapsed,
  };
}
