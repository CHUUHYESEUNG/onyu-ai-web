'use client';

import { Section, TimelineEvent } from '@/types/edit';
import { Save, X, History, Trash2, Plus } from 'lucide-react';
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
      <div className="flex items-center justify-center h-full bg-[#0B0F0E] text-[#A8C3BC]">
        <div className="text-center">
          <p className="text-lg mb-2">섹션을 선택해주세요</p>
          <p className="text-sm text-[#A8C3BC]/60">
            좌측 리스트에서 섹션을 클릭하거나<br />
            상단 타임라인에서 이벤트를 선택하세요
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0B0F0E]">
      {/* 헤더 */}
      <div className="p-4 border-b border-[#1F6F63]/30">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-[#E6F0ED] mb-1">{section.title}</h2>
            {event && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-[#2BA08C] bg-[#1F6F63]/20 rounded">
                {event.label}
              </span>
            )}
          </div>
          <button
            className="p-2 text-[#A8C3BC] hover:text-[#E6F0ED] hover:bg-[#1F6F63]/20 rounded transition-colors"
            title="버전 보기"
          >
            <History className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 에디터 */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="flex flex-col">
            <label className="mb-2 text-sm text-[#A8C3BC]">본문 작성</label>
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
                bg-[#0E1513] text-[#E6F0ED]
                border border-[#1F6F63]/30 rounded-lg
                focus:outline-none focus:border-[#2BA08C] focus:ring-2 focus:ring-[#2BA08C]
                resize-y
                font-['Noto_Sans_KR'] leading-relaxed
              "
              placeholder="내용을 입력하세요..."
              aria-label="섹션 본문"
              aria-describedby="editor-description"
            />
            <span id="editor-description" className="sr-only">
              선택한 섹션의 본문을 수정할 수 있습니다
            </span>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#A8C3BC]">소단락</p>
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
                  setHasChanges(true);
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-[#1F6F63]/30 px-3 py-1 text-xs text-[#E6F0ED] hover:border-[#2BA08C]"
              >
                <Plus className="h-3 w-3" /> 소단락 추가
              </button>
            </div>
            <div className="space-y-3">
              {(subsections ?? []).length === 0 ? (
                <p className="text-xs text-[#A8C3BC]/60">녹음/파일 처리 결과가 여기에 표시되며, 손수 추가하거나 수정할 수 있습니다.</p>
              ) : (
                subsections!.map((subsection) => (
                  <div key={subsection.id} className="rounded-xl border border-[#1F6F63]/30 bg-[#0E1513] p-3 shadow-sm">
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
                        className="flex-1 rounded bg-transparent text-sm text-[#E6F0ED] focus:border-[#2BA08C] focus:outline-none"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setExpandedSubsectionId((current) =>
                              current === subsection.id ? null : subsection.id,
                            )
                          }
                          className="rounded border border-[#1F6F63]/30 px-2 py-1 text-[10px] text-[#A8C3BC] hover:border-[#2BA08C]"
                        >
                          {expandedSubsectionId === subsection.id ? '닫기' : '내용'}
                        </button>
                        <button
                          onClick={() => {
                            setSubsections((prev) => prev?.filter((item) => item.id !== subsection.id));
                            setHasChanges(true);
                          }}
                          className="rounded border border-[#1F6F63]/30 px-2 py-1 text-[10px] text-[#A8C3BC] hover:border-red-400 hover:text-red-300"
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
                        className="mt-2 w-full rounded-lg border border-[#1F6F63]/30 bg-[#0B1412] p-2 text-xs text-[#E6F0ED] focus:border-[#2BA08C] focus:outline-none focus:ring-1 focus:ring-[#2BA08C]"
                        rows={4}
                      />
                    )}
                  </div>
                ))
              )}
            </div>
            <Separator />
            <div className="text-xs text-[#A8C3BC]/60">
              소단락은 음성/파일 처리 결과로 자동 생성되며, 필요 시 직접 추가/수정할 수 있습니다.
            </div>
          </div>
        </div>
      </div>

      {/* 액션 버튼 */}
      {hasChanges && (
        <div className="p-4 border-t border-[#1F6F63]/30 bg-[#0E1513]/50 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#A8C3BC]">저장하지 않은 변경사항이 있습니다</span>
            <div className="flex gap-2">
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="
                  flex items-center gap-2 px-4 py-2
                  text-[#A8C3BC] hover:text-[#E6F0ED]
                  border border-[#1F6F63]/30 rounded-lg
                  hover:bg-[#1F6F63]/10 transition-colors
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
                  bg-[#1F6F63] hover:bg-[#2BA08C] text-[#E6F0ED]
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
