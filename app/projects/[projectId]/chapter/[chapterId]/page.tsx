'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  CheckCircle2,
  Clock,
  Plus,
  Mic,
  FileText,
  Edit2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database';

type Chapter = Database['public']['Tables']['chapters']['Row'];
type Session = Database['public']['Tables']['sessions']['Row'];
type Question = Database['public']['Tables']['questions']['Row'];

interface SessionWithQuestions extends Session {
  questions: Question[];
  completedQuestions: number;
  totalQuestions: number;
}

export default function ChapterDetailPage() {
  const params = useParams<{ projectId: string; chapterId: string }>();
  const router = useRouter();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [sessions, setSessions] = useState<SessionWithQuestions[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params?.chapterId) {
      loadChapterData();
    }
  }, [params?.chapterId]);

  async function loadChapterData() {
    try {
      // 챕터 정보 조회
      const { data: chapterData, error: chapterError } = await supabase
        .from('chapters')
        .select('*')
        .eq('id', params.chapterId)
        .single();

      if (chapterError) throw chapterError;
      setChapter(chapterData);

      // 세션 및 질문 조회
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('sessions')
        .select(`
          *,
          questions (*)
        `)
        .eq('chapter_id', params.chapterId)
        .order('order_index', { ascending: true });

      if (sessionsError) throw sessionsError;

      // 세션별 질문 통계 계산
      const sessionsWithStats = (sessionsData || []).map((session: any) => {
        const questions = session.questions || [];
        const completedQuestions = questions.filter(
          (q: Question) => q.is_completed || q.is_skipped
        ).length;

        return {
          ...session,
          questions,
          completedQuestions,
          totalQuestions: questions.length,
        };
      });

      setSessions(sessionsWithStats);
    } catch (error) {
      console.error('Failed to load chapter data:', error);
    } finally {
      setLoading(false);
    }
  }

  function getSessionProgress(session: SessionWithQuestions): number {
    if (session.totalQuestions === 0) return 0;
    return Math.round((session.completedQuestions / session.totalQuestions) * 100);
  }

  function getSessionStatusIcon(session: SessionWithQuestions) {
    if (session.status === 'completed') {
      return <CheckCircle2 className="h-5 w-5 text-green-400" />;
    } else if (session.status === 'in_progress') {
      return <Play className="h-5 w-5 text-[#1E5EFF]" />;
    } else {
      return <Clock className="h-5 w-5 text-gray-400" />;
    }
  }

  function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  async function createNewSession() {
    const title = prompt('세션 제목을 입력하세요 (예: 고향 이야기, 가족 이야기)');
    if (!title) return;

    try {
      const { data, error } = await supabase
        .from('sessions')
        // @ts-ignore - Supabase 타입 추론 이슈
        .insert({
          chapter_id: params.chapterId,
          title,
          order_index: sessions.length,
          status: 'not_started',
        })
        .select()
        .single();

      if (error) throw error;

      // 리로드
      loadChapterData();
    } catch (error) {
      console.error('Failed to create session:', error);
      alert('세션 생성에 실패했습니다.');
    }
  }

  async function startSession(sessionId: string) {
    router.push(`/projects/${params.projectId}/chapter/${params.chapterId}/session/${sessionId}`);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0B0F0E]">
        <div className="text-[#E6F0ED]">로딩 중...</div>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0B0F0E]">
        <div className="text-[#E6F0ED]">챕터를 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F0E] p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* 헤더 */}
        <header className="space-y-4">
          <div className="flex items-center gap-3 text-sm text-[#A8C3BC]">
            <Link
              href={`/projects/${params.projectId}`}
              className="hover:text-[#2BA08C] flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              프로젝트로 돌아가기
            </Link>
          </div>

          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                {chapter.status === 'completed' ? (
                  <CheckCircle2 className="h-8 w-8 text-green-400" />
                ) : chapter.status === 'in_progress' ? (
                  <Play className="h-8 w-8 text-[#1E5EFF]" />
                ) : (
                  <Clock className="h-8 w-8 text-gray-400" />
                )}
                <h1 className="text-4xl font-bold text-[#E6F0ED]">{chapter.title}</h1>
              </div>
              {chapter.description && (
                <p className="text-lg text-[#A8C3BC] ml-11">{chapter.description}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-[#A8C3BC] ml-11">
                <span className="flex items-center gap-2">
                  <Mic className="h-4 w-4" />
                  {sessions.length}개 세션
                </span>
                {chapter.estimated_duration && (
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    예상 {chapter.estimated_duration}분
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={createNewSession}
              className="flex items-center gap-2 px-6 py-3 bg-[#1F6F63] hover:bg-[#2BA08C] text-[#E6F0ED] rounded-xl font-medium transition-colors"
            >
              <Plus className="h-5 w-5" />
              세션 추가
            </button>
          </div>
        </header>

        {/* 세션 리스트 */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-[#E6F0ED]">인터뷰 세션</h2>

          {sessions.length === 0 ? (
            <div className="bg-[#0E1513] rounded-2xl p-12 border border-dashed border-[#2BA08C]/30 text-center">
              <Mic className="h-12 w-12 text-[#2BA08C]/50 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#E6F0ED] mb-2">
                아직 세션이 없습니다
              </h3>
              <p className="text-[#A8C3BC] mb-6">
                첫 번째 세션을 만들어 인터뷰를 시작하세요. 각 세션은 10-15분 정도 소요됩니다.
              </p>
              <button
                onClick={createNewSession}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#1F6F63] hover:bg-[#2BA08C] text-[#E6F0ED] rounded-xl font-medium transition-colors"
              >
                <Plus className="h-5 w-5" />
                첫 세션 만들기
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session, index) => (
                <div
                  key={session.id}
                  className="bg-[#0E1513] rounded-2xl p-6 border border-[#2BA08C]/10 hover:border-[#2BA08C]/30 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#2BA08C]/10 text-[#2BA08C] font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          {getSessionStatusIcon(session)}
                          <h3 className="text-xl font-semibold text-[#E6F0ED]">
                            {session.title}
                          </h3>
                        </div>
                        {session.description && (
                          <p className="text-sm text-[#A8C3BC] mb-3">{session.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-[#A8C3BC]">
                          <span className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            {session.totalQuestions}개 질문
                          </span>
                          {session.total_duration > 0 && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {formatDuration(session.total_duration)}
                            </span>
                          )}
                          <span
                            className={`px-3 py-1 rounded-full text-xs ${
                              session.status === 'completed'
                                ? 'bg-green-500/10 text-green-400'
                                : session.status === 'in_progress'
                                ? 'bg-[#1E5EFF]/10 text-[#1E5EFF]'
                                : 'bg-gray-500/10 text-gray-400'
                            }`}
                          >
                            {session.status === 'completed'
                              ? '완료'
                              : session.status === 'in_progress'
                              ? '진행 중'
                              : '시작 전'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => startSession(session.id)}
                      className="flex items-center gap-2 px-6 py-3 bg-[#1F6F63] hover:bg-[#2BA08C] text-[#E6F0ED] rounded-xl font-medium transition-colors"
                    >
                      {session.status === 'not_started' ? (
                        <>
                          <Play className="h-5 w-5" />
                          시작하기
                        </>
                      ) : session.status === 'completed' ? (
                        <>
                          <Edit2 className="h-5 w-5" />
                          다시 보기
                        </>
                      ) : (
                        <>
                          <Play className="h-5 w-5" />
                          이어하기
                        </>
                      )}
                    </button>
                  </div>

                  {/* 진행률 바 */}
                  {session.totalQuestions > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-[#A8C3BC]">
                        <span>
                          진행률: {session.completedQuestions} / {session.totalQuestions}
                        </span>
                        <span>{getSessionProgress(session)}%</span>
                      </div>
                      <div className="h-2 bg-[#0B0F0E] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#1F6F63] to-[#2BA08C] transition-all duration-500"
                          style={{ width: `${getSessionProgress(session)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 안내 */}
        <section className="bg-[#0E1513]/50 rounded-xl p-6 border border-[#2BA08C]/10">
          <h3 className="text-lg font-semibold text-[#E6F0ED] mb-3">💡 세션 진행 팁</h3>
          <ul className="space-y-2 text-sm text-[#A8C3BC]">
            <li>• 각 세션은 10-15분 정도의 짧은 인터뷰로 구성됩니다</li>
            <li>• 편한 시간에 조금씩 진행하셔도 괜찮습니다</li>
            <li>• 질문에 답변하기 어려우면 "건너뛰기"를 선택하세요</li>
            <li>• 녹음은 자동으로 저장되므로 걱정하지 마세요</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
