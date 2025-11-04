"use client";

import { useState } from "react";
import { ChevronRight, Download, RotateCcw, Share2, Sparkles } from "lucide-react";

import { ChapterCard } from "@/components/chapter-card";
import { ExportModal } from "@/components/export-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StoryData } from "@/types/story";

interface ResultPageProps {
  storyData: StoryData;
  onRegenerate: () => void;
  onNextTopic: () => void;
}

export function ResultPage({ storyData, onRegenerate, onNextTopic }: ResultPageProps) {
  const [isExportModalOpen, setExportModalOpen] = useState(false);

  const handleShare = () => {
    navigator.clipboard
      .writeText("https://onyu.ai/story/12345")
      .then(() => window.alert("링크가 복사되었습니다!"))
      .catch(() => window.alert("링크 복사에 실패했습니다. 다시 시도해주세요."));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F0E] via-[#0D1211] to-[#0E1513] px-6 pb-12 pt-24">
      <div className="mx-auto max-w-5xl">
        <header className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#2BA08C]/30 bg-[#2BA08C]/20 px-4 py-2">
            <Sparkles className="h-4 w-4 text-[#2BA08C]" />
            <span className="text-sm text-[#E6F0ED]/80">이야기가 완성되었습니다</span>
          </div>
          <h1 className="text-3xl text-[#E6F0ED]">{storyData.topic}</h1>
        </header>

        <section className="mb-12 rounded-2xl border border-[#2BA08C]/30 bg-gradient-to-br from-[#0F3D35]/40 to-[#1F6F63]/20 p-8">
          <h2 className="mb-4 text-xl text-[#E6F0ED]">요약</h2>
          <p className="mb-6 text-lg leading-relaxed text-[#E6F0ED]/80">{storyData.summary}</p>
          <div className="flex flex-wrap gap-2">
            {storyData.keywords.map((keyword) => (
              <Badge key={keyword}>{keyword}</Badge>
            ))}
          </div>
        </section>

        <div className="mb-12 flex flex-wrap justify-center gap-4">
          <Button onClick={() => setExportModalOpen(true)}>
            <Download className="h-5 w-5" />
            PDF 저장
          </Button>

          <Button variant="outline" className="bg-[#0F3D35]/40 hover:bg-[#0F3D35]/60" onClick={handleShare}>
            <Share2 className="h-5 w-5" />
            링크 공유
          </Button>

          <Button variant="outline" className="bg-[#0F3D35]/40 hover:bg-[#0F3D35]/60" onClick={onRegenerate}>
            <RotateCcw className="h-5 w-5" />
            다시 생성
          </Button>
        </div>

        <section className="mb-12 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl text-[#E6F0ED]">챕터</h2>
            <span className="text-sm text-[#E6F0ED]/60">총 {storyData.chapters.length}개의 챕터</span>
          </div>

          {storyData.chapters.map((chapter, index) => (
            <ChapterCard
              key={`${chapter.title}-${index}`}
              number={index + 1}
              title={chapter.title}
              content={chapter.content}
            />
          ))}
        </section>

        <section className="rounded-2xl border border-[#2BA08C]/30 bg-gradient-to-br from-[#0F3D35]/40 to-[#1F6F63]/20 p-8 text-center">
          <h3 className="mb-3 text-2xl text-[#E6F0ED]">다음 이야기를 들려주세요</h3>
          <p className="mb-6 text-sm text-[#E6F0ED]/70">또 다른 주제로 당신의 이야기를 이어가보세요.</p>
          <Button onClick={onNextTopic}>
            다음 주제 선택하기
            <ChevronRight className="h-5 w-5" />
          </Button>
        </section>
      </div>

      <ExportModal isOpen={isExportModalOpen} onClose={() => setExportModalOpen(false)} />
    </div>
  );
}
