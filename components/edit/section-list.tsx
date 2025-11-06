'use client';

import { DndContext, closestCenter, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Section, ReorderHandler } from '@/types/edit';
import { Search, ChevronUp, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface SectionListProps {
  sections: Section[];
  selectedSectionId?: string;
  onSectionSelect: (sectionId: string) => void;
  onReorder: ReorderHandler;
}

export function SectionList({ sections, selectedSectionId, onSectionSelect, onReorder }: SectionListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

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

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      onReorder(index, index - 1);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < filteredSections.length - 1) {
      onReorder(index, index + 1);
    }
  };
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSections = sections.filter((section) =>
    section.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#0B0F0E] border-r border-[#1F6F63]/30">
      {/* 검색 */}
      <div className="p-4 border-b border-[#1F6F63]/30">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8C3BC]" />
          <input
            type="text"
            placeholder="섹션 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="
              w-full pl-10 pr-4 py-2
              bg-[#0E1513] text-[#E6F0ED] placeholder-[#A8C3BC]/50
              border border-[#1F6F63]/30 rounded-lg
              focus:outline-none focus:border-[#2BA08C] focus:ring-1 focus:ring-[#2BA08C]
              transition-colors
            "
          />
        </div>
      </div>

      {/* 섹션 리스트 */}
      <div className="flex-1 overflow-y-auto">
        {filteredSections.length === 0 ? (
          <div className="p-4 text-center text-[#A8C3BC]/60 text-sm">섹션이 없습니다.</div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={filteredSections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2 p-2">
                {filteredSections.map((section, index) => (
                  <SectionListItem
                    key={section.id}
                    section={section}
                    isFirst={index === 0}
                    isLast={index === filteredSections.length - 1}
                    isSelected={selectedSectionId === section.id}
                    onSelect={onSectionSelect}
                    onMoveUp={() => handleMoveUp(index)}
                    onMoveDown={() => handleMoveDown(index)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}

interface SectionListItemProps {
  section: Section;
  isFirst: boolean;
  isLast: boolean;
  isSelected: boolean;
  onSelect: (sectionId: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

function SectionListItem({
  section,
  isFirst,
  isLast,
  isSelected,
  onSelect,
  onMoveUp,
  onMoveDown,
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
    <div ref={setNodeRef} style={style} className="space-y-1">
      {/* 섹션 내용 (드래그 가능) */}
      <button
        onClick={() => onSelect(section.id)}
        className={`
          w-full text-left p-3 rounded-lg transition-all
          focus:outline-none focus:ring-2 focus:ring-[#2BA08C]
          cursor-move
          ${
            isSelected
              ? 'bg-[#1F6F63]/20 border-l-4 border-[#2BA08C]'
              : 'hover:bg-[#0E1513] border-l-4 border-transparent'
          }
        `}
        {...attributes}
        {...listeners}
      >
        <div className="font-semibold text-[#E6F0ED] mb-1">{section.title}</div>
        <div className="text-sm text-[#A8C3BC] line-clamp-2">{section.excerpt}</div>
      </button>

      {/* 이동 버튼 */}
      <div className="flex gap-2 px-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMoveUp();
          }}
          disabled={isFirst}
          className="
            flex-1 flex items-center justify-center gap-2
            px-4 py-3 text-base font-medium
            bg-[#1F6F63] hover:bg-[#2BA08C]
            text-[#E6F0ED]
            rounded-lg transition-colors
            disabled:opacity-30 disabled:cursor-not-allowed
            focus:outline-none focus:ring-2 focus:ring-[#2BA08C]
          "
          aria-label={`${section.title} 위로 이동`}
          title="위로 이동"
        >
          <ChevronUp className="h-5 w-5" />
          <span>위로</span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onMoveDown();
          }}
          disabled={isLast}
          className="
            flex-1 flex items-center justify-center gap-2
            px-4 py-3 text-base font-medium
            bg-[#1F6F63] hover:bg-[#2BA08C]
            text-[#E6F0ED]
            rounded-lg transition-colors
            disabled:opacity-30 disabled:cursor-not-allowed
            focus:outline-none focus:ring-2 focus:ring-[#2BA08C]
          "
          aria-label={`${section.title} 아래로 이동`}
          title="아래로 이동"
        >
          <ChevronDown className="h-5 w-5" />
          <span>아래로</span>
        </button>
      </div>
    </div>
  );
}
