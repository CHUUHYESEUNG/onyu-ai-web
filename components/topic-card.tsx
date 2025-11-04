"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TopicCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
}

export function TopicCard({ icon: Icon, title, description, isSelected, onClick }: TopicCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-xl border p-6 text-left transition-all duration-300",
        isSelected
          ? "border-[#2BA08C] bg-gradient-to-br from-[#2BA08C]/30 to-[#1F6F63]/20 shadow-[0_0_24px_rgba(43,160,140,0.35)]"
          : "border-[#2BA08C]/20 bg-[#0F3D35]/20 hover:border-[#2BA08C]/40 hover:bg-[#0F3D35]/30",
      )}
    >
      <div
        className={cn(
          "mb-4 flex h-10 w-10 items-center justify-center rounded-lg",
          isSelected ? "bg-[#2BA08C]" : "bg-[#1F6F63]/50",
        )}
      >
        <Icon className="h-5 w-5 text-white" />
      </div>
      <h3 className="mb-2 text-[#E6F0ED]">{title}</h3>
      <p className="text-sm text-[#E6F0ED]/70">{description}</p>
    </button>
  );
}
