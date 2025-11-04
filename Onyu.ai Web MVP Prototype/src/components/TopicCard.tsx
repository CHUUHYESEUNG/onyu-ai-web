import { LucideIcon } from "lucide-react";

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
      onClick={onClick}
      className={`w-full p-6 rounded-xl text-left transition-all duration-300 ${
        isSelected 
          ? 'bg-gradient-to-br from-[#2BA08C]/30 to-[#1F6F63]/20 border-2 border-[#2BA08C] shadow-[0_0_20px_rgba(43,160,140,0.3)]' 
          : 'bg-[#0F3D35]/20 border border-[#2BA08C]/20 hover:border-[#2BA08C]/40 hover:bg-[#0F3D35]/30'
      }`}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${
        isSelected ? 'bg-[#2BA08C]' : 'bg-[#1F6F63]/50'
      }`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h3 className="text-[#E6F0ED] mb-2">{title}</h3>
      <p className="text-[#E6F0ED]/60">{description}</p>
    </button>
  );
}
