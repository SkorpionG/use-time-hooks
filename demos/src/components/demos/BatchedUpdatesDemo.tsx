import { useState, useEffect, useRef } from 'react';
import { useBatchedUpdates } from '../../../../src/useBatchedUpdates';
import { Button } from '@/components/ui/button';
import { CodeExample } from '../CodeExample';
import { DemoHeader } from '../DemoHeader';
import { DemoCard } from '../DemoCard';
import { DemoInstructions } from './DemoInstructions';
import { DemoFeatures } from './DemoFeatures';
import { Zap, Clock, CheckCircle, Play, Pause } from 'lucide-react';

export function BatchedUpdatesDemo() {
  const [count, setCount] = useState(0);
  const [renderCount, setRenderCount] = useState(0);
  const [updates, setUpdates] = useState<string[]>([]);
  const [lastFlushSize, setLastFlushSize] = useState(0);
  const [isAutoMode, setIsAutoMode] = useState(false);
  const autoIntervalRef = useRef<number | null>(null);
  
  const { addUpdate: addBatchUpdate, batchSize, timeUntilFlush, clear: clearBatch } = useBatchedUpdates<() => void>(
    (batchedUpdates) => {
      // Execute all batched update functions
      const timestamp = new Date().toLocaleTimeString();
      setLastFlushSize(batchedUpdates.length);
      setUpdates(prev => [...prev.slice(-9), `${timestamp} - 🚀 Flushed ${batchedUpdates.length} batched updates`]);
      batchedUpdates.forEach(fn => fn());
    },
    { 
      batchWindow: 1000, // 1 second window for clearer demonstration
      maxBatchSize: 10 
    }
  );

  // Track renders - intentionally no deps to count every render
  const renderCountRef = useRef(0);
  useEffect(() => {
    renderCountRef.current += 1;
    setRenderCount(renderCountRef.current);
  });  

  const logUpdate = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setUpdates(prev => [...prev.slice(-9), `${timestamp} - ${message}`]);
  };

  const handleSingleUpdate = () => {
    setCount(prev => prev + 1);
    logUpdate('Single update');
  };

  const handleBatchedUpdates = () => {
    addBatchUpdate(() => {
      setCount(prev => prev + 1);
      logUpdate('Batched update 1');
    });
    
    addBatchUpdate(() => {
      setCount(prev => prev + 1);
      logUpdate('Batched update 2');
    });
    
    addBatchUpdate(() => {
      setCount(prev => prev + 1);
      logUpdate('Batched update 3');
    });
  };

  const handleRapidUpdates = () => {
    for (let i = 0; i < 5; i++) {
      addBatchUpdate(() => {
        setCount(prev => prev + 1);
        logUpdate(`Rapid update ${i + 1}`);
      });
    }
  };

  const startAutoMode = () => {
    setIsAutoMode(true);
    const intervalId = setInterval(() => {
      addBatchUpdate(() => {
        setCount(prev => prev + 1);
        logUpdate('Auto-generated update');
      });
    }, 300);
    autoIntervalRef.current = intervalId as unknown as number;
  };

  const stopAutoMode = () => {
    if (autoIntervalRef.current) {
      clearInterval(autoIntervalRef.current);
      autoIntervalRef.current = null;
    }
    setIsAutoMode(false);
  };

  const handleToggleAutoMode = () => {
    if (isAutoMode) {
      stopAutoMode();
    } else {
      startAutoMode();
    }
  };

  const handleReset = () => {
    // Stop auto mode if running
    if (autoIntervalRef.current) {
      clearInterval(autoIntervalRef.current);
      autoIntervalRef.current = null;
    }
    setIsAutoMode(false);
    
    // Clear batch and reset state
    clearBatch();
    setCount(0);
    setRenderCount(0);
    setUpdates([]);
    setLastFlushSize(0);
    renderCountRef.current = 0;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoIntervalRef.current) {
        clearInterval(autoIntervalRef.current);
      }
    };
  }, []);

  const exampleCode = `import { useBatchedUpdates } from 'use-time-hooks';

function BatchedCounter() {
  const [count, setCount] = useState(0);
  const { batchUpdates, pendingCount } = useBatchedUpdates(100);

  const handleBatchedUpdates = () => {
    // These 3 updates will be batched together
    batchUpdates(() => setCount(prev => prev + 1));
    batchUpdates(() => setCount(prev => prev + 1));
    batchUpdates(() => setCount(prev => prev + 1));
  };

  return (
    <div>
      <h3>Count: {count}</h3>
      <p>Pending: {pendingCount}</p>
      <button onClick={handleBatchedUpdates}>
        +3 (Batched)
      </button>
    </div>
  );
}`;

  return (
    <div className="space-y-8">
      <DemoHeader
        title="useBatchedUpdates"
        description="Batch multiple state updates together to improve performance and reduce re-renders"
      />
      
      <DemoCard>
        <div className="space-y-6">
          {/* Mode Indicator */}
          {isAutoMode && (
            <div className="p-3 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-orange-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
                    Auto Mode Active - Generating updates every 300ms
                  </span>
                </div>
                <Button onClick={stopAutoMode} size="sm" variant="outline">
                  <Pause className="h-3 w-3 mr-1" />
                  Stop
                </Button>
              </div>
            </div>
          )}

          {/* Performance Metrics */}
          <div className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold">{count}</div>
              <div className="text-sm text-muted-foreground">Count</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{renderCount}</div>
              <div className="text-sm text-muted-foreground">Renders</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1">
                <div className="text-2xl font-bold">{batchSize}</div>
                {batchSize > 0 && <Clock className="h-4 w-4 text-orange-500 animate-pulse" />}
              </div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {batchSize > 0 ? `${(timeUntilFlush / 1000).toFixed(1)}s` : '-'}
              </div>
              <div className="text-sm text-muted-foreground">Flush In</div>
            </div>
          </div>

          {/* Batch Status */}
          {batchSize > 0 && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-md text-orange-800 dark:bg-orange-950 dark:border-orange-800 dark:text-orange-200">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 animate-pulse" />
                <span className="font-medium">
                  {batchSize} update{batchSize > 1 ? 's' : ''} queued - will flush in {(timeUntilFlush / 1000).toFixed(1)} seconds
                </span>
              </div>
            </div>
          )}

          {lastFlushSize > 0 && batchSize === 0 && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">
                  Last batch: {lastFlushSize} update{lastFlushSize > 1 ? 's' : ''} flushed successfully
                </span>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="space-y-3">
            <div className="text-sm text-center text-muted-foreground mb-2">
              {isAutoMode ? (
                <span className="text-orange-600 font-medium">🔄 Auto mode active - generating updates every 300ms</span>
              ) : (
                <span>Click buttons below to add updates and watch them batch together</span>
              )}
            </div>
            
            <div className="flex gap-2 justify-center flex-wrap">
              <Button onClick={handleSingleUpdate} variant="outline" disabled={isAutoMode}>
                +1 Single Update
              </Button>
              <Button onClick={handleBatchedUpdates} disabled={isAutoMode}>
                <Zap className="h-4 w-4 mr-2" />
                +3 Batched Updates
              </Button>
              <Button onClick={handleRapidUpdates} disabled={isAutoMode}>
                <Zap className="h-4 w-4 mr-2" />
                +5 Rapid Updates
              </Button>
            </div>
            
            <div className="flex gap-2 justify-center">
              <Button 
                onClick={handleToggleAutoMode}
                variant={isAutoMode ? "default" : "outline"}
                size="sm"
              >
                {isAutoMode ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Stop Auto Mode
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Auto Mode
                  </>
                )}
              </Button>
              <Button onClick={handleReset} variant="outline" size="sm">
                Reset All
              </Button>
            </div>
          </div>

          {/* Update Log */}
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-3">Recent Updates</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {updates.length === 0 ? (
                <div className="text-sm text-muted-foreground">No updates yet</div>
              ) : (
                updates.map((update, index) => (
                  <div key={index} className="text-xs font-mono text-muted-foreground">
                    {update}
                  </div>
                ))
              )}
            </div>
          </div>

          <DemoInstructions
            steps={[
              '<strong>Try Manual Mode First:</strong> Click "+3 Batched Updates" and watch the "Pending" counter. Updates queue for 1 second, then flush together.',
              '<strong>Compare with Single Updates:</strong> Click "+1 Single Update" 3 times. Notice the render count increases by 3 (one per update).',
              '<strong>Enable Auto Mode:</strong> Click "Start Auto Mode" to see continuous batching in action. Updates generate every 300ms but batch together.',
              '<strong>Watch the Metrics:</strong> <ul class="ml-6 mt-1 space-y-1 list-disc"><li><strong>Pending:</strong> Updates waiting to flush</li><li><strong>Flush In:</strong> Countdown to next batch flush</li><li><strong>Render Count:</strong> Total component re-renders</li></ul>'
            ]}
          />

          <DemoFeatures
            title="💡 Key Benefits:"
            features={[
              '<strong>Reduced Re-renders:</strong> 3 batched updates = 1 render vs 3 single updates = 3 renders',
              '<strong>Better Performance:</strong> Fewer renders = smoother UI, especially with frequent updates',
              '<strong>Configurable Window:</strong> Adjust batch window (1 second here) based on your needs',
              '<strong>Automatic Flushing:</strong> Updates flush automatically after the batch window expires'
            ]}
          />
        </div>
      </DemoCard>

      <CodeExample code={exampleCode} />
    </div>
  );
}
