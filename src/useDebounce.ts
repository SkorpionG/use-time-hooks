import { useEffect, useState } from 'react';

/**
 * A React hook that debounces a value, delaying updates until after the specified delay.
 * Useful for search inputs, API calls, and other scenarios where you want to limit
 * the frequency of updates.
 *
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds
 *
 * @returns The debounced value
 *
 * @example
 * ```tsx
 * function SearchInput() {
 *   const [searchTerm, setSearchTerm] = useState('');
 *   const debouncedSearchTerm = useDebounce(searchTerm, 500);
 *
 *   useEffect(() => {
 *     if (debouncedSearchTerm) {
 *       // Perform search API call
 *       console.log('Searching for:', debouncedSearchTerm);
 *     }
 *   }, [debouncedSearchTerm]);
 *
 *   return (
 *     <input
 *       type="text"
 *       value={searchTerm}
 *       onChange={(e) => setSearchTerm(e.target.value)}
 *       placeholder="Search..."
 *     />
 *   );
 * }
 * ```
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
