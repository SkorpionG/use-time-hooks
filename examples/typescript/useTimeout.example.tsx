import { useTimeout } from 'usetime';
import { useState } from 'react';

/**
 * Example: Delayed notification
 *
 * Shows a notification after a specified delay with pause/resume controls.
 */
export function DelayedNotificationExample() {
  const [message, setMessage] = useState('');

  const { start, pause, reset, toggle, isRunning, timeRemaining, timeElapsed } =
    useTimeout(
      () => {
        setMessage('⏰ Time is up!');
      },
      5000,
      false // Don't auto-start
    );

  const handleReset = () => {
    setMessage('');
    reset();
  };

  return (
    <div>
      <h2>Delayed Notification Example</h2>
      <p>{message || 'Waiting...'}</p>
      <p>Time remaining: {(timeRemaining / 1000).toFixed(1)}s</p>
      <p>Time elapsed: {(timeElapsed / 1000).toFixed(1)}s</p>
      <p>Status: {isRunning ? 'Running' : 'Stopped'}</p>

      <button onClick={toggle}>{isRunning ? 'Pause' : 'Start'}</button>
      <button onClick={pause} disabled={!isRunning}>
        Pause
      </button>
      <button onClick={handleReset}>Reset</button>
    </div>
  );
}

/**
 * Example: Auto-starting timeout
 *
 * Demonstrates a timeout that starts automatically on mount.
 */
export function AutoStartTimeoutExample() {
  const [status, setStatus] = useState('Waiting...');

  const { timeRemaining, isRunning } = useTimeout(
    () => {
      setStatus('✅ Completed!');
    },
    3000,
    true // Auto-start
  );

  return (
    <div>
      <h2>Auto-Start Timeout Example</h2>
      <p>Status: {status}</p>
      {isRunning && <p>Completing in: {(timeRemaining / 1000).toFixed(1)}s</p>}
    </div>
  );
}
