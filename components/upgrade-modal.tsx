"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2 } from "lucide-react";

const PLANS = [
  {
    name: "Starter",
    price: "무료",
    tagline: "개인 기록 시작용",
    features: [
      "주차별 질문 템플릿 3세트",
      "음성 녹음 2시간",
      "PDF 초안 다운로드(워터마크)",
    ],
    accent: "from-[#3CD2FF] to-[#9C6BFF]",
  },
  {
    name: "Pro",
    price: "₩99,000",
    tagline: "패밀리 자서전",
    features: [
      "무제한 질문/음성",
      "AI 편집 & 요약",
      "PDF, 실물책 1부 포함",
    ],
    accent: "from-[#FF8A3C] to-[#FF3CA2]",
    featured: true,
  },
  {
    name: "Premium",
    price: "₩199,000",
    tagline: "프리미엄 아카이빙",
    features: [
      "가족 초대 5명",
      "스튜디오 음성 가이드",
      "하드커버 + 오디오북",
    ],
    accent: "from-[#3EFFA3] to-[#3CA6FF]",
  },
];

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
}

export function UpgradeModal({ open, onClose }: UpgradeModalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur transition-opacity"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl rounded-3xl border border-white/10 bg-[#06080f]/95 p-8 shadow-2xl transition-all duration-200 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
          <div className="mb-6 text-center">
            <p className="text-xs uppercase tracking-[0.4em] text-accent">Plan Upgrade</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">어떤 방식으로 자서전을 만들까요?</h2>
            <p className="mt-2 text-sm text-white/70">플랜을 선택하면 맞춤 템플릿과 인터뷰 플로우가 자동으로 세팅됩니다.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-3xl border border-white/10 bg-white/5 p-5 text-white transition hover:border-white/40 ${
                  plan.featured ? "shadow-lg shadow-[#ff3ca2]/30" : ""
                }`}
              >
                <div className={`h-1 w-full rounded-full bg-gradient-to-r ${plan.accent}`} />
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/60">{plan.name}</p>
                    <p className="mt-1 text-2xl font-semibold">{plan.price}</p>
                  </div>
                  {plan.featured && (
                    <span className="rounded-full border border-white/20 px-3 py-1 text-xs">Most popular</span>
                  )}
                </div>
                <p className="mt-2 text-sm text-white/70">{plan.tagline}</p>
                <ul className="mt-4 space-y-2 text-sm text-white/80">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-accent" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/projects/new"
                  onClick={onClose}
                  className="mt-6 block rounded-2xl bg-white/10 px-4 py-3 text-center text-sm font-semibold transition hover:bg-white/20"
                >
                  이 플랜으로 시작하기
                </Link>
              </div>
            ))}
          </div>
      </div>
    </div>,
    document.body,
  );
}
