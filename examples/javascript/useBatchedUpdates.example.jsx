import React, { useState, useEffect } from 'react';
import { useBatchedUpdates } from 'use-time-hooks';

/**
 * Example: Batched counter updates
 * 
 * Demonstrates batching multiple state updates for better performance.
 */
export function BatchedCounterExample() {
  const [count, setCount] = useState(0);
  const [updates, setUpdates] = useState([]);
  
  const { batchUpdates, pendingCount } = useBatchedUpdates(100); // 100ms batch window

  const addUpdate = (message) => {
    setUpdates(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleSingleUpdate = () => {
    setCount(prev => prev + 1);
    addUpdate('Single update');
  };

  const handleBatchedUpdates = () => {
    batchUpdates(() => {
      setCount(prev => prev + 1);
      addUpdate('Batched update 1');
    });
    
    batchUpdates(() => {
      setCount(prev => prev + 1);
      addUpdate('Batched update 2');
    });
    
    batchUpdates(() => {
      setCount(prev => prev + 1);
      addUpdate('Batched update 3');
    });
  };

  const handleRapidUpdates = () => {
    // Simulate rapid updates that should be batched
    for (let i = 0; i < 5; i++) {
      batchUpdates(() => {
        setCount(prev => prev + 1);
        addUpdate(`Rapid update ${i + 1}`);
      });
    }
  };

  const clearUpdates = () => {
    setUpdates([]);
    setCount(0);
  };

  return (
    <div>
      <h2>Batched Counter Example</h2>
      <p>Compare single updates vs batched updates performance</p>
      
      <div>
        <h3>Count: {count}</h3>
        <p>Pending batched updates: {pendingCount}</p>
      </div>

      <div>
        <button onClick={handleSingleUpdate}>
          Single Update
        </button>
        <button onClick={handleBatchedUpdates}>
          3 Batched Updates
        </button>
        <button onClick={handleRapidUpdates}>
          5 Rapid Updates
        </button>
        <button onClick={clearUpdates}>
          Clear
        </button>
      </div>

      <div style={{ marginTop: '20px', maxHeight: '200px', overflow: 'auto' }}>
        <h4>Update Log:</h4>
        {updates.map((update, index) => (
          <div key={index} style={{ fontSize: '12px', fontFamily: 'monospace' }}>
            {update}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Example: Batched form updates
 * 
 * Shows how to batch form field updates to reduce re-renders.
 */
export function BatchedFormExample() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [renderCount, setRenderCount] = useState(0);

  const { batchUpdates, pendingCount } = useBatchedUpdates(200);

  // Track renders
  useEffect(() => {
    setRenderCount(prev => prev + 1);
  });

  const updateField = (field, value) => {
    batchUpdates(() => {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    });
  };

  const handleBulkUpdate = () => {
    batchUpdates(() => {
      setFormData(prev => ({ ...prev, name: 'John Doe' }));
    });
    batchUpdates(() => {
      setFormData(prev => ({ ...prev, email: 'john@example.com' }));
    });
    batchUpdates(() => {
      setFormData(prev => ({ ...prev, message: 'Hello World!' }));
    });
  };

  const clearForm = () => {
    setFormData({ name: '', email: '', message: '' });
    setRenderCount(0);
  };

  return (
    <div>
      <h2>Batched Form Example</h2>
      <p>Renders: {renderCount} | Pending: {pendingCount}</p>
      
      <div>
        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => updateField('name', e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => updateField('email', e.target.value)}
        />
        <textarea
          placeholder="Message"
          value={formData.message}
          onChange={(e) => updateField('message', e.target.value)}
        />
      </div>

      <div>
        <button onClick={handleBulkUpdate}>
          Fill Form (Batched)
        </button>
        <button onClick={clearForm}>
          Clear Form
        </button>
      </div>

      <div style={{ marginTop: '20px', padding: '10px', background: '#f5f5f5' }}>
        <h4>Form Data:</h4>
        <pre>{JSON.stringify(formData, null, 2)}</pre>
      </div>
    </div>
  );
}
