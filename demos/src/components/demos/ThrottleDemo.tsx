import { useState, useEffect, useRef } from 'react';
import { useThrottle } from '../../../../src/useThrottle';
import { MousePointer2, Activity } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { CodeExample } from '../CodeExample';
import { DemoHeader } from '../DemoHeader';
import { DemoCard } from '../DemoCard';
import { DemoInstructions } from './DemoInstructions';
import { DemoFeatures } from './DemoFeatures';

export function ThrottleDemo() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [callCount, setCallCount] = useState(0);
  const [throttledCallCount, setThrottledCallCount] = useState(0);
  const [delay, setDelay] = useState(100);
  const demoBoxRef = useRef<HTMLDivElement>(null);

  const throttledUpdate = useThrottle((x: number, y: number) => {
    setMousePosition({ x, y });
    setThrottledCallCount((prev) => prev + 1);
  }, delay);

  useEffect(() => {
    const demoBox = demoBoxRef.current;
    if (!demoBox) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = demoBox.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setCallCount((prev) => prev + 1);
      throttledUpdate(x, y);
    };

    demoBox.addEventListener('mousemove', handleMouseMove);
    return () => demoBox.removeEventListener('mousemove', handleMouseMove);
  }, [throttledUpdate]);

  const handleReset = () => {
    setCallCount(0);
    setThrottledCallCount(0);
  };

  return (
    <div className="space-y-8">
      <DemoHeader
        title="useThrottle"
        description="Throttle function calls to ensure they're executed at most once per specified delay. Perfect for scroll, resize, and mouse events."
      />

      <DemoCard>
        <div className="space-y-6">
          <div
            ref={demoBoxRef}
            className="relative h-64 rounded-lg border-2 border-dashed bg-muted/30"
          >
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MousePointer2 className="mx-auto mb-2 h-8 w-8 text-sky-600 dark:text-sky-400" />
                <p>Move your mouse in this area</p>
              </div>
            </div>
            <div
              className="pointer-events-none absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-rose-500 to-rose-600 shadow-lg transition-transform"
              style={{
                left: `${mousePosition.x}px`,
                top: `${mousePosition.y}px`,
              }}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border bg-background p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Activity className="h-4 w-4" />
                Total Events
              </div>
              <div className="mt-2 text-3xl font-bold tabular-nums">
                {callCount}
              </div>
            </div>
            <div className="rounded-lg border bg-background p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Activity className="h-4 w-4" />
                Throttled Calls
              </div>
              <div className="mt-2 text-3xl font-bold tabular-nums text-primary">
                {throttledCallCount}
              </div>
            </div>
            <div className="rounded-lg border bg-background p-4">
              <div className="text-sm text-muted-foreground">Reduction</div>
              <div className="mt-2 text-3xl font-bold tabular-nums text-green-600">
                {callCount > 0
                  ? Math.round((1 - throttledCallCount / callCount) * 100)
                  : 0}
                %
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Throttle Delay: {delay}ms
              </label>
              <Button onClick={handleReset} variant="link" size="sm">
                Reset Counters
              </Button>
            </div>
            <Slider
              min={50}
              max={500}
              step={50}
              value={[delay]}
              onValueChange={(values) => {
                setDelay(values[0]);
                handleReset();
              }}
              className="mt-2"
              aria-label="Throttle delay in milliseconds"
            />
            <p className="text-xs text-muted-foreground">
              Lower delay = more frequent updates. Higher delay = better
              performance.
            </p>
          </div>

          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="text-sm">
              <div className="font-semibold">Mouse Position:</div>
              <div className="mt-1 font-mono text-muted-foreground">
                X: {mousePosition.x}px, Y: {mousePosition.y}px
              </div>
            </div>
          </div>

          <DemoInstructions
            steps={[
              '<strong>Move Your Mouse:</strong> Move your mouse around the demo box and watch the counters.',
              '<strong>Compare Counts:</strong> "Total Calls" shows every mouse move. "Throttled Calls" shows how many actually updated.',
              '<strong>See Efficiency:</strong> Throttling reduces calls by up to 90%, improving performance.',
              '<strong>Adjust Delay:</strong> Use the slider to change throttle timing (50ms = more updates, 500ms = fewer updates).',
              '<strong>Reset & Test:</strong> Click "Reset Counters" to start fresh and try different delays.'
            ]}
          />

          <DemoFeatures
            features={[
              '<strong>Performance Boost:</strong> Reduces function calls by 80-95% for high-frequency events',
              '<strong>Guaranteed Execution:</strong> Unlike debounce, throttle ensures regular execution during continuous events',
              '<strong>Smooth Updates:</strong> Perfect for animations, scroll tracking, and real-time data',
              '<strong>Configurable Rate:</strong> Control how often updates occur (100ms for smooth, 500ms for efficiency)',
              '<strong>Use Cases:</strong> Scroll handlers, resize events, mouse tracking, infinite scroll, game loops'
            ]}
          />
        </div>
      </DemoCard>

      <CodeExample
        code={`import { useThrottle } from 'usetime';

function ScrollTracker() {
  const [scrollY, setScrollY] = useState(0);
  
  const throttledScroll = useThrottle(() => {
    setScrollY(window.scrollY);
  }, 100);
  
  useEffect(() => {
    window.addEventListener('scroll', throttledScroll);
    return () => window.removeEventListener('scroll', throttledScroll);
  }, [throttledScroll]);
  
  return <div>Scroll: {scrollY}px</div>;
}`}
      />
    </div>
  );
}
