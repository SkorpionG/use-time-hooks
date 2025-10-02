import { useState } from 'react';
import { useRetry } from '../../../../src/useRetry';
import { Button } from '@/components/ui/button';
import { CodeExample } from '../CodeExample';
import { DemoHeader } from '../DemoHeader';
import { DemoCard } from '../DemoCard';
import { DemoInstructions } from './DemoInstructions';
import { DemoFeatures } from './DemoFeatures';
import { RefreshCw, Clock, AlertCircle, CheckCircle } from 'lucide-react';

export function RetryDemo() {
  const [result, setResult] = useState<string>('');
  const [callCount, setCallCount] = useState(0);
  const [attemptLog, setAttemptLog] = useState<string[]>([]);

  // Simulate an API call that fails randomly
  const apiCall = async (): Promise<string> => {
    const currentAttempt = callCount + 1;
    setCallCount(currentAttempt);
    
    const timestamp = new Date().toLocaleTimeString();
    setAttemptLog(prev => [...prev, `${timestamp} - Attempt #${currentAttempt}: Calling API...`]);
    
    // 70% chance of failure to demonstrate retry logic
    if (Math.random() < 0.7) {
      const error = `API call failed (attempt ${currentAttempt})`;
      setAttemptLog(prev => [...prev, `${timestamp} - ❌ ${error}`]);
      throw new Error(error);
    }
    
    const success = `✅ Success! Data retrieved on attempt ${currentAttempt}`;
    setAttemptLog(prev => [...prev, `${timestamp} - ${success}`]);
    return success;
  };

  const { execute, reset, state } = useRetry(apiCall, {
    maxAttempts: 3,
    initialDelay: 1000,
    useExponentialBackoff: true,
    backoffMultiplier: 2,
    onRetry: (_error, attemptNumber, nextDelay) => {
      const timestamp = new Date().toLocaleTimeString();
      setAttemptLog(prev => [...prev, `${timestamp} - 🔄 Retrying in ${nextDelay}ms (attempt ${attemptNumber})...`]);
    },
    onMaxAttemptsReached: () => {
      const timestamp = new Date().toLocaleTimeString();
      setAttemptLog(prev => [...prev, `${timestamp} - ⛔ All retries exhausted`]);
    },
  });

  const handleExecute = async () => {
    try {
      const data = await execute();
      setResult(data);
    } catch (err) {
      // Error is already tracked in state.lastError
      console.error('Operation failed:', err);
    }
  };

  const handleReset = () => {
    setResult('');
    setCallCount(0);
    setAttemptLog([]);
    reset();
  };

  const exampleCode = `import { useRetry } from 'use-time-hooks';

function ApiRetryExample() {
  const [result, setResult] = useState('');

  const apiCall = async () => {
    // Simulate API call that might fail
    if (Math.random() < 0.7) {
      throw new Error('API call failed');
    }
    return 'Success! Data retrieved';
  };

  const { execute, isLoading, error, retryCount, reset } = useRetry(
    apiCall,
    {
      maxRetries: 3,
      delay: 1000,
      exponentialBackoff: true,
      onSuccess: (data) => setResult(data),
    }
  );

  return (
    <div>
      <button onClick={execute} disabled={isLoading}>
        {isLoading ? 'Retrying...' : 'Call API'}
      </button>
      <p>Retry count: {retryCount}</p>
      {result && <p>{result}</p>}
      {error && <p>Error: {error.message}</p>}
    </div>
  );
}`;

  return (
    <div className="space-y-8">
      <DemoHeader
        title="useRetry"
        description="Retry failed operations with exponential backoff and customizable retry logic"
      />
      
      <DemoCard>
        <div className="space-y-6">
          {/* Status Display */}
          <div className="text-center p-6 border rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-4">
              {state.isRetrying && <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />}
              {state.lastError !== null && !state.isRetrying && <AlertCircle className="h-5 w-5 text-red-500" />}
              {result && !state.isRetrying && <CheckCircle className="h-5 w-5 text-green-500" />}
              <span className="font-medium">
                {state.isRetrying 
                  ? `Retrying... (Attempt ${state.currentAttempt + 1})` 
                  : state.lastError !== null 
                    ? 'Failed' 
                    : result 
                      ? 'Success' 
                      : 'Ready'}
              </span>
            </div>
            
            {state.isRetrying && state.timeUntilNextRetry > 0 && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200">
                <div className="flex items-center justify-center gap-2">
                  <Clock className="h-4 w-4 animate-pulse" />
                  <span className="text-sm">
                    Next retry in {(state.timeUntilNextRetry / 1000).toFixed(1)} seconds
                  </span>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Total Attempts</div>
                <div className="text-2xl font-bold">{state.totalAttempts}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Current Attempt</div>
                <div className="text-2xl font-bold">{state.currentAttempt + 1}</div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-2 justify-center">
            <Button onClick={handleExecute} disabled={state.isRetrying}>
              {state.isRetrying ? 'Retrying...' : 'Call API (70% fail rate)'}
            </Button>
            <Button onClick={handleReset} variant="outline" disabled={state.isRetrying}>
              Reset
            </Button>
          </div>

          {/* Results */}
          <div className="space-y-2">
            {result && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-md text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200">
                {result}
              </div>
            )}
            
            {state.lastError !== null && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200">
                ❌ {state.lastError instanceof Error ? state.lastError.message : String(state.lastError)}
              </div>
            )}
          </div>

          {/* Attempt Log */}
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-3">Retry Activity Log</h4>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {attemptLog.length === 0 ? (
                <div className="text-sm text-muted-foreground">Click "Call API" to see retry attempts in real-time</div>
              ) : (
                attemptLog.map((log, index) => (
                  <div key={index} className="text-xs font-mono text-muted-foreground">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          <DemoInstructions
            steps={[
              '<strong>Click "Fetch Data":</strong> Simulates an API call with a 70% failure rate to demonstrate retry logic.',
              '<strong>Watch Retries:</strong> If it fails, the hook automatically retries with exponential backoff (1s → 2s → 4s delays).',
              '<strong>Check Activity Log:</strong> See each attempt, failure, and retry in real-time with countdown timers.',
              '<strong>Try Cancel:</strong> Click "Cancel Retry" during a retry to stop the operation.',
              '<strong>Try Reset:</strong> Click "Reset" to clear the state and start fresh.'
            ]}
          />

          <DemoFeatures
            features={[
              '<strong>Automatic Retries:</strong> Configurable max attempts (3 retries = 4 total attempts including initial)',
              '<strong>Exponential Backoff:</strong> Delays increase between retries (1s → 2s → 4s) to avoid overwhelming servers',
              '<strong>Real-time Feedback:</strong> Countdown timer shows time until next retry attempt',
              '<strong>Full Control:</strong> Cancel ongoing retries or reset state at any time',
              '<strong>Use Cases:</strong> API calls, network requests, database operations, file uploads'
            ]}
          />
        </div>
      </DemoCard>

      <CodeExample code={exampleCode} />
    </div>
  );
}
