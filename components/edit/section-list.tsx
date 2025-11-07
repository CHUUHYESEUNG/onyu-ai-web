'use client';

import { DndContext, closestCenter, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Section, ReorderHandler } from '@/types/edit';
import { Search, GripVertical, Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface SectionListProps {
  sections: Section[];
  selectedSectionId?: string;
  onSectionSelect: (sectionId: string) => void;
  onReorder: ReorderHandler;
  onAddSection: () => void;
}

export function SectionList({
  sections,
  selectedSectionId,
  onSectionSelect,
  onReorder,
  onAddSection,
}: SectionListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isSearchOpen) {
      requestAnimationFrame(() => searchInputRef.current?.focus());
    }
  }, [isSearchOpen]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const filtered = filteredSections;
      const oldIndex = filtered.findIndex((s) => s.id === active.id);
      const newIndex = filtered.findIndex((s) => s.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        onReorder(oldIndex, newIndex);
      }
    }
  };

  const filteredSections = sections.filter((section) =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-navy-900 border-r border-navy-700/30">
      {/* 헤더 + 검색 */}
      <div className="sticky top-0 z-10 border-b border-navy-800/60 bg-navy-900/95 backdrop-blur">
        <div className="flex items-center justify-between gap-2 px-3 py-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#8d90a3]">소주제 목록</p>
            <p className="text-[11px] text-[#6f7284]">현재 선택된 대주제와 연결된 카드</p>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`
                overflow-hidden transition-all duration-200
                ${isSearchOpen ? 'w-40 opacity-100' : 'w-0 opacity-0 pointer-events-none'}
              `}
            >
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="검색"
                  className="
                    w-full rounded-lg border border-navy-700 bg-card px-8 py-1.5 text-xs text-[#e4e6eb]
                    placeholder:text-[#7a7d8c] focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/40
                  "
                />
                <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#7a7d8c]" />
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsSearchOpen((prev) => !prev)}
              className="
                inline-flex h-9 w-9 items-center justify-center rounded-lg border border-navy-700
                text-[#a0a3b1] hover:text-accent hover:border-accent transition-colors
              "
              aria-label="소주제 검색"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onAddSection}
              className="
                inline-flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-white
                hover:bg-accent-hover transition-colors
              "
              aria-label="소주제 추가"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 섹션 리스트 */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2">
        {filteredSections.length === 0 ? (
          <div className="p-4 text-center text-[#a0a3b1]/60 text-sm">섹션이 없습니다.</div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={filteredSections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              {filteredSections.map((section) => (
                <SectionListItem
                  key={section.id}
                  section={section}
                  isSelected={selectedSectionId === section.id}
                  onSelect={onSectionSelect}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}

interface SectionListItemProps {
  section: Section;
  isSelected: boolean;
  onSelect: (sectionId: string) => void;
}

function SectionListItem({
  section,
  isSelected,
  onSelect,
}: SectionListItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: section.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <button
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect(section.id)}
      className={`
        group w-full text-left rounded-xl transition-all
        focus:outline-none focus:ring-2 focus:ring-accent/40
        flex items-center gap-2.5 px-2.5 py-2
        ${
          isSelected
            ? 'bg-accent/10 border border-accent/50 shadow-[0_0_0_1px_rgba(34,197,94,0.2)]'
            : 'border border-transparent hover:border-navy-700/80 hover:bg-card/30'
        }
      `}
      title="드래그하여 순서 변경"
    >
      {/* 드래그 핸들 */}
      <div
        className="flex-shrink-0 text-[#6c6f82] group-hover:text-[#a0a3b1] transition-colors cursor-move"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4" />
      </div>

      {/* 섹션 내용 */}
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium truncate ${isSelected ? 'text-accent' : 'text-[#e4e6eb]'}`}>
          {section.title}
        </div>
        <div
          className={`
            text-[11px] text-[#a0a3b1] transition-all duration-200
            ${isSelected ? 'max-h-14 mt-1' : 'max-h-0 group-hover:max-h-14'}
            overflow-hidden line-clamp-2
          `}
        >
          {section.excerpt || '요약이 아직 없습니다.'}
        </div>
      </div>
    </button>
  );
}
