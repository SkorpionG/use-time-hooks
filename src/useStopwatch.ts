import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Represents a lap time entry
 */
export interface LapTime {
  /** Lap number (1-based) */
  lapNumber: number;
  /** Time when this lap was recorded */
  lapTime: number;
  /** Total elapsed time when this lap was recorded */
  totalTime: number;
  /** Time difference from the previous lap */
  splitTime: number;
}

/**
 * Return type for the useStopwatch hook
 */
export interface UseStopwatchReturn {
  /** Start the stopwatch */
  start: () => void;
  /** Stop the stopwatch */
  stop: () => void;
  /** Reset the stopwatch to zero */
  reset: () => void;
  /** Toggle between start and stop */
  toggle: () => void;
  /** Record a lap time */
  lap: () => LapTime;
  /** Clear all lap times */
  clearLaps: () => void;
  /** Whether the stopwatch is currently running */
  isRunning: boolean;
  /** Current elapsed time in milliseconds */
  elapsedTime: number;
  /** Array of recorded lap times */
  lapTimes: LapTime[];
  /** Formatted elapsed time string (HH:MM:SS.mmm) */
  formattedTime: string;
}

/**
 * Formats milliseconds into HH:MM:SS.mmm format
 */
function formatTime(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const ms = Math.floor((milliseconds % 1000) / 10); // Show only 2 decimal places

  const pad = (num: number, length: number = 2) =>
    num.toString().padStart(length, '0');

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}.${pad(ms)}`;
  }
  return `${pad(minutes)}:${pad(seconds)}.${pad(ms)}`;
}

/**
 * A React hook that provides stopwatch functionality with lap timing capabilities.
 *
 * @param precision - Update interval in milliseconds for time display (default: 10ms)
 *
 * @returns An object with methods and state to control the stopwatch
 *
 * @example
 * ```tsx
 * function StopwatchDemo() {
 *   const {
 *     start,
 *     stop,
 *     reset,
 *     toggle,
 *     lap,
 *     clearLaps,
 *     isRunning,
 *     elapsedTime,
 *     lapTimes,
 *     formattedTime
 *   } = useStopwatch(10);
 *
 *   return (
 *     <div>
 *       <div style={{ fontSize: '2rem', fontFamily: 'monospace' }}>
 *         {formattedTime}
 *       </div>
 *
 *       <div>
 *         <button onClick={toggle}>
 *           {isRunning ? 'Stop' : 'Start'}
 *         </button>
 *         <button onClick={reset}>Reset</button>
 *         <button onClick={lap} disabled={!isRunning}>
 *           Lap
 *         </button>
 *         <button onClick={clearLaps}>Clear Laps</button>
 *       </div>
 *
 *       <div>
 *         <h3>Lap Times</h3>
 *         {lapTimes.map((lapTime) => (
 *           <div key={lapTime.lapNumber}>
 *             Lap {lapTime.lapNumber}: {formatTime(lapTime.lapTime)}
 *             (Split: {formatTime(lapTime.splitTime)})
 *           </div>
 *         ))}
 *       </div>
 *     </div>
 *   );
 * }
 * ```
 */
export function useStopwatch(precision: number = 10): UseStopwatchReturn {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  const lastLapTimeRef = useRef<number>(0);

  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [lapTimes, setLapTimes] = useState<LapTime[]>([]);

  // Update elapsed time when running
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = now - startTimeRef.current + pausedTimeRef.current;
        setElapsedTime(elapsed);
      }, precision);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }
  }, [isRunning, precision]);

  // Start function
  const start = useCallback(() => {
    if (!isRunning) {
      startTimeRef.current = Date.now();
      setIsRunning(true);
    }
  }, [isRunning]);

  // Stop function
  const stop = useCallback(() => {
    if (isRunning && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;

      // Save the elapsed time when stopping
      const now = Date.now();
      const elapsed = now - startTimeRef.current + pausedTimeRef.current;
      pausedTimeRef.current = elapsed;

      setIsRunning(false);
    }
  }, [isRunning]);

  // Reset function
  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    startTimeRef.current = 0;
    pausedTimeRef.current = 0;
    lastLapTimeRef.current = 0;

    setIsRunning(false);
    setElapsedTime(0);
    setLapTimes([]);
  }, []);

  // Toggle function
  const toggle = useCallback(() => {
    if (isRunning) {
      stop();
    } else {
      start();
    }
  }, [isRunning, start, stop]);

  // Lap function
  const lap = useCallback((): LapTime => {
    if (!isRunning) {
      throw new Error('Cannot record lap time when stopwatch is not running');
    }

    const now = Date.now();
    const totalTime = now - startTimeRef.current + pausedTimeRef.current;
    const lapNumber = lapTimes.length + 1;
    const splitTime = totalTime - lastLapTimeRef.current;

    const newLap: LapTime = {
      lapNumber,
      lapTime: totalTime,
      totalTime,
      splitTime,
    };

    lastLapTimeRef.current = totalTime;
    setLapTimes((prev) => [...prev, newLap]);

    return newLap;
  }, [isRunning, lapTimes.length]);

  // Clear laps function
  const clearLaps = useCallback(() => {
    setLapTimes([]);
    lastLapTimeRef.current = 0;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const formattedTime = formatTime(elapsedTime);

  return {
    start,
    stop,
    reset,
    toggle,
    lap,
    clearLaps,
    isRunning,
    elapsedTime,
    lapTimes,
    formattedTime,
  };
}
