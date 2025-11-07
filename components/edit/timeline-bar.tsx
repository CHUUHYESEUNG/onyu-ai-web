'use client';

import { DndContext, closestCenter, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Check, Plus, PenSquare } from 'lucide-react';
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
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={events.map((e) => e.id)} strategy={horizontalListSortingStrategy}>
              <div className="relative flex items-start gap-8 overflow-x-auto pb-2 justify-center min-w-full" role="tablist">
                {/* 점선 */}
                <div className="absolute top-6 left-8 right-8 h-[2px] border-t-2 border-dashed border-navy-700/40 pointer-events-none" />

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
                    className="flex items-center gap-1 rounded-full border border-dashed border-accent/60 px-3 py-1.5 text-xs text-accent hover:bg-accent/10 transition-colors whitespace-nowrap ml-2"
                    title="대주제 추가"
                  >
                    <Plus className="w-4 h-4" />
                    새 대주제
                  </button>
                )}
              </div>
            </SortableContext>
          </DndContext>
        </div>
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
    <div ref={setNodeRef} style={style} className="relative flex-shrink-0 flex flex-col items-center gap-2 group">
      {/* 타임라인 노드 (드래그 가능) */}
      <div className="relative flex-shrink-0">
        <button
          onClick={() => onSelect(event.id)}
          className="relative flex-shrink-0 focus:outline-none"
          {...attributes}
          {...listeners}
          title="드래그하여 순서 변경"
        >
          <div
            className={`
              relative z-10 w-6 h-6 rounded-full transition-all flex items-center justify-center
              ${
                isSelected
                  ? 'bg-accent ring-4 ring-accent/30 scale-110'
                  : event.status === 'done'
                    ? 'bg-navy-700 border-2 border-accent'
                    : 'bg-card border-2 border-navy-700'
              }
              group-hover:scale-110 group-focus-within:ring-4 group-focus-within:ring-accent/50
              cursor-move
            `}
          >
            {event.status === 'done' && <Check className="h-3.5 w-3.5 text-white" />}
          </div>
        </button>

        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(event.id);
            }}
            className="
              absolute -right-4 -top-2 rounded-md border border-navy-700 bg-navy-900/90 p-1
              text-[#a0a3b1] opacity-0 shadow-lg transition-all
              group-hover:opacity-100 group-focus-within:opacity-100
              hover:text-accent hover:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40
            "
            title="대주제 이름 수정"
          >
            <PenSquare className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 라벨 */}
      <div className="text-center whitespace-nowrap">
        <div
          className={`
            text-xs font-medium transition-colors
            ${isSelected ? 'text-accent' : 'text-[#a0a3b1]'}
          `}
        >
          {event.label}
        </div>
        {event.date && <div className="text-[11px] text-[#a0a3b1]/60 mt-1">{event.date}</div>}
      </div>
    </div>
  );
}
