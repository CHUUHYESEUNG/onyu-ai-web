/**
 * 음성 인터뷰 자서전 편집 페이지 타입 정의
 * edit.md 요구사항 기반
 */

// 타임라인 이벤트 (생애 사건/챕터)
export interface TimelineEvent {
  id: string; // e.g., "1968_born"
  label: string; // "유년기", "중학교", "첫 직장" 등
  date?: string; // "1986-03" 등
  status?: 'todo' | 'done'; // 선택 표시용
  description?: string; // 추가 메모
}

// 섹션 (좌측 리스트)
export interface Section {
  id: string; // "ch_1_school"
  title: string; // "초등학교 시절"
  excerpt: string; // 미리보기 1~2문장
  content: string; // 본문(수정 대상)
  eventId?: string; // 상단 타임라인 이벤트와 연결
  subsections?: Array<{
    id: string;
    title: string;
    content: string;
    sourceType: 'text' | 'voice' | 'file';
  }>;
}

// 처리 단계
export type ProcessingStep =
  | 'recording' // 녹음 중
  | 'uploading' // 업로드 중
  | 'transcribing' // 전사 중
  | 'summarizing' // 요약 중
  | 'structuring' // 챕터화 중
  | 'voice_cloning' // 목소리 프로필 생성 중(선택)
  | 'tts' // 오디오 합성 중
  | 'done' // 완료
  | 'error'; // 실패

// 처리 상태
export interface ProcessingState {
  current: ProcessingStep;
  progress?: number; // 0~100
  errorMessage?: string;
  audioUrl?: string; // 원본/결과 오디오
  transcript?: string; // 전사 결과
}

// 단계 메타데이터
export interface StepMetadata {
  step: ProcessingStep;
  label: string;
  description: string;
}

// 모든 처리 단계 정의
export const PROCESSING_STEPS: StepMetadata[] = [
  { step: 'recording', label: '녹음', description: '음성 녹음 중' },
  { step: 'uploading', label: '업로드', description: '파일 업로드 중' },
  { step: 'transcribing', label: '전사', description: '음성을 텍스트로 변환 중' },
  { step: 'summarizing', label: '요약', description: 'AI가 내용을 요약 중' },
  { step: 'structuring', label: '구조화', description: '챕터로 구조화 중' },
  { step: 'voice_cloning', label: '음성 프로필', description: '음성 프로필 생성 중' },
  { step: 'tts', label: '오디오 합성', description: '오디오북 생성 중' },
  { step: 'done', label: '완료', description: '처리 완료' },
];

// 순서 변경 핸들러 타입
export type ReorderHandler = (fromIndex: number, toIndex: number) => void;

export type TranscriptStatus = 'draft' | 'inserted';

// 전사 결과 아이템 (녹음 히스토리)
export interface TranscriptItem {
  id: string;                   // 고유 ID
  transcript: string;           // 전사 결과 텍스트
  timestamp: Date;              // 녹음 시각
  duration: number;             // 녹음 길이 (초)
  status: TranscriptStatus;     // 본문 반영 여부
  sessionId: string;            // 녹음 세션 ID
  chunkIndex: number;           // 세션 내 조각 순서
  wordCount: number;            // 단어 수 (간단 지표)
  audioUrl?: string;            // 재생 가능한 오디오 URL (optional)
}

// 녹음 세션 메타데이터
export interface SessionMetadata {
  sessionId: string;            // 세션 고유 ID
  startTime: Date;              // 세션 시작 시간
  lastRecordingTime: Date;      // 마지막 녹음 시간
  chunkCount: number;           // 조각 개수
  totalDuration: number;        // 총 녹음 시간 (초)
  sectionTitle?: string;        // 연결된 소주제 제목
  isActive: boolean;            // 활성 세션 여부 (30분 이내)
}
