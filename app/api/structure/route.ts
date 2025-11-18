/**
 * AI 텍스트 구조화 API Route Handler
 *
 * 긴 전사 텍스트를 의미 단위로 나누고 소단락으로 구조화합니다.
 * 각 소단락에 적절한 제목을 붙여 목차 구조를 생성합니다.
 *
 * 처리 흐름:
 * 1. 전사 텍스트 또는 요약 텍스트 수신
 * 2. OpenAI GPT-4 API 호출
 * 3. 구조화된 소단락 배열 반환
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// OpenAI 클라이언트 초기화 (lazy initialization으로 빌드 에러 방지)
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    // Azure OpenAI 지원
    const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_AZURE_OPENAI_API_KEY;
    const azureEndpoint = process.env.NEXT_PUBLIC_AZURE_OPENAI_ENDPOINT;

    if (!apiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    // Azure OpenAI 사용 시
    if (azureEndpoint) {
      openai = new OpenAI({
        apiKey,
        baseURL: `${azureEndpoint}/openai/deployments`,
        defaultQuery: { 'api-version': '2024-02-15-preview' },
        defaultHeaders: { 'api-key': apiKey },
      } as any);
    } else {
      // 일반 OpenAI 사용 시
      openai = new OpenAI({ apiKey });
    }
  }
  return openai;
}

interface Subsection {
  title: string;
  content: string;
  order: number;
}

interface StructureRequest {
  text: string;
  sectionTitle?: string;
  targetSubsections?: number; // 목표 소단락 개수 (기본값: 자동)
}

interface StructureResponse {
  subsections: Subsection[];
  totalCount: number;
}

export async function POST(request: NextRequest) {
  try {
    // 1. 요청 데이터 추출
    const body: StructureRequest = await request.json();
    const { text, sectionTitle, targetSubsections } = body;

    // 유효성 검사
    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: '구조화할 텍스트가 필요합니다.' },
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
    const systemPrompt = getSystemPrompt();
    const userPrompt = getUserPrompt(text, sectionTitle, targetSubsections);

    // 3. OpenAI API 호출
    const client = getOpenAIClient();
    const completion = await client.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.5, // 구조화는 일관성이 중요
      max_tokens: 2000,
      response_format: { type: 'json_object' }, // JSON 모드 활성화
    });

    const responseText = completion.choices[0]?.message?.content || '{}';

    // 4. JSON 파싱
    let parsedResponse: { subsections: Subsection[] };
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText);
      return NextResponse.json(
        { error: 'AI 응답을 처리할 수 없습니다.' },
        { status: 500 }
      );
    }

    const subsections = parsedResponse.subsections || [];

    // 5. 결과 검증
    if (subsections.length === 0) {
      return NextResponse.json(
        { error: '소단락을 생성할 수 없습니다. 텍스트가 너무 짧거나 구조화가 어렵습니다.' },
        { status: 400 }
      );
    }

    // 6. order 인덱스 정규화
    const normalizedSubsections = subsections.map((sub, index) => ({
      ...sub,
      order: index + 1,
    }));

    const response: StructureResponse = {
      subsections: normalizedSubsections,
      totalCount: normalizedSubsections.length,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Structuring error:', error);

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
      { error: '텍스트 구조화 중 문제가 발생했습니다. 다시 시도해주세요.' },
      { status: 500 }
    );
  }
}

/**
 * 시스템 프롬프트 생성
 */
function getSystemPrompt(): string {
  return `당신은 자서전 텍스트를 의미 단위로 구조화하는 전문 편집자입니다.

역할:
- 긴 텍스트를 주제별/시간별로 소단락으로 분할
- 각 소단락에 명확하고 간결한 제목 부여
- 독자가 이해하기 쉬운 구조로 재구성

원칙:
- 하나의 소단락은 하나의 주제/사건/시기를 다룸
- 소단락 제목은 2-6단어로 간결하게
- 내용의 논리적 흐름 유지
- 각 소단락은 2-5문장으로 구성
- 시간 순서 또는 주제별 순서 유지

출력 형식:
JSON 형식으로 다음 구조를 따릅니다:
{
  "subsections": [
    {
      "title": "소단락 제목",
      "content": "소단락 내용 (여러 문장)",
      "order": 1
    },
    ...
  ]
}`;
}

/**
 * 사용자 프롬프트 생성
 */
function getUserPrompt(
  text: string,
  sectionTitle?: string,
  targetSubsections?: number
): string {
  let prompt = '다음 텍스트를 의미 있는 소단락으로 나누어주세요.\n\n';

  if (sectionTitle) {
    prompt += `[섹션 제목: ${sectionTitle}]\n\n`;
  }

  prompt += `텍스트:\n"${text}"\n\n`;

  prompt += `요구사항:\n`;
  if (targetSubsections) {
    prompt += `- 약 ${targetSubsections}개의 소단락으로 구분\n`;
  } else {
    prompt += `- 내용에 따라 적절한 개수의 소단락으로 구분 (보통 2-5개)\n`;
  }
  prompt += `- 각 소단락에 핵심을 드러내는 제목 부여\n`;
  prompt += `- 시간 순서 또는 논리적 순서 유지\n`;
  prompt += `- 각 소단락은 독립적으로 읽어도 이해 가능하도록\n\n`;

  prompt += `JSON 형식으로 출력해주세요. 다른 설명은 포함하지 마세요.`;

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
