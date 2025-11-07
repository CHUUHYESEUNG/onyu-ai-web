/**
 * 게이미피케이션 타입 정의
 * 데일리 미션, 스트릭, 진행률 등
 */

// 미션 타입
export type MissionType = 'create_section' | 'record_voice' | 'add_timeline';

// 미션 정의
export interface Mission {
  id: MissionType;
  label: string;
  description: string;
  target: number;      // 목표값
  current: number;     // 현재값
  completed: boolean;
  icon: string;        // 이모지
}

// 일일 진행 상황
export interface DailyProgress {
  date: string;        // "2025-01-07" 형식
  missions: Mission[];
  completed: boolean;  // 모든 미션 완료 여부
}

// 프로젝트 통계
export interface ProjectStats {
  totalSections: number;       // 총 소주제 수
  totalTimelineEvents: number; // 총 타임라인 이벤트 수
  totalRecordingTime: number;  // 총 녹음 시간 (초)
  totalWords: number;          // 총 단어 수
  lastUpdated: Date;
}

// 게이미피케이션 데이터
export interface GamificationData {
  projectId: string;
  currentStreak: number;       // 현재 연속 일수
  longestStreak: number;       // 최장 연속 일수
  lastActiveDate: string;      // "2025-01-07" 형식
  dailyProgress: DailyProgress[];
  stats: ProjectStats;
}

// 기본 미션 정의
export const DEFAULT_MISSIONS: Omit<Mission, 'current' | 'completed'>[] = [
  {
    id: 'create_section',
    label: '소주제 작성',
    description: '소주제 1개 이상 작성하기',
    target: 1,
    icon: '✍️',
  },
  {
    id: 'record_voice',
    label: '음성 녹음',
    description: '5분 이상 녹음하기',
    target: 300, // 5분 = 300초
    icon: '🎤',
  },
  {
    id: 'add_timeline',
    label: '타임라인 추가',
    description: '타임라인 이벤트 1개 추가하기',
    target: 1,
    icon: '📅',
  },
];
