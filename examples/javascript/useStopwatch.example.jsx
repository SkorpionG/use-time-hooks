import React from 'react';
import { useStopwatch } from 'use-time-hooks';

/**
 * Example: Basic stopwatch
 *
 * A simple stopwatch with start, stop, and reset functionality.
 */
export function BasicStopwatchExample() {
  const { start, stop, reset, toggle, isRunning, formattedTime } =
    useStopwatch();

  return (
    <div>
      <h2>Basic Stopwatch Example</h2>
      <h1 style={{ fontSize: '3em', fontFamily: 'monospace' }}>
        {formattedTime}
      </h1>
      <p>Status: {isRunning ? '▶️ Running' : '⏸️ Stopped'}</p>

      <button onClick={toggle}>{isRunning ? 'Stop' : 'Start'}</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}

/**
 * Example: Stopwatch with lap timing
 *
 * Demonstrates recording and displaying lap times.
 */
export function LapTimingStopwatchExample() {
  const {
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
  } = useStopwatch();

  return (
    <div>
      <h2>Lap Timing Stopwatch Example</h2>

      <h1 style={{ fontSize: '2.5em', fontFamily: 'monospace' }}>
        {formattedTime}
      </h1>

      <p>Status: {isRunning ? '▶️ Running' : '⏸️ Stopped'}</p>
      <p>Total elapsed: {(elapsedTime / 1000).toFixed(2)}s</p>

      <div>
        <button onClick={toggle}>{isRunning ? 'Stop' : 'Start'}</button>
        <button onClick={reset}>Reset</button>
        <button onClick={lap} disabled={!isRunning}>
          Lap
        </button>
        <button onClick={clearLaps} disabled={lapTimes.length === 0}>
          Clear Laps
        </button>
      </div>

      {lapTimes.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>Lap Times:</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>
                  Lap
                </th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>
                  Time
                </th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>
                  Split
                </th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {lapTimes.map((lapTime) => (
                <tr key={lapTime.lapNumber}>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {lapTime.lapNumber}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {(lapTime.lapTime / 1000).toFixed(2)}s
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {(lapTime.splitTime / 1000).toFixed(2)}s
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {(lapTime.totalTime / 1000).toFixed(2)}s
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
