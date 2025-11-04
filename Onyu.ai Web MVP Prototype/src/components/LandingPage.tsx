import { Mic, BookOpen, Sparkles, Download } from "lucide-react";
import { Button } from "./ui/button";

interface LandingPageProps {
  onStartClick: () => void;
}

export function LandingPage({ onStartClick }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F0E] via-[#0D1211] to-[#0E1513]">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#2BA08C]/10 rounded-full blur-[120px]" />
        
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="mb-6 flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1F6F63]/20 border border-[#2BA08C]/30">
              <Sparkles className="w-4 h-4 text-[#2BA08C]" />
              <span className="text-[#E6F0ED]/80">AI가 엮어주는 당신의 이야기</span>
            </div>
          </div>
          
          <h1 className="text-[#E6F0ED] mb-6" style={{ fontSize: '3.5rem', lineHeight: '1.2', fontWeight: '600' }}>
            당신의 목소리가<br />한 편의 이야기로.
          </h1>
          
          <p className="text-[#E6F0ED]/70 mb-12 max-w-2xl mx-auto" style={{ fontSize: '1.25rem', lineHeight: '1.6' }}>
            온유는 당신의 이야기를 챕터로 엮어드립니다.<br />
            말로 전하는 이야기를, 글로 남겨보세요.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={onStartClick}
              className="bg-gradient-to-r from-[#2BA08C] to-[#1F6F63] hover:shadow-[0_0_30px_rgba(43,160,140,0.3)] transition-all duration-300 text-white px-8 py-6 rounded-xl"
            >
              <Mic className="w-5 h-5 mr-2" />
              지금 시작하기
            </Button>
            <Button 
              variant="outline" 
              className="border-[#2BA08C]/50 text-[#E6F0ED] hover:bg-[#2BA08C]/10 px-8 py-6 rounded-xl"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              예시 보기
            </Button>
          </div>
        </div>
        
        {/* Waveform illustration */}
        <div className="mt-20 relative max-w-5xl mx-auto">
          <div className="rounded-2xl overflow-hidden border border-[#2BA08C]/20 shadow-[0_0_50px_rgba(43,160,140,0.15)]">
            <img 
              src="https://images.unsplash.com/photo-1660914256311-918659fae88f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdWRpbyUyMHdhdmVmb3JtJTIwZGFya3xlbnwxfHx8fDE3NjIyMjIxMjN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Audio waveform"
              className="w-full h-[300px] object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0E1513] via-transparent to-transparent" />
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-[#E6F0ED] text-center mb-16" style={{ fontSize: '2.5rem' }}>
            어떻게 작동하나요?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-[#0F3D35]/20 border border-[#2BA08C]/20 hover:border-[#2BA08C]/40 transition-colors">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2BA08C] to-[#1F6F63] flex items-center justify-center mb-6">
                <Mic className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-[#E6F0ED] mb-4">1. 이야기를 들려주세요</h3>
              <p className="text-[#E6F0ED]/70">
                주제를 선택하고 자유롭게 이야기를 녹음하세요. 어린 시절, 직장 생활, 가족 이야기 등 원하는 주제를 선택할 수 있습니다.
              </p>
            </div>
            
            <div className="p-8 rounded-2xl bg-[#0F3D35]/20 border border-[#2BA08C]/20 hover:border-[#2BA08C]/40 transition-colors">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2BA08C] to-[#1F6F63] flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-[#E6F0ED] mb-4">2. AI가 정리해드려요</h3>
              <p className="text-[#E6F0ED]/70">
                음성을 텍스트로 변환하고, 핵심을 추출해 아름다운 문장으로 다듬어드립니다. 자동으로 챕터가 만들어집니다.
              </p>
            </div>
            
            <div className="p-8 rounded-2xl bg-[#0F3D35]/20 border border-[#2BA08C]/20 hover:border-[#2BA08C]/40 transition-colors">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2BA08C] to-[#1F6F63] flex items-center justify-center mb-6">
                <Download className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-[#E6F0ED] mb-4">3. 저장하고 공유하세요</h3>
              <p className="text-[#E6F0ED]/70">
                완성된 이야기를 PDF로 저장하거나 링크로 공유할 수 있습니다. 소중한 기억을 간직하세요.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 rounded-3xl bg-gradient-to-br from-[#0F3D35]/40 to-[#1F6F63]/20 border border-[#2BA08C]/30">
            <h2 className="text-[#E6F0ED] mb-6" style={{ fontSize: '2.5rem' }}>
              지금 바로 시작해보세요
            </h2>
            <p className="text-[#E6F0ED]/70 mb-8" style={{ fontSize: '1.125rem' }}>
              당신의 첫 이야기를 온유와 함께 만들어보세요.
            </p>
            <Button 
              onClick={onStartClick}
              className="bg-gradient-to-r from-[#2BA08C] to-[#1F6F63] hover:shadow-[0_0_30px_rgba(43,160,140,0.4)] transition-all duration-300 text-white px-10 py-6 rounded-xl"
            >
              <Mic className="w-5 h-5 mr-2" />
              무료로 시작하기
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
