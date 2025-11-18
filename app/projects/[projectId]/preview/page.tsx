'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { BookOpen, Download, Share2, ArrowLeft, FileText } from 'lucide-react';
import { getTimeline, getSections } from '@/lib/supabase-api';
import type { TimelineEvent, Section } from '@/types/edit';

export default function PreviewPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 데이터 로드
  useEffect(() => {
    async function loadData() {
      try {
        const [timelineData, sectionsData] = await Promise.all([
          getTimeline(projectId),
          getSections(projectId),
        ]);

        setTimeline(timelineData);
        setSections(sectionsData);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('데이터를 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [projectId]);

  // PDF 다운로드
  const handleDownloadPDF = async () => {
    try {
      const response = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          title: '나의 자서전', // TODO: 프로젝트 제목 가져오기
          author: '홍길동', // TODO: 사용자 이름 가져오기
          sections: sections.map(s => ({
            title: s.title,
            content: s.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('PDF 생성 실패');
      }

      const html = await response.text();

      // 새 창에서 열기
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(html);
        newWindow.document.close();
      }
    } catch (err) {
      console.error('PDF download error:', err);
      alert('PDF 다운로드 중 문제가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F0E] flex items-center justify-center">
        <div className="text-[#A8C3BC]">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0B0F0E] flex items-center justify-center">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F0E]">
      {/* 헤더 */}
      <header className="bg-[#0E1513] border-b border-[#1F6F63]/30 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 text-[#A8C3BC] hover:text-[#2BA08C] transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-semibold text-[#E6F0ED]">
              미리보기
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-[#1F6F63] hover:bg-[#2BA08C]
                       text-[#E6F0ED] rounded-lg transition-colors"
            >
              <Download className="h-4 w-4" />
              PDF 다운로드
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 border border-[#1F6F63]
                       text-[#A8C3BC] hover:text-[#2BA08C] hover:border-[#2BA08C]
                       rounded-lg transition-colors"
            >
              <Share2 className="h-4 w-4" />
              공유
            </button>
          </div>
        </div>
      </header>

      {/* 본문 */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* 표지 */}
        <div className="mb-16 text-center py-20 border-b border-[#1F6F63]/30">
          <BookOpen className="h-16 w-16 mx-auto mb-6 text-[#2BA08C]" />
          <h1 className="text-4xl font-bold text-[#E6F0ED] mb-4">
            나의 자서전
          </h1>
          <p className="text-[#A8C3BC] text-lg">
            {new Date().getFullYear()}년
          </p>
        </div>

        {/* 목차 */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-[#E6F0ED] mb-6 flex items-center gap-3">
            <FileText className="h-6 w-6 text-[#2BA08C]" />
            목차
          </h2>
          <div className="space-y-2">
            {sections.map((section, index) => (
              <div
                key={section.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#0E1513] transition-colors cursor-pointer"
                onClick={() => {
                  const element = document.getElementById(`section-${section.id}`);
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <span className="text-[#A8C3BC] font-mono text-sm">
                  {String(index + 1).padStart(2, '0')}.
                </span>
                <span className="text-[#E6F0ED] flex-1">
                  {section.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 본문 섹션들 */}
        <div className="space-y-12">
          {sections.map((section, index) => (
            <section
              key={section.id}
              id={`section-${section.id}`}
              className="scroll-mt-24"
            >
              <div className="mb-6">
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-[#2BA08C] font-mono text-lg">
                    {String(index + 1).padStart(2, '0')}.
                  </span>
                  <h2 className="text-2xl font-semibold text-[#E6F0ED]">
                    {section.title}
                  </h2>
                </div>
                <div className="h-px bg-gradient-to-r from-[#1F6F63] to-transparent" />
              </div>

              <div className="prose prose-invert max-w-none">
                {section.content.split('\n').map((paragraph, pIndex) => (
                  paragraph.trim() && (
                    <p
                      key={pIndex}
                      className="text-[#A8C3BC] leading-relaxed mb-4 text-justify"
                    >
                      {paragraph}
                    </p>
                  )
                ))}

                {!section.content && (
                  <p className="text-[#A8C3BC]/50 italic">
                    아직 작성되지 않은 섹션입니다.
                  </p>
                )}
              </div>
            </section>
          ))}

          {sections.length === 0 && (
            <div className="text-center py-20">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-[#A8C3BC]/30" />
              <p className="text-[#A8C3BC] mb-4">
                아직 작성된 섹션이 없습니다.
              </p>
              <Link
                href={`/projects/${projectId}/edit`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#1F6F63] hover:bg-[#2BA08C]
                         text-[#E6F0ED] rounded-lg transition-colors"
              >
                편집하러 가기
              </Link>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="mt-20 pt-8 border-t border-[#1F6F63]/30 text-center text-[#A8C3BC]/50 text-sm">
          <p>온유록(Onyu.ai)으로 제작되었습니다.</p>
        </div>
      </main>
    </div>
  );
}
