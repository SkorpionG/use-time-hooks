# use-time-hooks Examples

This directory contains practical examples for each hook in the use-time-hooks library, organized by language.

## Folder Structure

```text
examples/
├── typescript/          # TypeScript examples (.tsx)
│   ├── useInterval.example.tsx
│   ├── useTimeout.example.tsx
│   ├── useDebounce.example.tsx
│   ├── useThrottle.example.tsx
│   ├── useStopwatch.example.tsx
│   ├── useRetry.example.tsx
│   ├── useBatchedUpdates.example.tsx
│   ├── useDelayedState.example.tsx
│   └── useSequentialExecution.example.tsx
│
└── javascript/          # JavaScript examples (.jsx)
    ├── useInterval.example.jsx
    ├── useTimeout.example.jsx
    ├── useDebounce.example.jsx
    ├── useThrottle.example.jsx
    ├── useStopwatch.example.jsx
    ├── useRetry.example.jsx
    ├── useBatchedUpdates.example.jsx
    ├── useDelayedState.example.jsx
    └── useSequentialExecution.example.jsx
```

## Available Examples

### Basic Hooks

Each example is available in both TypeScript and JavaScript versions:

| Hook                      | TypeScript                                               | JavaScript                                               | Description                         |
| ------------------------- | -------------------------------------------------------- | -------------------------------------------------------- | ----------------------------------- |
| **useInterval**           | [.tsx](./typescript/useInterval.example.tsx)            | [.jsx](./javascript/useInterval.example.jsx)            | Counter and timer examples          |
| **useTimeout**            | [.tsx](./typescript/useTimeout.example.tsx)             | [.jsx](./javascript/useTimeout.example.jsx)             | Delayed notifications with controls |
| **useDebounce**           | [.tsx](./typescript/useDebounce.example.tsx)            | [.jsx](./javascript/useDebounce.example.jsx)            | Search input and form validation    |
| **useThrottle**           | [.tsx](./typescript/useThrottle.example.tsx)            | [.jsx](./javascript/useThrottle.example.jsx)            | Scroll tracking and resize handling |
| **useStopwatch**          | [.tsx](./typescript/useStopwatch.example.tsx)           | [.jsx](./javascript/useStopwatch.example.jsx)           | Basic stopwatch and lap timing      |

### Advanced Hooks

| Hook                      | TypeScript                                               | JavaScript                                               | Description                         |
| ------------------------- | -------------------------------------------------------- | -------------------------------------------------------- | ----------------------------------- |
| **useRetry**              | [.tsx](./typescript/useRetry.example.tsx)               | [.jsx](./javascript/useRetry.example.jsx)               | Retry failed operations with exponential backoff |
| **useBatchedUpdates**     | [.tsx](./typescript/useBatchedUpdates.example.tsx)      | [.jsx](./javascript/useBatchedUpdates.example.jsx)      | Batch multiple updates for performance |
| **useDelayedState**       | [.tsx](./typescript/useDelayedState.example.tsx)        | [.jsx](./javascript/useDelayedState.example.jsx)        | State with delayed updates and optimistic UI |
| **useSequentialExecution** | [.tsx](./typescript/useSequentialExecution.example.tsx) | [.jsx](./javascript/useSequentialExecution.example.jsx) | Execute functions sequentially with control |

## Language Versions

### TypeScript (`.tsx`)

- Full type safety
- IntelliSense support
- Type annotations for parameters and return values
- Recommended for TypeScript projects

### JavaScript (`.jsx`)

- No type annotations
- Simpler syntax
- Works in any React project
- Recommended for JavaScript projects

## Running Examples

These examples can be integrated into any React application.

### Quick Start

**For TypeScript projects:**

1. Copy the example file from the `typescript/` folder
2. Import it into your React app
3. Use the component in your application

```tsx
import { DebouncedSearchExample } from './examples/typescript/useDebounce.example';

function App() {
  return (
    <div>
      <DebouncedSearchExample />
    </div>
  );
}
```

**For JavaScript projects:**

1. Copy the example file from the `javascript/` folder
2. Import it into your React app
3. Use the component in your application

```jsx
import { DebouncedSearchExample } from './examples/javascript/useDebounce.example';

function App() {
  return (
    <div>
      <DebouncedSearchExample />
    </div>
  );
}
```

## Example Structure

Each example file contains:

- **Multiple example components** demonstrating different use cases
- **Inline documentation** explaining what each example does
- **Complete, runnable code** that you can copy and paste

## Contributing Examples

If you have a great use case for any of the hooks, feel free to contribute an example!
