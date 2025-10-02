import React, { useState } from 'react';
import { useSequentialExecution, ExecutionStep } from 'use-time-hooks';

/**
 * Example: Sequential API calls
 * 
 * Demonstrates executing API calls one after another with delays between them.
 * Each step waits for its timeout, then executes its function.
 */
export function SequentialApiCallsExample() {
  const [results, setResults] = useState<string[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Define steps with functions and timeouts
  const steps: ExecutionStep[] = [
    {
      id: 'fetch-user',
      timeout: 1000, // Wait 1 second before executing
      fn: () => {
        addLog('🚀 Fetching user data...');
        setResults(prev => [...prev, '✅ User data fetched']);
        addLog('✅ User data complete');
      }
    },
    {
      id: 'fetch-preferences',
      timeout: 1500, // Wait 1.5 seconds before executing
      fn: () => {
        addLog('🚀 Loading preferences...');
        setResults(prev => [...prev, '✅ Preferences loaded']);
        addLog('✅ Preferences complete');
      }
    },
    {
      id: 'prepare-dashboard',
      timeout: 800, // Wait 0.8 seconds before executing
      fn: () => {
        addLog('🚀 Preparing dashboard...');
        setResults(prev => [...prev, '✅ Dashboard ready']);
        addLog('✅ Dashboard complete');
      }
    }
  ];

  // Initialize the hook
  const {
    start,
    stop,
    reset,
    isRunning,
    currentStepIndex,
    cyclesCompleted,
    timeRemaining,
    currentStep
  } = useSequentialExecution(steps, false); // loop = false

  const handleStart = () => {
    setResults([]);
    setLogs([]);
    start();
  };

  const handleStop = () => {
    stop();
    addLog('⏸️ Execution stopped');
  };

  const handleReset = () => {
    reset();
    setResults([]);
    setLogs([]);
    addLog('🔄 Reset to initial state');
  };

  return (
    <div>
      <h2>Sequential API Calls Example</h2>
      <p>Execute API calls one after another with delays between them</p>
      
      <div>
        <button onClick={handleStart} disabled={isRunning}>
          Start Sequence
        </button>
        {isRunning && (
          <button onClick={handleStop}>
            Stop
          </button>
        )}
      </div>

      <div style={{ marginTop: '20px' }}>
        <h4>Results:</h4>
        {results.map((result, index) => (
          <div key={index} style={{ color: 'green' }}>
            ✅ {result}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '20px', maxHeight: '200px', overflow: 'auto' }}>
        <h4>Execution Log:</h4>
        {logs.map((log, index) => (
          <div key={index} style={{ fontSize: '12px', fontFamily: 'monospace' }}>
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Example: Sequential animations with looping
 * 
 * Shows how to run animations in sequence with automatic looping.
 */
export function SequentialAnimationsExample() {
  const [animationStates, setAnimationStates] = useState<boolean[]>([false, false, false, false]);

  // Define animation steps
  const steps: ExecutionStep[] = [
    {
      id: 'box-1',
      timeout: 500,
      fn: () => {
        setAnimationStates([true, false, false, false]);
      }
    },
    {
      id: 'box-2',
      timeout: 500,
      fn: () => {
        setAnimationStates([false, true, false, false]);
      }
    },
    {
      id: 'box-3',
      timeout: 500,
      fn: () => {
        setAnimationStates([false, false, true, false]);
      }
    },
    {
      id: 'box-4',
      timeout: 500,
      fn: () => {
        setAnimationStates([false, false, false, true]);
      }
    }
  ];

  const {
    start,
    stop,
    reset,
    isRunning,
    currentStepIndex
  } = useSequentialExecution(steps, true); // loop = true

  const handleReset = () => {
    reset();
    setAnimationStates([false, false, false, false]);
  };

  return (
    <div>
      <h2>Sequential Animations Example</h2>
      <p>Watch boxes light up one after another in a loop</p>
      
      <div>
        <button onClick={start} disabled={isRunning}>
          Start Animations
        </button>
        {isRunning && (
          <button onClick={stop}>
            Stop
          </button>
        )}
        <button onClick={handleReset} disabled={isRunning}>
          Reset
        </button>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        {animationStates.map((isActive, index) => (
          <div
            key={index}
            style={{
              width: '60px',
              height: '60px',
              backgroundColor: isActive ? '#4ecdc4' : '#ddd',
              border: currentStepIndex === index && isRunning ? '3px solid #ff6b6b' : '1px solid #ccc',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              transform: isActive ? 'scale(1.2)' : 'scale(1)',
            }}
          >
            {index + 1}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
        {isRunning ? `Animating box ${currentStepIndex + 1}` : 'Click Start to begin'}
      </div>
    </div>
  );
}
