import { BookOpen } from "lucide-react";

interface ChapterCardProps {
  number: number;
  title: string;
  content: string;
}

export function ChapterCard({ number, title, content }: ChapterCardProps) {
  return (
    <div className="p-6 rounded-xl bg-[#0F3D35]/20 border border-[#2BA08C]/20 hover:border-[#2BA08C]/40 transition-all group">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-[#2BA08C] to-[#1F6F63] flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(43,160,140,0.3)] transition-all">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[#2BA08C] opacity-60">Chapter {number}</span>
          </div>
          <h3 className="text-[#E6F0ED] mb-3">{title}</h3>
          <p className="text-[#E6F0ED]/70 leading-relaxed">
            {content}
          </p>
        </div>
      </div>
    </div>
  );
}
