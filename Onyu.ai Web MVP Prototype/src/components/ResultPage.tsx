import { useState } from "react";
import { Download, Share2, RotateCcw, ChevronRight, Sparkles } from "lucide-react";
import { StoryData } from "./EditorPage";
import { ChapterCard } from "./ChapterCard";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ExportModal } from "./ExportModal";

interface ResultPageProps {
  storyData: StoryData;
  onRegenerate: () => void;
  onNextTopic: () => void;
}

export function ResultPage({ storyData, onRegenerate, onNextTopic }: ResultPageProps) {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F0E] via-[#0D1211] to-[#0E1513] pt-24 pb-12 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2BA08C]/20 border border-[#2BA08C]/30 mb-4">
            <Sparkles className="w-4 h-4 text-[#2BA08C]" />
            <span className="text-[#E6F0ED]/80">이야기가 완성되었습니다</span>
          </div>
          <h1 className="text-[#E6F0ED] mb-4" style={{ fontSize: '2.5rem' }}>
            {storyData.topic}
          </h1>
        </div>
        
        {/* Summary Section */}
        <div className="mb-12 p-8 rounded-2xl bg-gradient-to-br from-[#0F3D35]/40 to-[#1F6F63]/20 border border-[#2BA08C]/30">
          <h2 className="text-[#E6F0ED] mb-4">요약</h2>
          <p className="text-[#E6F0ED]/80 leading-relaxed mb-6" style={{ fontSize: '1.125rem' }}>
            {storyData.summary}
          </p>
          
          <div className="flex flex-wrap gap-2">
            {storyData.keywords.map((keyword, index) => (
              <Badge 
                key={index}
                className="bg-[#2BA08C]/20 text-[#2BA08C] border-[#2BA08C]/30 hover:bg-[#2BA08C]/30"
              >
                {keyword}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-12 justify-center">
          <Button
            onClick={() => setIsExportModalOpen(true)}
            className="bg-gradient-to-r from-[#2BA08C] to-[#1F6F63] hover:shadow-[0_0_30px_rgba(43,160,140,0.3)] text-white"
          >
            <Download className="w-5 h-5 mr-2" />
            PDF 저장
          </Button>
          
          <Button
            onClick={() => {
              navigator.clipboard.writeText('https://onyu.ai/story/12345');
              alert('링크가 복사되었습니다!');
            }}
            className="bg-[#0F3D35]/40 border border-[#2BA08C]/30 text-[#E6F0ED] hover:bg-[#0F3D35]/60"
            variant="outline"
          >
            <Share2 className="w-5 h-5 mr-2" />
            링크 공유
          </Button>
          
          <Button
            onClick={onRegenerate}
            className="bg-[#0F3D35]/40 border border-[#2BA08C]/30 text-[#E6F0ED] hover:bg-[#0F3D35]/60"
            variant="outline"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            다시 생성
          </Button>
        </div>
        
        {/* Chapters Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[#E6F0ED]" style={{ fontSize: '2rem' }}>챕터</h2>
            <span className="text-[#E6F0ED]/60">
              총 {storyData.chapters.length}개의 챕터
            </span>
          </div>
          
          <div className="space-y-6">
            {storyData.chapters.map((chapter, index) => (
              <ChapterCard
                key={index}
                number={index + 1}
                title={chapter.title}
                content={chapter.content}
              />
            ))}
          </div>
        </div>
        
        {/* Next Topic CTA */}
        <div className="p-8 rounded-2xl bg-gradient-to-br from-[#0F3D35]/40 to-[#1F6F63]/20 border border-[#2BA08C]/30 text-center">
          <h3 className="text-[#E6F0ED] mb-3" style={{ fontSize: '1.5rem' }}>
            다음 이야기를 들려주세요
          </h3>
          <p className="text-[#E6F0ED]/70 mb-6">
            또 다른 주제로 당신의 이야기를 이어가보세요.
          </p>
          <Button
            onClick={onNextTopic}
            className="bg-gradient-to-r from-[#2BA08C] to-[#1F6F63] hover:shadow-[0_0_30px_rgba(43,160,140,0.3)] text-white"
          >
            다음 주제 선택하기
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
      
      <ExportModal 
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
    </div>
  );
}
