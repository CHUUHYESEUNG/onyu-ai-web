import { Download, Link2, FileText, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const handleExportPDF = () => {
    // Mock PDF export
    console.log('Exporting to PDF...');
  };

  const handleCopyLink = () => {
    // Mock link copy
    navigator.clipboard.writeText('https://onyu.ai/story/12345');
    alert('링크가 복사되었습니다!');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0E1513] border-[#2BA08C]/30 text-[#E6F0ED] max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#E6F0ED]">이야기 내보내기</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <Button
            onClick={handleExportPDF}
            className="w-full justify-start bg-[#0F3D35]/40 hover:bg-[#0F3D35]/60 border border-[#2BA08C]/20 text-[#E6F0ED]"
            variant="outline"
          >
            <Download className="w-5 h-5 mr-3" />
            <div className="text-left">
              <div>PDF로 저장</div>
              <div className="text-[#E6F0ED]/60">파일로 다운로드</div>
            </div>
          </Button>
          
          <Button
            onClick={handleCopyLink}
            className="w-full justify-start bg-[#0F3D35]/40 hover:bg-[#0F3D35]/60 border border-[#2BA08C]/20 text-[#E6F0ED]"
            variant="outline"
          >
            <Link2 className="w-5 h-5 mr-3" />
            <div className="text-left">
              <div>링크 복사</div>
              <div className="text-[#E6F0ED]/60">다른 사람과 공유</div>
            </div>
          </Button>
          
          <Button
            onClick={onClose}
            className="w-full justify-start bg-[#0F3D35]/40 hover:bg-[#0F3D35]/60 border border-[#2BA08C]/20 text-[#E6F0ED]"
            variant="outline"
          >
            <FileText className="w-5 h-5 mr-3" />
            <div className="text-left">
              <div>텍스트 파일로 저장</div>
              <div className="text-[#E6F0ED]/60">.txt 형식</div>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
