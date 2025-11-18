/**
 * PDF 생성 API Route
 * 완성된 자서전을 PDF 파일로 변환
 */

import { NextRequest, NextResponse } from 'next/server';
import { loadSampleData, generateFullText } from '@/lib/seed-data';

export const runtime = 'nodejs'; // PDF 생성은 Node.js 런타임 필요

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { storyData } = body;

    // 더미 데이터 로드 (나중에 실제 프로젝트 ID로 DB에서 로드)
    const autobiography = loadSampleData();
    const fullText = generateFullText();

    // TODO: 실제 PDF 라이브러리로 PDF 생성
    // 현재는 임시 응답만 반환

    // 나중에 react-pdf 또는 jsPDF로 실제 PDF 생성
    // const pdfBuffer = await generatePDFBuffer(fullText, autobiography);
    // const pdfUrl = await uploadToStorage(pdfBuffer);

    // 임시 응답
    return NextResponse.json({
      success: true,
      pdfUrl: '/sample-autobiography.pdf', // 임시 URL
      metadata: {
        title: autobiography.title,
        author: autobiography.author.name,
        pages: autobiography.metadata.totalPages,
        wordCount: autobiography.metadata.wordCount,
      },
    });
  } catch (error) {
    console.error('PDF 생성 오류:', error);
    return NextResponse.json(
      { success: false, error: 'PDF 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
