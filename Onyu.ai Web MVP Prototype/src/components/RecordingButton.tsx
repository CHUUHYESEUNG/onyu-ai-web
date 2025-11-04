import { Mic, Square } from "lucide-react";
import { motion } from "motion/react";

interface RecordingButtonProps {
  isRecording: boolean;
  onClick: () => void;
  duration: number;
}

export function RecordingButton({ isRecording, onClick, duration }: RecordingButtonProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <motion.button
        onClick={onClick}
        className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
          isRecording
            ? 'bg-gradient-to-br from-red-500 to-red-600 shadow-[0_0_40px_rgba(239,68,68,0.5)]'
            : 'bg-gradient-to-br from-[#2BA08C] to-[#1F6F63] hover:shadow-[0_0_40px_rgba(43,160,140,0.4)]'
        }`}
        whileTap={{ scale: 0.95 }}
        animate={isRecording ? { scale: [1, 1.05, 1] } : {}}
        transition={isRecording ? { duration: 1.5, repeat: Infinity } : {}}
      >
        {isRecording ? (
          <Square className="w-10 h-10 text-white" />
        ) : (
          <Mic className="w-10 h-10 text-white" />
        )}
        
        {isRecording && (
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-red-400"
            animate={{ scale: [1, 1.3], opacity: [0.5, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </motion.button>
      
      <div className="text-center">
        <p className="text-[#E6F0ED] mb-2" style={{ fontSize: '1.5rem' }}>
          {formatTime(duration)}
        </p>
        <p className="text-[#E6F0ED]/60">
          {isRecording ? '녹음 중... 버튼을 눌러 종료' : '버튼을 눌러 녹음 시작'}
        </p>
      </div>
    </div>
  );
}
