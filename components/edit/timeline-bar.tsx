'use client';

import { DndContext, closestCenter, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { TimelineEvent, ReorderHandler } from '@/types/edit';

interface TimelineBarProps {
  events: TimelineEvent[];
  selectedEventId?: string;
  onEventSelect: (eventId: string) => void;
  onReorder: ReorderHandler;
}

export function TimelineBar({ events, selectedEventId, onEventSelect, onReorder }: TimelineBarProps) {
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

  const handleMoveLeft = (index: number) => {
    if (index > 0) {
      onReorder(index, index - 1);
    }
  };

  const handleMoveRight = (index: number) => {
    if (index < events.length - 1) {
      onReorder(index, index + 1);
    }
  };
  return (
    <div className="w-full bg-[#0E1513] border-b border-[#1F6F63]/30 px-6 py-6">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={events.map((e) => e.id)} strategy={horizontalListSortingStrategy}>
          <div className="relative flex items-start gap-4 overflow-x-auto pb-2" role="tablist">
            {/* 점선 */}
            <div className="absolute top-8 left-0 right-0 h-[2px] border-t-2 border-dashed border-[#1F6F63]/40 pointer-events-none" />

            {events.map((event, index) => (
              <TimelineEventItem
                key={event.id}
                event={event}
                isFirst={index === 0}
                isLast={index === events.length - 1}
                isSelected={selectedEventId === event.id}
                onSelect={onEventSelect}
                onMoveLeft={() => handleMoveLeft(index)}
                onMoveRight={() => handleMoveRight(index)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

interface TimelineEventItemProps {
  event: TimelineEvent;
  isFirst: boolean;
  isLast: boolean;
  isSelected: boolean;
  onSelect: (eventId: string) => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
}

function TimelineEventItem({
  event,
  isFirst,
  isLast,
  isSelected,
  onSelect,
  onMoveLeft,
  onMoveRight,
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
    <div ref={setNodeRef} style={style} className="relative flex-shrink-0 flex flex-col items-center gap-2">
      {/* 이동 버튼 */}
      <div className="flex gap-1 mb-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMoveLeft();
          }}
          disabled={isFirst}
          className="px-2 py-1 rounded bg-[#1F6F63] hover:bg-[#2BA08C] disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-[#2BA08C]"
          aria-label={`${event.label} 왼쪽으로 이동`}
          title="왼쪽으로"
        >
          <ChevronLeft className="h-3 w-3 text-[#E6F0ED]" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMoveRight();
          }}
          disabled={isLast}
          className="px-2 py-1 rounded bg-[#1F6F63] hover:bg-[#2BA08C] disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-[#2BA08C]"
          aria-label={`${event.label} 오른쪽으로 이동`}
          title="오른쪽으로"
        >
          <ChevronRight className="h-3 w-3 text-[#E6F0ED]" />
        </button>
      </div>

      {/* 타임라인 노드 (드래그 가능) */}
      <button
        onClick={() => onSelect(event.id)}
        className="relative flex-shrink-0 group focus:outline-none"
        {...attributes}
        {...listeners}
      >
        <div
          className={`
            relative z-10 w-8 h-8 rounded-full transition-all flex items-center justify-center
            ${
              isSelected
                ? 'bg-[#2BA08C] ring-4 ring-[#2BA08C]/30 scale-110'
                : event.status === 'done'
                  ? 'bg-[#1F6F63] border-2 border-[#2BA08C]'
                  : 'bg-[#0E1513] border-2 border-[#1F6F63]'
            }
            group-hover:scale-110 group-focus:ring-4 group-focus:ring-[#2BA08C]/50
            cursor-move
          `}
        >
          {event.status === 'done' && <Check className="h-4 w-4 text-white" />}
        </div>
      </button>

      {/* 라벨 */}
      <div className="text-center whitespace-nowrap">
        <div
          className={`
            text-base font-medium transition-colors
            ${isSelected ? 'text-[#2BA08C]' : 'text-[#A8C3BC]'}
          `}
        >
          {event.label}
        </div>
        {event.date && <div className="text-xs text-[#A8C3BC]/60 mt-1">{event.date}</div>}
      </div>
    </div>
  );
}
