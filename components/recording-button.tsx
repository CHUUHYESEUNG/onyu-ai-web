"use client";

import { Mic, Square } from "lucide-react";

interface RecordingButtonProps {
  isRecording: boolean;
  onClick: () => void;
  duration: number;
}

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${secs}`;
};

export function RecordingButton({ isRecording, onClick, duration }: RecordingButtonProps) {
  return (
    <div className="flex flex-col items-center gap-6">
      <button
        type="button"
        onClick={onClick}
        className={[
          "relative flex h-32 w-32 items-center justify-center rounded-full transition-transform duration-300",
          isRecording
            ? "bg-gradient-to-br from-red-500 to-red-600 shadow-[0_0_40px_rgba(239,68,68,0.5)]"
            : "bg-gradient-to-br from-[#2BA08C] to-[#1F6F63] hover:shadow-[0_0_40px_rgba(43,160,140,0.4)]",
        ].join(" ")}
        style={isRecording ? { animation: "pulseScale 1.6s ease-in-out infinite" } : undefined}
      >
        {isRecording ? (
          <Square className="h-10 w-10 text-white" />
        ) : (
          <Mic className="h-10 w-10 text-white" />
        )}
        {isRecording && (
          <span
            className="pointer-events-none absolute inset-0 rounded-full border-4 border-red-400"
            style={{ animation: "pulseOutline 1.6s ease-in-out infinite" }}
          />
        )}
      </button>

      <div className="text-center">
        <p className="mb-2 text-3xl text-[#E6F0ED]">{formatTime(duration)}</p>
        <p className="text-sm text-[#E6F0ED]/60">
          {isRecording ? "녹음 중... 버튼을 눌러 종료" : "버튼을 눌러 녹음 시작"}
        </p>
      </div>
    </div>
  );
}
