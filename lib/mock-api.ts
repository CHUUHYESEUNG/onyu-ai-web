/**
 * 목업 API 함수들
 * 실제 API 구현 전까지 사용할 가짜 지연 및 데이터 제공
 */

import { TimelineEvent, Section, ProcessingState, ProcessingStep } from '@/types/edit';

// 가짜 지연 함수
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// 목업 타임라인 데이터
export async function getTimeline(): Promise<TimelineEvent[]> {
  await delay(500);
  return [
    { id: '1950_birth', label: '탄생', date: '1950년', status: 'done' },
    { id: '1956_school', label: '학창시절', date: '1956-1968', status: 'done' },
    { id: '1973_job', label: '첫 직장', date: '1973년', status: 'done' },
    { id: '1978_marriage', label: '결혼', date: '1978년', status: 'todo' },
    { id: '1985_business', label: '사업', date: '1985년', status: 'todo' },
    { id: '2000_retirement', label: '은퇴', date: '2000년', status: 'todo' },
    { id: '2024_now', label: '현재', date: '2024년', status: 'todo' },
  ];
}

// 목업 섹션 데이터
export async function getSections(eventId?: string): Promise<Section[]> {
  await delay(300);

  const allSections: Section[] = [
    {
      id: 'sec_1',
      title: '고향 이야기',
      excerpt: '경상남도 진주에서 태어나 자랐습니다. 시골마을의 평온한 풍경이 아직도 생생합니다.',
      content:
        '나는 1950년 경상남도 진주의 작은 마을에서 태어났습니다. 우리 집은 논밭으로 둘러싸인 초가집이었고, 아침이면 닭이 우는 소리에 잠에서 깼습니다. 마을 앞 개울에서 친구들과 물놀이를 하던 기억이 아직도 생생합니다.',
      eventId: '1950_birth',
    },
    {
      id: 'sec_2',
      title: '가족 구성',
      excerpt: '부모님과 형제자매 다섯 명, 큰 가족이었습니다.',
      content:
        '우리 가족은 부모님과 형제자매 다섯 명으로 이루어진 큰 가족이었습니다. 아버지는 농사를 지으셨고, 어머니는 집안일과 함께 밭일을 도우셨습니다.',
      eventId: '1950_birth',
    },
    {
      id: 'sec_3',
      title: '초등학교 입학',
      excerpt: '마을에서 3km 떨어진 학교까지 걸어다녔습니다.',
      content:
        '1956년 봄, 나는 마을에서 3km 떨어진 초등학교에 입학했습니다. 매일 아침 친구들과 함께 걸어서 학교를 다녔고, 빨간 책가방을 메고 가는 것이 자랑스러웠습니다.',
      eventId: '1956_school',
    },
    {
      id: 'sec_4',
      title: '첫 직장 입사',
      excerpt: '1973년 서울로 상경하여 ○○상사에 입사했습니다.',
      content:
        '1973년, 나는 새로운 인생을 시작하기 위해 서울로 상경했습니다. 종로구에 있는 ○○상사에서 사무직으로 일하기 시작했고, 월급 3만 원을 받았습니다.',
      eventId: '1973_job',
    },
  ];

  if (eventId) {
    return allSections.filter((s) => s.eventId === eventId);
  }

  return allSections;
}

// 섹션 저장
export async function saveSection(sectionId: string, content: string): Promise<void> {
  await delay(800);
  console.log(`Saving section ${sectionId}:`, content.substring(0, 50) + '...');
  // 실제로는 서버에 POST 요청
}

// 녹음 시작 (목업)
let mockRecordingInterval: NodeJS.Timeout | null = null;

export function startRecording(): void {
  console.log('Recording started');
  // 실제로는 MediaRecorder API 사용
}

// 녹음 정지 (목업)
export function stopRecording(): Blob {
  console.log('Recording stopped');
  if (mockRecordingInterval) {
    clearInterval(mockRecordingInterval);
    mockRecordingInterval = null;
  }
  // 실제로는 녹음된 Blob 반환
  return new Blob([], { type: 'audio/webm' });
}

// 오디오 업로드
export async function uploadAudio(file: File): Promise<{ assetId: string }> {
  await delay(1500);
  console.log(`Uploading file: ${file.name}`);
  return { assetId: `asset_${Date.now()}` };
}

// 오디오 처리 (목업 - 단계별 진행 시뮬레이션)
export async function* processAudio(assetId: string): AsyncGenerator<ProcessingState> {
  const steps: ProcessingStep[] = [
    'uploading',
    'transcribing',
    'summarizing',
    'structuring',
    'tts',
    'done',
  ];

  for (const step of steps) {
    // 각 단계별 진행률 시뮬레이션
    for (let progress = 0; progress <= 100; progress += 20) {
      await delay(200);
      yield {
        current: step,
        progress,
      };
    }
  }

  // 완료 상태
  yield {
    current: 'done',
    progress: 100,
    transcript:
      '안녕하세요. 저는 1950년 경상남도 진주에서 태어났습니다. 어린 시절 고향에서의 추억들이 아직도 생생합니다.',
    audioUrl: '/mock-audio.mp3',
  };
}

// 타임라인 이벤트 순서 변경
export async function reorderTimelineEvents(eventIds: string[]): Promise<void> {
  await delay(300);
  console.log('Reordering timeline events:', eventIds);
  // 실제로는 서버에 PATCH 요청
}

// 섹션 순서 변경
export async function reorderSections(sectionIds: string[]): Promise<void> {
  await delay(300);
  console.log('Reordering sections:', sectionIds);
  // 실제로는 서버에 PATCH 요청
}
