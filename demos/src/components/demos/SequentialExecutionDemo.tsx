import { useState } from 'react';
import { useSequentialExecution } from '../../../../src/useSequentialExecution';
import { Button } from '@/components/ui/button';
import { CodeExample } from '../CodeExample';
import { DemoHeader } from '../DemoHeader';
import { DemoCard } from '../DemoCard';
import { DemoInstructions } from './DemoInstructions';
import { DemoFeatures } from './DemoFeatures';
import { Play, Square, RotateCcw, CheckCircle, Clock } from 'lucide-react';

export function SequentialExecutionDemo() {
  const [results, setResults] = useState<string[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [animationStates, setAnimationStates] = useState<boolean[]>([
    false,
    false,
    false,
    false,
  ]);

  const addLog = (message: string) => {
    setLogs((prev) => [
      ...prev.slice(-4),
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  // API simulation functions - simplified to execute immediately
  const apiCall1 = (): void => {
    addLog('🚀 API call 1: Fetching user data...');
    setResults((prev) => [...prev, '1. ✅ User data fetched']);
    addLog('✅ API call 1 completed');
  };

  const apiCall2 = (): void => {
    addLog('🚀 API call 2: Loading preferences...');
    setResults((prev) => [...prev, '2. ✅ Preferences loaded']);
    addLog('✅ API call 2 completed');
  };

  const apiCall3 = (): void => {
    addLog('🚀 API call 3: Preparing dashboard...');
    setResults((prev) => [...prev, '3. ✅ Dashboard ready']);
    addLog('✅ API call 3 completed');
  };

  // Animation functions - simplified to toggle immediately
  const animateBox = (index: number): void => {
    setAnimationStates((prev) => {
      const newStates = [...prev];
      newStates[index] = !newStates[index]; // Toggle the state
      return newStates;
    });
  };

  const apiSteps = [
    {
      fn: apiCall1,
      timeout: 1000,
      id: 'fetch-user-data',
    },
    {
      fn: apiCall2,
      timeout: 1500,
      id: 'load-preferences',
    },
    {
      fn: apiCall3,
      timeout: 800,
      id: 'prepare-dashboard',
    },
  ];

  const animationSteps = [
    { fn: () => animateBox(0), timeout: 500, id: 'box-1' },
    { fn: () => animateBox(1), timeout: 500, id: 'box-2' },
    { fn: () => animateBox(2), timeout: 500, id: 'box-3' },
    { fn: () => animateBox(3), timeout: 500, id: 'box-4' },
  ];

  const apiExecution = useSequentialExecution(apiSteps, false, false);
  const animationExecution = useSequentialExecution(
    animationSteps,
    false,
    false
  );

  const handleApiExecution = () => {
    setResults([]);
    setLogs([]);
    apiExecution.reset();
    apiExecution.start();
  };

  const handleAnimationExecution = () => {
    setAnimationStates([false, false, false, false]);
    animationExecution.reset();
    animationExecution.start();
  };

  const handleReset = () => {
    setResults([]);
    setLogs([]);
    setAnimationStates([false, false, false, false]);
    apiExecution.reset();
    animationExecution.reset();
  };

  const exampleCode = `import { useSequentialExecution } from 'usetime';

function SequentialApiCalls() {
  const [results, setResults] = useState([]);

  const apiCall1 = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return 'User data fetched';
  };

  const apiCall2 = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return 'Preferences loaded';
  };

  const { execute, isExecuting, currentIndex, cancel } = 
    useSequentialExecution(
      [apiCall1, apiCall2],
      {
        onSuccess: (result, index) => {
          setResults(prev => [...prev, result]);
        },
        onComplete: () => {
          console.log('All calls completed!');
        }
      }
    );

  return (
    <div>
      <button onClick={execute} disabled={isExecuting}>
        {isExecuting ? \`Step \${currentIndex + 1}/2\` : 'Start'}
      </button>
      {results.map((result, i) => (
        <div key={i}>{result}</div>
      ))}
    </div>
  );
}`;

  return (
    <div className="space-y-8">
      <DemoHeader
        title="useSequentialExecution"
        description="Execute async functions one after another in sequence with full control and progress tracking"
      />

      <DemoCard>
        <div className="space-y-6">
          {/* API Sequence Demo */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Sequential API Calls</h3>

            <div className="flex items-center gap-4 p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {apiExecution.isRunning && (
                    <Clock className="h-4 w-4 text-blue-500 animate-pulse" />
                  )}
                  <span className="font-medium">
                    {apiExecution.isRunning
                      ? `Executing step ${apiExecution.currentStepIndex + 1} of 3`
                      : apiExecution.cyclesCompleted > 0
                        ? '✅ Sequence completed'
                        : 'Ready to execute'}
                  </span>
                  {apiExecution.isRunning && apiExecution.timeRemaining > 0 && (
                    <span className="text-sm text-muted-foreground">
                      (next step in {(apiExecution.timeRemaining / 1000).toFixed(1)}s)
                    </span>
                  )}
                </div>

                <div className="flex gap-1">
                  {[0, 1, 2].map((index) => (
                    <div
                      key={index}
                      className={`h-2 flex-1 rounded transition-all ${
                        index < apiExecution.currentStepIndex || 
                        (index === apiExecution.currentStepIndex && apiExecution.cyclesCompleted > 0 && !apiExecution.isRunning)
                          ? 'bg-green-500'
                          : index === apiExecution.currentStepIndex &&
                              apiExecution.isRunning
                            ? 'bg-blue-500 animate-pulse'
                            : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    />
                  ))}
                </div>
                
                <div className="mt-2 text-xs text-muted-foreground">
                  Current step: {apiExecution.currentStep?.id || 'None'} | Cycles completed: {apiExecution.cyclesCompleted}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleApiExecution}
                  disabled={apiExecution.isRunning}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start API Sequence
                </Button>
                {apiExecution.isRunning && (
                  <Button onClick={apiExecution.stop} variant="outline">
                    <Square className="h-4 w-4 mr-2" />
                    Stop
                  </Button>
                )}
              </div>
            </div>

            {/* API Results */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Results</h4>
                <div className="border rounded-lg p-3 min-h-[100px]">
                  {results.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      No results yet
                    </div>
                  ) : (
                    results.map((result, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm"
                      >
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        {result}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Execution Log</h4>
                <div className="border rounded-lg p-3 min-h-[100px] max-h-[100px] overflow-y-auto">
                  {logs.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                      No logs yet
                    </div>
                  ) : (
                    logs.map((log, index) => (
                      <div
                        key={index}
                        className="text-xs font-mono text-muted-foreground"
                      >
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Animation Sequence Demo */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">
              Sequential Animations
            </h3>

            <div className="space-y-4">
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={handleAnimationExecution}
                  disabled={animationExecution.isRunning}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Animations
                </Button>
                {animationExecution.isRunning && (
                  <Button onClick={animationExecution.stop} variant="outline">
                    <Square className="h-4 w-4 mr-2" />
                    Stop
                  </Button>
                )}
                <Button onClick={handleReset} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>

              <div className="flex justify-center gap-3">
                {animationStates.map((isActive, index) => (
                  <div
                    key={index}
                    className={`
                      w-12 h-12 rounded-lg border-2 flex items-center justify-center font-bold
                      transition-all duration-300 ease-in-out
                      ${
                        isActive
                          ? 'bg-blue-500 text-white border-blue-600 scale-110 shadow-lg'
                          : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                      }
                      ${
                        animationExecution.currentStepIndex === index &&
                        animationExecution.isRunning
                          ? 'ring-2 ring-blue-400 ring-opacity-50'
                          : ''
                      }
                    `}
                  >
                    {index + 1}
                  </div>
                ))}
              </div>

              <div className="text-center text-sm text-muted-foreground">
                {animationExecution.isRunning ? (
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="h-3 w-3 animate-pulse" />
                    <span>
                      Animating box {animationExecution.currentStepIndex + 1} of 4
                      {animationExecution.timeRemaining > 0 && (
                        <span className="ml-1">
                          (next in {(animationExecution.timeRemaining / 1000).toFixed(1)}s)
                        </span>
                      )}
                    </span>
                  </div>
                ) : animationExecution.cyclesCompleted > 0 ? (
                  '✅ Animation sequence completed'
                ) : (
                  'Click "Start Animations" to see sequential box animations'
                )}
              </div>
            </div>
          </div>

          <DemoInstructions
            steps={[
              '<strong>Try API Sequence:</strong> Click "Start API Sequence" and watch each API call execute in order with delays between them (1s → 1.5s → 0.8s).',
              '<strong>Watch Progress:</strong> The progress bar fills as each step completes, and the countdown shows time until the next step.',
              '<strong>Try Animations:</strong> Click "Start Animations" to see boxes light up sequentially every 0.5 seconds.',
              '<strong>Control Execution:</strong> Use Stop to pause mid-sequence, or Reset to start over.',
              '<strong>Check Activity Log:</strong> See real-time updates of what\'s happening at each step.'
            ]}
          />

          <DemoFeatures
            features={[
              '<strong>Sequential Execution:</strong> Each step waits for its timeout before executing - perfect for API chains or animations',
              '<strong>Progress Tracking:</strong> Real-time progress bar and countdown timer for each step',
              '<strong>Flexible Control:</strong> Start, stop, or reset the sequence at any time',
              '<strong>Loop Support:</strong> Optionally loop the sequence (animations demo loops continuously)',
              '<strong>Use Cases:</strong> Multi-step forms, API request chains, onboarding flows, sequential animations'
            ]}
          />
        </div>
      </DemoCard>

      <CodeExample code={exampleCode} />
    </div>
  );
}
