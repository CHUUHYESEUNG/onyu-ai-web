// @ts-nocheck - Supabase 타입 이슈 임시 우회
'use client';

import { ProcessingState, ProcessingStep, PROCESSING_STEPS } from '@/types/edit';
import { Mic, Square, Upload, Play, Pause, CheckCircle, AlertCircle, Copy } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAudioRecorder, formatDuration, blobToFile } from '@/hooks/use-audio-recorder';
import { supabase, realtime } from '@/lib/supabase';
import { useParams } from 'next/navigation';

interface RecordingPanelProps {
  processingState: ProcessingState | null;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onUploadFile: (file: File) => void;
  isRecording: boolean;
}

export function RecordingPanel({
  processingState: externalProcessingState,
  onStartRecording: externalOnStartRecording,
  onStopRecording: externalOnStopRecording,
  onUploadFile: externalOnUploadFile,
  isRecording: externalIsRecording,
}: RecordingPanelProps) {
  const params = useParams<{ projectId: string }>();
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

  const [processingState, setProcessingState] = useState<ProcessingState | null>(externalProcessingState);
  const [currentAssetId, setCurrentAssetId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // 외부 processingState 변경 감지
  useEffect(() => {
    if (externalProcessingState) {
      setProcessingState(externalProcessingState);
    }
  }, [externalProcessingState]);

  // 녹음 완료 후 자동 업로드
  useEffect(() => {
    if (audioBlob && !isRecording) {
      handleUpload(audioBlob);
    }
  }, [audioBlob, isRecording]);

  // Realtime 구독
  useEffect(() => {
    if (!currentAssetId) return;

    const unsubscribe = realtime.subscribeToAudioProcessing(
      currentAssetId,
      (status, progress) => {
        setProcessingState({
          current: status as ProcessingStep,
          progress,
        });
      }
    );

    return () => {
      unsubscribe();
    };
  }, [currentAssetId]);

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

  // 파일 업로드 핸들러
  const handleUpload = async (blob: Blob) => {
    if (isUploading) return;

    try {
      setIsUploading(true);
      setProcessingState({ current: 'uploading', progress: 10 });

      const file = blobToFile(blob);
      const projectId = params?.projectId || 'default';

      // 1. Supabase Storage 업로드
      const filePath = `${projectId}/${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('audio-uploads')
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(`업로드 실패: ${uploadError.message}`);
      }

      setProcessingState({ current: 'uploading', progress: 50 });

      // 2. DB에 audio_assets 레코드 생성
      const { data: asset, error: assetError } = await supabase
        .from('audio_assets')
        .insert({
          project_id: projectId,
          file_path: filePath,
          file_size: file.size,
          duration: duration,
          status: 'uploaded',
        })
        .select()
        .single();

      if (assetError || !asset) {
        throw new Error(`DB 저장 실패: ${assetError?.message}`);
      }

      setCurrentAssetId(asset.id);
      setProcessingState({ current: 'transcribing', progress: 10 });

      // 3. /api/transcribe 호출
      const formData = new FormData();
      formData.append('audio', file);
      formData.append('assetId', asset.id);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '전사 실패');
      }

      const { transcript } = await response.json();

      setProcessingState({
        current: 'done',
        progress: 100,
        transcript,
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
  };

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

  // 전사 결과 복사
  const copyTranscript = () => {
    if (processingState?.transcript) {
      navigator.clipboard.writeText(processingState.transcript);
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

        {/* 전사 결과 */}
        {processingState?.transcript && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-[#e4e6eb]">전사 결과</h4>
              <button
                onClick={copyTranscript}
                className="
                  flex items-center gap-1 px-2 py-1 text-xs
                  text-[#a0a3b1] hover:text-[#e4e6eb]
                  hover:bg-card rounded transition-colors
                "
              >
                <Copy className="w-3 h-3" />
                복사
              </button>
            </div>
            <div className="p-3 bg-card border border-navy-700 rounded-lg text-sm text-[#e4e6eb] max-h-40 overflow-y-auto">
              {processingState.transcript}
            </div>
          </div>
        )}

        {/* 오디오 플레이어 */}
        {processingState?.audioUrl && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-[#e4e6eb] mb-2">합성 오디오</h4>
            <div className="flex items-center gap-3 p-3 bg-card border border-navy-700 rounded-lg">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="
                  w-10 h-10 rounded-full bg-accent hover:bg-accent-hover
                  flex items-center justify-center transition-colors
                "
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-white" />
                ) : (
                  <Play className="w-5 h-5 text-white ml-0.5" />
                )}
              </button>
              <div className="flex-1 h-2 bg-navy-800 rounded-full overflow-hidden">
                <div className="h-full bg-accent w-0 transition-all" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
