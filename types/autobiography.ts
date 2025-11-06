/**
 * 온유록 자서전 프로젝트 데이터 모델
 * 세션 기반 인터뷰 시스템을 위한 TypeScript 인터페이스
 */

// 자서전 프로젝트 전체
export interface AutobiographyProject {
  id: string;
  userId: string;
  title: string;
  description?: string;
  progress: number; // 0-100
  chapters: Chapter[];
  createdAt: Date;
  lastEditedAt: Date;
  status: 'draft' | 'in_progress' | 'completed' | 'published';
}

// 챕터 (시간대별 또는 주제별)
export interface Chapter {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  order: number;
  sessions: Session[];
  status: 'not_started' | 'in_progress' | 'completed';
  estimatedDuration?: number; // 예상 소요 시간 (분)
  createdAt: Date;
  updatedAt: Date;
}

// 세션 (실제 인터뷰 단위)
export interface Session {
  id: string;
  chapterId: string;
  title: string;
  description?: string;
  questions: Question[];
  startedAt?: Date;
  completedAt?: Date;
  totalDuration?: number; // 실제 녹음 시간 (초)
  status: 'not_started' | 'in_progress' | 'completed';
}

// 질문 및 답변
export interface Question {
  id: string;
  sessionId: string;
  prompt: string; // AI가 제시하는 질문
  order: number;
  audioUrl?: string; // 녹음 파일 URL
  transcription?: string; // STT 결과
  duration?: number; // 녹음 길이 (초)
  isSkipped: boolean;
  isCompleted: boolean;
  recordedAt?: Date;
}

// 편집 가능한 텍스트 블록
export interface TextBlock {
  id: string;
  projectId: string;
  chapterId?: string;
  content: string; // AI 생성 또는 사용자 수정 텍스트
  order: number;
  sourceQuestionIds: string[]; // 원본 질문 참조
  type: 'ai_generated' | 'user_edited' | 'user_added';
  editable: boolean;
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
}

// 협업용 코멘트
export interface Comment {
  id: string;
  blockId: string;
  userId: string;
  userName: string;
  content: string;
  type: 'text' | 'voice'; // 텍스트 또는 음성 메모
  audioUrl?: string;
  createdAt: Date;
}

// 프로젝트 생성 요청
export interface CreateProjectRequest {
  title: string;
  description?: string;
  templateType?: 'chronological' | 'thematic'; // 시간순 or 주제별
}

// 세션 진행 상태
export interface SessionProgress {
  sessionId: string;
  totalQuestions: number;
  completedQuestions: number;
  skippedQuestions: number;
  progressPercentage: number;
  estimatedTimeRemaining?: number; // 남은 예상 시간 (분)
}

// 챕터 템플릿
export interface ChapterTemplate {
  title: string;
  description: string;
  suggestedQuestions: string[];
  estimatedDuration: number;
  icon?: string;
}

// 기본 챕터 템플릿 (시간순)
export const CHRONOLOGICAL_TEMPLATES: ChapterTemplate[] = [
  {
    title: '어린 시절',
    description: '출생부터 초등학교 시절까지',
    suggestedQuestions: [
      '어디서 태어나셨나요?',
      '어린 시절의 가장 생생한 기억은 무엇인가요?',
      '가족 구성원은 어떻게 되나요?',
      '학교 생활은 어땠나요?',
    ],
    estimatedDuration: 30,
    icon: '👶',
  },
  {
    title: '청년 시절',
    description: '중고등학교부터 대학 시절까지',
    suggestedQuestions: [
      '청소년 시절 꿈은 무엇이었나요?',
      '가장 기억에 남는 친구는 누구인가요?',
      '대학은 어디를 다니셨나요?',
    ],
    estimatedDuration: 30,
    icon: '🎓',
  },
  {
    title: '직장 생활',
    description: '첫 직장부터 은퇴까지',
    suggestedQuestions: [
      '첫 직장은 어디였나요?',
      '가장 보람찼던 일은 무엇인가요?',
      '어려웠던 순간은 언제였나요?',
    ],
    estimatedDuration: 30,
    icon: '💼',
  },
  {
    title: '결혼과 가정',
    description: '배우자와의 만남, 자녀 양육',
    suggestedQuestions: [
      '배우자를 어떻게 만나셨나요?',
      '결혼 당시 기억은 어떤가요?',
      '자녀 양육에서 가장 중요하게 생각한 것은?',
    ],
    estimatedDuration: 30,
    icon: '👨‍👩‍👧‍👦',
  },
  {
    title: '지금 이 순간',
    description: '현재의 생활과 미래의 바람',
    suggestedQuestions: [
      '지금 가장 중요하게 생각하는 것은 무엇인가요?',
      '후손들에게 전하고 싶은 말씀은?',
      '앞으로의 바람은 무엇인가요?',
    ],
    estimatedDuration: 20,
    icon: '🌟',
  },
];
