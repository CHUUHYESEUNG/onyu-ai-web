'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Play,
  CheckCircle2,
  Clock,
  Plus,
  ChevronRight,
  Mic,
  FileText,
  TrendingUp,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

type Chapter = Database['public']['Tables']['chapters']['Row'];
type Session = Database['public']['Tables']['sessions']['Row'];
type Project = Database['public']['Tables']['projects']['Row'];

interface ChapterWithSessions extends Chapter {
  sessions: Session[];
  completedSessions: number;
  totalSessions: number;
}

export default function ProjectHomePage() {
  const params = useParams<{ projectId: string }>();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [chapters, setChapters] = useState<ChapterWithSessions[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params?.projectId) {
      loadProjectData();
    }
  }, [params?.projectId]);

  async function loadProjectData() {
    try {
      // 프로젝트 정보 조회
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', params.projectId)
        .single();

      if (projectError) throw projectError;
      setProject(projectData);

      // 챕터 및 세션 조회
      const { data: chaptersData, error: chaptersError } = await supabase
        .from('chapters')
        .select(`
          *,
          sessions (*)
        `)
        .eq('project_id', params.projectId)
        .order('order_index', { ascending: true });

      if (chaptersError) throw chaptersError;

      // 챕터별 세션 통계 계산
      const chaptersWithStats = (chaptersData || []).map((chapter: any) => {
        const sessions = chapter.sessions || [];
        const completedSessions = sessions.filter(
          (s: Session) => s.status === 'completed'
        ).length;

        return {
          ...chapter,
          sessions,
          completedSessions,
          totalSessions: sessions.length,
        };
      });

      setChapters(chaptersWithStats);
    } catch (error) {
      console.error('Failed to load project data:', error);
    } finally {
      setLoading(false);
    }
  }

  function getChapterStatusIcon(chapter: ChapterWithSessions) {
    if (chapter.status === 'completed') {
      return <CheckCircle2 className="h-5 w-5 text-green-400" />;
    } else if (chapter.status === 'in_progress') {
      return <Play className="h-5 w-5 text-[#1E5EFF]" />;
    } else {
      return <Clock className="h-5 w-5 text-gray-400" />;
    }
  }

  function getChapterProgress(chapter: ChapterWithSessions): number {
    if (chapter.totalSessions === 0) return 0;
    return Math.round((chapter.completedSessions / chapter.totalSessions) * 100);
  }

  function getOverallProgress(): number {
    const totalSessions = chapters.reduce((sum, ch) => sum + ch.totalSessions, 0);
    const completedSessions = chapters.reduce((sum, ch) => sum + ch.completedSessions, 0);
    if (totalSessions === 0) return 0;
    return Math.round((completedSessions / totalSessions) * 100);
  }

  async function createNewChapter() {
    const title = prompt('챕터 제목을 입력하세요 (예: 어린 시절, 청년 시절)');
    if (!title) return;

    try {
      const { data, error } = await supabase
        .from('chapters')
        // @ts-ignore - Supabase 타입 추론 이슈
        .insert({
          project_id: params.projectId,
          title,
          order_index: chapters.length,
          status: 'not_started',
        })
        .select()
        .single();

      if (error) throw error;

      // 리로드
      loadProjectData();
    } catch (error) {
      console.error('Failed to create chapter:', error);
      alert('챕터 생성에 실패했습니다.');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0B0F0E]">
        <div className="text-[#E6F0ED]">로딩 중...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0B0F0E]">
        <div className="text-[#E6F0ED]">프로젝트를 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F0E] p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* 헤더 */}
        <header className="space-y-4">
          <div className="flex items-center gap-3 text-sm text-[#A8C3BC]">
            <Link href="/projects" className="hover:text-[#2BA08C]">
              프로젝트
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-[#E6F0ED]">{project.title}</span>
          </div>

          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-[#E6F0ED]">{project.title}</h1>
              {project.description && (
                <p className="text-lg text-[#A8C3BC]">{project.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-[#A8C3BC]">
                <span className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  {chapters.length}개 챕터
                </span>
                <span className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  진행률 {getOverallProgress()}%
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                href={`/projects/${params.projectId}/edit`}
                className="flex items-center gap-2 px-6 py-3 bg-[#1F6F63] hover:bg-[#2BA08C] text-[#E6F0ED] rounded-xl font-medium transition-colors"
              >
                <FileText className="h-5 w-5" />
                편집 모드
              </Link>
              <button
                onClick={createNewChapter}
                className="flex items-center gap-2 px-6 py-3 border border-[#2BA08C]/30 hover:bg-[#2BA08C]/10 text-[#2BA08C] rounded-xl font-medium transition-colors"
              >
                <Plus className="h-5 w-5" />
                챕터 추가
              </button>
            </div>
          </div>
        </header>

        {/* 전체 진행률 */}
        <section className="bg-[#0E1513] rounded-2xl p-6 border border-[#2BA08C]/20">
          <h2 className="text-lg font-semibold text-[#E6F0ED] mb-4">전체 진행 상황</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-[#A8C3BC]">
              <span>
                완료된 세션:{' '}
                {chapters.reduce((sum, ch) => sum + ch.completedSessions, 0)} /{' '}
                {chapters.reduce((sum, ch) => sum + ch.totalSessions, 0)}
              </span>
              <span>{getOverallProgress()}%</span>
            </div>
            <div className="h-3 bg-[#0B0F0E] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#1F6F63] to-[#2BA08C] transition-all duration-500"
                style={{ width: `${getOverallProgress()}%` }}
              />
            </div>
          </div>
        </section>

        {/* 챕터 리스트 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-[#E6F0ED]">챕터 목록</h2>

          {chapters.length === 0 ? (
            <div className="bg-[#0E1513] rounded-2xl p-12 border border-dashed border-[#2BA08C]/30 text-center">
              <BookOpen className="h-12 w-12 text-[#2BA08C]/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#E6F0ED] mb-2">
                아직 챕터가 없습니다
              </h3>
              <p className="text-[#A8C3BC] mb-6">
                첫 번째 챕터를 만들어 인터뷰를 시작하세요
              </p>
              <button
                onClick={createNewChapter}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#1F6F63] hover:bg-[#2BA08C] text-[#E6F0ED] rounded-xl font-medium transition-colors"
              >
                <Plus className="h-5 w-5" />
                첫 챕터 만들기
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {chapters.map((chapter) => (
                <Link
                  key={chapter.id}
                  href={`/projects/${params.projectId}/chapter/${chapter.id}`}
                  className="block bg-[#0E1513] hover:bg-[#0E1513]/80 rounded-2xl p-6 border border-[#2BA08C]/10 hover:border-[#2BA08C]/30 transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="mt-1">{getChapterStatusIcon(chapter)}</div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-[#E6F0ED] mb-1 group-hover:text-[#2BA08C] transition-colors">
                          {chapter.title}
                        </h3>
                        {chapter.description && (
                          <p className="text-sm text-[#A8C3BC]">{chapter.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-3 text-sm text-[#A8C3BC]">
                          <span className="flex items-center gap-1">
                            <Mic className="h-4 w-4" />
                            {chapter.totalSessions}개 세션
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs ${
                              chapter.status === 'completed'
                                ? 'bg-green-500/10 text-green-400'
                                : chapter.status === 'in_progress'
                                ? 'bg-[#1E5EFF]/10 text-[#1E5EFF]'
                                : 'bg-gray-500/10 text-gray-400'
                            }`}
                          >
                            {chapter.status === 'completed'
                              ? '완료'
                              : chapter.status === 'in_progress'
                              ? '진행 중'
                              : '시작 전'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <ChevronRight className="h-6 w-6 text-[#A8C3BC] group-hover:text-[#2BA08C] group-hover:translate-x-1 transition-all" />
                  </div>

                  {/* 진행률 바 */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-[#A8C3BC]">
                      <span>
                        진행률: {chapter.completedSessions} / {chapter.totalSessions}
                      </span>
                      <span>{getChapterProgress(chapter)}%</span>
                    </div>
                    <div className="h-2 bg-[#0B0F0E] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#1F6F63] to-[#2BA08C] transition-all duration-500"
                        style={{ width: `${getChapterProgress(chapter)}%` }}
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* 빠른 액션 */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href={`/projects/${params.projectId}/overview`}
            className="bg-[#0E1513] hover:bg-[#0E1513]/80 rounded-xl p-6 border border-[#2BA08C]/10 hover:border-[#2BA08C]/30 transition-all text-center"
          >
            <TrendingUp className="h-8 w-8 text-[#2BA08C] mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-[#E6F0ED] mb-1">준비 점검</h3>
            <p className="text-sm text-[#A8C3BC]">인터뷰 준비 현황 보기</p>
          </Link>

          <Link
            href={`/projects/${params.projectId}/preview`}
            className="bg-[#0E1513] hover:bg-[#0E1513]/80 rounded-xl p-6 border border-[#2BA08C]/10 hover:border-[#2BA08C]/30 transition-all text-center"
          >
            <BookOpen className="h-8 w-8 text-[#2BA08C] mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-[#E6F0ED] mb-1">미리보기</h3>
            <p className="text-sm text-[#A8C3BC]">자서전 미리보기</p>
          </Link>

          <Link
            href={`/projects/${params.projectId}/publish`}
            className="bg-[#0E1513] hover:bg-[#0E1513]/80 rounded-xl p-6 border border-[#2BA08C]/10 hover:border-[#2BA08C]/30 transition-all text-center"
          >
            <FileText className="h-8 w-8 text-[#2BA08C] mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-[#E6F0ED] mb-1">출판</h3>
            <p className="text-sm text-[#A8C3BC]">출판 옵션 보기</p>
          </Link>
        </section>
      </div>
    </div>
  );
}
