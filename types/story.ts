export interface StoryChapter {
  title: string;
  content: string;
}

export interface StoryData {
  topic: string;
  summary: string;
  keywords: string[];
  chapters: StoryChapter[];
}

// 이전 버전 호환성을 위한 타입 별칭 (deprecated)
/** @deprecated Use StoryChapter instead */
export type Chapter = StoryChapter;
