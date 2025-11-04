"use client";

import { useEffect, useMemo, useState } from "react";

interface WaveformVisualizerProps {
  isRecording: boolean;
}

const BAR_COUNT = 32;
const IDLE_LEVELS = Array.from({ length: BAR_COUNT }, () => 0.1);

export function WaveformVisualizer({ isRecording }: WaveformVisualizerProps) {
  const [bars, setBars] = useState<number[]>(() => Array.from({ length: BAR_COUNT }, () => Math.random()));
  const barIndexes = useMemo(() => Array.from({ length: BAR_COUNT }, (_, index) => index), []);

  useEffect(() => {
    if (!isRecording) {
      return;
    }

    const interval = setInterval(() => {
      setBars((previous) => previous.map(() => Math.random()));
    }, 120);

    return () => clearInterval(interval);
  }, [isRecording]);

  const levels = isRecording ? bars : IDLE_LEVELS;

  return (
    <div className="flex h-32 items-end justify-center gap-[6px]">
      {barIndexes.map((index) => {
        const height = isRecording ? 20 + levels[index] * 80 : levels[index] * 25;

        return (
          <div
            key={index}
            className="w-1.5 rounded-full bg-gradient-to-t from-[#2BA08C] to-[#1F6F63] transition-all duration-150 ease-out"
            style={{ height: `${height}%` }}
          />
        );
      })}
    </div>
  );
}
