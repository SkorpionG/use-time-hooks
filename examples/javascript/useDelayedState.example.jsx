import React, { useState } from 'react';
import { useDelayedState } from 'use-time-hooks';

/**
 * Example: Delayed notification
 * 
 * Shows a notification that appears after a delay, useful for optimistic UI.
 */
export function DelayedNotificationExample() {
  const [message, setMessage] = useState('');
  const [delayedMessage, setDelayedMessage, { isDelayed, cancel, flush }] = useDelayedState('', 2000);

  const showNotification = (text) => {
    setMessage(text);
    setDelayedMessage(`✅ ${text} (confirmed after delay)`);
  };

  const handleQuickAction = () => {
    showNotification('Quick action performed!');
  };

  const handleSlowAction = () => {
    showNotification('Slow action initiated...');
  };

  const handleCancel = () => {
    cancel();
    setMessage('Action cancelled');
  };

  const handleFlush = () => {
    flush();
    setMessage('Action confirmed immediately');
  };

  return (
    <div>
      <h2>Delayed Notification Example</h2>
      <p>Notifications appear immediately, then get confirmed after 2 seconds</p>
      
      <div>
        <button onClick={handleQuickAction}>
          Quick Action
        </button>
        <button onClick={handleSlowAction}>
          Slow Action
        </button>
        {isDelayed && (
          <>
            <button onClick={handleCancel}>
              Cancel
            </button>
            <button onClick={handleFlush}>
              Confirm Now
            </button>
          </>
        )}
      </div>

      <div style={{ marginTop: '20px' }}>
        <div>
          <strong>Immediate:</strong> {message}
        </div>
        <div>
          <strong>Delayed:</strong> {delayedMessage}
          {isDelayed && <span> (pending...)</span>}
        </div>
      </div>
    </div>
  );
}

/**
 * Example: Optimistic UI updates
 * 
 * Demonstrates optimistic updates that revert if not confirmed.
 */
export function OptimisticUIExample() {
  const [items, setItems] = useState(['Item 1', 'Item 2', 'Item 3']);
  const [delayedItems, setDelayedItems, { isDelayed, cancel }] = useDelayedState([], 3000);

  const addItem = () => {
    const newItem = `Item ${items.length + 1}`;
    const newItems = [...items, newItem];
    
    // Optimistic update
    setItems(newItems);
    
    // Delayed confirmation (simulating server response)
    setDelayedItems(newItems);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    
    // Optimistic update
    setItems(newItems);
    
    // Delayed confirmation
    setDelayedItems(newItems);
  };

  const revertChanges = () => {
    cancel();
    // Revert to last confirmed state
    setItems(delayedItems);
  };

  return (
    <div>
      <h2>Optimistic UI Example</h2>
      <p>Changes appear immediately but are confirmed after 3 seconds</p>
      
      <div>
        <button onClick={addItem}>
          Add Item
        </button>
        {isDelayed && (
          <button onClick={revertChanges} style={{ color: 'red' }}>
            Revert Changes
          </button>
        )}
      </div>

      <div style={{ marginTop: '20px' }}>
        <h4>
          Items {isDelayed && <span style={{ color: 'orange' }}>(pending confirmation)</span>}
        </h4>
        <ul>
          {items.map((item, index) => (
            <li key={index}>
              {item}
              <button 
                onClick={() => removeItem(index)}
                style={{ marginLeft: '10px', fontSize: '12px' }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/**
 * Example: Auto-save with delay
 * 
 * Shows auto-saving functionality with delayed state updates.
 */
export function AutoSaveExample() {
  const [content, setContent] = useState('');
  const [savedContent, setSavedContent, { isDelayed, flush }] = useDelayedState('', 1500);

  const handleContentChange = (value) => {
    setContent(value);
    setSavedContent(value); // Will be saved after delay
  };

  const saveNow = () => {
    flush();
  };

  const isSaved = content === savedContent && !isDelayed;
  const hasUnsavedChanges = content !== savedContent || isDelayed;

  return (
    <div>
      <h2>Auto-Save Example</h2>
      <p>Content is auto-saved 1.5 seconds after you stop typing</p>
      
      <div>
        <textarea
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Start typing..."
          rows={5}
          cols={50}
        />
      </div>

      <div style={{ marginTop: '10px' }}>
        <div>
          Status: {' '}
          {isDelayed && <span style={{ color: 'orange' }}>Auto-saving...</span>}
          {isSaved && <span style={{ color: 'green' }}>✅ Saved</span>}
          {hasUnsavedChanges && !isDelayed && <span style={{ color: 'red' }}>❌ Unsaved changes</span>}
        </div>
        
        {hasUnsavedChanges && (
          <button onClick={saveNow} style={{ marginTop: '10px' }}>
            Save Now
          </button>
        )}
      </div>

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        <div>Current: {content.length} characters</div>
        <div>Saved: {savedContent.length} characters</div>
      </div>
    </div>
  );
}
