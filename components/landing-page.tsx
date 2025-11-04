"use client";

import Image from "next/image";
import { BookOpen, Download, Mic, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

interface LandingPageProps {
  onStartClick: () => void;
}

export function LandingPage({ onStartClick }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F0E] via-[#0D1211] to-[#0E1513]">
      <section id="overview" className="relative overflow-hidden px-6 pt-32 pb-20">
        <div className="absolute left-1/2 top-0 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-[#2BA08C]/10 blur-[120px]" />

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#2BA08C]/30 bg-[#1F6F63]/20 px-4 py-2">
              <Sparkles className="h-4 w-4 text-[#2BA08C]" />
              <span className="text-sm text-[#E6F0ED]/80">AI가 엮어주는 당신의 이야기</span>
            </div>
          </div>

          <h1 className="mb-6 text-5xl font-semibold leading-snug text-[#E6F0ED]">
            당신의 목소리가
            <br />
            한 편의 이야기로.
          </h1>

          <p className="mx-auto mb-12 max-w-2xl text-xl leading-relaxed text-[#E6F0ED]/70">
            온유는 당신의 이야기를 챕터로 엮어드립니다.
            <br />
            말로 전하는 이야기를, 글로 남겨보세요.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button className="px-8 py-6" size="lg" onClick={onStartClick}>
              <Mic className="h-5 w-5" />
              지금 시작하기
            </Button>

            <Button
              variant="outline"
              className="px-8 py-6 hover:shadow-[0_0_30px_rgba(43,160,140,0.25)]"
              size="lg"
            >
              <BookOpen className="h-5 w-5" />
              예시 보기
            </Button>
          </div>
        </div>

        <div className="relative mx-auto mt-20 max-w-5xl">
          <div className="relative h-[300px] overflow-hidden rounded-2xl border border-[#2BA08C]/20 shadow-[0_0_50px_rgba(43,160,140,0.15)]">
            <Image
              src="https://images.unsplash.com/photo-1660914256311-918659fae88f?auto=format&fit=crop&w=1200&q=80"
              alt="Audio waveform illustration"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 960px"
              className="object-cover opacity-70"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0E1513] via-transparent to-transparent" />
          </div>
        </div>
      </section>

      <section id="features" className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-16 text-center text-3xl text-[#E6F0ED]">어떻게 작동하나요?</h2>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <FeatureCard
              icon={<Mic className="h-6 w-6 text-white" />}
              title="1. 이야기를 들려주세요"
              description="주제를 선택하고 자유롭게 이야기를 녹음하세요. 어린 시절, 직장 생활, 가족 이야기 등 원하는 주제를 선택할 수 있습니다."
            />
            <FeatureCard
              icon={<Sparkles className="h-6 w-6 text-white" />}
              title="2. AI가 정리해드려요"
              description="음성을 텍스트로 변환하고, 핵심을 추출해 아름다운 문장으로 다듬어드립니다. 자동으로 챕터가 만들어집니다."
            />
            <FeatureCard
              icon={<Download className="h-6 w-6 text-white" />}
              title="3. 저장하고 공유하세요"
              description="완성된 이야기를 PDF로 저장하거나 링크로 공유할 수 있습니다. 소중한 기억을 간직하세요."
            />
          </div>
        </div>
      </section>

      <section id="guide" className="px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <div className="rounded-3xl border border-[#2BA08C]/30 bg-gradient-to-br from-[#0F3D35]/40 to-[#1F6F63]/20 p-12">
            <h2 className="mb-6 text-3xl text-[#E6F0ED]">지금 바로 시작해보세요</h2>
            <p className="mb-8 text-lg text-[#E6F0ED]/70">당신의 첫 이야기를 온유와 함께 만들어보세요.</p>
            <Button className="px-10 py-6" size="lg" onClick={onStartClick}>
              <Mic className="h-5 w-5" />
              무료로 시작하기
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="rounded-2xl border border-[#2BA08C]/20 bg-[#0F3D35]/20 p-8 transition-colors hover:border-[#2BA08C]/40">
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#2BA08C] to-[#1F6F63]">
        {icon}
      </div>
      <h3 className="mb-4 text-lg text-[#E6F0ED]">{title}</h3>
      <p className="text-sm leading-relaxed text-[#E6F0ED]/70">{description}</p>
    </div>
  );
}
