import { useCallback, useRef, useEffect } from 'react';

/**
 * A React hook that throttles a function, ensuring it's called at most once per specified delay.
 * Unlike debounce, throttle ensures the function is called regularly during continuous events.
 *
 * @param callback - The function to throttle
 * @param delay - The minimum delay between function calls in milliseconds
 *
 * @returns The throttled function
 *
 * @example
 * ```tsx
 * function ScrollTracker() {
 *   const [scrollY, setScrollY] = useState(0);
 *
 *   const throttledScroll = useThrottle(() => {
 *     setScrollY(window.scrollY);
 *   }, 100);
 *
 *   useEffect(() => {
 *     window.addEventListener('scroll', throttledScroll);
 *     return () => window.removeEventListener('scroll', throttledScroll);
 *   }, [throttledScroll]);
 *
 *   return <div>Scroll position: {scrollY}px</div>;
 * }
 * ```
 */
export function useThrottle<T extends (...args: never[]) => unknown>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();

      if (now - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = now;
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(
          () => {
            callback(...args);
            lastRun.current = Date.now();
          },
          delay - (now - lastRun.current)
        );
      }
    }) as T,
    [callback, delay]
  );
}
