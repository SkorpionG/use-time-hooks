/**
 * use-time-hooks - A collection of React hooks for time-based function execution
 *
 * This library provides a set of React hooks that simplify common time-based
 * patterns in React applications, including intervals, timeouts, debouncing,
 * and throttling.
 */

export { useInterval } from './useInterval.js';
export { useTimeout } from './useTimeout.js';
export { useDebounce } from './useDebounce.js';
export { useThrottle } from './useThrottle.js';
export { useSequentialExecution } from './useSequentialExecution.js';
export { useStopwatch } from './useStopwatch.js';
export { useRetry } from './useRetry.js';
export { useDelayedState } from './useDelayedState.js';
export { useBatchedUpdates } from './useBatchedUpdates.js';

// Type exports for TypeScript users
export type {} from './useInterval.js';
export type {} from './useTimeout.js';
export type {} from './useDebounce.js';
export type {} from './useThrottle.js';
export type {
  ExecutionStep,
  UseSequentialExecutionReturn,
} from './useSequentialExecution.js';
export type { LapTime, UseStopwatchReturn } from './useStopwatch.js';
export type { RetryOptions, RetryState, UseRetryReturn } from './useRetry.js';
export type { UseDelayedStateReturn } from './useDelayedState.js';
export type {
  BatchedUpdatesOptions,
  UseBatchedUpdatesReturn,
} from './useBatchedUpdates.js';
