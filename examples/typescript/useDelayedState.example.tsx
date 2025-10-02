import React, { useState } from 'react';
import { useDelayedState } from 'use-time-hooks';

/**
 * Example: Delayed notification
 * 
 * Shows a notification that appears after a delay, useful for optimistic UI.
 */
export function DelayedStateExample() {
  const [input, setInput] = useState('');
  const { value, immediateValue, setValue, setImmediate, cancel, isPending, timeRemaining } = useDelayedState('', 2000);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInput(newValue);
    setValue(newValue); // Will update 'value' after 2 seconds
  };

  return (
    <div>
      <h2>Delayed State Example</h2>
      <input
        value={input}
        onChange={handleInputChange}
        placeholder="Type something..."
      />

      <div style={{ marginTop: '10px' }}>
        <p>Immediate Value: {immediateValue}</p>
        <p>Delayed Value: {value}</p>
        {isPending && <p>Update in: {(timeRemaining / 1000).toFixed(1)}s</p>}
      </div>

      <button onClick={() => setImmediate(input)}>Apply Immediately</button>
      <button onClick={cancel} disabled={!isPending}>
        Cancel Pending
      </button>
    </div>
  );
}
