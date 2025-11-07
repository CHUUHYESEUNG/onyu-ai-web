"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import type { TimelineEvent } from "@/types/edit";
import { Button } from "@/components/ui/button";

export interface SectionInputState {
  title: string;
  excerpt: string;
  content: string;
  eventId: string;
}

interface AddSectionModalProps {
  mode: "text" | "voice" | "file";
  events: TimelineEvent[];
  form: SectionInputState;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onFormChange: Dispatch<SetStateAction<SectionInputState>>;
  onSubmit: () => Promise<void>;
}

export function AddSectionModal({
  mode,
  events,
  form,
  isOpen,
  isLoading,
  onClose,
  onFormChange,
  onSubmit,
}: AddSectionModalProps) {
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) {
    return null;
  }

  const handleClose = () => {
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!form.eventId) {
      setError("대주제를 선택해주세요.");
      return;
    }
    if (!form.title.trim()) {
      setError("소주제 제목을 입력해주세요.");
      return;
    }
    await onSubmit();
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative z-10 w-full max-w-lg rounded-2xl border border-accent/30 bg-card p-6 shadow-2xl shadow-black/50">
        <h2 className="text-xl font-semibold text-[#e4e6eb]">새로운 소주제 추가</h2>
        <p className="mt-1 text-sm text-[#a0a3b1]">대주제 안에 세부 이야기를 추가하고 바로 편집할 수 있습니다.</p>
        <div className="mt-6 space-y-4">
          <label className="space-y-2 text-sm text-[#a0a3b1]">
            대주제 선택
            <select
              value={form.eventId}
              onChange={(e) => {
                onFormChange((prev) => ({ ...prev, eventId: e.target.value }));
                setError(null);
              }}
              className="w-full rounded-lg border border-navy-700 bg-navy-900 px-4 py-2 text-[#e4e6eb] focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50"
            >
              <option value="" disabled>
                대주제를 선택하세요
              </option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 text-sm text-[#a0a3b1]">
            소주제 제목
            <input
              type="text"
              value={form.title}
              onChange={(e) => {
                onFormChange((prev) => ({ ...prev, title: e.target.value }));
                setError(null);
              }}
              className="w-full rounded-lg border border-navy-700 bg-navy-900 px-4 py-2 text-[#e4e6eb] placeholder:text-[#7a7d8c] focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50"
              placeholder="예: 첫 출근 날의 기억"
            />
          </label>

          {mode === "text" ? (
            <>
              <label className="space-y-2 text-sm text-[#a0a3b1]">
                요약 (선택)
                <input
                  type="text"
                  value={form.excerpt}
                  onChange={(e) => onFormChange((prev) => ({ ...prev, excerpt: e.target.value }))}
                  className="w-full rounded-lg border border-navy-700 bg-navy-900 px-4 py-2 text-[#e4e6eb] placeholder:text-[#7a7d8c] focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50"
                  placeholder="한두 문장으로 요약을 남겨보세요."
                />
              </label>

              <label className="space-y-2 text-sm text-[#a0a3b1]">
                본문 메모 (선택)
                <textarea
                  rows={4}
                  value={form.content}
                  onChange={(e) => onFormChange((prev) => ({ ...prev, content: e.target.value }))}
                  className="w-full rounded-lg border border-navy-700 bg-navy-900 px-4 py-2 text-[#e4e6eb] placeholder:text-[#7a7d8c] focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/50"
                  placeholder="기억하고 싶은 내용이나 추가하고 싶은 문장을 적어두세요."
                />
              </label>
            </>
          ) : (
            <div className="rounded-xl border border-navy-700 bg-navy-900 p-4 text-xs text-[#a0a3b1]">
              <p className="mb-2">
                {mode === "voice"
                  ? "녹음 패널에서 음성을 녹음하면 자동으로 소단락이 생성됩니다."
                  : "파일을 업로드하면 전사/요약 후 소단락이 생성됩니다."}
              </p>
              <p>생성된 소단락은 우측 패널에서 확인하고 편집할 수 있습니다.</p>
            </div>
          )}

          {error && <p className="text-sm text-red-400">{error}</p>}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose} className="border-navy-700 text-[#e4e6eb] hover:bg-card">
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "생성 중..." : "소주제 추가"}
          </Button>
        </div>
      </div>
    </div>
  );
}
