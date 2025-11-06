/**
 * useAudioRecorder - 음성 녹음 React Hook
 *
 * AudioRecorder 유틸리티를 React 컴포넌트에서 사용하기 쉽게
 * 추상화한 Hook입니다.
 *
 * @example
 * ```tsx
 * function RecordingComponent() {
 *   const {
 *     isRecording,
 *     isPaused,
 *     duration,
 *     audioBlob,
 *     error,
 *     startRecording,
 *     stopRecording,
 *     pauseRecording,
 *     resumeRecording,
 *   } = useAudioRecorder();
 *
 *   return (
 *     <div>
 *       {!isRecording && (
 *         <button onClick={startRecording}>녹음 시작</button>
 *       )}
 *       {isRecording && (
 *         <>
 *           <div>{formatDuration(duration)}</div>
 *           <button onClick={stopRecording}>녹음 정지</button>
 *         </>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  AudioRecorder,
  AudioRecorderOptions,
  isAudioRecordingSupported,
} from '@/lib/audio-recorder';

export interface UseAudioRecorderResult {
  /**
   * 녹음 중 여부
   */
  isRecording: boolean;

  /**
   * 일시정지 중 여부
   */
  isPaused: boolean;

  /**
   * 녹음 시간 (초 단위)
   */
  duration: number;

  /**
   * 녹음 완료 후 생성된 오디오 Blob
   */
  audioBlob: Blob | null;

  /**
   * 에러 메시지
   */
  error: string | null;

  /**
   * 브라우저가 오디오 녹음을 지원하는지 여부
   */
  isSupported: boolean;

  /**
   * 녹음 시작
   */
  startRecording: () => Promise<void>;

  /**
   * 녹음 정지 및 Blob 반환
   */
  stopRecording: () => Promise<Blob | null>;

  /**
   * 녹음 일시정지
   */
  pauseRecording: () => void;

  /**
   * 녹음 재개
   */
  resumeRecording: () => void;

  /**
   * 에러 초기화
   */
  clearError: () => void;

  /**
   * 녹음 데이터 초기화
   */
  reset: () => void;
}

export function useAudioRecorder(
  options?: AudioRecorderOptions
): UseAudioRecorderResult {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSupported] = useState(isAudioRecordingSupported());

  const recorderRef = useRef<AudioRecorder | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * 녹음 시간 카운터 시작
   */
  const startDurationCounter = useCallback(() => {
    intervalRef.current = setInterval(() => {
      if (recorderRef.current) {
        setDuration(recorderRef.current.getRecordingDuration());
      }
    }, 100); // 100ms마다 업데이트 (부드러운 카운터)
  }, []);

  /**
   * 녹음 시간 카운터 정지
   */
  const stopDurationCounter = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /**
   * 녹음 시작
   */
  const startRecording = useCallback(async () => {
    if (!isSupported) {
      setError('이 브라우저는 음성 녹음을 지원하지 않습니다.');
      return;
    }

    try {
      const recorder = new AudioRecorder(options);
      await recorder.requestPermission();
      recorder.start();

      recorderRef.current = recorder;
      setIsRecording(true);
      setIsPaused(false);
      setError(null);
      setAudioBlob(null);
      setDuration(0);

      startDurationCounter();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '녹음을 시작할 수 없습니다.';
      setError(errorMessage);
      setIsRecording(false);
    }
  }, [isSupported, options, startDurationCounter]);

  /**
   * 녹음 정지
   */
  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    if (!recorderRef.current) {
      return null;
    }

    try {
      const blob = await recorderRef.current.stop();

      setAudioBlob(blob);
      setIsRecording(false);
      setIsPaused(false);
      stopDurationCounter();

      return blob;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '녹음을 정지할 수 없습니다.';
      setError(errorMessage);
      return null;
    }
  }, [stopDurationCounter]);

  /**
   * 녹음 일시정지
   */
  const pauseRecording = useCallback(() => {
    if (recorderRef.current) {
      recorderRef.current.pause();
      setIsPaused(true);
      stopDurationCounter();
    }
  }, [stopDurationCounter]);

  /**
   * 녹음 재개
   */
  const resumeRecording = useCallback(() => {
    if (recorderRef.current) {
      recorderRef.current.resume();
      setIsPaused(false);
      startDurationCounter();
    }
  }, [startDurationCounter]);

  /**
   * 에러 초기화
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * 녹음 데이터 초기화
   */
  const reset = useCallback(() => {
    if (recorderRef.current) {
      recorderRef.current.dispose();
      recorderRef.current = null;
    }

    stopDurationCounter();
    setIsRecording(false);
    setIsPaused(false);
    setDuration(0);
    setAudioBlob(null);
    setError(null);
  }, [stopDurationCounter]);

  /**
   * 컴포넌트 언마운트 시 정리
   */
  useEffect(() => {
    return () => {
      if (recorderRef.current) {
        recorderRef.current.dispose();
      }
      stopDurationCounter();
    };
  }, [stopDurationCounter]);

  return {
    isRecording,
    isPaused,
    duration,
    audioBlob,
    error,
    isSupported,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    clearError,
    reset,
  };
}

/**
 * 녹음 시간을 mm:ss 형식으로 포맷팅하는 유틸리티 함수
 *
 * @param seconds - 초 단위 시간
 * @returns mm:ss 형식 문자열
 *
 * @example
 * ```ts
 * formatDuration(0)   // "00:00"
 * formatDuration(65)  // "01:05"
 * formatDuration(125) // "02:05"
 * ```
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * 오디오 Blob을 File 객체로 변환하는 유틸리티 함수
 *
 * @param blob - 오디오 Blob
 * @param filename - 파일명 (기본: recording_{timestamp}.webm)
 * @returns File 객체
 */
export function blobToFile(blob: Blob, filename?: string): File {
  const defaultFilename = filename || `recording_${Date.now()}.webm`;
  return new File([blob], defaultFilename, { type: blob.type });
}
