import { useInterval } from 'usetime';
import { useState } from 'react';

/**
 * Example: Simple counter using useInterval
 *
 * This example demonstrates how to use useInterval to create a counter
 * that increments every second with start/stop controls.
 */
export function IntervalCounterExample() {
  const [count, setCount] = useState(0);

  const { toggle, stop, reset, isRunning, executionCount } = useInterval(() => {
    setCount((count) => count + 1);
  }, 1000);

  const handleReset = () => {
    setCount(0);
    reset();
  };

  return (
    <div>
      <h2>Interval Counter Example</h2>
      <p>Count: {count}</p>
      <p>Executions: {executionCount}</p>
      <p>Status: {isRunning ? 'Running' : 'Stopped'}</p>

      <button onClick={toggle}>{isRunning ? 'Pause' : 'Start'}</button>
      <button onClick={stop}>Stop</button>
      <button onClick={handleReset}>Reset</button>
    </div>
  );
}

/**
 * Example: Timer with immediate execution
 *
 * Demonstrates using the immediate parameter to execute
 * the callback immediately on mount.
 */
export function ImmediateIntervalExample() {
  const [ticks, setTicks] = useState(0);

  const { isRunning, executionCount } = useInterval(
    () => {
      setTicks((t) => t + 1);
    },
    500,
    true // Execute immediately on mount
  );

  return (
    <div>
      <h2>Immediate Interval Example</h2>
      <p>Ticks: {ticks}</p>
      <p>Executions: {executionCount}</p>
      <p>Status: {isRunning ? 'Running' : 'Stopped'}</p>
    </div>
  );
}
