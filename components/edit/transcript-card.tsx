'use client';

import { useState } from 'react';
import { TranscriptItem } from '@/types/edit';
import {
  Check,
  X,
  Edit,
  ArrowDown,
  Trash2,
  CheckCircle,
  GitMerge,
  Scissors,
} from 'lucide-react';
import { formatTimeAgo, formatDuration } from '@/lib/editor-utils';

interface TranscriptCardProps {
  item: TranscriptItem;
  index: number;
  onUpdate: (id: string, transcript: string) => void;
  onDelete: (id: string) => void;
  onInsert: () => void;
  onMergePrev?: () => void;
  onMergeNext?: () => void;
  onSplit?: () => void;
}

export function TranscriptCard({
  item,
  index,
  onUpdate,
  onDelete,
  onInsert,
  onMergePrev,
  onMergeNext,
  onSplit,
}: TranscriptCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [editedText, setEditedText] = useState(item.transcript);

  const handleSave = () => {
    onUpdate(item.id, editedText);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedText(item.transcript);
    setIsEditing(false);
  };

  const sessionLabel = item.sessionId.replace('session_', '');

  // 3줄 제한을 위한 계산 (대략 1줄당 50자)
  const shouldTruncate = item.transcript.length > 150;
  const displayText = !isExpanded && shouldTruncate
    ? item.transcript.slice(0, 150) + '...'
    : item.transcript;

  return (
    <div
      className="rounded-xl border border-navy-700 bg-card p-3 shadow-sm hover:border-accent/40 transition-colors group"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* 컴팩트 헤더 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-xs text-[#a0a3b1]">
          <span className="font-semibold text-accent">세션 {sessionLabel}</span>
          <span className="text-[#7f8297]">조각 {item.chunkIndex + 1}</span>
          <span
            className={`
              inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px]
              border
              ${item.status === 'inserted'
                ? 'bg-green-500/10 text-green-300 border-green-500/30'
                : 'bg-navy-800 text-[#7f8297] border-navy-700'}
            `}
          >
            {item.status === 'inserted' ? '✓ 반영' : '임시'}
          </span>
        </div>

        {/* 액션 버튼 - hover 시에만 표시 */}
        {showActions && !isEditing && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 text-[#a0a3b1] hover:bg-card-hover rounded transition-colors"
              title="편집"
            >
              <Edit className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onInsert}
              className="p-1 text-accent hover:bg-accent/10 rounded transition-colors"
              title="본문에 삽입"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(item.id)}
              className="p-1 text-red-400 hover:bg-red-500/10 rounded transition-colors"
              title="삭제"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 편집 모드 액션 */}
        {isEditing && (
          <div className="flex items-center gap-1">
            <button
              onClick={handleSave}
              className="p-1 text-accent hover:bg-accent/10 rounded transition-colors"
              title="저장"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={handleCancel}
              className="p-1 text-[#a0a3b1] hover:bg-card-hover rounded transition-colors"
              title="취소"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 전사 텍스트 */}
      {isEditing ? (
        <textarea
          value={editedText}
          onChange={(e) => setEditedText(e.target.value)}
          className="w-full min-h-[80px] p-2 text-sm bg-navy-900 text-[#e4e6eb]
            border border-accent rounded-lg resize-y
            focus:outline-none focus:ring-1 focus:ring-accent/50
            placeholder:text-[#7a7d8c]"
          autoFocus
          placeholder="전사 결과를 입력하세요..."
        />
      ) : (
        <>
          <p className="text-sm text-[#e4e6eb] leading-relaxed whitespace-pre-wrap line-clamp-3">
            {displayText}
          </p>

          {/* 더보기/접기 버튼 */}
          {shouldTruncate && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-1 text-xs text-accent hover:text-accent-hover transition-colors"
            >
              {isExpanded ? '접기 ▲' : '더보기 ▼'}
            </button>
          )}
        </>
      )}

      {/* 고급 액션 - 확장 시에만 표시 */}
      {isExpanded && !isEditing && (
        <div className="mt-3 pt-3 border-t border-navy-700 flex items-center gap-2">
          <div className="text-[10px] text-[#7f8297]">
            <span>{formatTimeAgo(item.timestamp)}</span>
            <span> • {formatDuration(item.duration)}</span>
            <span> • {item.wordCount} 단어</span>
          </div>
          <div className="flex-1" />
          {onSplit && (
            <button
              onClick={onSplit}
              className="p-1 text-[#a0a3b1] hover:bg-card-hover rounded transition-colors"
              title="조각 분할"
            >
              <Scissors className="w-3.5 h-3.5" />
            </button>
          )}
          {onMergePrev && (
            <button
              onClick={onMergePrev}
              className="p-1 text-[#a0a3b1] hover:bg-card-hover rounded transition-colors"
              title="이전 조각과 합치기"
            >
              <GitMerge className="w-3.5 h-3.5 rotate-180" />
            </button>
          )}
          {onMergeNext && (
            <button
              onClick={onMergeNext}
              className="p-1 text-[#a0a3b1] hover:bg-card-hover rounded transition-colors"
              title="다음 조각과 합치기"
            >
              <GitMerge className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
