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

  return (
    <div className="rounded-xl border border-navy-700 bg-card p-3 shadow-sm hover:border-accent/40 transition-colors">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex flex-col gap-1 text-xs text-[#a0a3b1]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-accent">세션 {sessionLabel}</span>
            <span>조각 {item.chunkIndex + 1}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#7f8297]">
            <span>{formatTimeAgo(item.timestamp)}</span>
            <span>• {formatDuration(item.duration)}</span>
            <span>• {item.wordCount} 단어</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {isEditing ? (
            <>
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
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 text-[#a0a3b1] hover:bg-card-hover rounded transition-colors"
                title="편집"
              >
                <Edit className="w-4 h-4" />
              </button>
              {onSplit && (
                <button
                  onClick={onSplit}
                  className="p-1 text-[#a0a3b1] hover:bg-card-hover rounded transition-colors"
                  title="조각 분할"
                >
                  <Scissors className="w-4 h-4" />
                </button>
              )}
              {onMergePrev && (
                <button
                  onClick={onMergePrev}
                  className="p-1 text-[#a0a3b1] hover:bg-card-hover rounded transition-colors"
                  title="이전 조각과 합치기"
                >
                  <GitMerge className="w-4 h-4 rotate-180" />
                </button>
              )}
              {onMergeNext && (
                <button
                  onClick={onMergeNext}
                  className="p-1 text-[#a0a3b1] hover:bg-card-hover rounded transition-colors"
                  title="다음 조각과 합치기"
                >
                  <GitMerge className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onInsert}
                className="p-1 text-accent hover:bg-accent/10 rounded transition-colors"
                title="본문에 삽입"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="p-1 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                title="삭제"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
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
        <p className="text-sm text-[#e4e6eb] leading-relaxed whitespace-pre-wrap">
          {item.transcript}
        </p>
      )}

      {/* 상태 */}
      {!isEditing && (
        <div className="mt-2 flex items-center gap-2 text-[11px]">
          <span
            className={`
              inline-flex items-center gap-1 rounded-full px-2 py-0.5
              border
              ${item.status === 'inserted'
                ? 'bg-green-500/10 text-green-300 border-green-500/30'
                : 'bg-navy-800 text-[#c0c3d7] border-navy-700'}
            `}
          >
            <CheckCircle className="w-3 h-3" />
            {item.status === 'inserted' ? '본문 반영됨' : '임시 조각'}
          </span>
          <span className="text-[#6d7083]">#{index + 1}</span>
        </div>
      )}
    </div>
  );
}
