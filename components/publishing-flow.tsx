"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  Headphones,
  Printer,
  Receipt,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { StoryData } from "@/types/story";

type PublishOption = "print" | "ebook" | "audio";

interface PublishingFlowProps {
  storyData: StoryData;
  onRestart: () => void;
  onViewStory: () => void;
}

const STEPS = [
  { id: "select", label: "출판 방식 선택" },
  { id: "details", label: "세부 정보 입력" },
  { id: "review", label: "견적 및 다음 단계" },
] as const;

const OPTION_CONFIG: Record<
  PublishOption,
  {
    title: string;
    description: string;
    icon: React.ElementType;
  }
> = {
  print: {
    title: "실물책",
    description: "하드커버 / 소프트커버 선택, 수량 지정, 선물용 포장 옵션",
    icon: Printer,
  },
  ebook: {
    title: "전자책",
    description: "EPUB·PDF 변환과 리더기 최적화, 메타데이터 작성 지원",
    icon: BookOpen,
  },
  audio: {
    title: "오디오북",
    description: "전문 성우 또는 TTS 보이스, 배경 음악·사운드 디자인",
    icon: Headphones,
  },
};

type PublishingDetails = {
  print: {
    trimSize: string;
    coverType: string;
    quantity: number;
    giftWrap: boolean;
  };
  ebook: {
    format: "epub" | "pdf" | "both";
    distribution: "private" | "family" | "public";
    includePhotos: boolean;
  };
  audio: {
    narrator: "professional" | "family" | "tts";
    duration: "30" | "45" | "60";
    includeBgm: boolean;
  };
};

const DEFAULT_DETAILS: PublishingDetails = {
  print: {
    trimSize: "148x210",
    coverType: "hard",
    quantity: 2,
    giftWrap: false,
  },
  ebook: {
    format: "both",
    distribution: "family",
    includePhotos: true,
  },
  audio: {
    narrator: "professional",
    duration: "45",
    includeBgm: true,
  },
};

const currencyFormatter = new Intl.NumberFormat("ko-KR", {
  style: "currency",
  currency: "KRW",
  maximumFractionDigits: 0,
});

export function PublishingFlow({ storyData, onRestart, onViewStory }: PublishingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<PublishOption[]>(["print", "ebook"]);
  const [details, setDetails] = useState<PublishingDetails>(DEFAULT_DETAILS);

  const toggleOption = (option: PublishOption) => {
    setSelectedOptions((prev) => {
      if (prev.includes(option)) {
        return prev.filter((item) => item !== option);
      }
      return [...prev, option];
    });
  };

  const updateDetails = <K extends PublishOption, Field extends keyof PublishingDetails[K]>(
    option: K,
    field: Field,
    value: PublishingDetails[K][Field],
  ) => {
    setDetails((prev) => ({
      ...prev,
      [option]: {
        ...prev[option],
        [field]: value,
      },
    }));
  };

  const priceSummary = useMemo(() => {
    const breakdown: Array<{ label: string; amount: number; description: string }> = [];
    let total = 0;

    if (selectedOptions.includes("print")) {
      const base = 18000;
      const coverMultiplier = details.print.coverType === "hard" ? 1.25 : 1;
      const wrapFee = details.print.giftWrap ? 5000 : 0;
      const amount = Math.round(details.print.quantity * base * coverMultiplier + wrapFee);
      breakdown.push({
        label: "실물책 제작",
        amount,
        description: `${details.print.quantity}권 · ${details.print.coverType === "hard" ? "하드커버" : "소프트커버"}`,
      });
      total += amount;
    }

    if (selectedOptions.includes("ebook")) {
      const base = details.ebook.format === "both" ? 120000 : 90000;
      const withPhotos = details.ebook.includePhotos ? 20000 : 0;
      breakdown.push({
        label: "전자책 제작",
        amount: base + withPhotos,
        description: `${details.ebook.format.toUpperCase()} 포맷 · ${
          details.ebook.distribution === "family" ? "가족 공유" : details.ebook.distribution === "public" ? "스토어 배포" : "개인 보관"
        }`,
      });
      total += base + withPhotos;
    }

    if (selectedOptions.includes("audio")) {
      const base = details.audio.narrator === "professional" ? 260000 : details.audio.narrator === "tts" ? 140000 : 200000;
      const durationMultiplier = Number(details.audio.duration) / 30;
      const bgmFee = details.audio.includeBgm ? 40000 : 0;
      const amount = Math.round(base * durationMultiplier + bgmFee);
      breakdown.push({
        label: "오디오북 제작",
        amount,
        description: `${details.audio.duration}분 · ${
          details.audio.narrator === "professional" ? "전문 성우" : details.audio.narrator === "family" ? "가족 보이스" : "프리미엄 TTS"
        }`,
      });
      total += amount;
    }

    return {
      total,
      breakdown,
    };
  }, [details, selectedOptions]);

  const canProceedFromSelect = selectedOptions.length > 0;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === STEPS.length - 1;

  const goToStep = (step: number) => {
    if (step < 0 || step >= STEPS.length) return;
    setCurrentStep(step);
  };

  const goNext = () => {
    if (isLastStep) return;
    if (currentStep === 0 && !canProceedFromSelect) return;
    setCurrentStep((prev) => prev + 1);
  };

  const goPrevious = () => {
    if (isFirstStep) return;
    setCurrentStep((prev) => prev - 1);
  };

  const renderStepContent = () => {
    if (currentStep === 0) {
      return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {(Object.keys(OPTION_CONFIG) as PublishOption[]).map((option) => {
            const config = OPTION_CONFIG[option];
            const Icon = config.icon;
            const isActive = selectedOptions.includes(option);

            return (
              <button
                key={option}
                type="button"
                onClick={() => toggleOption(option)}
                className={cn(
                  "relative flex h-full flex-col rounded-2xl border p-6 text-left transition-all duration-300",
                  isActive
                    ? "border-[#2BA08C] bg-[#2BA08C]/15 shadow-[0_0_20px_rgba(43,160,140,0.2)]"
                    : "border-[#2BA08C]/20 bg-[#0F3D35]/20 hover:border-[#2BA08C]/40 hover:bg-[#0F3D35]/30",
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#2BA08C] to-[#1F6F63]">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  {isActive ? <CheckCircle2 className="h-6 w-6 text-[#2BA08C]" /> : null}
                </div>
                <div className="mt-6 space-y-3">
                  <h3 className="text-xl text-[#E6F0ED]">{config.title}</h3>
                  <p className="text-sm leading-relaxed text-[#E6F0ED]/70">{config.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      );
    }

    if (currentStep === 1) {
      return (
        <div className="space-y-10">
          {selectedOptions.includes("print") && (
            <section className="rounded-2xl border border-[#2BA08C]/20 bg-[#0F3D35]/25 p-6">
              <header className="mb-4 flex items-center gap-3">
                <Printer className="h-5 w-5 text-[#2BA08C]" />
                <h3 className="text-lg text-[#E6F0ED]">실물책 제작 옵션</h3>
              </header>
              <div className="grid gap-6 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm text-[#E6F0ED]/70">
                  판형
                  <select
                    value={details.print.trimSize}
                    onChange={(event) => updateDetails("print", "trimSize", event.target.value)}
                    className="rounded-lg border border-[#2BA08C]/30 bg-[#0B1412] px-4 py-3 text-[#E6F0ED]"
                  >
                    <option value="148x210">A5 (148×210mm)</option>
                    <option value="128x188">신국판 (152×225mm)</option>
                    <option value="152x225">크라운판 (176×248mm)</option>
                  </select>
                </label>

                <label className="flex flex-col gap-2 text-sm text-[#E6F0ED]/70">
                  커버 타입
                  <select
                    value={details.print.coverType}
                    onChange={(event) => updateDetails("print", "coverType", event.target.value as PublishingDetails["print"]["coverType"])}
                    className="rounded-lg border border-[#2BA08C]/30 bg-[#0B1412] px-4 py-3 text-[#E6F0ED]"
                  >
                    <option value="hard">하드커버</option>
                    <option value="soft">소프트커버</option>
                  </select>
                </label>

                <label className="flex flex-col gap-2 text-sm text-[#E6F0ED]/70">
                  제작 수량
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={details.print.quantity}
                    onChange={(event) => updateDetails("print", "quantity", Number(event.target.value) || 1)}
                    className="rounded-lg border border-[#2BA08C]/30 bg-[#0B1412] px-4 py-3 text-[#E6F0ED]"
                  />
                </label>

                <label className="flex items-center gap-3 text-sm text-[#E6F0ED]/70">
                  <input
                    type="checkbox"
                    checked={details.print.giftWrap}
                    onChange={(event) => updateDetails("print", "giftWrap", event.target.checked)}
                    className="h-4 w-4 accent-[#2BA08C]"
                  />
                  선물용 포장 추가
                </label>
              </div>
            </section>
          )}

          {selectedOptions.includes("ebook") && (
            <section className="rounded-2xl border border-[#2BA08C]/20 bg-[#0F3D35]/25 p-6">
              <header className="mb-4 flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-[#2BA08C]" />
                <h3 className="text-lg text-[#E6F0ED]">전자책 제작 옵션</h3>
              </header>
              <div className="grid gap-6 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm text-[#E6F0ED]/70">
                  제공 포맷
                  <select
                    value={details.ebook.format}
                    onChange={(event) => updateDetails("ebook", "format", event.target.value as PublishingDetails["ebook"]["format"])}
                    className="rounded-lg border border-[#2BA08C]/30 bg-[#0B1412] px-4 py-3 text-[#E6F0ED]"
                  >
                    <option value="epub">EPUB</option>
                    <option value="pdf">PDF</option>
                    <option value="both">EPUB + PDF</option>
                  </select>
                </label>

                <label className="flex flex-col gap-2 text-sm text-[#E6F0ED]/70">
                  공유 범위
                  <select
                    value={details.ebook.distribution}
                    onChange={(event) =>
                      updateDetails("ebook", "distribution", event.target.value as PublishingDetails["ebook"]["distribution"])
                    }
                    className="rounded-lg border border-[#2BA08C]/30 bg-[#0B1412] px-4 py-3 text-[#E6F0ED]"
                  >
                    <option value="private">개인 보관</option>
                    <option value="family">가족 공유 링크</option>
                    <option value="public">스토어 배포 지원</option>
                  </select>
                </label>

                <label className="flex items-center gap-3 text-sm text-[#E6F0ED]/70">
                  <input
                    type="checkbox"
                    checked={details.ebook.includePhotos}
                    onChange={(event) => updateDetails("ebook", "includePhotos", event.target.checked)}
                    className="h-4 w-4 accent-[#2BA08C]"
                  />
                  사진 / 삽화 포함 레이아웃
                </label>
              </div>
            </section>
          )}

          {selectedOptions.includes("audio") && (
            <section className="rounded-2xl border border-[#2BA08C]/20 bg-[#0F3D35]/25 p-6">
              <header className="mb-4 flex items-center gap-3">
                <Headphones className="h-5 w-5 text-[#2BA08C]" />
                <h3 className="text-lg text-[#E6F0ED]">오디오북 제작 옵션</h3>
              </header>
              <div className="grid gap-6 md:grid-cols-2">
                <label className="flex flex-col gap-2 text-sm text-[#E6F0ED]/70">
                  보이스 타입
                  <select
                    value={details.audio.narrator}
                    onChange={(event) =>
                      updateDetails("audio", "narrator", event.target.value as PublishingDetails["audio"]["narrator"])
                    }
                    className="rounded-lg border border-[#2BA08C]/30 bg-[#0B1412] px-4 py-3 text-[#E6F0ED]"
                  >
                    <option value="professional">전문 성우</option>
                    <option value="family">가족 보이스 녹음 가이드</option>
                    <option value="tts">프리미엄 TTS</option>
                  </select>
                </label>

                <label className="flex flex-col gap-2 text-sm text-[#E6F0ED]/70">
                  목표 러닝타임
                  <select
                    value={details.audio.duration}
                    onChange={(event) =>
                      updateDetails("audio", "duration", event.target.value as PublishingDetails["audio"]["duration"])
                    }
                    className="rounded-lg border border-[#2BA08C]/30 bg-[#0B1412] px-4 py-3 text-[#E6F0ED]"
                  >
                    <option value="30">약 30분</option>
                    <option value="45">약 45분</option>
                    <option value="60">약 60분</option>
                  </select>
                </label>

                <label className="flex items-center gap-3 text-sm text-[#E6F0ED]/70">
                  <input
                    type="checkbox"
                    checked={details.audio.includeBgm}
                    onChange={(event) => updateDetails("audio", "includeBgm", event.target.checked)}
                    className="h-4 w-4 accent-[#2BA08C]"
                  />
                  배경 음악 / 사운드 디자인 포함
                </label>
              </div>
            </section>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <div className="rounded-2xl border border-[#2BA08C]/25 bg-[#0F3D35]/25 p-6">
          <header className="mb-4 flex items-center gap-3">
            <Receipt className="h-5 w-5 text-[#2BA08C]" />
            <div>
              <h3 className="text-lg text-[#E6F0ED]">예상 제작 견적</h3>
              <p className="text-sm text-[#E6F0ED]/60">최종 금액은 담당 매니저와 상세 확인 후 안내됩니다.</p>
            </div>
          </header>

          <div className="space-y-3">
            {priceSummary.breakdown.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-xl border border-[#2BA08C]/15 bg-[#0B1412] px-4 py-3">
                <div>
                  <p className="text-sm text-[#E6F0ED]">{item.label}</p>
                  <p className="text-xs text-[#E6F0ED]/60">{item.description}</p>
                </div>
                <span className="text-sm text-[#2BA08C]">{currencyFormatter.format(item.amount)}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center justify-between rounded-xl border border-[#2BA08C]/30 bg-[#2BA08C]/10 px-4 py-4">
            <span className="text-sm text-[#E6F0ED]/80">예상 총액</span>
            <strong className="text-xl text-[#E6F0ED]">{currencyFormatter.format(priceSummary.total)}</strong>
          </div>
        </div>

        <div className="rounded-2xl border border-[#2BA08C]/20 bg-[#0F3D35]/25 p-6">
          <div className="flex items-center gap-3">
            <BadgeCheck className="h-5 w-5 text-[#2BA08C]" />
            <h3 className="text-lg text-[#E6F0ED]">다음 단계</h3>
          </div>
          <ul className="mt-4 space-y-3 text-sm text-[#E6F0ED]/70">
            <li>1. 매니저가 1영업일 내 제작 옵션을 검토하고 연락드립니다.</li>
            <li>2. 원고·이미지 검수 후 최종 견적과 일정(제작/배송)을 안내합니다.</li>
            <li>3. 결제 완료 후 제작에 착수하며, 진행 상황을 이메일과 문자로 공유합니다.</li>
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F0E] via-[#0D1211] to-[#0E1513] px-6 pb-16 pt-24">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 lg:flex-row">
        <div className="flex-1 space-y-8">
          <header className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#2BA08C]/30 bg-[#2BA08C]/10 px-4 py-2 text-sm text-[#E6F0ED]/80">
              <Sparkles className="h-4 w-4 text-[#2BA08C]" />
              제작 단계로 넘어가기
            </div>
            <h1 className="text-3xl text-[#E6F0ED]">어떤 방식으로 이야기 책을 제작할까요?</h1>
            <p className="max-w-2xl text-sm text-[#E6F0ED]/70">
              원하는 형식을 선택하고 필요한 정보를 입력하면, 담당 매니저가 맞춤 견적과 제작 일정을 안내해드립니다. 여러 옵션을 함께 선택할 수
              있습니다.
            </p>
          </header>

          <ol className="flex flex-wrap gap-4">
            {STEPS.map((step, index) => {
              const isActive = index === currentStep;
              const isCompleted = index < currentStep;

              return (
                <li key={step.id}>
                  <button
                    type="button"
                    onClick={() => goToStep(index)}
                    className={cn(
                      "flex items-center gap-3 rounded-full border px-5 py-2 text-sm transition-all",
                      isActive
                        ? "border-[#2BA08C] bg-[#2BA08C]/20 text-[#E6F0ED]"
                        : isCompleted
                        ? "border-[#2BA08C]/40 bg-[#0F3D35]/30 text-[#2BA08C]"
                        : "border-[#2BA08C]/20 bg-[#0F3D35]/10 text-[#E6F0ED]/60",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded-full border text-xs",
                        isActive || isCompleted ? "border-[#2BA08C] text-[#2BA08C]" : "border-[#2BA08C]/30 text-[#E6F0ED]/60",
                      )}
                    >
                      {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                    </span>
                    {step.label}
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="rounded-3xl border border-[#2BA08C]/25 bg-[#0F3D35]/30 p-6">
            {renderStepContent()}

            <div className="mt-8 flex flex-col gap-4 border-t border-[#2BA08C]/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3 text-xs text-[#E6F0ED]/60">
                {!isFirstStep ? (
                  <button
                    type="button"
                    onClick={goPrevious}
                    className="inline-flex items-center gap-1 text-[#2BA08C] transition-opacity hover:opacity-80"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    이전 단계
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[#E6F0ED]/50">
                    <ArrowLeft className="h-4 w-4" />
                    첫 단계
                  </span>
                )}
                <span>·</span>
                <button
                  type="button"
                  onClick={onViewStory}
                  className="inline-flex items-center gap-1 text-[#2BA08C] transition-opacity hover:opacity-80"
                >
                  이야기 다시 보기
                </button>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="border-[#2BA08C]/30 bg-[#0F3D35]/40 hover:bg-[#0F3D35]/60" onClick={onRestart}>
                  처음으로 돌아가기
                </Button>
                {!isLastStep ? (
                  <Button onClick={goNext} disabled={currentStep === 0 && !canProceedFromSelect}>
                    다음 단계
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                ) : (
                  <Button
                    onClick={() => window.alert("담당 매니저가 요청을 접수했습니다. 곧 안내드릴게요!")}
                    className="bg-gradient-to-r from-[#2BA08C] to-[#1F6F63]"
                  >
                    제작 요청 보내기
                    <Sparkles className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        <aside className="w-full max-w-sm space-y-6 rounded-3xl border border-[#2BA08C]/20 bg-[#0F3D35]/20 p-6">
          <div className="space-y-3">
            <h2 className="text-lg text-[#E6F0ED]">이야기 요약</h2>
            <p className="text-sm text-[#E6F0ED]/70">{storyData.topic}</p>
            <p className="text-xs leading-relaxed text-[#E6F0ED]/50">{storyData.summary}</p>
          </div>

          <div>
            <h3 className="text-sm text-[#E6F0ED]/70">키워드</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {storyData.keywords.map((keyword) => (
                <Badge key={keyword}>{keyword}</Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm text-[#E6F0ED]/70">선택한 제작 방식</h3>
            <ul className="mt-3 space-y-2 text-sm text-[#E6F0ED]/70">
              {selectedOptions.map((option) => (
                <li key={option} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#2BA08C]" />
                  {OPTION_CONFIG[option].title}
                </li>
              ))}
              {selectedOptions.length === 0 ? <li className="text-[#E6F0ED]/40">옵션을 선택해주세요.</li> : null}
            </ul>
          </div>

          <div className="rounded-2xl border border-[#2BA08C]/20 bg-[#2BA08C]/10 p-4">
            <p className="text-xs text-[#E6F0ED]/60">
              제작 요청을 보내면 온유 매니저가 편집본을 검토한 뒤 맞춤 일정을 안내드립니다. 옵션에 따라 시안, 보이스 샘플, 인쇄 샘플 등이 순차적으로
              제공됩니다.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
