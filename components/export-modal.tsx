"use client";

import { createPortal } from "react-dom";
import { Download, FileText, Link2, X } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  if (!isOpen || typeof document === "undefined") {
    return null;
  }

  const handleExportPdf = () => {
    console.log("Exporting to PDF...");
  };

  const handleCopyLink = () => {
    navigator.clipboard
      .writeText("https://onyu.ai/story/12345")
      .then(() => window.alert("링크가 복사되었습니다!"))
      .catch(() => window.alert("링크 복사에 실패했습니다. 다시 시도해주세요."));
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl border border-[#2BA08C]/30 bg-[#0E1513] p-8 text-[#E6F0ED]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="absolute right-4 top-4 rounded-full border border-white/10 bg-white/5 p-2 text-white/60 transition-colors hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="space-y-6">
          <header>
            <h2 className="text-xl font-semibold text-[#E6F0ED]">이야기 내보내기</h2>
            <p className="mt-2 text-sm text-[#E6F0ED]/60">완성된 이야기를 원하는 형식으로 저장하거나 공유하세요.</p>
          </header>

          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full justify-start bg-[#0F3D35]/40 hover:bg-[#0F3D35]/60"
              onClick={handleExportPdf}
            >
              <Download className="h-5 w-5" />
              <div className="text-left leading-tight">
                <div>PDF로 저장</div>
                <div className="text-xs text-[#E6F0ED]/60">파일로 다운로드</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start bg-[#0F3D35]/40 hover:bg-[#0F3D35]/60"
              onClick={handleCopyLink}
            >
              <Link2 className="h-5 w-5" />
              <div className="text-left leading-tight">
                <div>링크 복사</div>
                <div className="text-xs text-[#E6F0ED]/60">다른 사람과 공유</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start bg-[#0F3D35]/40 hover:bg-[#0F3D35]/60"
              onClick={onClose}
            >
              <FileText className="h-5 w-5" />
              <div className="text-left leading-tight">
                <div>텍스트 파일로 저장</div>
                <div className="text-xs text-[#E6F0ED]/60">.txt 형식</div>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
