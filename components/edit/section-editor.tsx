'use client';

import { Section, TimelineEvent } from '@/types/edit';
import { Save, X, History, Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Separator } from '@/components/ui/separator';

interface SectionEditorProps {
  section: Section | null;
  event?: TimelineEvent;
  onSave: (sectionId: string, content: string, subsections?: Section['subsections']) => Promise<void>;
}

export function SectionEditor({ section, event, onSave }: SectionEditorProps) {
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [subsections, setSubsections] = useState<Section['subsections']>([]);
  const [expandedSubsectionId, setExpandedSubsectionId] = useState<string | null>(null);
  const [showSubsections, setShowSubsections] = useState(false);

  useEffect(() => {
    if (section) {
      setContent(section.content);
      setSubsections(section.subsections ?? []);
      setHasChanges(false);
      setExpandedSubsectionId(null);
    }
  }, [section]);

  const handleSave = async () => {
    if (!section) return;
    setIsSaving(true);
    try {
      await onSave(section.id, content, subsections);
      setHasChanges(false);
      if (section.subsections?.length) {
        setSubsections(section.subsections);
      }
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (section) {
      setContent(section.content);
      setSubsections(section.subsections ?? []);
      setHasChanges(false);
      setExpandedSubsectionId(null);
    }
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
    <div className="flex flex-col h-full bg-navy-900">
      {/* 헤더 */}
      <div className="p-4 border-b border-navy-700/30">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-[#e4e6eb] mb-1">{section.title}</h2>
            {event && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-accent bg-accent/10 rounded">
                {event.label}
              </span>
            )}
          </div>
          <button
            className="p-2 text-[#a0a3b1] hover:text-[#e4e6eb] hover:bg-card rounded transition-colors"
            title="버전 보기"
          >
            <History className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 에디터 */}
      <div className="flex-1 p-6 overflow-y-auto max-w-4xl mx-auto w-full">
        <div className="space-y-6">
          <div className="flex flex-col">
            <label className="mb-2 text-sm text-[#a0a3b1]">본문 작성</label>
            <textarea
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setHasChanges(
                  e.target.value !== section.content ||
                    JSON.stringify(subsections ?? []) !== JSON.stringify(section.subsections ?? []),
                );
              }}
              className="
                w-full min-h-[320px] p-4
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
              선택한 섹션의 본문을 수정할 수 있습니다
            </span>
          </div>

          {/* 소단락 섹션 - 접을 수 있음 */}
          <div className="flex flex-col border border-navy-700/50 rounded-lg overflow-hidden">
            <button
              onClick={() => setShowSubsections(!showSubsections)}
              className="flex items-center justify-between p-3 bg-card hover:bg-card-hover transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                {showSubsections ? <ChevronUp className="w-4 h-4 text-[#a0a3b1]" /> : <ChevronDown className="w-4 h-4 text-[#a0a3b1]" />}
                <span className="text-sm font-medium text-[#e4e6eb]">소단락 관리</span>
                {subsections && subsections.length > 0 && (
                  <span className="text-xs text-[#a0a3b1]">({subsections.length})</span>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSubsections((prev) => [
                    ...(prev ?? []),
                    {
                      id: `draft_${Date.now()}`,
                      title: `소단락 ${(prev ?? []).length + 1}`,
                      content: '',
                      sourceType: 'text',
                    },
                  ]);
                  setHasChanges(true);
                  setShowSubsections(true);
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-navy-700 px-3 py-1.5 text-xs text-[#e4e6eb] hover:border-accent transition-colors"
              >
                <Plus className="h-3 w-3" /> 추가
              </button>
            </button>

            {showSubsections && (
              <div className="p-4 space-y-3 border-t border-navy-700/50">
                {(subsections ?? []).length === 0 ? (
                  <p className="text-xs text-[#a0a3b1]/60 text-center py-4">
                    녹음/파일 처리 결과가 여기에 표시되며, 손수 추가하거나 수정할 수 있습니다.
                  </p>
                ) : (
                  subsections!.map((subsection) => (
                    <div key={subsection.id} className="rounded-lg border border-navy-700 bg-navy-900 p-3 shadow-sm">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          value={subsection.title}
                          onChange={(e) => {
                            setSubsections((prev) =>
                              prev?.map((item) =>
                                item.id === subsection.id ? { ...item, title: e.target.value } : item,
                              ),
                            );
                            setHasChanges(true);
                          }}
                          className="flex-1 rounded bg-transparent text-sm text-[#e4e6eb] focus:border-accent focus:outline-none"
                        />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              setExpandedSubsectionId((current) =>
                                current === subsection.id ? null : subsection.id,
                              )
                            }
                            className="rounded border border-navy-700 px-2 py-1 text-[10px] text-[#a0a3b1] hover:border-accent transition-colors"
                          >
                            {expandedSubsectionId === subsection.id ? '닫기' : '내용'}
                          </button>
                          <button
                            onClick={() => {
                              setSubsections((prev) => prev?.filter((item) => item.id !== subsection.id));
                              setHasChanges(true);
                            }}
                            className="rounded border border-navy-700 px-2 py-1 text-[10px] text-[#a0a3b1] hover:border-red-400 hover:text-red-300 transition-colors"
                            title="삭제"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      {expandedSubsectionId === subsection.id && (
                        <textarea
                          value={subsection.content}
                          onChange={(e) => {
                            setSubsections((prev) =>
                              prev?.map((item) =>
                                item.id === subsection.id ? { ...item, content: e.target.value } : item,
                              ),
                            );
                            setHasChanges(true);
                          }}
                          className="mt-2 w-full rounded-lg border border-navy-700 bg-card p-2 text-xs text-[#e4e6eb] placeholder:text-[#7a7d8c] focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50"
                          rows={4}
                        />
                      )}
                    </div>
                  ))
                )}
                <div className="text-xs text-[#a0a3b1]/60 pt-2 border-t border-navy-700/50">
                  💡 소단락은 음성/파일 처리 결과로 자동 생성되며, 필요 시 직접 추가/수정할 수 있습니다.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 액션 버튼 */}
      {hasChanges && (
        <div className="p-4 border-t border-navy-700/30 bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#a0a3b1]">저장하지 않은 변경사항이 있습니다</span>
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="
                  flex items-center gap-2 px-4 py-2
                  text-[#a0a3b1] hover:text-[#e4e6eb]
                  border border-navy-700 rounded-lg
                  hover:bg-card transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                <X className="w-4 h-4" />
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="
                  flex items-center gap-2 px-4 py-2
                  bg-accent hover:bg-accent-hover text-white
                  rounded-lg transition-colors
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                <Save className="w-4 h-4" />
                {isSaving ? '저장 중...' : '저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
