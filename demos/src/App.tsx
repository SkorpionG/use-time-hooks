import { IntervalDemo } from './components/demos/IntervalDemo';
import { TimeoutDemo } from './components/demos/TimeoutDemo';
import { DebounceDemo } from './components/demos/DebounceDemo';
import { ThrottleDemo } from './components/demos/ThrottleDemo';
import { StopwatchDemo } from './components/demos/StopwatchDemo';
import { RetryDemo } from './components/demos/RetryDemo';
import { BatchedUpdatesDemo } from './components/demos/BatchedUpdatesDemo';
import { DelayedStateDemo } from './components/demos/DelayedStateDemo';
import { SequentialExecutionDemo } from './components/demos/SequentialExecutionDemo';
import { ThemeToggle } from './components/ThemeToggle';
import { InstallationSection } from './components/InstallationSection';
import { ResponsiveTabs } from './components/ResponsiveTabs';
import {
  Clock,
  Timer,
  Search,
  Activity,
  TimerReset,
  RefreshCw,
  Zap,
  Save,
  PlayCircle,
  Github,
} from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-rose-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-4 py-8">
        <div className="absolute right-4 top-4">
          <ThemeToggle />
        </div>

        <header className="mb-12 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <Clock className="h-12 w-12 text-sky-600 dark:text-sky-400" />
            <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-sky-600 via-cyan-600 to-rose-600 bg-clip-text text-transparent dark:from-sky-400 dark:via-cyan-400 dark:to-rose-400">
              use-time-hooks
            </h1>
          </div>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            A collection of React hooks for time-based function execution.
            Simplify intervals, timeouts, debouncing, and throttling in your
            React applications.
          </p>
          <div className="mt-6 flex items-center justify-center gap-4">
            <a
              href="https://github.com/SkorpionG/use-time-hooks"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <Github className="h-4 w-4" />
              View on GitHub
            </a>
            <span className="text-muted-foreground">•</span>
            <a
              href="https://www.npmjs.com/package/use-time-hooks"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              View on npm
            </a>
          </div>
        </header>

        <InstallationSection />

        <section className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            Interactive Examples
          </h2>
          <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
            Explore live demonstrations of each hook. Click on any tab to see the hook in action.
          </p>

          <ResponsiveTabs
            defaultValue="interval"
            tabs={[
            { value: 'interval', label: 'useInterval', icon: <Clock className="h-4 w-4" /> },
            { value: 'timeout', label: 'useTimeout', icon: <Timer className="h-4 w-4" /> },
            { value: 'debounce', label: 'useDebounce', icon: <Search className="h-4 w-4" /> },
            { value: 'throttle', label: 'useThrottle', icon: <Activity className="h-4 w-4" /> },
            { value: 'stopwatch', label: 'useStopwatch', icon: <TimerReset className="h-4 w-4" /> },
            { value: 'retry', label: 'useRetry', icon: <RefreshCw className="h-4 w-4" /> },
            { value: 'batched', label: 'useBatchedUpdates', icon: <Zap className="h-4 w-4" /> },
            { value: 'delayed', label: 'useDelayedState', icon: <Save className="h-4 w-4" /> },
            { value: 'sequential', label: 'useSequentialExecution', icon: <PlayCircle className="h-4 w-4" /> },
          ]}
        >
          {(activeTab) => (
            <>
              {activeTab === 'interval' && <IntervalDemo />}
              {activeTab === 'timeout' && <TimeoutDemo />}
              {activeTab === 'debounce' && <DebounceDemo />}
              {activeTab === 'throttle' && <ThrottleDemo />}
              {activeTab === 'stopwatch' && <StopwatchDemo />}
              {activeTab === 'retry' && <RetryDemo />}
              {activeTab === 'batched' && <BatchedUpdatesDemo />}
              {activeTab === 'delayed' && <DelayedStateDemo />}
              {activeTab === 'sequential' && <SequentialExecutionDemo />}
            </>
          )}
        </ResponsiveTabs>
        </section>

        <footer className="mt-16 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>Built with React, TypeScript, and Tailwind CSS</p>
          <p className="mt-2">MIT License © {new Date().getFullYear()}</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
