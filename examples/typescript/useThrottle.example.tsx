import { useThrottle } from 'usetime';
import { useState, useEffect } from 'react';

/**
 * Example: Scroll position tracker
 *
 * Throttles scroll events to improve performance.
 */
export function ScrollTrackerExample() {
  const [scrollY, setScrollY] = useState(0);
  const [callCount, setCallCount] = useState(0);

  const throttledScroll = useThrottle(() => {
    setScrollY(window.scrollY);
    setCallCount((c) => c + 1);
  }, 100);

  useEffect(() => {
    window.addEventListener('scroll', throttledScroll);
    return () => window.removeEventListener('scroll', throttledScroll);
  }, [throttledScroll]);

  return (
    <div>
      <h2>Scroll Tracker Example</h2>
      <div
        style={{
          position: 'fixed',
          top: 0,
          background: 'white',
          padding: '10px',
        }}
      >
        <p>Scroll position: {scrollY}px</p>
        <p>Throttled calls: {callCount}</p>
      </div>
      <div style={{ height: '200vh', paddingTop: '100px' }}>
        <p>Scroll down to see the throttled scroll tracking...</p>
      </div>
    </div>
  );
}

/**
 * Example: Window resize handler
 *
 * Throttles window resize events to avoid excessive re-renders.
 */
export function ResizeHandlerExample() {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [resizeCount, setResizeCount] = useState(0);

  const throttledResize = useThrottle(() => {
    setWindowSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });
    setResizeCount((c) => c + 1);
  }, 200);

  useEffect(() => {
    window.addEventListener('resize', throttledResize);
    return () => window.removeEventListener('resize', throttledResize);
  }, [throttledResize]);

  return (
    <div>
      <h2>Resize Handler Example</h2>
      <p>Window width: {windowSize.width}px</p>
      <p>Window height: {windowSize.height}px</p>
      <p>Resize events handled: {resizeCount}</p>
      <p>Try resizing your browser window...</p>
    </div>
  );
}

/**
 * Example: Button click throttling
 *
 * Prevents rapid button clicks from triggering multiple actions.
 */
export function ThrottledButtonExample() {
  const [clickCount, setClickCount] = useState(0);
  const [throttledClickCount, setThrottledClickCount] = useState(0);

  const throttledClick = useThrottle(() => {
    setThrottledClickCount((c) => c + 1);
  }, 1000);

  const handleClick = () => {
    setClickCount((c) => c + 1);
    throttledClick();
  };

  return (
    <div>
      <h2>Throttled Button Example</h2>
      <button onClick={handleClick}>Click Me Fast!</button>
      <p>Total clicks: {clickCount}</p>
      <p>Throttled clicks (max 1 per second): {throttledClickCount}</p>
    </div>
  );
}
