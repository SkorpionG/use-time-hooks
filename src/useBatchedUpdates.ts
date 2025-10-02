import { useEffect, useRef, useState, useCallback, useMemo } from 'react';

/**
 * Configuration options for batched updates
 */
export interface BatchedUpdatesOptions {
  /** Time window in milliseconds to batch updates (default: 100) */
  batchWindow?: number;
  /** Maximum number of updates to batch before forcing a flush (default: 50) */
  maxBatchSize?: number;
  /** Whether to flush immediately on the first update (default: false) */
  flushOnFirst?: boolean;
  /** Custom reducer function to combine batched updates */
  reducer?: <T>(accumulated: T[], newUpdate: T) => T[];
  /** Callback fired when a batch is flushed */
  onFlush?: <T>(batchedUpdates: T[], batchSize: number) => void;
}

/**
 * Return type for the useBatchedUpdates hook
 */
export interface UseBatchedUpdatesReturn<T> {
  /** Add an update to the batch */
  addUpdate: (update: T) => void;
  /** Manually flush all pending updates */
  flush: () => void;
  /** Clear all pending updates without flushing */
  clear: () => void;
  /** Current batch of pending updates */
  pendingUpdates: T[];
  /** Number of updates in the current batch */
  batchSize: number;
  /** Whether there are pending updates */
  hasPendingUpdates: boolean;
  /** Time remaining until next auto-flush (in milliseconds) */
  timeUntilFlush: number;
}

/**
 * Default options for batched updates
 */
const DEFAULT_OPTIONS = {
  batchWindow: 100,
  maxBatchSize: 50,
  flushOnFirst: false,
  reducer: <T>(accumulated: T[], newUpdate: T) => [...accumulated, newUpdate],
  onFlush: <T>(_batchedUpdates: T[], _batchSize: number) => {},
} as const;

/**
 * A React hook that batches multiple updates over time to reduce re-renders and improve performance.
 * Useful for scenarios with frequent state updates like real-time data, animations, or user input.
 *
 * @param onBatchFlush - Callback function that receives the batched updates when flushed
 * @param options - Configuration options for batching behavior
 *
 * @returns An object with methods and state to control batched updates
 *
 * @example
 * ```tsx
 * function BatchedUpdatesDemo() {
 *   const [messages, setMessages] = useState<string[]>([]);
 *   const [updateCount, setUpdateCount] = useState(0);
 *
 *   const {
 *     addUpdate,
 *     flush,
 *     clear,
 *     pendingUpdates,
 *     batchSize,
 *     hasPendingUpdates,
 *     timeUntilFlush
 *   } = useBatchedUpdates(
 *     (batchedUpdates: string[]) => {
 *       // This will be called with all batched updates at once
 *       setMessages(prev => [...prev, ...batchedUpdates]);
 *       setUpdateCount(prev => prev + batchedUpdates.length);
 *     },
 *     {
 *       batchWindow: 500,
 *       maxBatchSize: 10,
 *       onFlush: (updates, size) => {
 *         console.log(`Flushed ${size} updates:`, updates);
 *       }
 *     }
 *   );
 *
 *   const addMessage = () => {
 *     const message = `Message ${Date.now()}`;
 *     addUpdate(message); // Will be batched
 *   };
 *
 *   const addMultipleMessages = () => {
 *     for (let i = 0; i < 5; i++) {
 *       addUpdate(`Bulk message ${i + 1}`);
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       <div>
 *         <button onClick={addMessage}>Add Message</button>
 *         <button onClick={addMultipleMessages}>Add 5 Messages</button>
 *         <button onClick={flush} disabled={!hasPendingUpdates}>
 *           Flush Now ({batchSize})
 *         </button>
 *         <button onClick={clear} disabled={!hasPendingUpdates}>
 *           Clear Pending
 *         </button>
 *       </div>
 *
 *       <div>
 *         <p>Total updates processed: {updateCount}</p>
 *         <p>Pending updates: {batchSize}</p>
 *         {hasPendingUpdates && (
 *           <p>Auto-flush in: {(timeUntilFlush / 1000).toFixed(1)}s</p>
 *         )}
 *       </div>
 *
 *       <div>
 *         <h3>Pending Updates:</h3>
 *         {pendingUpdates.map((update, idx) => (
 *           <div key={idx} style={{ color: 'orange' }}>{update}</div>
 *         ))}
 *       </div>
 *
 *       <div>
 *         <h3>Processed Messages:</h3>
 *         {messages.map((msg, idx) => (
 *           <div key={idx}>{msg}</div>
 *         ))}
 *       </div>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * // Real-time data updates
 * ```tsx
 * function RealTimeChart() {
 *   const [dataPoints, setDataPoints] = useState<number[]>([]);
 *
 *   const { addUpdate } = useBatchedUpdates(
 *     (batchedPoints: number[]) => {
 *       // Update chart with all batched data points at once
 *       setDataPoints(prev => [...prev.slice(-100), ...batchedPoints]);
 *     },
 *     {
 *       batchWindow: 50, // Very fast updates for smooth charts
 *       maxBatchSize: 20,
 *       reducer: (accumulated, newPoint) => {
 *         // Custom logic to handle data point batching
 *         return [...accumulated, newPoint];
 *       }
 *     }
 *   );
 *
 *   useEffect(() => {
 *     // Simulate real-time data
 *     const interval = setInterval(() => {
 *       addUpdate(Math.random() * 100);
 *     }, 10);
 *
 *     return () => clearInterval(interval);
 *   }, [addUpdate]);
 *
 *   return <Chart data={dataPoints} />;
 * }
 * ```
 */
export function useBatchedUpdates<T>(
  onBatchFlush: (batchedUpdates: T[]) => void,
  options: BatchedUpdatesOptions = {}
): UseBatchedUpdatesReturn<T> {
  const opts = useMemo(
    () => ({ ...DEFAULT_OPTIONS, ...options }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      options.batchWindow,
      options.maxBatchSize,
      options.flushOnFirst,
      options.reducer,
      options.onFlush,
    ]
  );

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const isFirstUpdateRef = useRef<boolean>(true);
  const onBatchFlushRef = useRef(onBatchFlush);

  const [pendingUpdates, setPendingUpdates] = useState<T[]>([]);
  const [timeUntilFlush, setTimeUntilFlush] = useState<number>(0);

  // Keep ref updated
  useEffect(() => {
    onBatchFlushRef.current = onBatchFlush;
  }, [onBatchFlush]);

  const batchSize = pendingUpdates.length;
  const hasPendingUpdates = batchSize > 0;
  
  // Use ref to track if we have pending updates
  const hasPendingUpdatesRef = useRef(hasPendingUpdates);
  useEffect(() => {
    hasPendingUpdatesRef.current = hasPendingUpdates;
  }, [hasPendingUpdates]);

  // Update countdown timer - stable function using refs
  const updateCountdown = useCallback(() => {
    if (!hasPendingUpdatesRef.current) return;

    const elapsed = Date.now() - startTimeRef.current;
    const remaining = Math.max(0, opts.batchWindow - elapsed);

    setTimeUntilFlush(remaining);

    if (remaining > 0) {
      countdownRef.current = setTimeout(updateCountdown, 50);
    }
  }, [opts.batchWindow]);

  // Start countdown
  const startCountdown = useCallback(() => {
    startTimeRef.current = Date.now();
    setTimeUntilFlush(opts.batchWindow);
    updateCountdown();
  }, [opts.batchWindow, updateCountdown]);

  // Clear timers
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

  // Flush all pending updates - use functional setState to avoid dependency
  const flush = useCallback(() => {
    setPendingUpdates((currentUpdates) => {
      if (currentUpdates.length === 0) return currentUpdates;

      clearTimers();

      const updatesToFlush = [...currentUpdates];
      setTimeUntilFlush(0);

      // Call the flush callback
      opts.onFlush<T>(updatesToFlush, updatesToFlush.length);
      onBatchFlushRef.current(updatesToFlush);

      isFirstUpdateRef.current = true;
      hasPendingUpdatesRef.current = false;
      
      return [];
    });
  }, [opts, clearTimers]);

  // Schedule auto-flush
  const scheduleFlush = useCallback(() => {
    clearTimers();
    startCountdown();

    timeoutRef.current = setTimeout(() => {
      flush();
    }, opts.batchWindow);
  }, [flush, opts.batchWindow, clearTimers, startCountdown]);

  // Add update to batch
  const addUpdate = useCallback(
    (update: T) => {
      setPendingUpdates((prev) => {
        const newUpdates = opts.reducer<T>(prev, update);

        // Check if we should flush immediately
        const shouldFlushOnFirst =
          opts.flushOnFirst && isFirstUpdateRef.current;
        const shouldFlushOnSize = newUpdates.length >= opts.maxBatchSize;

        if (shouldFlushOnFirst) {
          // Flush immediately for first update
          setTimeout(() => {
            opts.onFlush<T>([update], 1);
            onBatchFlush([update]);
          }, 0);
          isFirstUpdateRef.current = false;
          return [];
        }

        if (shouldFlushOnSize) {
          // Flush immediately when max batch size reached
          setTimeout(() => {
            opts.onFlush<T>(newUpdates, newUpdates.length);
            onBatchFlush(newUpdates);
          }, 0);
          isFirstUpdateRef.current = true;
          return [];
        }

        // Schedule auto-flush if this is the first update in the batch
        if (prev.length === 0) {
          hasPendingUpdatesRef.current = true;
          scheduleFlush();
        }

        isFirstUpdateRef.current = false;
        return newUpdates;
      });
    },
    [onBatchFlush, opts, scheduleFlush]
  );

  // Clear all pending updates without flushing
  const clear = useCallback(() => {
    clearTimers();
    setPendingUpdates([]);
    setTimeUntilFlush(0);
    isFirstUpdateRef.current = true;
    hasPendingUpdatesRef.current = false;
  }, [clearTimers]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, [clearTimers]);

  // Auto-flush on unmount if there are pending updates
  const pendingUpdatesRef = useRef<T[]>([]);
  useEffect(() => {
    pendingUpdatesRef.current = pendingUpdates;
  }, [pendingUpdates]);

  useEffect(() => {
    return () => {
      if (pendingUpdatesRef.current.length > 0) {
        opts.onFlush<T>(pendingUpdatesRef.current, pendingUpdatesRef.current.length);
        onBatchFlushRef.current(pendingUpdatesRef.current);
        hasPendingUpdatesRef.current = false;
      }
    };
  }, [opts]);

  return {
    addUpdate,
    flush,
    clear,
    pendingUpdates,
    batchSize,
    hasPendingUpdates,
    timeUntilFlush,
  };
}
