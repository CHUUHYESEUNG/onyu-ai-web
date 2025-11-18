'use client';

import { DndContext, closestCenter, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Check, Plus, PenSquare, GripVertical, Circle, X } from 'lucide-react';
import { TimelineEvent, ReorderHandler } from '@/types/edit';
import { useState } from 'react';

interface TimelineBarProps {
  events: TimelineEvent[];
  selectedEventId?: string;
  onEventSelect: (eventId: string) => void;
  onReorder: ReorderHandler;
  onAddEvent?: () => void;
  onUpdateEvent?: (eventId: string, label: string, date?: string) => void;
}

export function TimelineBar({
  events,
  selectedEventId,
  onEventSelect,
  onReorder,
  onAddEvent,
  onUpdateEvent,
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
    <div className="w-full bg-navy-900 border-b border-navy-700/30 px-6 py-4">
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
                  onUpdate={onUpdateEvent}
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
                    focus:outline-none focus:ring-2 focus:ring-accent
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
  onUpdate?: (eventId: string, label: string, date?: string) => void;
}

function TimelineEventItem({
  event,
  isSelected,
  onSelect,
  onUpdate,
}: TimelineEventItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedLabel, setEditedLabel] = useState(event.label);
  const [editedDate, setEditedDate] = useState(event.date || '');

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: event.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSave = () => {
    if (editedLabel.trim() && onUpdate) {
      onUpdate(event.id, editedLabel.trim(), editedDate.trim() || undefined);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedLabel(event.label);
    setEditedDate(event.date || '');
    setIsEditing(false);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUpdate) {
      setIsEditing(true);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => !isEditing && onSelect(event.id)}
      onDoubleClick={handleDoubleClick}
      className={`
        w-[140px] sm:w-[160px] h-[110px] sm:h-[120px]
        flex-shrink-0 flex flex-col
        border-2 rounded-xl
        transition-all
        ${!isEditing && 'cursor-pointer'}
        group
        relative
        ${
          isSelected
            ? 'border-accent bg-accent/10 shadow-lg shadow-accent/20'
            : 'border-navy-700 bg-card hover:border-accent/50 hover:bg-card'
        }
      `}
    >
      {isEditing ? (
        <div className="flex flex-col gap-2 p-3 h-full" onClick={(e) => e.stopPropagation()}>
          <input
            type="text"
            value={editedLabel}
            onChange={(e) => setEditedLabel(e.target.value)}
            className="
              w-full px-2 py-1 text-sm bg-navy-900 text-[#e4e6eb]
              border border-accent rounded
              focus:outline-none focus:ring-2 focus:ring-accent
            "
            placeholder="대주제 이름"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
          />
          <input
            type="text"
            value={editedDate}
            onChange={(e) => setEditedDate(e.target.value)}
            className="
              w-full px-2 py-1 text-xs bg-navy-900 text-[#a0a3b1]
              border border-navy-700 rounded
              focus:outline-none focus:ring-2 focus:ring-accent
            "
            placeholder="날짜 (선택)"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
          />
          <div className="flex gap-1 mt-auto">
            <button
              onClick={handleSave}
              className="flex-1 px-2 py-1 text-xs bg-accent hover:bg-accent-hover text-white rounded transition-colors"
            >
              <Check className="w-3 h-3 mx-auto" />
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 px-2 py-1 text-xs bg-navy-700 hover:bg-navy-600 text-[#e4e6eb] rounded transition-colors"
            >
              <X className="w-3 h-3 mx-auto" />
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* 상단: 편집 버튼 - hover 시에만 표시 */}
          <div className="flex justify-end p-2">
            {onUpdate && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                className="
                  rounded-md border border-navy-700/50 bg-navy-900/90 p-1
                  text-[#a0a3b1] opacity-0 group-hover:opacity-100
                  hover:text-accent hover:border-accent
                  transition-all
                  focus:outline-none focus:opacity-100 focus:ring-2 focus:ring-accent
                "
                title="더블클릭 또는 클릭하여 수정"
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
        </>
      )}
    </div>
  );
}
