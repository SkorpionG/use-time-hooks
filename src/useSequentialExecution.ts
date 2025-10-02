import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Configuration for a single execution step
 */
export interface ExecutionStep {
  /** The function to execute */
  fn: () => void | Promise<void>;
  /** The timeout in milliseconds before executing this function */
  timeout: number;
  /** Optional identifier for this step */
  id?: string;
}

/**
 * Return type for the useSequentialExecution hook
 */
export interface UseSequentialExecutionReturn {
  /** Start the sequential execution */
  start: () => void;
  /** Stop the sequential execution */
  stop: () => void;
  /** Reset to the beginning of the sequence */
  reset: () => void;
  /** Toggle between start and stop */
  toggle: () => void;
  /** Whether the execution is currently running */
  isRunning: boolean;
  /** Current step index being executed */
  currentStepIndex: number;
  /** Total number of execution cycles completed */
  cyclesCompleted: number;
  /** Time remaining until next execution (in milliseconds) */
  timeRemaining: number;
  /** Current step being executed */
  currentStep: ExecutionStep | null;
}

/**
 * A React hook that executes an array of functions sequentially with specified timeouts.
 * After completing all functions, it can optionally loop back to the beginning.
 *
 * @param steps - Array of execution steps, each containing a function and timeout
 * @param loop - Whether to loop back to the beginning after completing all steps (default: true)
 * @param autoStart - Whether to start execution immediately (default: false)
 *
 * @returns An object with methods and state to control the sequential execution
 *
 * @example
 * ```tsx
 * function SequentialDemo() {
 *   const [messages, setMessages] = useState<string[]>([]);
 *
 *   const steps: ExecutionStep[] = [
 *     {
 *       fn: () => setMessages(prev => [...prev, 'Step 1 executed']),
 *       timeout: 1000,
 *       id: 'step1'
 *     },
 *     {
 *       fn: () => setMessages(prev => [...prev, 'Step 2 executed']),
 *       timeout: 2000,
 *       id: 'step2'
 *     },
 *     {
 *       fn: () => setMessages(prev => [...prev, 'Step 3 executed']),
 *       timeout: 1500,
 *       id: 'step3'
 *     }
 *   ];
 *
 *   const {
 *     start,
 *     stop,
 *     toggle,
 *     isRunning,
 *     currentStepIndex,
 *     cyclesCompleted,
 *     timeRemaining,
 *     currentStep
 *   } = useSequentialExecution(steps, true, false);
 *
 *   return (
 *     <div>
 *       <div>
 *         <button onClick={toggle}>
 *           {isRunning ? 'Stop' : 'Start'}
 *         </button>
 *         <button onClick={() => setMessages([])}>Clear Messages</button>
 *       </div>
 *       <div>
 *         Status: {isRunning ? 'Running' : 'Stopped'} |
 *         Step: {currentStepIndex + 1}/{steps.length} |
 *         Cycles: {cyclesCompleted} |
 *         Next in: {(timeRemaining / 1000).toFixed(1)}s
 *       </div>
 *       <div>Current Step: {currentStep?.id || 'None'}</div>
 *       <div>
 *         {messages.map((msg, idx) => (
 *           <div key={idx}>{msg}</div>
 *         ))}
 *       </div>
 *     </div>
 *   );
 * }
 * ```
 */
export function useSequentialExecution(
  steps: ExecutionStep[],
  loop: boolean = true,
  autoStart: boolean = false
): UseSequentialExecutionReturn {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const currentTimeoutRef = useRef<number>(0);

  const [isRunning, setIsRunning] = useState(autoStart);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Validate steps
  if (!steps || steps.length === 0) {
    throw new Error('useSequentialExecution: steps array cannot be empty');
  }

  const currentStep = steps[currentStepIndex] || null;

  // Update time remaining every 100ms when running
  useEffect(() => {
    if (!isRunning) return;

    const intervalId = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const remaining = Math.max(0, currentTimeoutRef.current - elapsed);
      setTimeRemaining(remaining);
    }, 100);

    return () => clearInterval(intervalId);
  }, [isRunning, currentStepIndex]);

  // Use refs to avoid dependency issues
  const stepsRef = useRef(steps);
  const loopRef = useRef(loop);
  
  useEffect(() => {
    stepsRef.current = steps;
    loopRef.current = loop;
  }, [steps, loop]);

  // Execute step and schedule next - stable function using refs
  const executeAndScheduleNext = useCallback(async (stepIndex: number) => {
    const currentSteps = stepsRef.current;
    const step = currentSteps[stepIndex];
    if (!step) return;

    
    try {
      await step.fn();
    } catch (error) {
      console.error(`Error executing step ${stepIndex}:`, error);
    }


    // Move to next step or complete cycle
    const nextIndex = stepIndex + 1;
    if (nextIndex >= currentSteps.length) {
      // Completed a full cycle
      setCyclesCompleted((prev) => prev + 1);

      if (loopRef.current) {
        setCurrentStepIndex(0);
        // Schedule first step again
        const firstStep = currentSteps[0];
        if (firstStep) {
          startTimeRef.current = Date.now();
          currentTimeoutRef.current = firstStep.timeout;
          setTimeRemaining(firstStep.timeout);
          timeoutRef.current = setTimeout(() => {
            void executeAndScheduleNext(0);
          }, firstStep.timeout);
        }
      } else {
        // Stop execution if not looping
        setIsRunning(false);
        setTimeRemaining(0);
        return;
      }
    } else {
      setCurrentStepIndex(nextIndex);
      // Schedule next step
      const nextStep = currentSteps[nextIndex];
      if (nextStep) {
        startTimeRef.current = Date.now();
        currentTimeoutRef.current = nextStep.timeout;
        setTimeRemaining(nextStep.timeout);
        timeoutRef.current = setTimeout(() => {
          void executeAndScheduleNext(nextIndex);
        }, nextStep.timeout);
      }
    }
  }, []);

  // Use ref to track running state for start function
  const isRunningRef = useRef(isRunning);
  useEffect(() => {
    isRunningRef.current = isRunning;
  }, [isRunning]);

  // Start function - directly schedule the first step
  const start = useCallback(() => {
    if (isRunningRef.current) return;
    if (timeoutRef.current) return; // Already has a timeout scheduled

    setIsRunning(true);
    setCurrentStepIndex(0);
    
    const step = stepsRef.current[0];
    if (!step) return;

    startTimeRef.current = Date.now();
    currentTimeoutRef.current = step.timeout;
    setTimeRemaining(step.timeout);

    timeoutRef.current = setTimeout(() => {
      void executeAndScheduleNext(0);
    }, step.timeout);
    
  }, [executeAndScheduleNext]);

  // Stop function
  const stop = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setIsRunning(false);
    setTimeRemaining(0);
  }, []);

  // Reset function
  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    setIsRunning(false);
    setCurrentStepIndex(0);
    setCyclesCompleted(0);
    setTimeRemaining(0);
  }, []);

  // Toggle function
  const toggle = useCallback(() => {
    if (isRunning) {
      stop();
    } else {
      start();
    }
  }, [isRunning, start, stop]);


  // Auto-start on mount if enabled - run once
  useEffect(() => {
    if (autoStart && !isRunningRef.current && !timeoutRef.current) {
      const step = stepsRef.current[0];
      if (!step) return;

      setIsRunning(true);
      setCurrentStepIndex(0);
      
      startTimeRef.current = Date.now();
      currentTimeoutRef.current = step.timeout;
      setTimeRemaining(step.timeout);

      timeoutRef.current = setTimeout(() => {
        void executeAndScheduleNext(0);
      }, step.timeout);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [autoStart, executeAndScheduleNext]);

  return {
    start,
    stop,
    reset,
    toggle,
    isRunning,
    currentStepIndex,
    cyclesCompleted,
    timeRemaining,
    currentStep,
  };
}
