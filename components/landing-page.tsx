"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import {
  Mic,
  Sparkles,
  BookOpen,
  ShieldCheck,
  Zap,
  Workflow,
  CheckCircle2,
  ArrowRight,
  Quote,
} from "lucide-react";
import Lottie from 'lottie-react';

const TRUST_METRICS = [
  { label: "전자책/실물책 동시 제작", detail: "원클릭 워크플로우", icon: ShieldCheck },
  { label: "48시간 내 첫 PDF", detail: "AI 편집 자동화", icon: Zap },
  { label: "5인 협업 초대", detail: "가족/에디터 초대", icon: Workflow },
];

const FEATURE_BLOCKS = [
  {
    title: "AI가 질문부터 초안까지 생성",
    subtitle: "인터뷰 설계",
    bullets: ["세대·관계별 질문 추천", "녹음 가이드와 일정 관리", "실시간 전사 + 요약"],
    image: "/capture/5.png",
  },
  {
    title: "글 편집과 출판을 한 곳에서",
    subtitle: "편집 · 출판",
    bullets: ["타임라인 기반 섹션 편집", "PDF · 실물 · 오디오북 변환", "브랜드 커버 템플릿 제공"],
    image: "/capture/3.png",
    reverse: true,
  },
];

const TESTIMONIALS = [
  {
    quote: "부모님 목소리를 그대로 담아 손주에게 전달할 수 있었어요. 질문과 편집을 온유가 도와줘서 생각보다 금방 완성했습니다.",
    name: "김지연",
    role: "가족 프로젝트 리더",
  },
  {
    quote: "에디터로 참여했는데, 브라우저에서 바로 협업이 가능해 제작 공수가 크게 줄었습니다.",
    name: "박도현",
    role: "프리랜서 에디터",
  },
  {
    quote: "한 번의 인터뷰로 PDF, 실물, 오디오북까지 의뢰할 수 있는 점이 결정적이었어요.",
    name: "손민수",
    role: "기업 HR 팀",
  },
];

export function LandingPage() {
  const router = useRouter();
  const [showLoading, setShowLoading] = useState(false);

  const handleStartProject = () => {
    if (showLoading) return;
    setShowLoading(true);
    setTimeout(() => {
      router.push("/projects/new");
    }, 2000);
  };

  return (
    <div className="bg-white text-[#0C1523]">
      <Script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js" strategy="afterInteractive" />
      {showLoading && (
        <div className="fixed inset-0 z-[2000] flex flex-col items-center justify-center bg-white/90 backdrop-blur">
          {/* <lottie-player
            autoplay
            loop
            mode="normal"
            src="/lottie/book_blue.json"
            style={{ width: "280px", height: "280px" }}
          /> */}
          <p className="mt-6 text-sm font-semibold text-[#1E5EFF]">AI가 프로젝트 환경을 준비하고 있습니다...</p>
        </div>
      )}
      <HeroSection onStartProject={handleStartProject} />
      <TrustSection />
      {FEATURE_BLOCKS.map((block) => (
        <FeatureSection key={block.title} {...block} />
      ))}
      <SolutionsSection />
      <FeatureTabsSection />
      <TestimonialSection />
      <BottomCTA />
    </div>
  );
}

function HeroSection({ onStartProject }: { onStartProject: () => void }) {
  return (
    <section className="relative overflow-hidden px-6 pt-32 pb-24">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#F4F6FB_0%,#FFFFFF_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(30,94,255,0.08),_transparent_60%)]" aria-hidden />
      <div className="relative mx-auto flex max-w-5xl flex-col items-center text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#E6EDFF] px-4 py-2 text-xs font-semibold text-[#4A6CF7]">
          <Sparkles className="h-4 w-4" /> AI로 쉽게 자서전 만들기
        </div>
        <h1 className="text-4xl font-bold text-[#0C1523] sm:text-5xl">
          목소리만 녹음하면 <span className="text-[#1E5EFF]">AI 온유</span>가
          <br /> 자서전 제작을 끝까지 돕습니다.
        </h1>
        <p className="mt-6 max-w-3xl text-lg text-[#5C6476]">
          인터뷰 질문 설계부터 전사·편집·출판까지 한 번의 흐름으로 제공하는 온유 AI.<br />
          개인, 가족, 기업 인터뷰를 빠르게 기록하고
          멀티 포맷으로 남겨보세요.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button
            onClick={onStartProject}
            className="flex items-center gap-2 rounded-full bg-[#1E5EFF] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(30,94,255,0.35)]"
          >
            <Mic className="h-4 w-4" /> 무료로 자서전 시작하기
          </button>
          <Link
            href="/projects"
            className="flex items-center gap-2 rounded-full border border-[#D2D9EF] px-6 py-3 text-sm font-semibold text-[#1E5EFF]"
          >
            <BookOpen className="h-4 w-4" /> 제품 데모 보기
          </Link>
        </div>
        <div className="relative mt-16 w-full max-w-4xl rounded-[32px] border border-[#E5E9F5] bg-white p-4 shadow-[0_20px_80px_rgba(20,36,79,0.08)]">
          <Image src="/capture/5.png" alt="Onyu dashboard" width={1280} height={720} className="w-full rounded-[24px] border border-[#E5E9F5]" />
        </div>
      </div>
    </section>
  );
}

function TrustSection() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-5xl rounded-3xl border border-[#E5E9F5] bg-white px-8 py-6 shadow-sm">
        <p className="text-center text-sm font-semibold text-[#1E5EFF]">전국 120+ 가족 · 기업 팀이 온유를 이용 중</p>
        <div className="mt-6 grid gap-6 text-center text-sm text-[#5C6476] md:grid-cols-3">
          {TRUST_METRICS.map(({ label, detail, icon: Icon }) => (
            <div key={label} className="space-y-2">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#E6EDFF]">
                <Icon className="h-5 w-5 text-[#1E5EFF]" />
              </div>
              <p className="text-lg font-semibold text-[#0C1523]">{label}</p>
              <p>{detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

type FeatureSectionProps = {
  title: string;
  subtitle: string;
  bullets: string[];
  image: string;
  reverse?: boolean;
};

function FeatureSection({ title, subtitle, bullets, image, reverse }: FeatureSectionProps) {
  return (
    <section className="px-6 py-16">
      <div className={`mx-auto flex max-w-5xl flex-col gap-10 ${reverse ? "lg:flex-row-reverse" : "lg:flex-row"}`}>
        <div className="flex-1 space-y-4">
          <p className="text-sm font-semibold text-[#1E5EFF]">{subtitle}</p>
          <h3 className="text-3xl font-bold text-[#0C1523]">{title}</h3>
          <ul className="space-y-3 text-sm text-[#5C6476]">
            {bullets.map((bullet) => (
              <li key={bullet} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#1E5EFF]" /> {bullet}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex-1">
          <div className="rounded-[32px] border border-[#E5E9F5] bg-white p-4 shadow-[0_20px_80px_rgba(20,36,79,0.08)]">
            <Image src={image} alt={title} width={1200} height={760} className="w-full rounded-[24px] border border-[#E5E9F5]" />
          </div>
        </div>
      </div>
    </section>
  );
}

function SolutionsSection() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-5xl rounded-3xl border border-[#E5E9F5] bg-[#F7F9FD] px-8 py-10">
        <div className="grid gap-6 md:grid-cols-3">
          <SolutionCard
            icon={<ShieldCheck className="h-6 w-6 text-[#1E5EFF]" />}
            title="보안형 음성 보관"
            description="Supabase 기반 저장소로 음성·텍스트를 안전하게 보관"
          />
          <SolutionCard
            icon={<Zap className="h-6 w-6 text-[#1E5EFF]" />}
            title="48시간 출판"
            description="AI 편집 워크플로우로 48시간 내 PDF·ePub 초안을 전달"
          />
          <SolutionCard
            icon={<Workflow className="h-6 w-6 text-[#1E5EFF]" />}
            title="워크플로우 자동화"
            description="녹음 → 전사 → 섹션 생성 → 출판 의뢰까지 자동 연결"
          />
        </div>
      </div>
    </section>
  );
}

interface SolutionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function SolutionCard({ icon, title, description }: SolutionCardProps) {
  return (
    <div className="rounded-[24px] border border-white/60 bg-white p-6 shadow-sm">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#E6EDFF]">{icon}</div>
      <p className="text-lg font-semibold text-[#0C1523]">{title}</p>
      <p className="mt-2 text-sm text-[#5C6476]">{description}</p>
    </div>
  );
}

const FEATURE_TABS = [
  {
    name: "AI Interview",
    description: "세대/관계별 질문 템플릿과 타임라인 가이드를 제공해 누구나 쉽게 인터뷰를 진행할 수 있습니다.",
    image: "/thumbnail.png",
    bullets: ["연령대별 질문 120+ 문항", "프로젝트별 스크립트 자동 생성", "알림과 일정 자동화"],
  },
  {
    name: "Voice Workspace",
    description: "웹에서 바로 녹음하고 실시간 전사·요약을 받을 수 있어, 말만 하면 초안이 탄생합니다.",
    image: "/capture/2.png",
    bullets: ["실시간 전사 + 키워드 추출", "소단락 자동 분할", "노이즈 제거 및 음질 보정"],
  },
  {
    name: "Editing Studio",
    description: "타임라인 기반의 에디터로 각 챕터를 정리하고, 가족·에디터와 동시에 협업할 수 있습니다.",
    image: "/capture/3.png",
    bullets: ["드래그 앤 드롭 섹션 편집", "자동 요약 카드", "협업자 코멘트"],
  },
  {
    name: "Publishing Center",
    description: "PDF, 실물 하드커버, 오디오북까지 한 화면에서 의뢰하고 진행 상황을 추적합니다.",
    image: "/capture/4.png",
    bullets: ["커버/내지 템플릿", "제작 진행 알림", "샘플 미리보기"],
  },
];

function FeatureTabsSection() {
  const [activeTab, setActiveTab] = useState(0);
  const current = FEATURE_TABS[activeTab];

  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-5xl rounded-3xl border border-[#E5E9F5] bg-white p-10 shadow-sm">
        <div className="flex flex-wrap justify-center gap-4">
          {FEATURE_TABS.map((tab, idx) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(idx)}
              className={`rounded-full border px-5 py-2 text-sm font-semibold ${idx === activeTab ? "border-[#1E5EFF] bg-[#E6EDFF] text-[#1E5EFF]" : "border-[#E5E9F5] text-[#5C6476]"}`}
            >
              {tab.name}
            </button>
          ))}
        </div>
        <div className="mt-10 flex flex-col gap-10 lg:flex-row">
          <div className="flex-1 space-y-4">
            <h3 className="text-3xl font-bold text-[#0C1523]">{current.name}</h3>
            <p className="text-sm text-[#5C6476]">{current.description}</p>
            <ul className="space-y-3 text-sm text-[#5C6476]">
              {current.bullets.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#1E5EFF]" /> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1">
            <div className="rounded-[24px] border border-[#E5E9F5] bg-white p-4 shadow-[0_10px_40px_rgba(20,36,79,0.08)]">
              <Image src={current.image} alt={current.name} width={1200} height={760} className="w-full rounded-[16px] border border-[#E5E9F5]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialSection() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-5xl rounded-3xl border border-[#E5E9F5] bg-white p-10 shadow-sm">
        <p className="text-center text-sm font-semibold text-[#1E5EFF]">실제 사용 후기</p>
        <h3 className="mt-2 text-center text-3xl font-bold text-[#0C1523]">온유로 자서전을 완성한 사람들의 이야기</h3>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((item) => (
            <div key={item.name} className="rounded-2xl border border-[#F1F3FB] bg-[#FAFBFF] p-6 text-sm text-[#5C6476]">
              <div className="my-6 flex justify-center">
                <Image src="/logo/oy_logo_black.png" alt="profile" width={80} height={40} className="rounded-full border border-[#E5E9F5]" />
              </div>
              <div className="flex justify-center">
                <Quote className="mb-3 h-5 w-5 text-[#1E5EFF]" />
              </div>
              <p className="text-center mt-2 ">“{item.quote}”</p>
              <p className="text-center mt-4 font-semibold text-[#0C1523]">{item.name}</p>
              <p className="text-center text-xs text-[#8A93A8]">{item.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BottomCTA() {
  return (
    <section className="px-6 pb-24">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 rounded-[32px] border border-[#0B1F4D] bg-[#0B1F4D] px-10 py-12 text-white md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">Get Started</p>
          <h3 className="mt-3 text-3xl font-bold">지금 온유와 함께 기록을 시작해보세요</h3>
          <p className="mt-3 text-sm text-white/80">AI 기반 인터뷰와 편집 자동화로 단 2주 안에 자서전을 완성할 수 있습니다.</p>
        </div>
        <div className="flex flex-col gap-3 text-sm">
          <Link href="/projects/new" className="flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-[#0B1F4D]">
            프로젝트 만들기 <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/projects" className="flex items-center justify-center gap-2 rounded-full border border-white/30 px-6 py-3 text-white/80">
            제품 문의하기
          </Link>
        </div>
      </div>
    </section>
  );
}
