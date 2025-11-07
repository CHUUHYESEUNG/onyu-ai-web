'use client';

import { ProcessingState, PROCESSING_STEPS, TranscriptItem } from '@/types/edit';
import { Mic, Square, Upload, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useAudioRecorder, formatDuration } from '@/hooks/use-audio-recorder';
import { TranscriptCard } from '@/components/edit/transcript-card';

interface TranscriptFragmentPayload {
  transcript: string;
  duration: number;
  sessionId: string;
  chunkIndex: number;
}

interface RecordingPanelProps {
  transcriptHistory: TranscriptItem[];
  onTranscriptAdd: (fragment: TranscriptFragmentPayload) => void;
  onTranscriptUpdate: (id: string, transcript: string) => void;
  onTranscriptDelete: (id: string) => void;
  onTranscriptInsert: (id: string, transcript: string) => void;
  onMergeFragments: (id: string, direction: 'prev' | 'next') => void;
  onSplitFragment: (id: string) => void;
  onClearAll: () => void;
  onClosePanel: () => void;
}

const chunkTranscript = (text: string, maxLength = 220): string[] => {
  if (!text.trim()) return [];
  const sentences = text.split(/(?<=[.!?]|[。！？]|다\.)\s+/);
  const chunks: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    const next = current ? `${current} ${sentence}`.trim() : sentence.trim();
    if (next.length > maxLength && current) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current = next;
    }
  }

  if (current.trim()) {
    chunks.push(current.trim());
  }

  if (chunks.length === 0) {
    return [text.trim()];
  }

  return chunks;
};

const ensureChunkDuration = (duration: number, chunkCount: number) => {
  if (chunkCount <= 0) return duration || 30;
  const safeDuration = Math.max(duration, 10);
  return Math.max(Math.round(safeDuration / chunkCount), 5);
};

export function RecordingPanel({
  transcriptHistory,
  onTranscriptAdd,
  onTranscriptUpdate,
  onTranscriptDelete,
  onTranscriptInsert,
  onMergeFragments,
  onSplitFragment,
  onClearAll,
  onClosePanel,
}: RecordingPanelProps) {
  const {
    isRecording,
    isPaused,
    duration,
    audioBlob,
    error: recorderError,
    isSupported,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearError,
  } = useAudioRecorder();

  const [processingState, setProcessingState] = useState<ProcessingState | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // 녹음 완료 후 자동 업로드
  useEffect(() => {
    if (audioBlob && !isRecording) {
      handleUpload(audioBlob);
    }
  }, [audioBlob, isRecording, handleUpload]);

  // 녹음 시작/정지 핸들러
  const handleRecordToggle = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      clearError();
      setProcessingState({ current: 'recording', progress: 0 });
      await startRecording();
    }
  };

  // 파일 업로드 핸들러 (MOCK 처리)
  const handleUpload = useCallback(async (blob: Blob) => {
    if (isUploading) return;

    try {
      setIsUploading(true);
      setProcessingState({ current: 'uploading', progress: 10 });

      // Mock: 업로드 시뮬레이션 (500ms)
      await new Promise(resolve => setTimeout(resolve, 500));
      setProcessingState({ current: 'uploading', progress: 50 });

      // Mock: 전사 시뮬레이션 (1초)
      setProcessingState({ current: 'transcribing', progress: 10 });
      await new Promise(resolve => setTimeout(resolve, 300));
      setProcessingState({ current: 'transcribing', progress: 50 });
      await new Promise(resolve => setTimeout(resolve, 400));
      setProcessingState({ current: 'transcribing', progress: 80 });
      await new Promise(resolve => setTimeout(resolve, 300));

      // Mock: 가상 전사 결과 생성
      const mockTranscripts = [
        "저는 1950년에 부산으로 피난을 갔어요. 그때 오빠가 저를 업고 걸어서 며칠을 갔던 기억이 나요. 정말 힘들었지만 가족이 함께 있어서 다행이었습니다.",
        "첫 직장은 1975년에 들어간 은행이었어요. 그때는 여자 직원이 별로 없었는데, 제가 처음으로 여성 행원으로 채용됐습니다. 부모님이 정말 자랑스러워하셨어요.",
        "남편을 만난 건 1978년 봄이었어요. 친구 소개로 만났는데, 첫인상이 참 좋았습니다. 성실하고 착한 사람이라는 게 눈에 보였어요.",
        "아이들이 태어나고 나서는 정말 바빴어요. 육아와 일을 병행하는 게 쉽지 않았지만, 아이들 웃는 얼굴을 보면 피로가 다 풀렸습니다.",
        "요즘 손주들을 보면서 옛날 생각이 많이 나요. 시간이 정말 빨리 흐르는 것 같습니다. 건강할 때 이렇게 이야기를 남길 수 있어서 참 다행이에요.",
      ];

      const randomTranscript = mockTranscripts[Math.floor(Math.random() * mockTranscripts.length)];
      const sessionId = `session_${Date.now()}`;
      const chunks = chunkTranscript(randomTranscript);
      const baselineDuration = duration || Math.max(Math.round(blob.size / 16000), 10);
      const perChunkDuration = ensureChunkDuration(baselineDuration, chunks.length);

      setProcessingState({
        current: 'done',
        progress: 100,
      });

      const effectiveChunks = chunks.length === 0 ? [randomTranscript] : chunks;
      effectiveChunks.forEach((chunk, index) => {
        onTranscriptAdd({
          transcript: chunk,
          duration: perChunkDuration,
          sessionId,
          chunkIndex: index,
        });
      });

    } catch (error) {
      console.error('Upload/transcribe error:', error);
      setProcessingState({
        current: 'error',
        errorMessage: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.',
      });
    } finally {
      setIsUploading(false);
    }
  }, [duration, isUploading, onTranscriptAdd]);

  // 파일 업로드 핸들러 (input)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 파일을 Blob으로 변환하여 업로드
      file.arrayBuffer().then(buffer => {
        const blob = new Blob([buffer], { type: file.type });
        handleUpload(blob);
      });
    }
  };

  // 재시도
  const handleRetry = () => {
    if (audioBlob) {
      handleUpload(audioBlob);
    }
  };

  return (
    <div className="flex flex-col h-full bg-navy-900 border-l border-navy-700">
      <div className="flex items-center justify-between border-b border-navy-800 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-[#e4e6eb]">녹음 & 전사 패널</p>
          <p className="text-[11px] text-[#7a7d8c]">
            세션 {new Set(transcriptHistory.map((item) => item.sessionId)).size}개 · 조각 {transcriptHistory.length}개
          </p>
        </div>
        <button
          onClick={onClosePanel}
          className="inline-flex items-center gap-1 rounded-lg border border-navy-700 px-3 py-1.5 text-xs text-[#a0a3b1] hover:text-[#e4e6eb] hover:border-accent transition-colors"
        >
          <X className="w-4 h-4" />
          닫기
        </button>
      </div>

      {/* 녹음 컨트롤 */}
      <div className="p-4 border-b border-navy-700">
        <div className="flex flex-col items-center gap-4">
          {/* 녹음 버튼 */}
          <button
            onClick={handleRecordToggle}
            disabled={!isSupported || isUploading}
            className={`
              w-20 h-20 rounded-full flex items-center justify-center
              transition-all transform hover:scale-105
              focus:outline-none focus:ring-4
              disabled:opacity-50 disabled:cursor-not-allowed
              ${
                isRecording
                  ? 'bg-red-500 hover:bg-red-600 focus:ring-red-500/50 animate-pulse'
                  : 'bg-accent hover:bg-accent-hover focus:ring-accent/50'
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
            <div className="text-2xl font-mono text-[#e4e6eb]">
              {formatDuration(duration)}
            </div>
          )}

          {/* 일시정지/재개 버튼 (녹음 중) */}
          {isRecording && (
            <button
              onClick={isPaused ? resumeRecording : pauseRecording}
              className="px-4 py-2 text-sm bg-card hover:bg-card-hover text-[#e4e6eb] rounded-lg transition-colors"
            >
              {isPaused ? '재개' : '일시정지'}
            </button>
          )}

          {/* 파일 업로드 */}
          <div className="w-full">
            <label className="
              flex items-center justify-center gap-2 px-4 py-2
              text-[#a0a3b1] hover:text-[#e4e6eb]
              border border-navy-700 rounded-lg
              hover:bg-card transition-colors
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
                disabled={isUploading}
              />
            </label>
          </div>

          {/* 에러 메시지 (녹음 에러) */}
          {recorderError && (
            <div className="w-full p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-xs text-red-400">
              {recorderError}
            </div>
          )}

          {/* 브라우저 지원 안내 */}
          {!isSupported && (
            <div className="w-full p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-xs text-yellow-400">
              이 브라우저는 음성 녹음을 지원하지 않습니다.
            </div>
          )}
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
                      ${isDone ? 'bg-accent' : 'bg-navy-700 border-l-2 border-dashed'}
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
                            ? 'bg-accent ring-4 ring-accent/30'
                            : isDone
                            ? 'bg-navy-700 border-2 border-accent'
                            : 'bg-card border-2 border-navy-700'
                        }
                      `}
                    >
                      {isDone ? (
                        <CheckCircle className="w-4 h-4 text-accent" />
                      ) : isActive && isError ? (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      ) : null}
                    </div>
                  </div>

                  {/* 내용 */}
                  <div className="flex-1 pt-0.5">
                    <div className={`
                      font-medium transition-colors
                      ${isActive ? 'text-accent' : isDone ? 'text-[#e4e6eb]' : 'text-[#a0a3b1]'}
                    `}>
                      {stepMeta.label}
                    </div>
                    <div className="text-xs text-[#7a7d8c] mt-0.5">
                      {isActive && processingState?.progress !== undefined
                        ? `${stepMeta.description}... ${processingState.progress}%`
                        : stepMeta.description}
                    </div>
                    {isActive && processingState?.progress !== undefined && (
                      <div className="mt-2 w-full bg-card rounded-full h-1.5">
                        <div
                          className="bg-accent h-1.5 rounded-full transition-all"
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
                <button
                  onClick={handleRetry}
                  className="mt-2 text-xs text-red-400 hover:text-red-300 underline"
                >
                  재시도
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 녹음 기록 히스토리 */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-[#e4e6eb]">
              녹음 기록 ({transcriptHistory.length})
            </h4>
            {transcriptHistory.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                전체 삭제
              </button>
            )}
          </div>

          {transcriptHistory.length === 0 ? (
            <div className="text-center text-[#7a7d8c] text-sm py-8">
              녹음 버튼을 눌러 시작하세요
            </div>
          ) : (
            <div className="space-y-3">
              {transcriptHistory.map((item, index) => (
                <TranscriptCard
                  key={item.id}
                  item={item}
                  index={index}
                  onUpdate={onTranscriptUpdate}
                  onDelete={onTranscriptDelete}
                  onInsert={() => onTranscriptInsert(item.id, item.transcript)}
                  onMergePrev={
                    index > 0 && transcriptHistory[index - 1].sessionId === item.sessionId
                      ? () => onMergeFragments(item.id, 'prev')
                      : undefined
                  }
                  onMergeNext={
                    index < transcriptHistory.length - 1 && transcriptHistory[index + 1].sessionId === item.sessionId
                      ? () => onMergeFragments(item.id, 'next')
                      : undefined
                  }
                  onSplit={() => onSplitFragment(item.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
