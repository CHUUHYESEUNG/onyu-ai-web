"use client";

import { BookOpen } from "lucide-react";

interface ChapterCardProps {
  number: number;
  title: string;
  content: string;
}

export function ChapterCard({ number, title, content }: ChapterCardProps) {
  return (
    <article className="group rounded-xl border border-[#2BA08C]/20 bg-[#0F3D35]/20 p-6 transition-all hover:border-[#2BA08C]/40">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#2BA08C] to-[#1F6F63] transition-all group-hover:shadow-[0_0_20px_rgba(43,160,140,0.3)]">
          <BookOpen className="h-5 w-5 text-white" />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-sm uppercase tracking-wide text-[#2BA08C]/70">Chapter {number}</span>
            <h3 className="text-lg text-[#E6F0ED]">{title}</h3>
          </div>
          <p className="text-sm leading-relaxed text-[#E6F0ED]/70">{content}</p>
        </div>
      </div>
    </article>
  );
}
