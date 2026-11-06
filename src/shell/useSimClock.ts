import { useState, useEffect, useRef, useCallback } from 'react';

export interface SimClock {
  isPlaying: boolean;
  speed: number;
  time: number;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  reset: () => void;
  step: (amount?: number) => void;
  setSpeed: (multiplier: number) => void;
  registerCallback: (cb: (dt: number, totalTime: number) => void) => () => void;
}

export function useSimClock(initialSpeed: number = 1.0): SimClock {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeedState] = useState<number>(initialSpeed);
  const [time, setTime] = useState<number>(0);

  const isPlayingRef = useRef<boolean>(isPlaying);
  isPlayingRef.current = isPlaying;

  const speedRef = useRef<number>(speed);
  speedRef.current = speed;

  const timeRef = useRef<number>(time);
  timeRef.current = time;

  const callbacksRef = useRef<Set<(dt: number, totalTime: number) => void>>(new Set());
  const lastTimestampRef = useRef<number | null>(null);

  const play = useCallback(() => setIsPlaying(true), []);
  const pause = useCallback(() => setIsPlaying(false), []);
  const togglePlay = useCallback(() => setIsPlaying((prev) => !prev), []);

  const reset = useCallback(() => {
    setTime(0);
    timeRef.current = 0;
    lastTimestampRef.current = null;
  }, []);

  const step = useCallback((amount: number = 0.1) => {
    const nextTime = timeRef.current + amount;
    setTime(nextTime);
    timeRef.current = nextTime;
    callbacksRef.current.forEach((cb) => cb(amount, nextTime));
  }, []);

  const setSpeed = useCallback((multiplier: number) => {
    setSpeedState(multiplier);
  }, []);

  const registerCallback = useCallback((cb: (dt: number, totalTime: number) => void) => {
    callbacksRef.current.add(cb);
    return () => {
      callbacksRef.current.delete(cb);
    };
  }, []);

  useEffect(() => {
    let animId: number;

    const tick = (timestamp: number) => {
      if (lastTimestampRef.current !== null && isPlayingRef.current) {
        const rawDt = (timestamp - lastTimestampRef.current) / 1000;
        // Clamp rawDt to 0.1s to avoid huge jumps on background tab resume
        const dt = Math.min(rawDt, 0.1) * speedRef.current;
        const nextTime = timeRef.current + dt;
        timeRef.current = nextTime;
        setTime(nextTime);

        callbacksRef.current.forEach((cb) => cb(dt, nextTime));
      }
      lastTimestampRef.current = timestamp;
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  return {
    isPlaying,
    speed,
    time,
    play,
    pause,
    togglePlay,
    reset,
    step,
    setSpeed,
    registerCallback,
  };
}
