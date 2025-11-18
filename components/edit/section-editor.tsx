'use client';

import { Section, TimelineEvent } from '@/types/edit';
import { Save, X, History, Trash2, Plus, ChevronDown, ChevronUp, PanelRightOpen, PanelRightClose } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

interface SectionEditorProps {
  section: Section | null;
  event?: TimelineEvent;
  onSave: (sectionId: string, content: string, subsections?: Section['subsections']) => Promise<void>;
}

export function SectionEditor({ section, event, onSave }: SectionEditorProps) {
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [subsections, setSubsections] = useState<Section['subsections']>([]);
  const [expandedSubsectionId, setExpandedSubsectionId] = useState<string | null>(null);
  const [showSubsectionsSidebar, setShowSubsectionsSidebar] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastContentRef = useRef('');

  useEffect(() => {
    if (section) {
      setContent(section.content);
      setSubsections(section.subsections ?? []);
      setExpandedSubsectionId(null);
      lastContentRef.current = section.content;
    }
  }, [section]);

  // Auto-save with debounce
  useEffect(() => {
    if (!section) return;
    if (content === lastContentRef.current) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      setIsSaving(true);
      try {
        await onSave(section.id, content, subsections);
        lastContentRef.current = content;
        setLastSavedAt(new Date());
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setIsSaving(false);
      }
    }, 1500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [content, section, subsections, onSave]);

  // Format time ago
  const getTimeAgo = () => {
    if (!lastSavedAt) return '';
    const seconds = Math.floor((Date.now() - lastSavedAt.getTime()) / 1000);
    if (seconds < 5) return '방금 전';
    if (seconds < 60) return `${seconds}초 전`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}분 전`;
    return '1시간 이상';
  };

  if (!section) {
    return (
      <div className="flex items-center justify-center h-full bg-navy-900 text-[#a0a3b1]">
        <div className="text-center">
          <p className="text-lg mb-2">섹션을 선택해주세요</p>
          <p className="text-sm text-[#a0a3b1]/60">
            좌측 리스트에서 섹션을 클릭하거나<br />
            상단 타임라인에서 이벤트를 선택하세요
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-navy-900 relative">
      {/* 메인 에디터 영역 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 최소화된 헤더: 실시간 저장 인디케이터 + 버전 보기 아이콘 */}
        <div className="absolute top-4 right-4 flex items-center gap-3 z-10">
          {/* 자동 저장 인디케이터 */}
          <div className="flex items-center gap-2 text-xs text-[#a0a3b1]">
            {isSaving ? (
              <>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                <span>저장 중...</span>
              </>
            ) : lastSavedAt ? (
              <>
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span>자동 저장됨 · {getTimeAgo()}</span>
              </>
            ) : null}
          </div>

          {/* 버전 보기 아이콘 */}
          <button
            className="p-2 text-[#a0a3b1] hover:text-[#e4e6eb] hover:bg-card rounded transition-colors"
            title="버전 보기"
          >
            <History className="w-4 h-4" />
          </button>

          {/* 소단락 사이드바 토글 */}
          {subsections && subsections.length > 0 && (
            <button
              onClick={() => setShowSubsectionsSidebar(!showSubsectionsSidebar)}
              className="p-2 text-[#a0a3b1] hover:text-[#e4e6eb] hover:bg-card rounded transition-colors"
              title={showSubsectionsSidebar ? '소단락 숨기기' : '소단락 보기'}
            >
              {showSubsectionsSidebar ? (
                <PanelRightClose className="w-4 h-4" />
              ) : (
                <PanelRightOpen className="w-4 h-4" />
              )}
            </button>
          )}
        </div>

        {/* 에디터 본문 */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto w-full space-y-4">
            {/* 인라인 섹션 제목 */}
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold text-[#e4e6eb]">{section.title}</h2>
              {event && (
                <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-accent bg-accent/10 rounded">
                  {event.label}
                </span>
              )}
            </div>

            {/* 본문 작성 textarea */}
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="
                w-full min-h-[500px] p-4
                bg-card text-[#e4e6eb]
                border border-navy-700 rounded-lg
                focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/50
                resize-y
                font-['Noto_Sans_KR'] leading-relaxed
                placeholder:text-[#7a7d8c]
              "
              placeholder="내용을 입력하세요..."
              aria-label="섹션 본문"
              aria-describedby="editor-description"
            />
            <span id="editor-description" className="sr-only">
              선택한 섹션의 본문을 수정할 수 있습니다. 자동 저장됩니다.
            </span>
          </div>
        </div>
      </div>

      {/* 우측 슬라이드인 소단락 사이드바 */}
      {showSubsectionsSidebar && (
        <div className="w-80 border-l border-navy-700/30 bg-navy-900 flex flex-col overflow-hidden">
          {/* 사이드바 헤더 */}
          <div className="p-4 border-b border-navy-700/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[#e4e6eb]">소단락 관리</span>
              {subsections && subsections.length > 0 && (
                <span className="text-xs text-[#a0a3b1]">({subsections.length})</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSubsections((prev) => [
                    ...(prev ?? []),
                    {
                      id: `draft_${Date.now()}`,
                      title: `소단락 ${(prev ?? []).length + 1}`,
                      content: '',
                      sourceType: 'text',
                    },
                  ]);
                }}
                className="p-1.5 text-[#a0a3b1] hover:text-accent hover:bg-card rounded transition-colors"
                title="소단락 추가"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowSubsectionsSidebar(false)}
                className="p-1.5 text-[#a0a3b1] hover:text-[#e4e6eb] hover:bg-card rounded transition-colors"
                title="닫기"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 소단락 리스트 */}
          <div className="flex-1 p-4 space-y-3 overflow-y-auto">
            {(subsections ?? []).length === 0 ? (
              <p className="text-xs text-[#a0a3b1]/60 text-center py-8">
                녹음/파일 처리 결과가 여기에 표시되며,<br />
                손수 추가하거나 수정할 수 있습니다.
              </p>
            ) : (
              subsections!.map((subsection) => (
                <div key={subsection.id} className="rounded-lg border border-navy-700 bg-card p-3 shadow-sm">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <input
                      value={subsection.title}
                      onChange={(e) => {
                        setSubsections((prev) =>
                          prev?.map((item) =>
                            item.id === subsection.id ? { ...item, title: e.target.value } : item,
                          ),
                        );
                      }}
                      className="flex-1 rounded bg-transparent text-sm font-medium text-[#e4e6eb] focus:outline-none border-b border-transparent hover:border-navy-600 focus:border-accent transition-colors"
                    />
                    <button
                      onClick={() => {
                        setSubsections((prev) => prev?.filter((item) => item.id !== subsection.id));
                      }}
                      className="p-1 text-[#a0a3b1] hover:text-red-400 transition-colors"
                      title="삭제"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() =>
                        setExpandedSubsectionId((current) =>
                          current === subsection.id ? null : subsection.id,
                        )
                      }
                      className="w-full text-left text-xs text-[#a0a3b1] hover:text-[#e4e6eb] transition-colors"
                    >
                      {expandedSubsectionId === subsection.id ? '내용 숨기기 ▲' : '내용 보기 ▼'}
                    </button>

                    {expandedSubsectionId === subsection.id && (
                      <textarea
                        value={subsection.content}
                        onChange={(e) => {
                          setSubsections((prev) =>
                            prev?.map((item) =>
                              item.id === subsection.id ? { ...item, content: e.target.value } : item,
                            ),
                          );
                        }}
                        className="w-full rounded-lg border border-navy-700 bg-navy-900 p-2 text-xs text-[#e4e6eb] placeholder:text-[#7a7d8c] focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50"
                        rows={6}
                        placeholder="소단락 내용..."
                      />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 사이드바 푸터 팁 */}
          <div className="p-4 border-t border-navy-700/30 text-[10px] text-[#a0a3b1]/60">
            💡 소단락은 음성/파일 처리 결과로 자동 생성됩니다.
          </div>
        </div>
      )}
    </div>
  );
}
