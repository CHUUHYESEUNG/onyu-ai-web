/**
 * AI 유틸리티 함수
 *
 * OpenAI GPT-4를 사용한 텍스트 요약, 구조화, 소단락 생성 등의 유틸리티 함수를 제공합니다.
 */

export interface Subsection {
  id: string;
  title: string;
  content: string;
  sourceType: 'text' | 'voice' | 'file';
}

export interface SummarizeOptions {
  sectionTitle?: string;
  eventContext?: string;
  style?: 'formal' | 'casual' | 'warm';
}

export interface StructureOptions {
  sectionTitle?: string;
  targetSubsections?: number;
}

/**
 * 프롬프트 생성 모드
 */
export type PromptMode =
  | 'summarize'
  | 'structure'
  | 'warm_storytelling'
  | 'respectful_memories'
  | 'chapter_generation'
  | 'question_generation';

/**
 * 프롬프트 생성 옵션
 */
export interface PromptOptions {
  mode: PromptMode;
  tone?: 'formal' | 'warm' | 'casual';
  style?: 'narrative' | 'documentary' | 'conversational';
  context?: {
    sectionTitle?: string;
    eventContext?: string;
    targetLength?: number;
    targetSubsections?: number;
  };
}

/**
 * 전략 패턴 기반 프롬프트 생성기
 *
 * 다양한 AI 작업에 맞는 프롬프트를 생성합니다.
 */
export class PromptBuilder {
  private options: PromptOptions;

  constructor(options: PromptOptions) {
    this.options = options;
  }

  build(): string {
    switch (this.options.mode) {
      case 'summarize':
        return this.buildSummarizePrompt();
      case 'structure':
        return this.buildStructurePrompt();
      case 'warm_storytelling':
        return this.buildWarmStorytellingPrompt();
      case 'respectful_memories':
        return this.buildRespectfulMemoriesPrompt();
      case 'chapter_generation':
        return this.buildChapterGenerationPrompt();
      case 'question_generation':
        return this.buildQuestionGenerationPrompt();
      default:
        throw new Error(`Unknown prompt mode: ${this.options.mode}`);
    }
  }

  private buildSummarizePrompt(): string {
    const { tone = 'warm', context } = this.options;

    const toneGuide = {
      formal: '정중하고 격식있는 표현을 사용하세요.',
      warm: '따뜻하고 친근한 어조로 작성하세요.',
      casual: '편안하고 자연스러운 대화체를 사용하세요.',
    };

    return `당신은 시니어 세대의 인생 이야기를 존중하며 정리하는 전문 작가입니다.

다음 인터뷰 전사 텍스트를 자서전 형식으로 요약해주세요:

${context?.eventContext ? `맥락: ${context.eventContext}` : ''}
${context?.sectionTitle ? `주제: ${context.sectionTitle}` : ''}

요구사항:
- ${toneGuide[tone]}
- 말하는 사람의 감정과 뉘앙스를 보존하세요.
- 시간 순서대로 정리하되, 자연스러운 흐름을 유지하세요.
- 불필요한 반복이나 말더듬은 제거하세요.
- 한국어 존댓말/경어를 적절히 사용하세요.
${context?.targetLength ? `- 약 ${context.targetLength}자 정도로 작성하세요.` : ''}

전사 텍스트:`;
  }

  private buildStructurePrompt(): string {
    const { context } = this.options;

    return `다음 텍스트를 의미 단위로 소단락(subsections)으로 분할해주세요.

${context?.sectionTitle ? `주제: ${context.sectionTitle}` : ''}

요구사항:
- 각 소단락은 하나의 주제나 사건을 다뤄야 합니다.
- 각 소단락에 제목을 붙여주세요.
- 소단락은 자연스럽게 이어져야 합니다.
${context?.targetSubsections ? `- 약 ${context.targetSubsections}개의 소단락으로 나눠주세요.` : '- 3-5개의 소단락으로 나눠주세요.'}

다음 JSON 형식으로 응답해주세요:
{
  "subsections": [
    {
      "title": "소단락 제목",
      "content": "소단락 내용"
    }
  ]
}

텍스트:`;
  }

  private buildWarmStorytellingPrompt(): string {
    return `당신은 시니어의 인생 이야기를 따뜻하게 전달하는 스토리텔러입니다.

다음 전사 텍스트를 감동적인 자서전 형식으로 다시 작성해주세요:

요구사항:
- 따뜻하고 존중하는 어조를 유지하세요.
- 세대를 잇는 가치와 지혜를 강조하세요.
- 구체적인 디테일과 감정을 살려주세요.
- 독자(가족, 후손)가 공감할 수 있게 작성하세요.
- "나"를 주어로 1인칭 서술을 사용하세요.

전사 텍스트:`;
  }

  private buildRespectfulMemoriesPrompt(): string {
    return `당신은 어르신의 기억을 존중하며 기록하는 전문가입니다.

다음 전사 텍스트를 정중하고 존중하는 자서전 형식으로 작성해주세요:

요구사항:
- 최대한 원문의 표현과 느낌을 보존하세요.
- 어르신의 말투와 개성을 살려주세요.
- 사실관계를 정확히 기록하세요.
- 불필요한 각색이나 과장을 피하세요.
- 존댓말과 경어를 적절히 사용하세요.

전사 텍스트:`;
  }

  private buildChapterGenerationPrompt(): string {
    return `당신은 인터뷰 내용을 분석하여 자서전의 챕터 구조를 제안하는 전문가입니다.

다음 인터뷰 전사 텍스트들을 분석하여 5-8개의 주요 챕터를 자동 생성해주세요:

요구사항:
- 시간순(연대기순)으로 챕터를 구성하세요.
- 각 챕터는 인생의 중요한 시기나 주제를 다뤄야 합니다.
- 챕터 제목은 간결하고 의미있게 작성하세요.
- 각 챕터에 간단한 설명을 추가하세요.

다음 JSON 형식으로 응답해주세요:
{
  "chapters": [
    {
      "title": "챕터 제목",
      "description": "챕터 설명",
      "estimatedDuration": 30
    }
  ]
}

인터뷰 전사 텍스트:`;
  }

  private buildQuestionGenerationPrompt(): string {
    const { context } = this.options;

    return `당신은 시니어 인터뷰를 위한 질문을 생성하는 전문가입니다.

${context?.sectionTitle ? `주제: ${context.sectionTitle}` : ''}

요구사항:
- 자연스럽고 편안한 대화체 질문을 만드세요.
- 구체적인 기억과 감정을 이끌어내는 질문이어야 합니다.
- 시니어가 쉽게 이해하고 답변할 수 있어야 합니다.
- 5-8개의 질문을 생성하세요.

다음 JSON 형식으로 응답해주세요:
{
  "questions": [
    {
      "prompt": "질문 내용",
      "hint": "답변 힌트 (선택사항)"
    }
  ]
}`;
  }
}

/**
 * 전사 텍스트를 요약합니다.
 *
 * @param transcript 전사된 텍스트
 * @param options 요약 옵션
 * @returns 요약된 텍스트
 */
export async function summarizeTranscript(
  transcript: string,
  options: SummarizeOptions = {}
): Promise<string> {
  try {
    const response = await fetch('/api/summarize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transcript,
        ...options,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '요약 실패');
    }

    const data = await response.json();
    return data.summary;
  } catch (error) {
    console.error('Summarize error:', error);
    throw error;
  }
}

/**
 * 텍스트를 소단락으로 구조화합니다.
 *
 * @param text 구조화할 텍스트
 * @param options 구조화 옵션
 * @returns 소단락 배열
 */
export async function structureText(
  text: string,
  options: StructureOptions = {}
): Promise<Subsection[]> {
  try {
    const response = await fetch('/api/structure', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        ...options,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || '구조화 실패');
    }

    const data = await response.json();

    // Subsection 형식으로 변환
    return data.subsections.map((sub: any, index: number) => ({
      id: `subsection_${Date.now()}_${index}`,
      title: sub.title,
      content: sub.content,
      sourceType: 'voice' as const,
    }));
  } catch (error) {
    console.error('Structure error:', error);
    throw error;
  }
}

/**
 * 전사 텍스트를 소단락으로 자동 생성합니다.
 *
 * 이 함수는 다음 단계를 수행합니다:
 * 1. 전사 텍스트를 요약
 * 2. 요약된 텍스트를 소단락으로 구조화
 *
 * @param transcript 전사된 텍스트
 * @param options 옵션 (요약 + 구조화)
 * @returns 소단락 배열
 */
export async function generateSubsectionsFromTranscript(
  transcript: string,
  options: SummarizeOptions & StructureOptions = {}
): Promise<Subsection[]> {
  try {
    // 1단계: 요약
    console.log('[AI] 전사 텍스트 요약 중...');
    const summary = await summarizeTranscript(transcript, {
      sectionTitle: options.sectionTitle,
      eventContext: options.eventContext,
      style: options.style,
    });

    // 2단계: 구조화
    console.log('[AI] 요약 텍스트 구조화 중...');
    const subsections = await structureText(summary, {
      sectionTitle: options.sectionTitle,
      targetSubsections: options.targetSubsections,
    });

    console.log(`[AI] ${subsections.length}개 소단락 생성 완료`);
    return subsections;
  } catch (error) {
    console.error('Generate subsections error:', error);
    throw error;
  }
}

/**
 * 전사 텍스트를 문장 단위로 분할합니다 (간단한 폴백 방법).
 *
 * AI API가 실패하거나 사용할 수 없을 때 사용하는 간단한 분할 로직입니다.
 *
 * @param transcript 전사된 텍스트
 * @param maxSentencesPerChunk 청크당 최대 문장 수
 * @returns 소단락 배열
 */
export function chunkTranscriptSimple(
  transcript: string,
  maxSentencesPerChunk: number = 3
): Subsection[] {
  // 문장 단위로 분할 (마침표, 느낌표, 물음표 기준)
  const sentences = transcript
    .split(/([.!?]\s+)/)
    .reduce((acc: string[], curr, index, array) => {
      if (index % 2 === 0 && curr.trim()) {
        const punctuation = array[index + 1] || '';
        acc.push(curr + punctuation);
      }
      return acc;
    }, [])
    .filter(s => s.trim().length > 0);

  // 청크로 그룹화
  const chunks: string[][] = [];
  for (let i = 0; i < sentences.length; i += maxSentencesPerChunk) {
    chunks.push(sentences.slice(i, i + maxSentencesPerChunk));
  }

  // Subsection 형식으로 변환
  return chunks.map((chunk, index) => ({
    id: `chunk_${Date.now()}_${index}`,
    title: `조각 ${index + 1}`,
    content: chunk.join(' ').trim(),
    sourceType: 'voice' as const,
  }));
}

/**
 * 텍스트의 단어 수를 계산합니다.
 *
 * @param text 텍스트
 * @returns 단어 수
 */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * 텍스트의 문장 수를 계산합니다.
 *
 * @param text 텍스트
 * @returns 문장 수
 */
export function countSentences(text: string): number {
  return text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
}

/**
 * 텍스트를 요약 미리보기로 변환합니다 (첫 2문장 + 말줄임표).
 *
 * @param text 텍스트
 * @param maxLength 최대 길이 (문자 수)
 * @returns 요약 미리보기
 */
export function generateExcerpt(text: string, maxLength: number = 150): string {
  const trimmed = text.trim();

  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  // 첫 2문장 추출
  const sentences = trimmed.split(/[.!?]\s+/).filter(s => s.trim().length > 0);
  const firstTwo = sentences.slice(0, 2).join('. ');

  if (firstTwo.length <= maxLength) {
    return firstTwo + '...';
  }

  // 길이 제한
  return trimmed.substring(0, maxLength).trim() + '...';
}

/**
 * 챕터 자동 생성 인터페이스
 */
export interface Chapter {
  title: string;
  description: string;
  estimatedDuration: number;
}

/**
 * 인터뷰 전사 텍스트를 분석하여 챕터 구조를 자동 생성합니다.
 *
 * @param transcripts 인터뷰 전사 텍스트 배열
 * @returns 생성된 챕터 배열
 */
export async function generateChaptersFromTranscripts(
  transcripts: string[]
): Promise<Chapter[]> {
  try {
    // 전사 텍스트를 하나로 합침
    const combinedTranscript = transcripts.join('\n\n---\n\n');

    // 프롬프트 빌더 사용
    const promptBuilder = new PromptBuilder({
      mode: 'chapter_generation',
      tone: 'warm',
    });

    const systemPrompt = promptBuilder.build();

    const response = await fetch('/api/ai/generate-chapters', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemPrompt,
        transcript: combinedTranscript,
      }),
    });

    if (!response.ok) {
      throw new Error('Chapter generation failed');
    }

    const data = await response.json();
    return data.chapters;
  } catch (error) {
    console.error('Generate chapters error:', error);
    // 폴백: 기본 챕터 구조 반환
    return [
      {
        title: '어린 시절',
        description: '유년기와 성장 과정',
        estimatedDuration: 30,
      },
      {
        title: '청년 시절',
        description: '학창 시절과 사회 진출',
        estimatedDuration: 30,
      },
      {
        title: '결혼과 가정',
        description: '가족과 함께한 시간',
        estimatedDuration: 30,
      },
    ];
  }
}

/**
 * 질문 자동 생성 인터페이스
 */
export interface GeneratedQuestion {
  prompt: string;
  hint?: string;
}

/**
 * 주어진 주제에 대한 인터뷰 질문을 자동 생성합니다.
 *
 * @param topic 주제 (예: "어린 시절", "첫 직장")
 * @param count 생성할 질문 개수 (기본 5개)
 * @returns 생성된 질문 배열
 */
export async function generateQuestions(
  topic: string,
  count: number = 5
): Promise<GeneratedQuestion[]> {
  try {
    const promptBuilder = new PromptBuilder({
      mode: 'question_generation',
      tone: 'warm',
      context: {
        sectionTitle: topic,
      },
    });

    const systemPrompt = promptBuilder.build();

    const response = await fetch('/api/ai/generate-questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        systemPrompt,
        topic,
        count,
      }),
    });

    if (!response.ok) {
      throw new Error('Question generation failed');
    }

    const data = await response.json();
    return data.questions;
  } catch (error) {
    console.error('Generate questions error:', error);
    // 폴백: 기본 질문 반환
    return [
      {
        prompt: `${topic}에 대해 기억나는 것을 말씀해주세요.`,
        hint: '편안하게 이야기하듯 답변해주세요.',
      },
      {
        prompt: `그 시절 가장 기억에 남는 사건이나 경험은 무엇인가요?`,
      },
      {
        prompt: `당시 느꼈던 감정이나 생각을 말씀해주세요.`,
      },
    ];
  }
}
