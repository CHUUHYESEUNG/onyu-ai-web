/**
 * 에디터 및 녹음 관련 유틸리티 함수
 */

/**
 * 상대 시간 표시 (예: "방금 전", "2분 전", "1시간 전")
 */
export function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 60) return '방금 전';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간 전`;

  // 오늘이 아니면 시간 표시
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * 녹음 길이 표시 (예: "30초", "2분 15초", "1시간 5분")
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}초`;

  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return secs > 0 ? `${hours}시간 ${mins}분 ${secs}초` : `${hours}시간 ${mins}분`;
  }

  return secs > 0 ? `${mins}분 ${secs}초` : `${mins}분`;
}
