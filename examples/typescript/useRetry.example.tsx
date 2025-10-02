import { useRetry } from 'usetime';
import { useState } from 'react';

/**
 * Example: API call with retry logic
 * 
 * Demonstrates retrying a failed API call with exponential backoff.
 */
export function ApiRetryExample() {
  const [result, setResult] = useState<string>('');
  const [callCount, setCallCount] = useState(0);

  // Simulate an API call that fails randomly
  const apiCall = async (): Promise<string> => {
    setCallCount(prev => prev + 1);
    
    // 70% chance of failure to demonstrate retry logic
    if (Math.random() < 0.7) {
      throw new Error(`API call failed (attempt ${callCount + 1})`);
    }
    
    return `Success! Data retrieved on attempt ${callCount + 1}`;
  };

  const { execute, isLoading, error, retryCount, reset } = useRetry(
    apiCall,
    {
      maxRetries: 3,
      delay: 1000,
      exponentialBackoff: true,
      onSuccess: (data) => setResult(data),
      onError: (err) => console.log('Retry failed:', err.message),
    }
  );

  const handleReset = () => {
    setResult('');
    setCallCount(0);
    reset();
  };

  return (
    <div>
      <h2>API Retry Example</h2>
      <p>This simulates an API call with 70% failure rate</p>
      
      <div>
        <button onClick={execute} disabled={isLoading}>
          {isLoading ? 'Retrying...' : 'Call API'}
        </button>
        <button onClick={handleReset} disabled={isLoading}>
          Reset
        </button>
      </div>

      <div>
        <p>Total attempts: {callCount}</p>
        <p>Retry count: {retryCount}</p>
        <p>Status: {isLoading ? 'Loading...' : 'Idle'}</p>
        
        {result && (
          <div style={{ color: 'green' }}>
            <strong>✅ {result}</strong>
          </div>
        )}
        
        {error && (
          <div style={{ color: 'red' }}>
            <strong>❌ {error.message}</strong>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Example: File upload with retry
 * 
 * Shows how to retry file uploads with custom retry logic.
 */
export function FileUploadRetryExample() {
  const [uploadStatus, setUploadStatus] = useState<string>('');

  const uploadFile = async (): Promise<string> => {
    // Simulate file upload that might fail
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (Math.random() < 0.5) {
      throw new Error('Network error during upload');
    }
    
    return 'File uploaded successfully!';
  };

  const { execute, isLoading, error, retryCount } = useRetry(
    uploadFile,
    {
      maxRetries: 5,
      delay: 2000,
      exponentialBackoff: false, // Fixed delay
      onSuccess: (message) => setUploadStatus(message),
    }
  );

  return (
    <div>
      <h2>File Upload Retry Example</h2>
      
      <button onClick={execute} disabled={isLoading}>
        {isLoading ? `Uploading... (attempt ${retryCount + 1})` : 'Upload File'}
      </button>

      <div>
        <p>Retry attempts: {retryCount}/5</p>
        
        {uploadStatus && (
          <div style={{ color: 'green' }}>
            <strong>✅ {uploadStatus}</strong>
          </div>
        )}
        
        {error && (
          <div style={{ color: 'red' }}>
            <strong>❌ Upload failed: {error.message}</strong>
          </div>
        )}
      </div>
    </div>
  );
}
