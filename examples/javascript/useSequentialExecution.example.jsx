import { useSequentialExecution } from 'usetime';
import { useState } from 'react';

/**
 * Example: Sequential API calls
 * 
 * Demonstrates executing API calls one after another in sequence.
 */
export function SequentialApiCallsExample() {
  const [results, setResults] = useState([]);
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // Simulate API calls with different delays
  const apiCall1 = async () => {
    addLog('Starting API call 1...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    const result = 'Data from API 1';
    addLog('API call 1 completed');
    return result;
  };

  const apiCall2 = async () => {
    addLog('Starting API call 2...');
    await new Promise(resolve => setTimeout(resolve, 1500));
    const result = 'Data from API 2';
    addLog('API call 2 completed');
    return result;
  };

  const apiCall3 = async () => {
    addLog('Starting API call 3...');
    await new Promise(resolve => setTimeout(resolve, 800));
    const result = 'Data from API 3';
    addLog('API call 3 completed');
    return result;
  };

  const { execute, isExecuting, currentIndex, cancel } = useSequentialExecution(
    [apiCall1, apiCall2, apiCall3],
    {
      onSuccess: (result, index) => {
        setResults(prev => [...prev, `${index + 1}: ${result}`]);
        addLog(`Result ${index + 1} received: ${result}`);
      },
      onError: (error, index) => {
        addLog(`Error in call ${index + 1}: ${error.message}`);
      },
      onComplete: () => {
        addLog('All API calls completed!');
      }
    }
  );

  const handleExecute = () => {
    setResults([]);
    setLogs([]);
    execute();
  };

  const handleCancel = () => {
    cancel();
    addLog('Execution cancelled');
  };

  return (
    <div>
      <h2>Sequential API Calls Example</h2>
      <p>Execute multiple API calls one after another</p>
      
      <div>
        <button onClick={handleExecute} disabled={isExecuting}>
          {isExecuting ? `Executing... (${currentIndex + 1}/3)` : 'Start API Calls'}
        </button>
        {isExecuting && (
          <button onClick={handleCancel}>
            Cancel
          </button>
        )}
      </div>

      <div style={{ marginTop: '20px' }}>
        <h4>Results:</h4>
        {results.map((result, index) => (
          <div key={index} style={{ color: 'green' }}>
            ✅ {result}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '20px', maxHeight: '200px', overflow: 'auto' }}>
        <h4>Execution Log:</h4>
        {logs.map((log, index) => (
          <div key={index} style={{ fontSize: '12px', fontFamily: 'monospace' }}>
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Example: Sequential animations
 * 
 * Shows how to run animations in sequence with delays.
 */
export function SequentialAnimationsExample() {
  const [animationStates, setAnimationStates] = useState([false, false, false, false]);

  const animateBox = async (index) => {
    return new Promise(resolve => {
      setAnimationStates(prev => {
        const newStates = [...prev];
        newStates[index] = true;
        return newStates;
      });
      
      setTimeout(() => {
        setAnimationStates(prev => {
          const newStates = [...prev];
          newStates[index] = false;
          return newStates;
        });
        resolve();
      }, 1000);
    });
  };

  const animations = [
    () => animateBox(0),
    () => animateBox(1),
    () => animateBox(2),
    () => animateBox(3),
  ];

  const { execute, isExecuting, currentIndex, cancel } = useSequentialExecution(
    animations,
    {
      delay: 200, // 200ms delay between animations
      onComplete: () => {
        console.log('All animations completed!');
      }
    }
  );

  const resetAnimations = () => {
    setAnimationStates([false, false, false, false]);
  };

  return (
    <div>
      <h2>Sequential Animations Example</h2>
      <p>Watch boxes animate one after another</p>
      
      <div>
        <button onClick={execute} disabled={isExecuting}>
          {isExecuting ? `Animating... (${currentIndex + 1}/4)` : 'Start Animations'}
        </button>
        {isExecuting && (
          <button onClick={cancel}>
            Cancel
          </button>
        )}
        <button onClick={resetAnimations} disabled={isExecuting}>
          Reset
        </button>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
        {animationStates.map((isActive, index) => (
          <div
            key={index}
            style={{
              width: '50px',
              height: '50px',
              backgroundColor: isActive ? '#ff6b6b' : '#ddd',
              border: currentIndex === index && isExecuting ? '3px solid #4ecdc4' : '1px solid #ccc',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              transform: isActive ? 'scale(1.2)' : 'scale(1)',
            }}
          >
            {index + 1}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Example: Sequential form validation
 * 
 * Validates form fields one by one in sequence.
 */
export function SequentialValidationExample() {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: ''
  });
  const [validationResults, setValidationResults] = useState({});

  const validateEmail = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (!formData.email.includes('@')) {
      throw new Error('Invalid email format');
    }
  };

  const validateUsername = async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    if (formData.username.length < 3) {
      throw new Error('Username must be at least 3 characters');
    }
  };

  const validatePassword = async () => {
    await new Promise(resolve => setTimeout(resolve, 600));
    if (formData.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
  };

  const validations = [
    { name: 'email', validator: validateEmail },
    { name: 'username', validator: validateUsername },
    { name: 'password', validator: validatePassword },
  ];

  const { execute, isExecuting, currentIndex } = useSequentialExecution(
    validations.map(v => v.validator),
    {
      onSuccess: (_, index) => {
        const fieldName = validations[index].name;
        setValidationResults(prev => ({
          ...prev,
          [fieldName]: 'Valid ✅'
        }));
      },
      onError: (error, index) => {
        const fieldName = validations[index].name;
        setValidationResults(prev => ({
          ...prev,
          [fieldName]: `Error: ${error.message} ❌`
        }));
      },
      onComplete: () => {
        console.log('Validation complete!');
      }
    }
  );

  const handleValidate = () => {
    setValidationResults({});
    execute();
  };

  return (
    <div>
      <h2>Sequential Validation Example</h2>
      <p>Validates form fields one by one in sequence</p>
      
      <div style={{ marginBottom: '20px' }}>
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          style={{ display: 'block', marginBottom: '10px', padding: '8px' }}
        />
        <div style={{ fontSize: '12px', color: currentIndex === 0 && isExecuting ? 'blue' : 'black' }}>
          {validationResults.email || 'Email validation pending...'}
        </div>

        <input
          type="text"
          placeholder="Username"
          value={formData.username}
          onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
          style={{ display: 'block', marginBottom: '10px', padding: '8px' }}
        />
        <div style={{ fontSize: '12px', color: currentIndex === 1 && isExecuting ? 'blue' : 'black' }}>
          {validationResults.username || 'Username validation pending...'}
        </div>

        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
          style={{ display: 'block', marginBottom: '10px', padding: '8px' }}
        />
        <div style={{ fontSize: '12px', color: currentIndex === 2 && isExecuting ? 'blue' : 'black' }}>
          {validationResults.password || 'Password validation pending...'}
        </div>
      </div>

      <button onClick={handleValidate} disabled={isExecuting}>
        {isExecuting ? `Validating... (${currentIndex + 1}/3)` : 'Validate Form'}
      </button>
    </div>
  );
}
