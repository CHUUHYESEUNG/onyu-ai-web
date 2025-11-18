'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  Mic,
  Square,
  SkipForward,
  CheckCircle2,
  Circle,
  Clock,
  Play,
  Pause,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAudioRecorder } from '@/hooks/use-audio-recorder';
import type { Database } from '@/types/database';

type Session = Database['public']['Tables']['sessions']['Row'];
type Question = Database['public']['Tables']['questions']['Row'];
type Chapter = Database['public']['Tables']['chapters']['Row'];

export default function SessionInterviewPage() {
  const params = useParams<{ projectId: string; chapterId: string; sessionId: string }>();
  const router = useRouter();

  const [session, setSession] = useState<Session | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

  const {
    isRecording,
    isPaused,
    duration,
    audioBlob,
    error: recordingError,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
  } = useAudioRecorder();

  useEffect(() => {
    if (params?.sessionId) {
      loadSessionData();
    }
  }, [params?.sessionId]);

  // 세션 시작 시 시작 시간 기록
  useEffect(() => {
    if (session && !sessionStartTime) {
      startSession();
    }
  }, [session]);

  async function loadSessionData() {
    try {
      // 세션 정보 조회
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', params.sessionId)
        .single();

      if (sessionError) throw sessionError;
      setSession(sessionData);

      // 챕터 정보 조회
      const { data: chapterData, error: chapterError } = await supabase
        .from('chapters')
        .select('*')
        .eq('id', params.chapterId)
        .single();

      if (chapterError) throw chapterError;
      setChapter(chapterData);

      // 질문 리스트 조회
      const { data: questionsData, error: questionsError } = await supabase
        .from('questions')
        // @ts-ignore - Supabase 타입 추론 이슈
        .select('*')
        .eq('session_id', params.sessionId)
        .order('order_index', { ascending: true });

      if (questionsError) throw questionsError;
      setQuestions(questionsData || []);

      // 현재 질문 인덱스 찾기 (마지막으로 완료하지 않은 질문)
      const lastIncompleteIndex = (questionsData || []).findIndex(
        // @ts-ignore - Supabase 타입 추론 이슈
        (q) => !q.is_completed && !q.is_skipped
      );
      if (lastIncompleteIndex !== -1) {
        setCurrentQuestionIndex(lastIncompleteIndex);
      }
    } catch (error) {
      console.error('Failed to load session data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function startSession() {
    if (session?.status === 'not_started') {
      const now = Date.now();
      setSessionStartTime(now);

      await supabase
        .from('sessions')
        // @ts-ignore - Supabase 타입 추론 이슈
        .update({
          status: 'in_progress',
          started_at: new Date().toISOString(),
        })
        .eq('id', params.sessionId);
    }
  }

  async function completeSession() {
    if (!session) return;

    const totalDuration = sessionStartTime
      ? Math.floor((Date.now() - sessionStartTime) / 1000)
      : session.total_duration;

    await supabase
      .from('sessions')
      // @ts-ignore - Supabase 타입 추론 이슈
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        total_duration: totalDuration,
      })
      .eq('id', params.sessionId);

    // 챕터로 돌아가기
    router.push(`/projects/${params.projectId}/chapter/${params.chapterId}`);
  }

  async function handleStartRecording() {
    try {
      await startRecording();
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('녹음을 시작할 수 없습니다. 마이크 권한을 확인해주세요.');
    }
  }

  async function handleStopRecording() {
    try {
      const blob = await stopRecording();
      if (!blob) return;

      setIsProcessing(true);

      // 1. Supabase Storage에 업로드
      const file = new File([blob], `recording_${Date.now()}.webm`, {
        type: blob.type,
      });

      const filePath = `${params.projectId}/${params.sessionId}/${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('audio-uploads')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. audio_assets 레코드 생성
      const { data: asset, error: assetError } = await supabase
        .from('audio_assets')
        // @ts-ignore - Supabase 타입 추론 이슈
        .insert({
          project_id: params.projectId,
          question_id: currentQuestion?.id,
          file_path: filePath,
          duration: duration,
          status: 'uploaded',
        })
        .select()
        .single();

      if (assetError) throw assetError;

      // 3. STT API 호출
      const formData = new FormData();
      formData.append('audio', file);
      // @ts-ignore - Supabase 타입 추론 이슈
      formData.append('assetId', asset.id);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Transcription failed');

      const { transcript } = await response.json();

      // 4. 질문 업데이트
      await supabase
        .from('questions')
        // @ts-ignore - Supabase 타입 추론 이슈
        .update({
          // @ts-ignore - Supabase 타입 추론 이슈
          audio_asset_id: asset.id,
          transcription: transcript,
          duration: duration,
          is_completed: true,
          recorded_at: new Date().toISOString(),
        })
        .eq('id', currentQuestion?.id);

      // 5. 다음 질문으로 이동
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }

      setIsProcessing(false);
      loadSessionData(); // 데이터 갱신
    } catch (error) {
      console.error('Failed to process recording:', error);
      alert('녹음 처리 중 오류가 발생했습니다.');
      setIsProcessing(false);
    }
  }

  async function handleSkipQuestion() {
    if (!currentQuestion) return;

    await supabase
      .from('questions')
      // @ts-ignore - Supabase 타입 추론 이슈
      .update({
        is_skipped: true,
        is_completed: true,
      })
      .eq('id', currentQuestion.id);

    // 다음 질문으로 이동
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }

    loadSessionData();
  }

  function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  const currentQuestion = questions[currentQuestionIndex];
  const completedCount = questions.filter((q) => q.is_completed || q.is_skipped).length;
  const progress = questions.length > 0 ? (completedCount / questions.length) * 100 : 0;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const allQuestionsCompleted = completedCount === questions.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0B0F0E]">
        <div className="text-[#E6F0ED]">로딩 중...</div>
      </div>
    );
  }

  if (!session || !chapter) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0B0F0E]">
        <div className="text-[#E6F0ED]">세션을 찾을 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F0E] p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* 헤더 */}
        <header className="space-y-3">
          <Link
            href={`/projects/${params.projectId}/chapter/${params.chapterId}`}
            className="inline-flex items-center gap-2 text-sm text-[#A8C3BC] hover:text-[#2BA08C]"
          >
            <ChevronLeft className="h-4 w-4" />
            {chapter.title}로 돌아가기
          </Link>

          <div>
            <h1 className="text-3xl font-bold text-[#E6F0ED]">{session.title}</h1>
            {session.description && (
              <p className="text-lg text-[#A8C3BC] mt-1">{session.description}</p>
            )}
          </div>

          {/* 전체 진행률 */}
          <div className="bg-[#0E1513] rounded-xl p-4 border border-[#2BA08C]/20">
            <div className="flex justify-between text-sm text-[#A8C3BC] mb-2">
              <span>
                진행률: {completedCount} / {questions.length} 질문
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-[#0B0F0E] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#1F6F63] to-[#2BA08C] transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </header>

        {/* 모든 질문 완료 시 */}
        {allQuestionsCompleted ? (
          <div className="bg-[#0E1513] rounded-2xl p-12 border border-[#2BA08C]/20 text-center">
            <CheckCircle2 className="h-16 w-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-[#E6F0ED] mb-2">
              세션을 완료했습니다! 🎉
            </h2>
            <p className="text-[#A8C3BC] mb-6">
              모든 질문에 답변하셨습니다. 수고하셨습니다!
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={completeSession}
                className="px-6 py-3 bg-[#1F6F63] hover:bg-[#2BA08C] text-[#E6F0ED] rounded-xl font-medium transition-colors"
              >
                완료하기
              </button>
              <button
                onClick={() => setCurrentQuestionIndex(0)}
                className="px-6 py-3 border border-[#2BA08C]/30 hover:bg-[#2BA08C]/10 text-[#2BA08C] rounded-xl font-medium transition-colors"
              >
                처음부터 다시 보기
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* 질문 카드 */}
            <div className="bg-[#0E1513] rounded-2xl p-8 border border-[#2BA08C]/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#2BA08C]/10 text-[#2BA08C] font-bold text-lg">
                  {currentQuestionIndex + 1}
                </div>
                <span className="text-sm text-[#A8C3BC]">
                  총 {questions.length}개 질문 중
                </span>
              </div>

              <h2 className="text-2xl font-semibold text-[#E6F0ED] mb-6">
                {currentQuestion?.prompt}
              </h2>

              {/* 녹음 UI */}
              <div className="space-y-6">
                {!isRecording && !isProcessing && (
                  <button
                    onClick={handleStartRecording}
                    className="w-full py-6 bg-[#1F6F63] hover:bg-[#2BA08C] text-[#E6F0ED] rounded-xl font-semibold text-lg transition-colors flex items-center justify-center gap-3"
                  >
                    <Mic className="h-6 w-6" />
                    녹음 시작
                  </button>
                )}

                {isRecording && (
                  <div className="space-y-6">
                    {/* 녹음 시간 표시 */}
                    <div className="text-center">
                      <div className="text-5xl font-mono font-bold text-[#2BA08C] mb-2">
                        {formatDuration(duration)}
                      </div>
                      <div className="text-sm text-[#A8C3BC]">녹음 중...</div>
                    </div>

                    {/* 펄스 애니메이션 */}
                    <div className="flex justify-center">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-red-500 animate-pulse" />
                        <div className="absolute inset-0 w-20 h-20 rounded-full bg-red-500/30 animate-ping" />
                      </div>
                    </div>

                    {/* 녹음 제어 버튼 */}
                    <div className="flex gap-3">
                      <button
                        onClick={isPaused ? resumeRecording : pauseRecording}
                        className="flex-1 py-4 bg-[#0E1513] hover:bg-[#0E1513]/80 text-[#E6F0ED] rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        {isPaused ? (
                          <>
                            <Play className="h-5 w-5" />
                            재개
                          </>
                        ) : (
                          <>
                            <Pause className="h-5 w-5" />
                            일시정지
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleStopRecording}
                        className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <Square className="h-5 w-5" />
                        녹음 정지
                      </button>
                    </div>
                  </div>
                )}

                {isProcessing && (
                  <div className="text-center py-8">
                    <div className="inline-block h-12 w-12 border-4 border-[#2BA08C]/30 border-t-[#2BA08C] rounded-full animate-spin mb-4" />
                    <div className="text-lg text-[#E6F0ED] mb-2">음성을 처리 중입니다...</div>
                    <div className="text-sm text-[#A8C3BC]">
                      음성을 텍스트로 변환하고 있습니다. 잠시만 기다려주세요.
                    </div>
                  </div>
                )}

                {recordingError && (
                  <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-xl text-red-400">
                    {recordingError}
                  </div>
                )}

                {/* 건너뛰기 버튼 */}
                {!isRecording && !isProcessing && (
                  <button
                    onClick={handleSkipQuestion}
                    className="w-full py-3 border border-[#2BA08C]/30 hover:bg-[#2BA08C]/10 text-[#A8C3BC] hover:text-[#2BA08C] rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <SkipForward className="h-5 w-5" />
                    이 질문 건너뛰기
                  </button>
                )}
              </div>
            </div>

            {/* 질문 리스트 */}
            <div className="bg-[#0E1513] rounded-xl p-6 border border-[#2BA08C]/10">
              <h3 className="text-lg font-semibold text-[#E6F0ED] mb-4">질문 목록</h3>
              <div className="space-y-2">
                {questions.map((question, index) => (
                  <button
                    key={question.id}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      index === currentQuestionIndex
                        ? 'bg-[#2BA08C]/10 border border-[#2BA08C]/30'
                        : 'hover:bg-[#0B0F0E]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {question.is_completed ? (
                        <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0" />
                      ) : question.is_skipped ? (
                        <SkipForward className="h-5 w-5 text-gray-400 flex-shrink-0" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-600 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="text-sm font-medium text-[#E6F0ED]">
                          {index + 1}. {question.prompt}
                        </div>
                        {question.duration && (
                          <div className="text-xs text-[#A8C3BC] mt-1">
                            {formatDuration(question.duration)}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* 도움말 */}
        <div className="bg-[#0E1513]/50 rounded-xl p-6 border border-[#2BA08C]/10">
          <h3 className="text-lg font-semibold text-[#E6F0ED] mb-3">💡 녹음 팁</h3>
          <ul className="space-y-2 text-sm text-[#A8C3BC]">
            <li>• 조용한 공간에서 녹음하면 더 좋은 결과를 얻을 수 있습니다</li>
            <li>• 자연스럽게 이야기하듯이 답변해주세요</li>
            <li>• 답변이 어려우면 "건너뛰기"를 선택하세요</li>
            <li>• 녹음은 자동으로 저장되니 걱정하지 마세요</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
