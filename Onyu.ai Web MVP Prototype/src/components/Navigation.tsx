import { Mic2 } from "lucide-react";

export function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0B0F0E]/80 backdrop-blur-md border-b border-[#1F6F63]/20">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#2BA08C] to-[#1F6F63] flex items-center justify-center">
            <Mic2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-[#E6F0ED] tracking-tight" style={{ fontSize: '1.25rem' }}>Onyu.ai</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <a href="#" className="text-[#E6F0ED]/70 hover:text-[#2BA08C] transition-colors">소개</a>
          <a href="#" className="text-[#E6F0ED]/70 hover:text-[#2BA08C] transition-colors">예시</a>
          <a href="#" className="text-[#E6F0ED]/70 hover:text-[#2BA08C] transition-colors">가이드</a>
        </div>
      </div>
    </nav>
  );
}
