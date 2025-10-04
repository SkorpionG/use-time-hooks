# use-time-hooks

> A comprehensive collection of React hooks for time-based operations

A powerful, TypeScript-first library providing several production-ready React hooks for managing time-based operations, including intervals, timeouts, debouncing, throttling, stopwatches, retries, and more.

[![npm version](https://img.shields.io/npm/v/use-time-hooks.svg)](https://www.npmjs.com/package/use-time-hooks)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Table of Contents

- [Installation](#installation)
- [Features](#features)
- [Hooks](#hooks)
  - [useInterval](#useinterval) - Execute functions at regular intervals
  - [useTimeout](#usetimeout) - Execute functions after a delay
  - [useDebounce](#usedebounce) - Debounce values
  - [useThrottle](#usethrottle) - Throttle function calls
  - [useStopwatch](#usestopwatch) - Stopwatch with lap timing
  - [useRetry](#useretry) - Retry failed operations
  - [useBatchedUpdates](#usebatchedupdates) - Batch multiple updates
  - [useDelayedState](#usedelayedstate) - State with delayed updates
  - [useSequentialExecution](#usesequentialexecution) - Sequential function execution
- [TypeScript Support](#typescript-support)
- [Quick Start](#quick-start)
- [Examples](#examples)
- [Browser Compatibility](#browser-compatibility)
- [License](#license)

## Installation

```bash
npm install use-time-hooks
```

```bash
yarn add use-time-hooks
```

```bash
pnpm add use-time-hooks
```

## Features

- ⏱️ **useInterval** - Execute functions at regular intervals with full control
- ⏰ **useTimeout** - Execute functions after a delay with pause/resume
- 🔄 **useDebounce** - Debounce values to limit update frequency
- 🚀 **useThrottle** - Throttle function calls to improve performance
- ⏲️ **useStopwatch** - Full-featured stopwatch with lap timing
- 🔁 **useRetry** - Retry failed operations with exponential backoff
- 📦 **useBatchedUpdates** - Batch multiple updates to reduce re-renders
- ⏳ **useDelayedState** - State with delayed updates for optimistic UI
- 🎬 **useSequentialExecution** - Execute functions sequentially with delays
- 📝 **TypeScript Support** - Full TypeScript support with type definitions
- ⚡ **Tree Shakeable** - Import only what you need
- 🪶 **Lightweight** - Minimal bundle size impact
- ✅ **Well Tested** - Comprehensive test coverage with Vitest

## Hooks

### useInterval

Execute a callback function at specified intervals with manual control.

```tsx
import { useInterval } from 'use-time-hooks';
import { useState } from 'react';

function Timer() {
  const [count, setCount] = useState(0);

  const { toggle, stop, isRunning, executionCount } = useInterval(() => {
    setCount((count) => count + 1);
  }, 1000);

  const handleReset = () => {
    setCount(0);
    stop();
  };

  return (
    <div>
      <p>Count: {count}</p>
      <p>Executions: {executionCount}</p>
      <p>Status: {isRunning ? 'Running' : 'Stopped'}</p>
      <button onClick={toggle}>{isRunning ? 'Pause' : 'Start'}</button>
      <button onClick={handleReset}>Reset</button>
    </div>
  );
}
```

**Parameters:**

- `callback: () => void` - Function to execute at each interval
- `delay: number` - Delay in milliseconds between executions
- `immediate?: boolean` - Execute immediately on mount (default: false)

**Returns:**

- `start: () => void` - Start the interval
- `stop: () => void` - Stop the interval
- `reset: () => void` - Reset execution count and stop
- `toggle: () => void` - Toggle between start and stop
- `isRunning: boolean` - Current running state
- `executionCount: number` - Number of times the callback has been executed

### useTimeout

Execute a callback function after a specified delay with full control and real-time progress tracking.

```tsx
import { useTimeout } from 'use-time-hooks';
import { useState } from 'react';

function DelayedMessage() {
  const [message, setMessage] = useState('');

  const { start, pause, reset, toggle, isRunning, timeRemaining } = useTimeout(
    () => {
      setMessage('Hello after 3 seconds!');
    },
    3000,
    false
  ); // false = don't auto-start

  return (
    <div>
      <p>{message}</p>
      <p>Time remaining: {(timeRemaining / 1000).toFixed(1)}s</p>
      <p>Status: {isRunning ? 'Running' : 'Stopped'}</p>
      <button onClick={toggle}>{isRunning ? 'Pause' : 'Start'}</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
```

**Parameters:**

- `callback: () => void` - Function to execute after delay
- `delay: number` - Delay in milliseconds
- `autoStart?: boolean` - Whether to start immediately (default: true)

**Returns:**

- `start: () => void` - Start the timeout
- `pause: () => void` - Pause the timeout (preserves remaining time)
- `reset: () => void` - Reset to initial delay
- `clear: () => void` - Clear the timeout (alias for reset)
- `toggle: () => void` - Toggle between running and paused
- `isRunning: boolean` - Current running state
- `timeRemaining: number` - Milliseconds remaining until execution
- `timeElapsed: number` - Milliseconds elapsed since start

### useDebounce

Debounce a value, delaying updates until after the specified delay.

```tsx
import { useDebounce } from 'use-time-hooks';
import { useState, useEffect } from 'react';

function SearchInput() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearchTerm) {
      // Perform search API call
      console.log('Searching for:', debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  return (
    <input
      type="text"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

**Parameters:**

- `value: T` - Value to debounce
- `delay: number` - Delay in milliseconds

**Returns:**

- `T` - The debounced value

### useThrottle

Throttle a function, ensuring it's called at most once per specified delay.

```tsx
import { useThrottle } from 'use-time-hooks';
import { useState, useEffect } from 'react';

function ScrollTracker() {
  const [scrollY, setScrollY] = useState(0);

  const throttledScroll = useThrottle(() => {
    setScrollY(window.scrollY);
  }, 100);

  useEffect(() => {
    window.addEventListener('scroll', throttledScroll);
    return () => window.removeEventListener('scroll', throttledScroll);
  }, [throttledScroll]);

  return <div>Scroll position: {scrollY}px</div>;
}
```

**Parameters:**

- `callback: T` - Function to throttle
- `delay: number` - Minimum delay between calls in milliseconds

**Returns:**

- `T` - The throttled function

### useStopwatch

A full-featured stopwatch with lap timing capabilities and formatted time display.

```tsx
import { useStopwatch } from 'use-time-hooks';

function StopwatchDemo() {
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
      <h1>{formattedTime}</h1>
      <p>Status: {isRunning ? 'Running' : 'Stopped'}</p>

      <button onClick={toggle}>{isRunning ? 'Stop' : 'Start'}</button>
      <button onClick={reset}>Reset</button>
      <button onClick={lap} disabled={!isRunning}>
        Lap
      </button>
      <button onClick={clearLaps}>Clear Laps</button>

      <div>
        <h3>Lap Times:</h3>
        {lapTimes.map((lapTime) => (
          <div key={lapTime.lapNumber}>
            Lap {lapTime.lapNumber}: {(lapTime.lapTime / 1000).toFixed(2)}s
            (Split: {(lapTime.splitTime / 1000).toFixed(2)}s)
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Parameters:**

- `precision?: number` - Update interval in milliseconds (default: 10ms)

**Returns:**

- `start: () => void` - Start the stopwatch
- `stop: () => void` - Stop the stopwatch
- `reset: () => void` - Reset to zero
- `toggle: () => void` - Toggle between start and stop
- `lap: () => LapTime` - Record a lap time
- `clearLaps: () => void` - Clear all lap times
- `isRunning: boolean` - Current running state
- `elapsedTime: number` - Elapsed time in milliseconds
- `lapTimes: LapTime[]` - Array of recorded lap times
- `formattedTime: string` - Formatted time (HH:MM:SS.mmm)

### useRetry

Retry failed async operations with exponential backoff and customizable retry logic.

```tsx
import { useRetry } from 'use-time-hooks';
import { useState } from 'react';

function DataFetcher() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = async (id: string) => {
    const response = await fetch(`/api/data/${id}`);
    if (!response.ok) throw new Error('Failed to fetch');
    return response.json();
  };

  const { execute, cancel, reset, state } = useRetry(fetchData, {
    maxAttempts: 5,
    initialDelay: 1000,
    backoffMultiplier: 2,
    maxDelay: 30000,
    shouldRetry: (error, attempt) => {
      // Only retry on network errors or 5xx status codes
      return error.message.includes('Failed to fetch');
    },
    onRetry: (error, attempt, delay) => {
      console.log(`Retry attempt ${attempt} in ${delay}ms`);
    },
  });

  const handleFetch = async () => {
    try {
      setError(null);
      const result = await execute('123');
      setData(result);
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div>
      <button onClick={handleFetch} disabled={state.isRetrying}>
        {state.isRetrying ? 'Retrying...' : 'Fetch Data'}
      </button>
      <button onClick={cancel} disabled={!state.isRetrying}>
        Cancel
      </button>
      <button onClick={reset}>Reset</button>

      {state.isRetrying && (
        <p>
          Attempt {state.currentAttempt + 1} of {state.totalAttempts}
          {state.timeUntilNextRetry > 0 && (
            <span>
              {' '}
              - Next retry in: {(state.timeUntilNextRetry / 1000).toFixed(1)}s
            </span>
          )}
        </p>
      )}

      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
      {error && <p>Error: {error.message}</p>}
    </div>
  );
}
```

**Parameters:**

- `operation: (...args) => Promise<T>` - Async operation to retry
- `options?: RetryOptions` - Configuration options
  - `maxAttempts?: number` - Maximum retry attempts (default: 3)
  - `initialDelay?: number` - Initial delay in ms (default: 1000)
  - `backoffMultiplier?: number` - Exponential backoff multiplier (default: 2)
  - `maxDelay?: number` - Maximum delay in ms (default: 30000)
  - `useExponentialBackoff?: boolean` - Use exponential backoff (default: true)
  - `shouldRetry?: (error, attemptNumber) => boolean` - Custom retry logic
  - `onRetry?: (error, attemptNumber, nextDelay) => void` - Retry callback
  - `onMaxAttemptsReached?: (lastError, totalAttempts) => void` - Max attempts callback

**Returns:**

- `execute: (...args) => Promise<T>` - Execute with retry logic
- `cancel: () => void` - Cancel ongoing retry
- `reset: () => void` - Reset retry state
- `state: RetryState` - Current retry state

### useBatchedUpdates

Batch multiple updates over time to reduce re-renders and improve performance.

```tsx
import { useBatchedUpdates } from 'use-time-hooks';
import { useState } from 'react';

function BatchedUpdatesDemo() {
  const [messages, setMessages] = useState<string[]>([]);

  const {
    addUpdate,
    flush,
    clear,
    pendingUpdates,
    batchSize,
    hasPendingUpdates,
    timeUntilFlush,
  } = useBatchedUpdates(
    (batchedUpdates: string[]) => {
      // This will be called with all batched updates at once
      setMessages((prev) => [...prev, ...batchedUpdates]);
    },
    {
      batchWindow: 500, // Wait 500ms before flushing
      maxBatchSize: 10, // Or flush when 10 updates accumulated
      onFlush: (updates, size) => {
        console.log(`Flushed ${size} updates`);
      },
    }
  );

  const addMessage = () => {
    addUpdate(`Message ${Date.now()}`);
  };

  return (
    <div>
      <button onClick={addMessage}>Add Message</button>
      <button onClick={flush} disabled={!hasPendingUpdates}>
        Flush Now ({batchSize})
      </button>
      <button onClick={clear} disabled={!hasPendingUpdates}>
        Clear Pending
      </button>

      <p>Pending: {batchSize}</p>
      {hasPendingUpdates && (
        <p>Auto-flush in: {(timeUntilFlush / 1000).toFixed(1)}s</p>
      )}

      <div>
        {messages.map((msg, idx) => (
          <div key={idx}>{msg}</div>
        ))}
      </div>
    </div>
  );
}
```

**Parameters:**

- `onBatchFlush: (batchedUpdates: T[]) => void` - Callback when batch is flushed
- `options?: BatchedUpdatesOptions` - Configuration options
  - `batchWindow?: number` - Time window in ms (default: 100)
  - `maxBatchSize?: number` - Max batch size (default: 50)
  - `flushOnFirst?: boolean` - Flush immediately on first update (default: false)
  - `reducer?: (accumulated, newUpdate) => any[]` - Custom reducer
  - `onFlush?: (batchedUpdates, batchSize) => void` - Flush callback

**Returns:**

- `addUpdate: (update: T) => void` - Add update to batch
- `flush: () => void` - Manually flush pending updates
- `clear: () => void` - Clear pending updates
- `pendingUpdates: T[]` - Current batch
- `batchSize: number` - Number of pending updates
- `hasPendingUpdates: boolean` - Whether there are pending updates
- `timeUntilFlush: number` - Time until auto-flush in ms

### useDelayedState

State with delayed updates, useful for optimistic UI updates or debouncing state changes.

```tsx
import { useDelayedState } from 'use-time-hooks';
import { useState } from 'react';

function DelayedStateDemo() {
  const {
    value,
    immediateValue,
    setValue,
    setImmediate,
    cancel,
    isPending,
    timeRemaining,
  } = useDelayedState('', 2000);

  const [input, setInput] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInput(newValue);
    setValue(newValue); // Will update 'value' after 2 seconds
  };

  return (
    <div>
      <input
        value={input}
        onChange={handleInputChange}
        placeholder="Type something..."
      />

      <div>
        <p>Immediate: {immediateValue}</p>
        <p>Delayed: {value}</p>
        {isPending && <p>Update in: {(timeRemaining / 1000).toFixed(1)}s</p>}
      </div>

      <button onClick={() => setImmediate(input)}>Apply Immediately</button>
      <button onClick={cancel} disabled={!isPending}>
        Cancel Pending
      </button>
    </div>
  );
}
```

**Parameters:**

- `initialValue: T` - Initial state value
- `delay: number` - Delay in milliseconds
- `immediate?: boolean` - First update immediate (default: false)

**Returns:**

- `value: T` - Current value (may be delayed)
- `immediateValue: T` - Immediate value (not delayed)
- `setValue: (newValue) => void` - Set value with delay
- `setImmediate: (newValue) => void` - Set value immediately
- `cancel: () => void` - Cancel pending update
- `isPending: boolean` - Whether update is pending
- `timeRemaining: number` - Time until update in ms

### useSequentialExecution

Execute an array of functions sequentially with specified delays between each execution.

```tsx
import { useSequentialExecution, ExecutionStep } from 'use-time-hooks';
import { useState } from 'react';

function SequentialDemo() {
  const [messages, setMessages] = useState<string[]>([]);

  const steps: ExecutionStep[] = [
    {
      fn: () => setMessages((prev) => [...prev, 'Step 1 executed']),
      timeout: 1000,
      id: 'step1',
    },
    {
      fn: () => setMessages((prev) => [...prev, 'Step 2 executed']),
      timeout: 2000,
      id: 'step2',
    },
    {
      fn: () => setMessages((prev) => [...prev, 'Step 3 executed']),
      timeout: 1500,
      id: 'step3',
    },
  ];

  const {
    start,
    stop,
    reset,
    toggle,
    isRunning,
    currentStepIndex,
    cyclesCompleted,
    timeRemaining,
    currentStep,
  } = useSequentialExecution(steps, true, false); // loop=true, autoStart=false

  return (
    <div>
      <button onClick={toggle}>{isRunning ? 'Stop' : 'Start'}</button>
      <button onClick={reset}>Reset</button>

      <p>Status: {isRunning ? 'Running' : 'Stopped'}</p>
      <p>
        Step: {currentStepIndex + 1}/{steps.length}
      </p>
      <p>Cycles: {cyclesCompleted}</p>
      <p>Next in: {(timeRemaining / 1000).toFixed(1)}s</p>
      <p>Current Step: {currentStep?.id || 'None'}</p>

      <div>
        {messages.map((msg, idx) => (
          <div key={idx}>{msg}</div>
        ))}
      </div>
    </div>
  );
}
```

**Parameters:**

- `steps: ExecutionStep[]` - Array of steps to execute
  - `fn: () => void | Promise<void>` - Function to execute
  - `timeout: number` - Timeout before executing in ms
  - `id?: string` - Optional identifier
- `loop?: boolean` - Loop back to beginning (default: true)
- `autoStart?: boolean` - Start immediately (default: false)

**Returns:**

- `start: () => void` - Start execution
- `stop: () => void` - Stop execution
- `reset: () => void` - Reset to beginning
- `toggle: () => void` - Toggle between start and stop
- `isRunning: boolean` - Current running state
- `currentStepIndex: number` - Current step index
- `cyclesCompleted: number` - Number of cycles completed
- `timeRemaining: number` - Time remaining until next execution
- `currentStep: ExecutionStep | null` - Current step being executed

## TypeScript Support

This library is written in TypeScript and provides full type definitions out of the box. All hooks are fully typed with proper generic support where applicable.

### Generic Hooks

Several hooks support TypeScript generics for type-safe usage:

**useDebounce\<T\>** - Preserves the type of the debounced value:

```typescript
const [searchTerm, setSearchTerm] = useState<string>('');
const debouncedSearch = useDebounce<string>(searchTerm, 500);
// debouncedSearch is typed as string
```

**useRetry\<T\>** - Types the return value of the operation:

```typescript
interface UserData {
  id: string;
  name: string;
}

const fetchUser = async (): Promise<UserData> => {
  const response = await fetch('/api/user');
  return response.json();
};

const { execute, state } = useRetry<UserData>(fetchUser, {
  maxAttempts: 3
});

// execute() returns Promise<UserData>
const userData = await execute();
```

**useBatchedUpdates\<T\>** - Types the batched update items:

```typescript
interface LogEntry {
  timestamp: number;
  message: string;
}

const { addUpdate } = useBatchedUpdates<LogEntry>(
  (entries) => {
    console.log('Batch:', entries);
  }
);

// addUpdate expects LogEntry type
addUpdate({ timestamp: Date.now(), message: 'Hello' });
```

**useDelayedState\<T\>** - Types the state value:

```typescript
interface FormData {
  email: string;
  password: string;
}

const { value, setValue, isPending } = useDelayedState<FormData>(
  { email: '', password: '' },
  2000
);

// value is typed as FormData
console.log(value.email);
```

### Type Exports

All hooks export their return type interfaces for advanced usage:

```typescript
import type { 
  UseIntervalReturn,
  UseTimeoutReturn,
  UseStopwatchReturn,
  UseRetryReturn,
  UseBatchedUpdatesReturn,
  UseDelayedStateReturn,
  UseSequentialExecutionReturn,
  LapTime,
  ExecutionStep,
  RetryState
} from 'use-time-hooks';
```

## Quick Start

```tsx
import { useInterval, useDebounce, useTimeout } from 'use-time-hooks';
import { useState } from 'react';

function App() {
  // Simple counter with interval
  const [count, setCount] = useState(0);
  const { toggle, isRunning } = useInterval(() => {
    setCount((c) => c + 1);
  }, 1000);

  // Debounced search
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);

  // Delayed notification
  useTimeout(() => {
    console.log('5 seconds passed!');
  }, 5000);

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={toggle}>{isRunning ? 'Pause' : 'Start'}</button>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search..."
      />
      <p>Debounced: {debouncedSearch}</p>
    </div>
  );
}
```

## Examples

For complete, runnable examples of each hook, check out the [`examples/`](./examples) folder:

### Basic Hooks

- **[useInterval](./examples/typescript/useInterval.example.tsx)** ([JS](./examples/javascript/useInterval.example.jsx)) - Counter and timer examples
- **[useTimeout](./examples/typescript/useTimeout.example.tsx)** ([JS](./examples/javascript/useTimeout.example.jsx)) - Delayed notifications with controls
- **[useDebounce](./examples/typescript/useDebounce.example.tsx)** ([JS](./examples/javascript/useDebounce.example.jsx)) - Search input and form validation
- **[useThrottle](./examples/typescript/useThrottle.example.tsx)** ([JS](./examples/javascript/useThrottle.example.jsx)) - Scroll tracking and resize handling
- **[useStopwatch](./examples/typescript/useStopwatch.example.tsx)** ([JS](./examples/javascript/useStopwatch.example.jsx)) - Stopwatch with lap timing

### Advanced Hooks

- **[useRetry](./examples/typescript/useRetry.example.tsx)** ([JS](./examples/javascript/useRetry.example.jsx)) - Retry failed operations with exponential backoff
- **[useBatchedUpdates](./examples/typescript/useBatchedUpdates.example.tsx)** ([JS](./examples/javascript/useBatchedUpdates.example.jsx)) - Batch multiple updates for performance
- **[useDelayedState](./examples/typescript/useDelayedState.example.tsx)** ([JS](./examples/javascript/useDelayedState.example.jsx)) - State with delayed updates and optimistic UI
- **[useSequentialExecution](./examples/typescript/useSequentialExecution.example.tsx)** ([JS](./examples/javascript/useSequentialExecution.example.jsx)) - Execute functions sequentially with control

Each example file contains multiple use cases demonstrating different features of the hooks. Examples are available in both TypeScript and JavaScript versions.

### Live Demo

Check out the interactive demo site to see all hooks in action:

```bash
cd demos
npm install
npm run dev
```

Visit `http://localhost:5173` to explore the demos.

## Browser Compatibility

This library works with React 16.8+ (hooks support required) and supports all modern browsers.

## License

MIT © [SkorpionG](https://github.com/SkorpionG)

## Repository

[https://github.com/SkorpionG/use-time-hooks](https://github.com/SkorpionG/use-time-hooks)

## Author

Created with ❤️ by [SkorpionG](https://github.com/SkorpionG)
