import { useState } from 'react';
import { useInterval } from '../../../../src/useInterval';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { CodeExample } from '../CodeExample';
import { DemoHeader } from '../DemoHeader';
import { DemoCard } from '../DemoCard';
import { DemoInstructions } from './DemoInstructions';
import { DemoFeatures } from './DemoFeatures';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';

export function IntervalDemo() {
  const [count, setCount] = useState(0);
  const [intervalTime, setIntervalTime] = useState(1000);
  const { toggle, reset, isRunning, executionCount } = useInterval(() => {
    setCount((prev) => prev + 1);
  }, intervalTime);

  const handleReset = () => {
    setCount(0);
    reset();
  };

  return (
    <div className="space-y-8">
      <DemoHeader
        title="useInterval"
        description="Execute a callback function at specified intervals. Perfect for timers, counters, and periodic updates."
      />

      <DemoCard>
        <div className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center gap-4">
              <Clock className="h-12 w-12 text-sky-600 dark:text-sky-400" />
              <div className="text-6xl font-bold tabular-nums bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent dark:from-sky-400 dark:to-cyan-400">
                {count}
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              Executions: {executionCount}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={toggle}
                variant={isRunning ? 'secondary' : 'default'}
                size="lg"
              >
                {isRunning ? (
                  <>
                    <Pause className="mr-2 h-4 w-4" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Start
                  </>
                )}
              </Button>
              <Button onClick={handleReset} variant="outline" size="lg">
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Interval: {intervalTime}ms
            </label>
            <Slider
              min={100}
              max={2000}
              step={100}
              value={[intervalTime]}
              onValueChange={(values) => setIntervalTime(values[0])}
              disabled={isRunning}
              aria-label="Interval time in milliseconds"
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground">
              {isRunning
                ? 'Stop the timer to adjust interval'
                : 'Adjust the interval speed'}
            </p>
          </div>

          <DemoInstructions
            steps={[
              '<strong>Start Timer:</strong> Click "Start" to begin the interval. The counter increases every interval.',
              '<strong>Watch Execution Count:</strong> See how many times the interval callback has fired.',
              '<strong>Pause & Resume:</strong> Click "Pause" to stop, then "Start" to resume from where you left off.',
              '<strong>Reset:</strong> Click "Reset" to set everything back to zero.',
              '<strong>Adjust Speed:</strong> Stop the timer and use the slider to change interval timing (100ms to 2000ms).'
            ]}
          />

          <DemoFeatures
            features={[
              '<strong>Auto Cleanup:</strong> Automatically clears intervals on unmount - no memory leaks',
              '<strong>Pause/Resume:</strong> Full control to start, stop, and reset the interval',
              '<strong>Execution Tracking:</strong> Built-in counter shows how many times callback has run',
              '<strong>Dynamic Interval:</strong> Change timing on the fly',
              '<strong>Use Cases:</strong> Polling APIs, auto-refresh, animations, countdowns, real-time updates'
            ]}
          />
        </div>
      </DemoCard>

      <CodeExample
        code={`import { useInterval } from 'usetime';

function Timer() {
  const [count, setCount] = useState(0);
  const { toggle, reset, isRunning, executionCount } = useInterval(() => {
    setCount(count => count + 1);
  }, 1000);
  
  return (
    <div>
      <div>Count: {count}</div>
      <div>Executions: {executionCount}</div>
      <div>Status: {isRunning ? 'Running' : 'Stopped'}</div>
      <button onClick={toggle}>
        {isRunning ? 'Stop' : 'Start'}
      </button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}`}
      />
    </div>
  );
}
