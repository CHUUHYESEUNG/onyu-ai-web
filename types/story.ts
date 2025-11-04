export interface Chapter {
  title: string;
  content: string;
}

export interface StoryData {
  topic: string;
  summary: string;
  keywords: string[];
  chapters: Chapter[];
}
