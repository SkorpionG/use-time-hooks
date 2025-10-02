import { useStopwatch } from '../../../../src/useStopwatch';
import { Button } from '../ui/button';
import { DemoCard } from '../DemoCard';
import { CodeExample } from '../CodeExample';
import { DemoHeader } from '../DemoHeader';
import { DemoInstructions } from './DemoInstructions';
import { DemoFeatures } from './DemoFeatures';

export function StopwatchDemo() {
  const {
    reset,
    toggle,
    lap,
    clearLaps,
    isRunning,
    elapsedTime,
    lapTimes,
    formattedTime,
  } = useStopwatch();

  const exampleCode = `import { useStopwatch } from 'usetime';

function StopwatchExample() {
  const {
    start,
    stop,
    reset,
    toggle,
    lap,
    isRunning,
    formattedTime,
    lapTimes
  } = useStopwatch();

  return (
    <div>
      <h1>{formattedTime}</h1>
      <button onClick={toggle}>
        {isRunning ? 'Stop' : 'Start'}
      </button>
      <button onClick={reset}>Reset</button>
      <button onClick={lap}>Lap</button>
    </div>
  );
}`;

  return (
    <div className="space-y-8">
      <DemoHeader
        title="useStopwatch"
        description="Full-featured stopwatch with lap timing and formatted time display"
      />
      <DemoCard>
        <div className="space-y-6">
          {/* Stopwatch Display */}
          <div className="text-center">
            <div className="text-6xl font-mono font-bold mb-4">
              {formattedTime}
            </div>
            <div className="text-sm text-muted-foreground">
              {isRunning ? '⏱️ Running' : '⏸️ Stopped'} •{' '}
              {elapsedTime.toFixed(0)}ms elapsed
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-2 justify-center flex-wrap">
            <Button
              onClick={toggle}
              variant={isRunning ? 'destructive' : 'default'}
            >
              {isRunning ? 'Stop' : 'Start'}
            </Button>
            <Button onClick={reset} variant="outline">
              Reset
            </Button>
            <Button onClick={lap} disabled={!isRunning} variant="secondary">
              Lap
            </Button>
            <Button
              onClick={clearLaps}
              disabled={lapTimes.length === 0}
              variant="outline"
            >
              Clear Laps
            </Button>
          </div>

          {/* Lap Times */}
          {lapTimes.length > 0 && (
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Lap Times</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {lapTimes.map((lapTime) => (
                  <div
                    key={lapTime.lapNumber}
                    className="flex justify-between items-center p-2 bg-muted rounded text-sm"
                  >
                    <span className="font-medium">Lap {lapTime.lapNumber}</span>
                    <div className="flex gap-4 font-mono">
                      <span>Time: {(lapTime.lapTime / 1000).toFixed(2)}s</span>
                      <span className="text-muted-foreground">
                        Split: {(lapTime.splitTime / 1000).toFixed(2)}s
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <DemoInstructions
            steps={[
              '<strong>Start Timer:</strong> Click "Start" to begin the stopwatch. Time updates in real-time.',
              '<strong>Record Laps:</strong> Click "Lap" while running to record split times without stopping.',
              '<strong>Stop & Resume:</strong> Click "Stop" to pause, then "Start" to resume from where you left off.',
              '<strong>View Lap Data:</strong> Each lap shows both the lap time (time for that lap) and split time (total time at that lap).',
              '<strong>Reset:</strong> Click "Reset" to clear time, or "Clear Laps" to only clear lap records.'
            ]}
          />

          <DemoFeatures
            features={[
              '<strong>High Precision:</strong> Tracks time in milliseconds with formatted display (MM:SS:MS)',
              '<strong>Lap Timing:</strong> Record unlimited laps with individual and cumulative times',
              '<strong>Pause/Resume:</strong> Full control without losing elapsed time',
              '<strong>Auto-formatted:</strong> Built-in time formatting (no manual conversion needed)',
              '<strong>Use Cases:</strong> Sports timing, task tracking, performance monitoring, time trials, productivity apps'
            ]}
          />
        </div>
      </DemoCard>

      <CodeExample code={exampleCode} />
    </div>
  );
}
