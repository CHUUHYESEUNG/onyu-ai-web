/**
 * AI 텍스트 요약 API Route Handler
 *
 * 전사된 텍스트를 GPT-4를 사용하여 요약합니다.
 * 자서전 형식에 맞게 문체를 다듬고 핵심 내용을 추출합니다.
 *
 * 처리 흐름:
 * 1. 전사 텍스트 수신
 * 2. OpenAI GPT-4 API 호출
 * 3. 요약된 텍스트 반환
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// OpenAI 클라이언트 초기화
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface SummarizeRequest {
  transcript: string;
  sectionTitle?: string;
  eventContext?: string;
  style?: 'formal' | 'casual' | 'warm'; // 문체 선택
}

interface SummarizeResponse {
  summary: string;
  wordCount: number;
  originalWordCount: number;
  compressionRatio: number;
}

export async function POST(request: NextRequest) {
  try {
    // 1. 요청 데이터 추출
    const body: SummarizeRequest = await request.json();
    const { transcript, sectionTitle, eventContext, style = 'warm' } = body;

    // 유효성 검사
    if (!transcript || transcript.trim().length === 0) {
      return NextResponse.json(
        { error: '요약할 텍스트가 필요합니다.' },
        { status: 400 }
      );
    }

    // API 키 확인
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set');
      return NextResponse.json(
        { error: 'AI 서비스 설정이 올바르지 않습니다.' },
        { status: 500 }
      );
    }

    // 2. 시스템 프롬프트 구성
    const systemPrompt = getSystemPrompt(style);
    const userPrompt = getUserPrompt(transcript, sectionTitle, eventContext);

    // 3. OpenAI API 호출
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview', // 또는 'gpt-3.5-turbo'로 비용 절감
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7, // 창의성과 일관성의 균형
      max_tokens: 1000, // 최대 출력 토큰 (약 750단어)
      top_p: 0.9,
      frequency_penalty: 0.3, // 반복 줄이기
      presence_penalty: 0.3, // 다양성 증가
    });

    const summary = completion.choices[0]?.message?.content || '';

    if (!summary) {
      return NextResponse.json(
        { error: 'AI 요약 결과를 받지 못했습니다.' },
        { status: 500 }
      );
    }

    // 4. 통계 계산
    const originalWordCount = transcript.split(/\s+/).length;
    const summaryWordCount = summary.split(/\s+/).length;
    const compressionRatio = Math.round((summaryWordCount / originalWordCount) * 100);

    const response: SummarizeResponse = {
      summary: summary.trim(),
      wordCount: summaryWordCount,
      originalWordCount,
      compressionRatio,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Summarization error:', error);

    // OpenAI 특정 에러 처리
    if (error instanceof OpenAI.APIError) {
      if (error.status === 429) {
        return NextResponse.json(
          { error: 'AI 서비스 사용량이 초과되었습니다. 잠시 후 다시 시도해주세요.' },
          { status: 429 }
        );
      }

      if (error.status === 401) {
        return NextResponse.json(
          { error: 'AI 서비스 인증에 실패했습니다.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: '텍스트 요약 중 문제가 발생했습니다. 다시 시도해주세요.' },
      { status: 500 }
    );
  }
}

/**
 * 시스템 프롬프트 생성
 */
function getSystemPrompt(style: 'formal' | 'casual' | 'warm'): string {
  const basePrompt = `당신은 시니어 세대의 구술 인터뷰를 자서전 형식으로 정리하는 전문 작가입니다.

역할:
- 구어체 인터뷰 내용을 자서전 문체로 변환
- 핵심 내용과 감정을 유지하면서 간결하게 요약
- 시간 순서와 맥락을 명확히 정리
- 존댓말 사용 및 따뜻한 어조 유지

원칙:
- 화자의 원래 의도와 감정을 절대 왜곡하지 않음
- 중요한 고유명사, 날짜, 장소는 반드시 보존
- "어", "음", "그", "저" 등의 간투사 제거
- 반복되는 내용은 한 번만 언급
- 자연스러운 문장으로 재구성`;

  const styleGuide = {
    formal: '\n문체: 격식 있고 품위 있는 문체를 사용합니다. "~했다", "~였다" 형태를 사용합니다.',
    casual: '\n문체: 편안하고 친근한 문체를 사용합니다. "~했어요", "~이었어요" 형태를 사용합니다.',
    warm: '\n문체: 따뜻하고 존중하는 어조를 사용합니다. "~하셨다", "~이셨다" 형태로 높임말을 사용합니다.',
  };

  return basePrompt + styleGuide[style];
}

/**
 * 사용자 프롬프트 생성
 */
function getUserPrompt(
  transcript: string,
  sectionTitle?: string,
  eventContext?: string
): string {
  let prompt = '다음은 인터뷰 녹음을 음성 인식으로 변환한 텍스트입니다.\n\n';

  if (sectionTitle) {
    prompt += `[주제: ${sectionTitle}]\n\n`;
  }

  if (eventContext) {
    prompt += `[배경: ${eventContext}]\n\n`;
  }

  prompt += `인터뷰 내용:\n"${transcript}"\n\n`;

  prompt += `위 내용을 자서전의 한 단락으로 정리해주세요. 다음 가이드라인을 따라주세요:
1. 2-4문단으로 구성 (각 문단은 3-5문장)
2. 핵심 메시지와 감정을 유지
3. 시간 순서대로 재구성
4. 구어체를 문어체로 자연스럽게 변환
5. 불필요한 반복 제거
6. 중요한 세부사항 (이름, 날짜, 장소 등)은 반드시 포함

요약본만 출력해주세요. 설명이나 메타 코멘트는 포함하지 마세요.`;

  return prompt;
}

/**
 * OPTIONS 요청 처리 (CORS)
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
