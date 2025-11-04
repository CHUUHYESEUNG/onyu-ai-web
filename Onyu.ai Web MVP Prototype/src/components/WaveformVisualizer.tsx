import { motion } from "motion/react";
import { useEffect, useState } from "react";

interface WaveformVisualizerProps {
  isRecording: boolean;
}

export function WaveformVisualizer({ isRecording }: WaveformVisualizerProps) {
  const [bars, setBars] = useState<number[]>(Array(30).fill(0));

  useEffect(() => {
    if (!isRecording) {
      setBars(Array(30).fill(0));
      return;
    }

    const interval = setInterval(() => {
      setBars(Array(30).fill(0).map(() => Math.random()));
    }, 100);

    return () => clearInterval(interval);
  }, [isRecording]);

  return (
    <div className="flex items-center justify-center gap-1 h-32">
      {bars.map((height, index) => (
        <motion.div
          key={index}
          className="w-2 bg-gradient-to-t from-[#2BA08C] to-[#1F6F63] rounded-full"
          animate={{
            height: isRecording ? `${20 + height * 80}%` : '10%',
          }}
          transition={{
            duration: 0.1,
          }}
        />
      ))}
    </div>
  );
}
