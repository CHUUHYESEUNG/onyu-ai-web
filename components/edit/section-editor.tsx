'use client';

import { Section, TimelineEvent } from '@/types/edit';
import { Save, X, History } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SectionEditorProps {
  section: Section | null;
  event?: TimelineEvent;
  onSave: (sectionId: string, content: string) => Promise<void>;
}

export function SectionEditor({ section, event, onSave }: SectionEditorProps) {
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (section) {
      setContent(section.content);
      setHasChanges(false);
    }
  }, [section]);

  const handleSave = async () => {
    if (!section) return;
    setIsSaving(true);
    try {
      await onSave(section.id, content);
      setHasChanges(false);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (section) {
      setContent(section.content);
      setHasChanges(false);
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
        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setHasChanges(e.target.value !== section.content);
          }}
          className="
            w-full h-full min-h-[400px] p-4
            bg-[#0E1513] text-[#E6F0ED]
            border border-[#1F6F63]/30 rounded-lg
            focus:outline-none focus:border-[#2BA08C] focus:ring-2 focus:ring-[#2BA08C]
            resize-none
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
