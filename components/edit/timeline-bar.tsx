'use client';

import { DndContext, closestCenter, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Check, Plus, PenSquare, GripVertical, Circle } from 'lucide-react';
import { TimelineEvent, ReorderHandler } from '@/types/edit';

interface TimelineBarProps {
  events: TimelineEvent[];
  selectedEventId?: string;
  onEventSelect: (eventId: string) => void;
  onReorder: ReorderHandler;
  onAddEvent?: () => void;
  onEditEvent?: (eventId: string) => void;
}

export function TimelineBar({
  events,
  selectedEventId,
  onEventSelect,
  onReorder,
  onAddEvent,
  onEditEvent,
}: TimelineBarProps) {
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
      const oldIndex = events.findIndex((e) => e.id === active.id);
      const newIndex = events.findIndex((e) => e.id === over.id);
      onReorder(oldIndex, newIndex);
    }
  };

  return (
    <div className="w-full bg-card border-b border-navy-700/30 px-6 py-4">
      <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-navy-700">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={events.map((e) => e.id)} strategy={horizontalListSortingStrategy}>
            <div className="inline-flex gap-3 py-2 min-w-max" role="tablist">
              {events.map((event) => (
                <TimelineEventItem
                  key={event.id}
                  event={event}
                  isSelected={selectedEventId === event.id}
                  onSelect={onEventSelect}
                  onEdit={onEditEvent}
                />
              ))}

              {onAddEvent && (
                <button
                  onClick={onAddEvent}
                  className="
                    w-[140px] sm:w-[160px] h-[110px] sm:h-[120px]
                    flex-shrink-0 flex flex-col items-center justify-center gap-2
                    border-2 border-dashed border-accent/40 rounded-xl
                    bg-accent/5 hover:bg-accent/10 hover:border-accent/60
                    transition-all
                  "
                  title="대주제 추가"
                >
                  <Plus className="w-6 h-6 text-accent" />
                  <span className="text-sm font-medium text-accent">새 대주제</span>
                </button>
              )}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}

interface TimelineEventItemProps {
  event: TimelineEvent;
  isSelected: boolean;
  onSelect: (eventId: string) => void;
  onEdit?: (eventId: string) => void;
}

function TimelineEventItem({
  event,
  isSelected,
  onSelect,
  onEdit,
}: TimelineEventItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: event.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect(event.id)}
      className={`
        w-[140px] sm:w-[160px] h-[110px] sm:h-[120px]
        flex-shrink-0 flex flex-col
        border-2 rounded-xl
        transition-all
        cursor-pointer
        group
        ${
          isSelected
            ? 'border-accent bg-accent/10 shadow-lg shadow-accent/20'
            : 'border-navy-700 bg-card/50 hover:border-accent/50 hover:bg-card/80'
        }
      `}
    >
      {/* 상단: 편집 버튼 */}
      <div className="flex justify-end p-2">
        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(event.id);
            }}
            className="
              rounded-md border border-navy-700/50 bg-navy-900/90 p-1
              text-[#a0a3b1] opacity-0 group-hover:opacity-100
              hover:text-accent hover:border-accent
              transition-all
              focus:outline-none focus:opacity-100
            "
            title="대주제 이름 수정"
          >
            <PenSquare className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 중앙: 메인 라벨 */}
      <div className="flex-1 flex items-center justify-center px-3 py-1">
        <h3
          className={`
            text-sm sm:text-base font-semibold text-center line-clamp-2 break-words
            transition-colors
            ${isSelected ? 'text-accent' : 'text-[#e4e6eb]'}
          `}
        >
          {event.label}
        </h3>
      </div>

      {/* 날짜 */}
      {event.date && (
        <div className="px-3 text-[10px] sm:text-xs text-center text-[#a0a3b1] mb-1">
          {event.date}
        </div>
      )}

      {/* 하단: 드래그 핸들 + 상태 */}
      <div className="flex items-center justify-between px-2 py-2 border-t border-navy-700/30">
        <div
          {...attributes}
          {...listeners}
          className="cursor-move text-[#6c6f82] hover:text-[#a0a3b1] transition-colors"
          title="드래그하여 순서 변경"
        >
          <GripVertical className="w-4 h-4" />
        </div>
        <div className="flex items-center gap-1 text-[10px] font-medium">
          {event.status === 'done' ? (
            <>
              <Check className="w-3 h-3 text-accent" />
              <span className="text-accent">완료</span>
            </>
          ) : (
            <>
              <Circle className="w-3 h-3 text-[#a0a3b1]" />
              <span className="text-[#a0a3b1]">예정</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
