import React, { useState } from 'react';
import { useRetry } from 'use-time-hooks';
/**
 * Example: API call with retry logic
 *
 * Demonstrates retrying a failed API call with exponential backoff.
 */
export function ApiRetryExample() {
  const [result, setResult] = useState<string>('');
  const [callCount, setCallCount] = useState(0);

  const { execute, cancel, reset, state } = useRetry<string>(
    async () => {
      setCallCount((c) => c + 1);
      if (callCount < 2) {
        throw new Error(`Attempt ${callCount + 1} failed`);
      }
      return `Success on attempt ${callCount + 1}`;
    },
    {
      maxAttempts: 3,
      initialDelay: 200,
      backoffMultiplier: 2,
    }
  );

  const handleExecute = async () => {
    setResult('');
    setCallCount(0);
    try {
      const res = await execute();
      setResult(res);
    } catch (e) {
      // error is already in state.lastError
    }
  };

  return (
    <div>
      <h2>API Retry Example</h2>
      <button onClick={handleExecute} disabled={state.isRetrying}>
        {state.isRetrying ? 'Retrying...' : 'Start Retry'}
      </button>
      <button onClick={cancel} disabled={!state.isRetrying}>
        Cancel
      </button>

      <div style={{ marginTop: '10px' }}>
        <p>Status: {state.isRetrying ? 'Retrying' : 'Idle'}</p>
        {result && <p style={{ color: 'green' }}>Result: {result}</p>}
        {state.lastError && !result && (
          <p style={{ color: 'red' }}>
            Error: {(state.lastError as Error).message}
          </p>
        )}
        <p>Attempt: {state.currentAttempt}</p>
      </div>
    </div>
  );
}

/**
 * Example: File upload with retry
 *
 * Simulates a file upload that might fail and retries upon failure.
 */
export function FileUploadRetryExample() {
  const [uploadResult, setUploadResult] = useState('');

  const { execute, state } = useRetry<string>(
    async (file: File) => {
      if (Math.random() > 0.5) {
        throw new Error(`Failed to upload ${file.name}`);
      }
      return `Uploaded ${file.name} successfully`;
    },
    {
      maxAttempts: 2,
      initialDelay: 500,
    }
  );

  const handleUpload = () => {
    setUploadResult('');
    const file = new File(['content'], 'example.txt', { type: 'text/plain' });
    execute(file as never)
      .then(setUploadResult)
      .catch(() => {});
  };

  return (
    <div>
      <h2>File Upload Retry Example</h2>
      <button onClick={handleUpload} disabled={state.isRetrying}>
        {state.isRetrying ? 'Uploading...' : 'Upload File'}
      </button>

      <div style={{ marginTop: '10px' }}>
        {state.isRetrying && (
          <p>Uploading, attempt {state.currentAttempt + 1}...</p>
        )}
        {uploadResult && <p style={{ color: 'green' }}>{uploadResult}</p>}
        {state.lastError && !uploadResult && (
          <p style={{ color: 'red' }}>
            Error: {(state.lastError as Error).message}
          </p>
        )}
      </div>
    </div>
  );
}
