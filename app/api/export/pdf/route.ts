/**
 * PDF 생성 API Route Handler
 *
 * 자서전 프로젝트를 PDF 파일로 내보냅니다.
 *
 * 현재는 간단한 텍스트 기반 PDF를 생성하며,
 * 향후 Puppeteer를 사용한 고급 레이아웃 지원을 추가할 수 있습니다.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface ExportRequest {
  projectId: string;
  title: string;
  author: string;
  sections: Array<{
    title: string;
    content: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const body: ExportRequest = await request.json();
    const { projectId, title, author, sections } = body;

    // 유효성 검사
    if (!projectId || !title || !sections || sections.length === 0) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    /**
     * TODO: PDF 생성 구현
     *
     * 방법 1: jsPDF (클라이언트 사이드 - 간단)
     * - 장점: 설치 간단, 빠른 구현
     * - 단점: 한글 폰트 제한, 레이아웃 커스터마이징 어려움
     *
     * 방법 2: Puppeteer (서버 사이드 - 고급)
     * - 장점: HTML/CSS 그대로 PDF 변환, 한글 완벽 지원
     * - 단점: 설치 복잡, 메모리 많이 사용
     * - 설치: npm install puppeteer
     *
     * 현재는 간단한 HTML 템플릿을 반환하고,
     * 클라이언트에서 window.print() 또는 jsPDF로 변환합니다.
     */

    // HTML 템플릿 생성
    const html = generatePdfHtml(title, author, sections);

    // 현재는 HTML을 반환하여 클라이언트에서 처리
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    });

    /*
    // Puppeteer를 사용한 서버 사이드 PDF 생성 예시:
    const puppeteer = require('puppeteer');
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm',
      },
    });
    await browser.close();

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(title)}.pdf"`,
      },
    });
    */

  } catch (error) {
    console.error('PDF export error:', error);
    return NextResponse.json(
      { error: 'PDF 생성 중 문제가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * PDF용 HTML 템플릿 생성
 */
function generatePdfHtml(
  title: string,
  author: string,
  sections: Array<{ title: string; content: string }>
): string {
  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    @page {
      size: A4;
      margin: 20mm;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Noto Sans KR', 'Malgun Gothic', sans-serif;
      line-height: 1.8;
      color: #333;
      font-size: 11pt;
    }

    .cover {
      page-break-after: always;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100vh;
      text-align: center;
    }

    .cover h1 {
      font-size: 36pt;
      margin-bottom: 40px;
      font-weight: bold;
    }

    .cover .author {
      font-size: 18pt;
      color: #666;
    }

    .cover .date {
      margin-top: 20px;
      font-size: 12pt;
      color: #999;
    }

    .toc {
      page-break-after: always;
      padding: 20mm 0;
    }

    .toc h2 {
      font-size: 24pt;
      margin-bottom: 30px;
      border-bottom: 2px solid #333;
      padding-bottom: 10px;
    }

    .toc ul {
      list-style: none;
    }

    .toc li {
      margin-bottom: 10px;
      padding-left: 20px;
    }

    .section {
      page-break-before: always;
      padding: 20mm 0;
    }

    .section h2 {
      font-size: 20pt;
      margin-bottom: 20px;
      color: #1F6F63;
      border-left: 4px solid #1F6F63;
      padding-left: 15px;
    }

    .section p {
      margin-bottom: 15px;
      text-align: justify;
      word-break: keep-all;
    }

    .footer {
      margin-top: 50px;
      text-align: center;
      font-size: 9pt;
      color: #999;
    }

    @media print {
      body {
        background: white;
      }

      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <!-- 표지 -->
  <div class="cover">
    <h1>${title}</h1>
    <div class="author">${author}</div>
    <div class="date">${new Date().getFullYear()}년</div>
  </div>

  <!-- 목차 -->
  <div class="toc">
    <h2>목차</h2>
    <ul>
      ${sections.map((section, index) => `
        <li>${index + 1}. ${section.title}</li>
      `).join('')}
    </ul>
  </div>

  <!-- 본문 -->
  ${sections.map((section, index) => `
    <div class="section">
      <h2>${index + 1}. ${section.title}</h2>
      ${section.content.split('\n').map(para =>
        para.trim() ? `<p>${para}</p>` : ''
      ).join('')}
    </div>
  `).join('')}

  <!-- 푸터 -->
  <div class="footer">
    <p>온유록(Onyu.ai)으로 제작되었습니다.</p>
  </div>

  <!-- 인쇄 버튼 (프린트 시 숨김) -->
  <div class="no-print" style="position: fixed; bottom: 20px; right: 20px;">
    <button onclick="window.print()" style="
      padding: 15px 30px;
      background: #1F6F63;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14pt;
      cursor: pointer;
    ">
      PDF로 저장
    </button>
  </div>
</body>
</html>
  `.trim();
}

/**
 * OPTIONS 요청 처리
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
