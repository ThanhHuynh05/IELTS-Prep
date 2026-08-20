import { useState, useEffect, useRef, useCallback } from 'react';

export default function useTimer(initialMinutes, onExpire) {
  // For development, we might want to use seconds instead of minutes to test quickly.
  // We'll multiply by 60 for real mode, but allow a 'mock' fast mode.
  // We will assume initialMinutes is the actual minute count, so we multiply by 60.
  const [secondsRemaining, setSecondsRemaining] = useState(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);
  const onExpireRef = useRef(onExpire);

  // Keep callback ref fresh without retriggering effect
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  const start = useCallback(() => {
    if (!isRunning && secondsRemaining > 0) {
      setIsRunning(true);
      timerRef.current = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            if (onExpireRef.current) {
              onExpireRef.current();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [isRunning, secondsRemaining]);

  const stop = useCallback(() => {
    if (isRunning) {
      clearInterval(timerRef.current);
      setIsRunning(false);
    }
  }, [isRunning]);

  const reset = useCallback((newMinutes) => {
    stop();
    setSecondsRemaining((newMinutes !== undefined ? newMinutes : initialMinutes) * 60);
  }, [initialMinutes, stop]);

  useEffect(() => {
    return () => stop(); // cleanup on unmount
  }, [stop]);

  // Format MM:SS
  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const formattedTime = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  return {
    secondsRemaining,
    formattedTime,
    isRunning,
    start,
    stop,
    reset
  };
}
