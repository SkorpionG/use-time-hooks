import React, { useState } from 'react';
import { useBatchedUpdates } from 'use-time-hooks';

/**
 * Example: Batched counter updates
 *
 * Demonstrates batching multiple state updates for better performance.
 */
export function BatchedCounterExample() {
  const [processedCount, setProcessedCount] = useState(0);
  const [updateLog, setUpdateLog] = useState<string[]>([]);

  const {
    addUpdate,
    flush,
    clear,
    batchSize,
    hasPendingUpdates,
    timeUntilFlush,
  } = useBatchedUpdates<number>(
    (batchedItems: number[]) => {
      setProcessedCount(
        (c) => c + batchedItems.reduce((sum, item) => sum + item, 0)
      );
      setUpdateLog((logs) => [
        ...logs,
        `Flushed ${batchedItems.length} items: [${batchedItems.join(', ')}]`,
      ]);
    },
    {
      batchWindow: 1000, // Flush after 1 second
      maxBatchSize: 5, // Or when 5 items are in the batch
    }
  );

  return (
    <div>
      <h2>Batched Updates Example</h2>
      <p>Updates are flushed every 1000ms or when the batch size reaches 5.</p>

      <div>
        <button onClick={() => addUpdate(1)}>Add 1</button>
        <button
          onClick={() => {
            addUpdate(2);
            addUpdate(3);
          }}
        >
          Add 2 & 3
        </button>
        <button onClick={flush} disabled={!hasPendingUpdates}>
          Flush Now ({batchSize})
        </button>
        <button onClick={clear} disabled={!hasPendingUpdates}>
          Clear Pending
        </button>
      </div>

      <div style={{ marginTop: '10px' }}>
        <p>Total Processed Count: {processedCount}</p>
        <p>Pending Updates: {batchSize}</p>
        {hasPendingUpdates && (
          <p>Time until flush: {(timeUntilFlush / 1000).toFixed(1)}s</p>
        )}
      </div>

      <div
        style={{
          marginTop: '10px',
          maxHeight: '150px',
          overflowY: 'auto',
          border: '1px solid #ccc',
          padding: '5px',
        }}
      >
        <h4>Update Log:</h4>
        {updateLog.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </div>
    </div>
  );
}
