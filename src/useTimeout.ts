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
  const savedCallback = useRef<(() => void) | undefined>(undefined);
  const startTimeRef = useRef<number>(0);
  const remainingTimeRef = useRef<number>(delay);

  const [isRunning, setIsRunning] = useState(autoStart);
  const [timeRemaining, setTimeRemaining] = useState(delay);
  const [timeElapsed, setTimeElapsed] = useState(0);
  // Bumping this forces the timer effect to (re)start even while already running.
  const [restartNonce, setRestartNonce] = useState(0);

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Declaratively run the timeout + countdown whenever the timer is active.
  // Driving the timer from `isRunning`/`restartNonce` state (rather than calling
  // an imperative start() inside an effect) avoids synchronous setState-in-effect
  useEffect(() => {
    if (!isRunning) return;

    startTimeRef.current = Date.now();
    const duration = remainingTimeRef.current;

    const timeoutId = setTimeout(() => {
      savedCallback.current?.();
      remainingTimeRef.current = delay;
      setTimeRemaining(0);
      setTimeElapsed(delay);
      setIsRunning(false);
    }, duration);

    const intervalId = setInterval(() => {
      const remaining = Math.max(
        0,
        duration - (Date.now() - startTimeRef.current)
      );
      setTimeRemaining(remaining);
      setTimeElapsed(delay - remaining);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [isRunning, restartNonce, delay]);

  // Start (or resume) the timeout using whatever time is currently remaining.
  const start = useCallback(() => {
    setIsRunning(true);
    setRestartNonce((n) => n + 1);
  }, []);

  // Pause, preserving the remaining time so start() can resume from it.
  const pause = useCallback(() => {
    remainingTimeRef.current = Math.max(
      0,
      remainingTimeRef.current - (Date.now() - startTimeRef.current)
    );
    setTimeRemaining(remainingTimeRef.current);
    setTimeElapsed(delay - remainingTimeRef.current);
    setIsRunning(false);
  }, [delay]);

  // Reset back to the full delay; keeps running when autoStart is enabled.
  const reset = useCallback(() => {
    remainingTimeRef.current = delay;
    setTimeRemaining(delay);
    setTimeElapsed(0);
    setIsRunning(autoStart);
    setRestartNonce((n) => n + 1);
  }, [delay, autoStart]);

  // Clear the timeout and reset display state without restarting.
  const clear = useCallback(() => {
    remainingTimeRef.current = delay;
    setTimeRemaining(delay);
    setTimeElapsed(0);
    setIsRunning(false);
  }, [delay]);

  // Toggle function
  const toggle = useCallback(() => {
    if (isRunning) {
      pause();
    } else {
      start();
    }
  }, [isRunning, pause, start]);

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
