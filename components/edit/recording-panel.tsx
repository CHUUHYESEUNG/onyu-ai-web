'use client';

import { ProcessingState, ProcessingStep, PROCESSING_STEPS } from '@/types/edit';
import { Mic, Square, Upload, Play, Pause, CheckCircle, AlertCircle, Copy } from 'lucide-react';
import { useState } from 'react';

interface RecordingPanelProps {
  processingState: ProcessingState | null;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onUploadFile: (file: File) => void;
  isRecording: boolean;
}

export function RecordingPanel({
  processingState,
  onStartRecording,
  onStopRecording,
  onUploadFile,
  isRecording,
}: RecordingPanelProps) {
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadFile(file);
    }
  };

  const copyTranscript = () => {
    if (processingState?.transcript) {
      navigator.clipboard.writeText(processingState.transcript);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0B0F0E] border-l border-[#1F6F63]/30">
      {/* 녹음 컨트롤 */}
      <div className="p-4 border-b border-[#1F6F63]/30">
        <div className="flex flex-col items-center gap-4">
          {/* 녹음 버튼 */}
          <button
            onClick={isRecording ? onStopRecording : onStartRecording}
            className={`
              w-20 h-20 rounded-full flex items-center justify-center
              transition-all transform hover:scale-105
              focus:outline-none focus:ring-4
              ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 focus:ring-red-500/50 animate-pulse'
                  : 'bg-[#1F6F63] hover:bg-[#2BA08C] focus:ring-[#2BA08C]/50'
              }
            `}
            aria-label={isRecording ? '녹음 정지' : '녹음 시작'}
          >
            {isRecording ? (
              <Square className="w-8 h-8 text-white" />
            ) : (
              <Mic className="w-8 h-8 text-white" />
            )}
          </button>

          {/* 녹음 시간 */}
          {isRecording && (
            <div className="text-2xl font-mono text-[#E6F0ED]">
              {Math.floor(recordingTime / 60)}:{(recordingTime % 60).toString().padStart(2, '0')}
            </div>
          )}

          {/* 파일 업로드 */}
          <div className="w-full">
            <label className="
              flex items-center justify-center gap-2 px-4 py-2
              text-[#A8C3BC] hover:text-[#E6F0ED]
              border border-[#1F6F63]/30 rounded-lg
              hover:bg-[#1F6F63]/10 transition-colors
              cursor-pointer
            ">
              <Upload className="w-4 h-4" />
              <span className="text-sm">파일 업로드</span>
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
                aria-label="오디오 파일 업로드"
              />
            </label>
          </div>
        </div>
      </div>

      {/* 처리 단계 타임라인 */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {PROCESSING_STEPS.filter(s => s.step !== 'error').map((stepMeta, index) => {
            const isActive = processingState?.current === stepMeta.step;
            const isDone =
              processingState &&
              PROCESSING_STEPS.findIndex((s) => s.step === processingState.current) >
                PROCESSING_STEPS.findIndex((s) => s.step === stepMeta.step);
            const isError = processingState?.current === 'error';

            return (
              <div key={stepMeta.step} className="relative">
                {/* 연결선 */}
                {index < PROCESSING_STEPS.length - 2 && (
                  <div
                    className={`
                      absolute left-3 top-8 w-0.5 h-8
                      ${isDone ? 'bg-[#2BA08C]' : 'bg-[#1F6F63]/30 border-l-2 border-dashed'}
                    `}
                  />
                )}

                <div className="flex items-start gap-3">
                  {/* 노드 */}
                  <div className="relative">
                    <div
                      className={`
                        w-6 h-6 rounded-full flex items-center justify-center
                        transition-all
                        ${
                          isActive
                            ? 'bg-[#2BA08C] ring-4 ring-[#2BA08C]/30'
                            : isDone
                            ? 'bg-[#1F6F63] border-2 border-[#2BA08C]'
                            : 'bg-[#0E1513] border-2 border-[#1F6F63]/30'
                        }
                      `}
                    >
                      {isDone ? (
                        <CheckCircle className="w-4 h-4 text-[#2BA08C]" />
                      ) : isActive && isError ? (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      ) : null}
                    </div>
                  </div>

                  {/* 내용 */}
                  <div className="flex-1 pt-0.5">
                    <div className={`
                      font-medium transition-colors
                      ${isActive ? 'text-[#2BA08C]' : isDone ? 'text-[#E6F0ED]' : 'text-[#A8C3BC]'}
                    `}>
                      {stepMeta.label}
                    </div>
                    <div className="text-xs text-[#A8C3BC]/60 mt-0.5">
                      {isActive && processingState?.progress !== undefined
                        ? `${stepMeta.description}... ${processingState.progress}%`
                        : stepMeta.description}
                    </div>
                    {isActive && processingState?.progress !== undefined && (
                      <div className="mt-2 w-full bg-[#0E1513] rounded-full h-1.5">
                        <div
                          className="bg-[#2BA08C] h-1.5 rounded-full transition-all"
                          style={{ width: `${processingState.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 에러 메시지 */}
        {processingState?.current === 'error' && processingState.errorMessage && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-red-500 mb-1">처리 실패</div>
                <div className="text-xs text-red-400/80">{processingState.errorMessage}</div>
                <button className="mt-2 text-xs text-red-400 hover:text-red-300 underline">
                  재시도
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 전사 결과 */}
        {processingState?.transcript && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-[#E6F0ED]">전사 결과</h4>
              <button
                onClick={copyTranscript}
                className="
                  flex items-center gap-1 px-2 py-1 text-xs
                  text-[#A8C3BC] hover:text-[#E6F0ED]
                  hover:bg-[#1F6F63]/10 rounded transition-colors
                "
              >
                <Copy className="w-3 h-3" />
                복사
              </button>
            </div>
            <div className="p-3 bg-[#0E1513] border border-[#1F6F63]/30 rounded-lg text-sm text-[#E6F0ED] max-h-40 overflow-y-auto">
              {processingState.transcript}
            </div>
          </div>
        )}

        {/* 오디오 플레이어 */}
        {processingState?.audioUrl && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-[#E6F0ED] mb-2">합성 오디오</h4>
            <div className="flex items-center gap-3 p-3 bg-[#0E1513] border border-[#1F6F63]/30 rounded-lg">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="
                  w-10 h-10 rounded-full bg-[#1F6F63] hover:bg-[#2BA08C]
                  flex items-center justify-center transition-colors
                "
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-white" />
                ) : (
                  <Play className="w-5 h-5 text-white ml-0.5" />
                )}
              </button>
              <div className="flex-1 h-2 bg-[#0B0F0E] rounded-full overflow-hidden">
                <div className="h-full bg-[#2BA08C] w-0 transition-all" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
