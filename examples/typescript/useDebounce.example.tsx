import { useDebounce } from 'usetime';
import { useState, useEffect } from 'react';

/**
 * Example: Search input with debouncing
 *
 * Demonstrates debouncing user input to reduce API calls.
 */
export function DebouncedSearchExample() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearchTerm) {
      setIsSearching(true);

      // Simulate API call
      setTimeout(() => {
        setSearchResults([
          `Result 1 for "${debouncedSearchTerm}"`,
          `Result 2 for "${debouncedSearchTerm}"`,
          `Result 3 for "${debouncedSearchTerm}"`,
        ]);
        setIsSearching(false);
      }, 300);
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchTerm]);

  return (
    <div>
      <h2>Debounced Search Example</h2>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Type to search..."
      />

      <p>Current input: {searchTerm}</p>
      <p>Debounced value: {debouncedSearchTerm}</p>

      {isSearching && <p>Searching...</p>}

      <div>
        <h3>Results:</h3>
        {searchResults.map((result, idx) => (
          <div key={idx}>{result}</div>
        ))}
      </div>
    </div>
  );
}

/**
 * Example: Form validation with debouncing
 *
 * Shows how to debounce form validation to avoid excessive checks.
 */
export function DebouncedValidationExample() {
  const [email, setEmail] = useState('');
  const [validationMessage, setValidationMessage] = useState('');

  const debouncedEmail = useDebounce(email, 800);

  useEffect(() => {
    if (debouncedEmail) {
      // Validate email
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(debouncedEmail);
      setValidationMessage(
        isValid ? '✅ Valid email' : '❌ Invalid email format'
      );
    } else {
      setValidationMessage('');
    }
  }, [debouncedEmail]);

  return (
    <div>
      <h2>Debounced Validation Example</h2>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter email..."
      />
      <p>{validationMessage}</p>
    </div>
  );
}
