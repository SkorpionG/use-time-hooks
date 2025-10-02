import { useState, useEffect } from 'react';
import { useDebounce } from '../../../../src/useDebounce';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { CodeExample } from '../CodeExample';
import { DemoHeader } from '../DemoHeader';
import { DemoCard } from '../DemoCard';
import { DemoInstructions } from './DemoInstructions';
import { DemoFeatures } from './DemoFeatures';
import { Search, Loader2 } from 'lucide-react';

export function DebounceDemo() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [delay, setDelay] = useState(500);
  const debouncedSearchTerm = useDebounce(searchTerm, delay);

  useEffect(() => {
    if (searchTerm && searchTerm !== debouncedSearchTerm) {
      setIsSearching(true);
    }
  }, [searchTerm, debouncedSearchTerm]);

  useEffect(() => {
    if (debouncedSearchTerm) {
      // Simulate API call
      setIsSearching(true);
      const timer = setTimeout(() => {
        const mockResults = [
          `${debouncedSearchTerm} - Documentation`,
          `${debouncedSearchTerm} - Tutorial`,
          `${debouncedSearchTerm} - API Reference`,
          `${debouncedSearchTerm} - Examples`,
          `${debouncedSearchTerm} - Best Practices`,
        ];
        setResults(mockResults);
        setIsSearching(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setResults([]);
      setIsSearching(false);
    }
  }, [debouncedSearchTerm]);

  return (
    <div className="space-y-8">
      <DemoHeader
        title="useDebounce"
        description="Debounce a value to limit update frequency. Ideal for search inputs, form validation, and API calls."
      />

      <DemoCard>
        <div className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-rose-600 dark:text-rose-400" />
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Type to search..."
              className="w-full rounded-lg border bg-background px-10 py-3 text-lg outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 animate-spin text-primary" />
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Search term:{' '}
                <span className="font-mono">{searchTerm || '(empty)'}</span>
              </span>
              <span className="text-muted-foreground">
                Debounced:{' '}
                <span className="font-mono">
                  {debouncedSearchTerm || '(empty)'}
                </span>
              </span>
            </div>
          </div>

          {results.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Search Results:</h3>
              <div className="space-y-1">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className="rounded-md border bg-background p-3 transition-colors hover:bg-accent"
                  >
                    {result}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2 pt-4">
            <label className="text-sm font-medium">
              Debounce Delay: {delay}ms
            </label>
            <Slider
              min={100}
              max={2000}
              step={100}
              value={[delay]}
              onValueChange={(values) => setDelay(values[0])}
              aria-label="Debounce delay in milliseconds"
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground">
              Adjust the delay to see how debouncing affects the search behavior
            </p>
          </div>

          <DemoInstructions
            steps={[
              '<strong>Start Typing:</strong> Type in the search box and watch the "Search term" update instantly.',
              '<strong>Watch Debouncing:</strong> The "Debounced" value waits for the delay period (default 500ms) before updating.',
              '<strong>See Results:</strong> Search results only appear after the debounced value updates, reducing unnecessary API calls.',
              '<strong>Adjust Delay:</strong> Use the slider to change the debounce delay and see how it affects behavior.',
              '<strong>Notice Efficiency:</strong> Typing quickly only triggers one search instead of many.'
            ]}
          />

          <DemoFeatures
            features={[
              '<strong>Reduced API Calls:</strong> Only triggers after user stops typing, saving bandwidth and server resources',
              '<strong>Better UX:</strong> Prevents flickering results and reduces visual noise',
              '<strong>Configurable Delay:</strong> Adjust timing based on your use case (search: 300-500ms, validation: 500-1000ms)',
              '<strong>Simple API:</strong> Just wrap your value with useDebounce',
              '<strong>Use Cases:</strong> Search inputs, form validation, auto-save, resize handlers, scroll events'
            ]}
          />
        </div>
      </DemoCard>

      <CodeExample
        code={`import { useDebounce } from 'use-time-hooks';

function SearchInput() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  
  useEffect(() => {
    if (debouncedSearchTerm) {
      // Perform API call
      fetchResults(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);
  
  return (
    <Input
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search..."
    />
  );
}`}
      />
    </div>
  );
}
