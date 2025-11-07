'use client';

import { List, Mic } from 'lucide-react';

interface CollapsedPanelProps {
  type: 'left' | 'right';
}

export function CollapsedPanel({ type }: CollapsedPanelProps) {
  const isLeft = type === 'left';

  return (
    <div
      className={`
        h-full w-16 flex flex-col items-center justify-center gap-4 py-4
        bg-navy-900 transition-all
        ${isLeft ? 'border-r border-navy-700' : 'border-l border-navy-700'}
      `}
    >
      {/* 아이콘 */}
      <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
        {isLeft ? (
          <List className="w-5 h-5 text-accent" />
        ) : (
          <Mic className="w-5 h-5 text-accent" />
        )}
      </div>

      {/* 세로 텍스트 */}
      <div
        className="text-xs text-[#a0a3b1] whitespace-nowrap"
        style={{
          writingMode: 'vertical-rl',
          textOrientation: 'mixed'
        }}
      >
        {isLeft ? '섹션 목록' : '녹음'}
      </div>
    </div>
  );
}
