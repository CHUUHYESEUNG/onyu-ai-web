/**
 * 게이미피케이션 로직
 * 스트릭 계산, 미션 진행률, localStorage 관리
 */

import { GamificationData, DailyProgress, Mission, DEFAULT_MISSIONS, ProjectStats, MissionType } from '@/types/gamification';

const STORAGE_KEY_PREFIX = 'gamification_';

// 오늘 날짜를 YYYY-MM-DD 형식으로 반환
export function getTodayString(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

// 날짜 문자열을 Date 객체로 변환
function parseDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00');
}

// 두 날짜 사이의 일수 차이 계산
function daysBetween(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

// 초기 게이미피케이션 데이터 생성
export function createInitialGamificationData(projectId: string): GamificationData {
  const today = getTodayString();
  return {
    projectId,
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: today,
    dailyProgress: [],
    stats: {
      totalSections: 0,
      totalTimelineEvents: 0,
      totalRecordingTime: 0,
      totalWords: 0,
      lastUpdated: new Date(),
    },
  };
}

// localStorage에서 게이미피케이션 데이터 로드
export function loadGamificationData(projectId: string): GamificationData {
  if (typeof window === 'undefined') {
    return createInitialGamificationData(projectId);
  }

  const key = STORAGE_KEY_PREFIX + projectId;
  const stored = localStorage.getItem(key);

  if (!stored) {
    return createInitialGamificationData(projectId);
  }

  try {
    const data = JSON.parse(stored);
    // Date 객체 복원
    data.stats.lastUpdated = new Date(data.stats.lastUpdated);
    return data;
  } catch (error) {
    console.error('Failed to parse gamification data:', error);
    return createInitialGamificationData(projectId);
  }
}

// localStorage에 게이미피케이션 데이터 저장
export function saveGamificationData(data: GamificationData): void {
  if (typeof window === 'undefined') return;

  const key = STORAGE_KEY_PREFIX + data.projectId;
  localStorage.setItem(key, JSON.stringify(data));
}

// 오늘의 미션 가져오기 (없으면 생성)
export function getTodayMissions(data: GamificationData): Mission[] {
  const today = getTodayString();
  const todayProgress = data.dailyProgress.find(p => p.date === today);

  if (todayProgress) {
    return todayProgress.missions;
  }

  // 오늘의 미션 생성
  return DEFAULT_MISSIONS.map(template => ({
    ...template,
    current: 0,
    completed: false,
  }));
}

// 오늘의 진행 상황 가져오기 (없으면 생성)
export function getTodayProgress(data: GamificationData): DailyProgress {
  const today = getTodayString();
  const existing = data.dailyProgress.find(p => p.date === today);

  if (existing) {
    return existing;
  }

  // 새 진행 상황 생성
  const newProgress: DailyProgress = {
    date: today,
    missions: getTodayMissions(data),
    completed: false,
  };

  return newProgress;
}

// 스트릭 계산
export function calculateStreak(data: GamificationData): number {
  const today = getTodayString();
  const lastActive = data.lastActiveDate;

  if (!lastActive) return 0;

  const lastDate = parseDate(lastActive);
  const todayDate = parseDate(today);
  const daysDiff = daysBetween(lastDate, todayDate);

  // 같은 날이면 현재 스트릭 유지
  if (daysDiff === 0) {
    return data.currentStreak;
  }

  // 하루 차이면 스트릭 증가
  if (daysDiff === 1) {
    return data.currentStreak + 1;
  }

  // 그 이상이면 스트릭 끊김
  return 1; // 오늘부터 새로 시작
}

// 미션 업데이트
export function updateMission(
  data: GamificationData,
  missionId: MissionType,
  increment: number
): GamificationData {
  const today = getTodayString();
  let todayProgress = getTodayProgress(data);

  // 미션 찾기
  const missionIndex = todayProgress.missions.findIndex(m => m.id === missionId);
  if (missionIndex === -1) return data;

  const mission = todayProgress.missions[missionIndex];
  const newCurrent = Math.min(mission.current + increment, mission.target);
  const newCompleted = newCurrent >= mission.target;

  // 미션 업데이트
  const updatedMissions = [...todayProgress.missions];
  updatedMissions[missionIndex] = {
    ...mission,
    current: newCurrent,
    completed: newCompleted,
  };

  // 모든 미션 완료 여부 확인
  const allCompleted = updatedMissions.every(m => m.completed);

  todayProgress = {
    ...todayProgress,
    missions: updatedMissions,
    completed: allCompleted,
  };

  // dailyProgress 업데이트
  const progressIndex = data.dailyProgress.findIndex(p => p.date === today);
  let updatedDailyProgress: DailyProgress[];

  if (progressIndex >= 0) {
    updatedDailyProgress = [...data.dailyProgress];
    updatedDailyProgress[progressIndex] = todayProgress;
  } else {
    updatedDailyProgress = [...data.dailyProgress, todayProgress];
  }

  // 스트릭 계산
  const newStreak = calculateStreak(data);
  const newLongestStreak = Math.max(data.longestStreak, newStreak);

  return {
    ...data,
    currentStreak: newStreak,
    longestStreak: newLongestStreak,
    lastActiveDate: today,
    dailyProgress: updatedDailyProgress,
  };
}

// 통계 업데이트
export function updateStats(
  data: GamificationData,
  updates: Partial<ProjectStats>
): GamificationData {
  return {
    ...data,
    stats: {
      ...data.stats,
      ...updates,
      lastUpdated: new Date(),
    },
  };
}

// 소주제 작성 시 호출
export function onSectionCreated(data: GamificationData): GamificationData {
  let updated = updateMission(data, 'create_section', 1);
  updated = updateStats(updated, {
    totalSections: updated.stats.totalSections + 1,
  });
  saveGamificationData(updated);
  return updated;
}

// 녹음 완료 시 호출
export function onRecordingCompleted(
  data: GamificationData,
  durationSeconds: number,
  wordCount: number
): GamificationData {
  let updated = updateMission(data, 'record_voice', durationSeconds);
  updated = updateStats(updated, {
    totalRecordingTime: updated.stats.totalRecordingTime + durationSeconds,
    totalWords: updated.stats.totalWords + wordCount,
  });
  saveGamificationData(updated);
  return updated;
}

// 타임라인 이벤트 추가 시 호출
export function onTimelineEventCreated(data: GamificationData): GamificationData {
  let updated = updateMission(data, 'add_timeline', 1);
  updated = updateStats(updated, {
    totalTimelineEvents: updated.stats.totalTimelineEvents + 1,
  });
  saveGamificationData(updated);
  return updated;
}
