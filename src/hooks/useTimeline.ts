import { useState, useEffect, useCallback, useRef } from "react";
import { frames, TOTAL_DURATION, type FrameData } from "@/data/timeline";

export interface TimelineState {
  currentFrame: FrameData;
  frameIndex: number;
  elapsed: number; // seconds since frame start
  globalTime: number; // 0-60
  playing: boolean;
  togglePlay: () => void;
  reset: () => void;
  nextFrame: () => void;
  prevFrame: () => void;
  goToFrame: (index: number) => void;
}

export function useTimeline(): TimelineState {
  const [globalTime, setGlobalTime] = useState(0);
  const [playing, setPlaying] = useState(true);
  const intervalRef = useRef<number | null>(null);

  const frameIndex = frames.findIndex(
    (f, i) =>
      globalTime >= f.startTime &&
      (i === frames.length - 1 || globalTime < frames[i + 1].startTime)
  );
  const currentFrame = frames[Math.max(0, frameIndex)];
  const elapsed = globalTime - currentFrame.startTime;

  useEffect(() => {
    if (playing) {
      intervalRef.current = window.setInterval(() => {
        setGlobalTime((t) => {
          const next = t + 0.1;
          return next >= TOTAL_DURATION ? 0 : Math.round(next * 10) / 10;
        });
      }, 100);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing]);

  const togglePlay = useCallback(() => setPlaying((p) => !p), []);
  const reset = useCallback(() => {
    setGlobalTime(0);
    setPlaying(true);
  }, []);

  const goToFrame = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(index, frames.length - 1));
    setGlobalTime(frames[clamped].startTime);
  }, []);

  const nextFrame = useCallback(() => {
    const next = frameIndex + 1;
    goToFrame(next >= frames.length ? 0 : next);
  }, [frameIndex, goToFrame]);

  const prevFrame = useCallback(() => {
    goToFrame(frameIndex <= 0 ? frames.length - 1 : frameIndex - 1);
  }, [frameIndex, goToFrame]);

  return {
    currentFrame,
    frameIndex,
    elapsed,
    globalTime,
    playing,
    togglePlay,
    reset,
    nextFrame,
    prevFrame,
    goToFrame,
  };
}
