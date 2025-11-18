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
