import { useCallback, useRef, useState, useMemo } from 'react';

/**
 * Configuration options for retry behavior
 */
export interface RetryOptions {
  /** Maximum number of retry attempts (default: 3) */
  maxAttempts?: number;
  /** Initial delay between retries in milliseconds (default: 1000) */
  initialDelay?: number;
  /** Multiplier for exponential backoff (default: 2) */
  backoffMultiplier?: number;
  /** Maximum delay between retries in milliseconds (default: 30000) */
  maxDelay?: number;
  /** Whether to use exponential backoff (default: true) */
  useExponentialBackoff?: boolean;
  /** Custom function to determine if an error should trigger a retry */
  shouldRetry?: (error: unknown, attemptNumber: number) => boolean;
  /** Callback fired on each retry attempt */
  onRetry?: (error: unknown, attemptNumber: number, nextDelay: number) => void;
  /** Callback fired when all retries are exhausted */
  onMaxAttemptsReached?: (lastError: unknown, totalAttempts: number) => void;
}

/**
 * Represents the current state of a retry operation
 */
export interface RetryState {
  /** Whether a retry operation is currently in progress */
  isRetrying: boolean;
  /** Current attempt number (0 = initial attempt, 1+ = retry attempts) */
  currentAttempt: number;
  /** Last error that occurred */
  lastError: unknown;
  /** Time remaining until next retry (in milliseconds) */
  timeUntilNextRetry: number;
  /** Total number of attempts made so far */
  totalAttempts: number;
}

/**
 * Return type for the useRetry hook
 */
export interface UseRetryReturn<T> {
  /** Execute the operation with retry logic */
  execute: (...args: never[]) => Promise<T>;
  /** Cancel any ongoing retry operation */
  cancel: () => void;
  /** Reset the retry state */
  reset: () => void;
  /** Current retry state */
  state: RetryState;
}

/**
 * Default retry options
 */
const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 3,
  initialDelay: 1000,
  backoffMultiplier: 2,
  maxDelay: 30000,
  useExponentialBackoff: true,
  shouldRetry: () => true,
  onRetry: () => {},
  onMaxAttemptsReached: () => {},
};

/**
 * A React hook that provides retry functionality with exponential backoff for failed operations.
 *
 * @param operation - The async operation to retry
 * @param options - Configuration options for retry behavior
 *
 * @returns An object with methods and state to control retry operations
 *
 * @example
 * ```tsx
 * function ApiCallDemo() {
 *   const [data, setData] = useState(null);
 *   const [error, setError] = useState(null);
 *
 *   const fetchData = async (id: string) => {
 *     const response = await fetch(`/api/data/${id}`);
 *     if (!response.ok) {
 *       throw new Error(`HTTP ${response.status}: ${response.statusText}`);
 *     }
 *     return response.json();
 *   };
 *
 *   const { execute, cancel, reset, state } = useRetry(fetchData, {
 *     maxAttempts: 5,
 *     initialDelay: 1000,
 *     backoffMultiplier: 1.5,
 *     shouldRetry: (error, attempt) => {
 *       // Only retry on network errors or 5xx status codes
 *       return error.message.includes('HTTP 5') || error.message.includes('fetch');
 *     },
 *     onRetry: (error, attempt, delay) => {
 *       console.log(`Retry attempt ${attempt} in ${delay}ms due to:`, error.message);
 *     },
 *     onMaxAttemptsReached: (error, attempts) => {
 *       console.error(`Failed after ${attempts} attempts:`, error);
 *     }
 *   });
 *
 *   const handleFetch = async () => {
 *     try {
 *       setError(null);
 *       const result = await execute('123');
 *       setData(result);
 *     } catch (err) {
 *       setError(err);
 *     }
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleFetch} disabled={state.isRetrying}>
 *         {state.isRetrying ? 'Retrying...' : 'Fetch Data'}
 *       </button>
 *       <button onClick={cancel} disabled={!state.isRetrying}>
 *         Cancel
 *       </button>
 *       <button onClick={reset}>Reset</button>
 *
 *       {state.isRetrying && (
 *         <div>
 *           Attempt {state.currentAttempt + 1} of {options.maxAttempts + 1}
 *           {state.timeUntilNextRetry > 0 && (
 *             <div>Next retry in: {(state.timeUntilNextRetry / 1000).toFixed(1)}s</div>
 *           )}
 *         </div>
 *       )}
 *
 *       {data && <div>Success: {JSON.stringify(data)}</div>}
 *       {error && <div>Error: {error.message}</div>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useRetry<T>(
  operation: (...args: never[]) => Promise<T>,
  options: RetryOptions = {}
): UseRetryReturn<T> {
  const opts = useMemo(
    () => ({ ...DEFAULT_OPTIONS, ...options }),
    [options]
  );

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const cancelledRef = useRef<boolean>(false);

  const [state, setState] = useState<RetryState>({
    isRetrying: false,
    currentAttempt: 0,
    lastError: null,
    timeUntilNextRetry: 0,
    totalAttempts: 0,
  });

  // Calculate delay for next retry
  const calculateDelay = useCallback(
    (attemptNumber: number): number => {
      if (!opts.useExponentialBackoff) {
        return opts.initialDelay;
      }

      const delay =
        opts.initialDelay * Math.pow(opts.backoffMultiplier, attemptNumber - 1);
      return Math.min(delay, opts.maxDelay);
    },
    [opts]
  );

  // Update countdown timer
  const startCountdown = useCallback((totalDelay: number) => {
    const startTime = Date.now();
    const updateCountdown = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, totalDelay - elapsed);

      setState((prev) => ({ ...prev, timeUntilNextRetry: remaining }));

      if (remaining > 0 && !cancelledRef.current) {
        countdownRef.current = setTimeout(updateCountdown, 100);
      }
    };

    updateCountdown();
  }, []);

  // Execute operation with retry logic
  const execute = useCallback(
    async (...args: never[]): Promise<T> => {
      cancelledRef.current = false;

      setState((prev) => ({
        ...prev,
        isRetrying: true,
        currentAttempt: 0,
        lastError: null,
        timeUntilNextRetry: 0,
        totalAttempts: 0,
      }));

      const attemptOperation = async (attemptNumber: number): Promise<T> => {
        if (cancelledRef.current) {
          throw new Error('Operation cancelled');
        }

        setState((prev) => ({
          ...prev,
          currentAttempt: attemptNumber,
          totalAttempts: attemptNumber + 1,
        }));

        try {
          const result = await operation(...args);

          // Success - clean up and return result
          setState((prev) => ({
            ...prev,
            isRetrying: false,
            timeUntilNextRetry: 0,
          }));

          return result;
        } catch (error) {
          setState((prev) => ({ ...prev, lastError: error }));

          // Check if we should retry
          const shouldRetry = opts.shouldRetry(error, attemptNumber);
          const hasAttemptsLeft = attemptNumber < opts.maxAttempts;

          if (!shouldRetry || !hasAttemptsLeft || cancelledRef.current) {
            // No more retries - clean up and throw error
            setState((prev) => ({
              ...prev,
              isRetrying: false,
              timeUntilNextRetry: 0,
            }));

            if (hasAttemptsLeft === false) {
              opts.onMaxAttemptsReached(error, attemptNumber + 1);
            }

            throw error;
          }

          // Calculate delay and retry
          const delay = calculateDelay(attemptNumber + 1);
          opts.onRetry(error, attemptNumber + 1, delay);

          // Start countdown
          startCountdown(delay);

          // Wait for delay, then retry
          return new Promise<T>((resolve, reject) => {
            timeoutRef.current = setTimeout(() => {
              attemptOperation(attemptNumber + 1)
                .then(resolve)
                .catch(reject);
            }, delay);
          });
        }
      };

      return attemptOperation(0);
    },
    [operation, opts, calculateDelay, startCountdown]
  );

  // Cancel ongoing retry operation
  const cancel = useCallback(() => {
    cancelledRef.current = true;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (countdownRef.current) {
      clearTimeout(countdownRef.current);
      countdownRef.current = null;
    }

    setState((prev) => ({
      ...prev,
      isRetrying: false,
      timeUntilNextRetry: 0,
    }));
  }, []);

  // Reset retry state
  const reset = useCallback(() => {
    cancel();

    setState({
      isRetrying: false,
      currentAttempt: 0,
      lastError: null,
      timeUntilNextRetry: 0,
      totalAttempts: 0,
    });
  }, [cancel]);

  return {
    execute,
    cancel,
    reset,
    state,
  };
}
