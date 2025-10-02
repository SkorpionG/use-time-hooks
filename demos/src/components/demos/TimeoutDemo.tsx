import { useState } from 'react';
import { useTimeout } from '../../../../src/useTimeout';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { CodeExample } from '../CodeExample';
import { DemoHeader } from '../DemoHeader';
import { DemoCard } from '../DemoCard';
import { DemoInstructions } from './DemoInstructions';
import { DemoFeatures } from './DemoFeatures';
import { Play, RotateCcw, X, Timer } from 'lucide-react';

export function TimeoutDemo() {
  const [message, setMessage] = useState('');
  const [delay, setDelay] = useState(3000);

  const { start, pause, reset, isRunning, timeRemaining } = useTimeout(
    () => {
      setMessage('⏰ Timeout executed!');
    },
    delay,
    false // Don't auto-start
  );

  const handleStart = () => {
    setMessage('');
    start();
  };

  const handleReset = () => {
    setMessage('');
    reset();
  };

  return (
    <div className="space-y-8">
      <DemoHeader
        title="useTimeout"
        description="Execute a callback function after a specified delay with control methods to reset or cancel."
      />

      <DemoCard>
        <div className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center align-middle gap-4">
              <Timer className="h-12 w-12 text-cyan-600 dark:text-cyan-400" />
              <div className="text-center">
                {isRunning ? (
                  <div className="text-2xl font-semibold text-muted-foreground animate-pulse">
                    {(timeRemaining / 1000).toFixed(1)}s remaining
                  </div>
                ) : message ? (
                  <div className="text-2xl font-semibold">{message}</div>
                ) : (
                  <div className="text-2xl font-semibold text-muted-foreground">
                    Ready to start
                  </div>
                )}
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              Status: {isRunning ? 'Running' : 'Stopped'}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={handleStart} disabled={isRunning} size="lg">
                <Play className="mr-2 h-4 w-4" />
                Start
              </Button>
              <Button
                onClick={pause}
                variant="secondary"
                disabled={!isRunning}
                size="lg"
              >
                <X className="mr-2 h-4 w-4" />
                Pause
              </Button>
              <Button onClick={handleReset} variant="outline" size="lg">
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Delay: {delay}ms ({(delay / 1000).toFixed(1)}s)
            </label>
            <Slider
              min={1000}
              max={10000}
              step={500}
              value={[delay]}
              onValueChange={(values) => setDelay(values[0])}
              disabled={isRunning}
              aria-label="Timeout delay in milliseconds"
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground">
              {isRunning
                ? 'Stop the timeout to adjust delay'
                : 'Adjust the timeout delay'}
            </p>
          </div>

          <DemoInstructions
            steps={[
              '<strong>Click Start:</strong> Begin the countdown timer. Watch the "Time remaining" count down.',
              '<strong>Watch Countdown:</strong> The timer shows remaining time in seconds with real-time updates.',
              '<strong>Try Pause:</strong> Click "Pause" to stop the countdown. Click "Start" again to resume.',
              '<strong>Try Reset:</strong> Click "Reset" to clear everything and return to initial state.',
              '<strong>Adjust Delay:</strong> Use the slider to change the timeout duration (1-10 seconds).'
            ]}
          />

          <DemoFeatures
            features={[
              '<strong>Precise Timing:</strong> Execute callbacks after exact delays with countdown tracking',
              '<strong>Full Control:</strong> Start, pause, and reset the timeout at any time',
              '<strong>Real-time Countdown:</strong> See exactly how much time remains',
              '<strong>Auto Cleanup:</strong> Automatically clears timeouts on unmount',
              '<strong>Use Cases:</strong> Delayed notifications, auto-logout, tooltips, temporary messages, timed actions'
            ]}
          />
        </div>
      </DemoCard>

      <CodeExample
        code={`import { useTimeout } from 'usetime';

function DelayedMessage() {
  const [message, setMessage] = useState('');
  
  const { start, pause, reset, isRunning, timeRemaining } = useTimeout(() => {
    setMessage('Hello after 3 seconds!');
  }, 3000, false);
  
  return (
    <div>
      <p>{message}</p>
      <p>Time remaining: {(timeRemaining / 1000).toFixed(1)}s</p>
      <p>Status: {isRunning ? 'Running' : 'Stopped'}</p>
      <button onClick={start} disabled={isRunning}>Start</button>
      <button onClick={pause} disabled={!isRunning}>Pause</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}`}
      />
    </div>
  );
}
