/**
 * Deepgram STT API Route Handler
 *
 * 브라우저에서 녹음된 오디오 파일을 Deepgram API로 전송하여
 * 한국어 음성을 텍스트로 변환(STT)합니다.
 *
 * 처리 흐름:
 * 1. 오디오 파일 및 assetId 수신
 * 2. Deepgram API 호출 (한국어, nova-2 모델)
 * 3. 전사 결과를 Supabase DB에 저장
 * 4. 결과 반환
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

interface DeepgramWord {
  word: string;
  start: number;
  end: number;
  confidence: number;
}

interface DeepgramResponse {
  results: {
    channels: Array<{
      alternatives: Array<{
        transcript: string;
        confidence: number;
        words: DeepgramWord[];
      }>;
    }>;
  };
}

export async function POST(request: NextRequest) {
  try {
    // 1. 요청 데이터 추출
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;
    const assetId = formData.get('assetId') as string | null;

    // 유효성 검사
    if (!audioFile) {
      return NextResponse.json(
        { error: '오디오 파일이 필요합니다.' },
        { status: 400 }
      );
    }

    if (!assetId) {
      return NextResponse.json(
        { error: 'asset ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // API 키 확인
    const apiKey = process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY;
    if (!apiKey) {
      console.error('NEXT_PUBLIC_DEEPGRAM_API_KEY is not set');
      return NextResponse.json(
        { error: 'STT 서비스 설정이 올바르지 않습니다.' },
        { status: 500 }
      );
    }

    // 2. DB 상태 업데이트 (전사 시작)
    await supabaseAdmin
      .from('audio_assets')
      // @ts-ignore - Supabase 타입 추론 이슈
      .update({
        status: 'transcribing' as const,
        progress: 10,
      })
      .eq('id', assetId);

    // 3. Deepgram API 호출
    const deepgramUrl = new URL('https://api.deepgram.com/v1/listen');

    // 한국어 최적 설정
    deepgramUrl.searchParams.set('language', 'ko'); // 한국어
    deepgramUrl.searchParams.set('model', 'nova-2'); // 최신 모델 (정확도 높음)
    deepgramUrl.searchParams.set('punctuate', 'true'); // 구두점 자동 삽입
    deepgramUrl.searchParams.set('diarize', 'false'); // 화자 구분 (단일 화자이므로 false)
    deepgramUrl.searchParams.set('smart_format', 'true'); // 날짜/시간 등 자동 포맷팅

    const audioArrayBuffer = await audioFile.arrayBuffer();

    const response = await fetch(deepgramUrl.toString(), {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': audioFile.type || 'audio/webm',
      },
      body: audioArrayBuffer,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Deepgram API error:', response.status, errorText);

      // DB 에러 상태 업데이트
      await supabaseAdmin
        .from('audio_assets')
        // @ts-ignore - Supabase 타입 추론 이슈
        .update({
          status: 'failed' as const,
          error_message: `Deepgram API 오류: ${response.status}`,
        })
        .eq('id', assetId);

      return NextResponse.json(
        { error: '음성 변환 서비스에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.' },
        { status: 500 }
      );
    }

    // 4. 전사 결과 파싱
    const data: DeepgramResponse = await response.json();
    const channel = data.results?.channels?.[0];
    const alternative = channel?.alternatives?.[0];

    if (!alternative || !alternative.transcript) {
      // 전사 결과가 없는 경우 (무음 파일 등)
      await supabaseAdmin
        .from('audio_assets')
        // @ts-ignore - Supabase 타입 추론 이슈
        .update({
          status: 'transcribed' as const,
          transcript: '',
          progress: 100,
        })
        .eq('id', assetId);

      return NextResponse.json({
        transcript: '',
        confidence: 0,
        words: [],
        message: '음성을 인식할 수 없습니다. 다시 녹음해주세요.',
      });
    }

    const transcript = alternative.transcript;
    const confidence = alternative.confidence || 0;
    const words = alternative.words || [];

    // 5. DB 업데이트 (전사 완료)
    await supabaseAdmin
      .from('audio_assets')
      // @ts-ignore - Supabase 타입 추론 이슈
      .update({
        status: 'transcribed' as const,
        transcript: transcript,
        progress: 100,
      })
      .eq('id', assetId);

    // 6. 성공 응답
    return NextResponse.json({
      transcript,
      confidence,
      words,
    });

  } catch (error) {
    console.error('Transcription error:', error);

    // DB 에러 상태 업데이트 (assetId가 있는 경우만)
    try {
      const formData = await request.formData();
      const assetId = formData.get('assetId') as string | null;

      if (assetId) {
        await supabaseAdmin
          .from('audio_assets')
          // @ts-ignore - Supabase 타입 추론 이슈
          .update({
            status: 'failed' as const,
            error_message: error instanceof Error ? error.message : '알 수 없는 오류',
          })
          .eq('id', assetId);
      }
    } catch (dbError) {
      console.error('Failed to update error status:', dbError);
    }

    return NextResponse.json(
      {
        error: '음성을 글자로 변환하는 중 문제가 발생했습니다. 다시 시도해주세요.',
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS 요청 처리 (CORS preflight)
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
