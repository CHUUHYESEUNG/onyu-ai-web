"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ProjectShell } from "@/components/project-shell";
import {
  BookmarkCheck,
  Calendar,
  CheckCircle2,
  Circle,
  Mic,
  Sparkles,
  Users,
} from "lucide-react";

const CREATION_STEPS = [
  { title: "기획", description: "아카이빙 목표와 인물 정의" },
  { title: "인터뷰", description: "주차별 질문과 가이드" },
  { title: "편집", description: "타임라인 · 소주제 정리" },
  { title: "출판", description: "실물책 · ePub · 오디오북" },
];

const STORY_FOCUS_TAGS = [
  "유년기",
  "가족",
  "커리어",
  "사랑",
  "여행",
  "신앙",
  "취미",
  "도전",
];

const TAGLINE_SUGGESTIONS = [
  "세대를 잇는 목소리",
  "기억을 기록하는 여정",
  "가족에게 선물하는 이야기",
  "한 사람의 시대사",
  "삶의 전환점을 담은 기록",
];

export default function NewProjectPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "나의 첫 자서전",
    tagline: "세대를 잇는 이야기 기록",
    generation: "1세대 (본인)",
    eraRange: "1950 ~ 2025",
    tone: "따뜻한 가족 서사",
    recordPreference: "voice",
    reminder: "매주 토요일 오전 10시",
    invitees: "딸 혜진, 손자 민수",
    focusTags: ["가족", "커리어", "취미"],
    inviteEmails: ["hyejin@example.com"],
  });
  const [inviteEmailDraft, setInviteEmailDraft] = useState("");

  const completion = useMemo(() => {
    return Math.round((form.focusTags.length / STORY_FOCUS_TAGS.length) * 100);
  }, [form.focusTags.length]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleFocusTag = (tag: string) => {
    setForm((prev) => {
      const exists = prev.focusTags.includes(tag);
      return {
        ...prev,
        focusTags: exists
          ? prev.focusTags.filter((item) => item !== tag)
          : [...prev.focusTags, tag],
      };
    });
  };

  const handleSubmit = () => {
    alert(
      `새 프로젝트가 준비됐어요!\n제목: ${form.title}\n녹음 방식: ${
        form.recordPreference === "voice"
          ? "모바일 음성"
          : form.recordPreference === "video"
          ? "화상 인터뷰"
          : "텍스트"
      }\n초대 메일 대상: ${form.inviteEmails.join(", ") || "없음"}`
    );
    router.push("/projects");
  };

  const addInviteEmail = () => {
    const trimmed = inviteEmailDraft.trim();
    if (!trimmed) return;
    if (form.inviteEmails.includes(trimmed)) {
      setInviteEmailDraft("");
      return;
    }
    setForm((prev) => ({ ...prev, inviteEmails: [...prev.inviteEmails, trimmed] }));
    setInviteEmailDraft("");
  };

  const removeInviteEmail = (email: string) => {
    setForm((prev) => ({
      ...prev,
      inviteEmails: prev.inviteEmails.filter((item) => item !== email),
    }));
  };

  return (
    <ProjectShell
      breadcrumb={[
        { label: "홈", href: "/" },
        { label: "내 프로젝트", href: "/projects" },
        { label: "새 프로젝트 생성" },
      ]}
    >
      <div className="space-y-8 text-white">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-white/60">
                <Sparkles className="h-4 w-4 text-[#1E5EFF]" /> Guided Flow
              </div>
              <h1 className="mt-2 text-3xl font-semibold">새 자서전 프로젝트를 시작합니다</h1>
              <p className="mt-2 text-sm text-white/70">
                기본 정보를 입력하면 Onyu가 인터뷰 질문, 녹음 일정, 편집 템플릿을 자동으로 세팅해 드립니다.
              </p>
            </div>
            <button
              onClick={handleSubmit}
              className="rounded-full bg-[#1E5EFF] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(30,94,255,0.35)]"
            >
              프로젝트 생성하기
            </button>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {CREATION_STEPS.map((step, index) => (
              <div
                key={step.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <div className="mb-3 flex items-center gap-2 text-xs text-white/60">
                  {index === 0 ? (
                    <CheckCircle2 className="h-4 w-4 text-[#1E5EFF]" />
                  ) : (
                    <Circle className="h-4 w-4 text-white/30" />
                  )}
                  Step {index + 1}
                </div>
                <p className="text-sm font-semibold">{step.title}</p>
                <p className="mt-1 text-xs text-white/50">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        <section className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <header className="mb-5 flex items-center gap-3">
                <div className="rounded-2xl bg-white/10 p-2 text-[#1E5EFF]">
                  <BookmarkCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-white/50">Step 1</p>
                  <h2 className="text-xl font-semibold text-white">프로젝트 기본 정보</h2>
                </div>
              </header>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-white/60">프로젝트 제목</label>
                  <input
                    value={form.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-white/10 bg-[#03050f] px-4 py-3 text-base text-white focus:border-[#1E5EFF] focus:outline-none"
                    placeholder="예) 할아버지의 바다"
                  />
                </div>
                <div>
                  <label className="text-sm text-[#a0a3b1]">한 줄 태그라인</label>
                  <div className="mt-1 grid gap-2 md:grid-cols-[1.2fr_1fr]">
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) {
                          handleChange("tagline", e.target.value);
                        }
                      }}
                      className="rounded-2xl border border-navy-800 bg-transparent px-4 py-3 text-sm text-[#a0a3b1] focus:border-accent focus:outline-none"
                    >
                      <option value="">추천 태그라인 선택...</option>
                      {TAGLINE_SUGGESTIONS.map((option) => (
                        <option key={option} value={option} className="bg-navy-900 text-[#e4e6eb]">
                          {option}
                        </option>
                      ))}
                    </select>
                    <input
                      value={form.tagline}
                      onChange={(e) => handleChange("tagline", e.target.value)}
                      className="rounded-2xl border border-navy-800 bg-transparent px-4 py-3 text-base focus:border-accent focus:outline-none"
                      placeholder="어떤 이야기를 남기고 싶나요?"
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm text-[#a0a3b1]">기록 주체</label>
                    <input
                      value={form.generation}
                      onChange={(e) => handleChange("generation", e.target.value)}
                      className="mt-1 w-full rounded-2xl border border-navy-800 bg-transparent px-4 py-3 focus:border-accent focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[#a0a3b1]">기록 시기</label>
                    <input
                      value={form.eraRange}
                      onChange={(e) => handleChange("eraRange", e.target.value)}
                      className="mt-1 w-full rounded-2xl border border-navy-800 bg-transparent px-4 py-3 focus:border-accent focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-navy-800 bg-navy-900/50 p-6">
              <header className="mb-5 flex items-center gap-3">
                <div className="rounded-2xl bg-accent/15 p-2 text-accent">
                  <Mic className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-[#7a7d8c]">Step 2</p>
                  <h2 className="text-xl font-semibold">이야기 포커스 & 녹음 스타일</h2>
                </div>
              </header>
              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-sm text-[#a0a3b1]">중점적으로 다루고 싶은 주제</p>
                  <div className="flex flex-wrap gap-2">
                    {STORY_FOCUS_TAGS.map((tag) => {
                      const active = form.focusTags.includes(tag);
                      return (
                        <button
                          type="button"
                          key={tag}
                          onClick={() => toggleFocusTag(tag)}
                          className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                            active
                              ? "border-accent bg-accent/10 text-accent"
                              : "border-navy-800 text-[#a0a3b1] hover:border-accent/40"
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <div>
                    <label className="text-sm text-[#a0a3b1]">선호하는 톤 & 스타일</label>
                    <input
                      value={form.tone}
                      onChange={(e) => handleChange("tone", e.target.value)}
                      className="mt-1 w-full rounded-2xl border border-navy-800 bg-transparent px-4 py-3 focus:border-accent focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[#a0a3b1]">녹음 선호 방식</label>
                    <select
                      value={form.recordPreference}
                      onChange={(e) => handleChange("recordPreference", e.target.value)}
                      className="mt-1 w-full rounded-2xl border border-navy-800 bg-transparent px-4 py-3 focus:border-accent focus:outline-none"
                    >
                      <option value="voice">모바일 음성 녹음</option>
                      <option value="video">화상 인터뷰</option>
                      <option value="text">텍스트 입력 위주</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-navy-800 bg-navy-900/50 p-6">
              <header className="mb-5 flex items-center gap-3">
                <div className="rounded-2xl bg-accent/15 p-2 text-accent">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-[#7a7d8c]">Step 3</p>
                  <h2 className="text-xl font-semibold">인터뷰 & 초대 플랜</h2>
                </div>
              </header>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm text-[#a0a3b1]">주차별 알림 시간</label>
                  <input
                    value={form.reminder}
                    onChange={(e) => handleChange("reminder", e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-navy-800 bg-transparent px-4 py-3 focus:border-accent focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-sm text-[#a0a3b1]">공동 참여자 (초대)</label>
                  <input
                    value={form.invitees}
                    onChange={(e) => handleChange("invitees", e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-navy-800 bg-transparent px-4 py-3 focus:border-accent focus:outline-none"
                    placeholder="가족, 에디터 등"
                  />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <label className="text-sm text-[#a0a3b1]">
                  초대 이메일 (선택) — 입력 후 Enter 또는 추가 버튼을 눌러주세요
                </label>
                <div className="flex flex-wrap gap-2">
                  <input
                    value={inviteEmailDraft}
                    onChange={(e) => setInviteEmailDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addInviteEmail();
                      }
                    }}
                    className="flex-1 rounded-2xl border border-navy-800 bg-transparent px-4 py-3 text-sm focus:border-accent focus:outline-none"
                    placeholder="example@onyu.ai"
                  />
                  <button
                    type="button"
                    onClick={addInviteEmail}
                    className="rounded-2xl border border-accent px-4 py-3 text-sm font-medium text-accent hover:bg-accent/10"
                  >
                    추가
                  </button>
                </div>
                {form.inviteEmails.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.inviteEmails.map((email) => (
                      <span
                        key={email}
                        className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs text-accent"
                      >
                        {email}
                        <button
                          type="button"
                          onClick={() => removeInviteEmail(email)}
                          className="text-accent/70 transition-colors hover:text-white"
                          aria-label={`${email} 삭제`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-6 rounded-2xl border border-dashed border-navy-800 bg-navy-900/40 p-4 text-sm text-[#a0a3b1]">
                <p className="font-semibold text-[#e4e6eb]">Onyu가 제공할 것들</p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-xs">
                  <li>주차별 인터뷰 질문 세트 + 음성 녹음 가이드</li>
                  <li>타임라인 자동 생성 & 섹션 템플릿 배포</li>
                  <li>녹음 업로드 → 전사 → 소주제 블록화 자동 처리</li>
                </ul>
              </div>
            </div>
          </div>

          <aside className="flex flex-col gap-6">
            <div className="rounded-3xl border border-navy-800 bg-gradient-to-b from-navy-800/80 to-navy-900 p-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#7a7d8c]">준비도</span>
                <span className="font-semibold text-accent">{completion}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-navy-800">
                <div className="h-full rounded-full bg-accent" style={{ width: `${completion}%` }} />
              </div>
              <div className="mt-6 space-y-4 text-sm">
                <div>
                  <p className="text-[#7a7d8c]">프로젝트 제목</p>
                  <p className="text-base font-semibold">{form.title}</p>
                </div>
                <div>
                  <p className="text-[#7a7d8c]">태그라인</p>
                  <p>{form.tagline}</p>
                </div>
                <div>
                  <p className="text-[#7a7d8c]">포커스 태그</p>
                  <p>{form.focusTags.join(", ") || "선택 없음"}</p>
                </div>
                <div>
                  <p className="text-[#7a7d8c]">참여자</p>
                  <p>{form.invitees || "예정 없음"}</p>
                </div>
                <div>
                  <p className="text-[#7a7d8c]">초대 이메일</p>
                  <p>{form.inviteEmails.join(", ") || "선택 없음"}</p>
                </div>
              </div>
            </div>
            <div className="rounded-3xl border border-navy-800 bg-navy-900/60 p-6 text-sm text-[#a0a3b1]">
              <div className="mb-4 flex items-center gap-2 text-base font-semibold text-[#e4e6eb]">
                <Users className="h-5 w-5 text-accent" /> 함께 진행할 사람들
              </div>
              <p>
                초대한 가족 또는 에디터에게 인터뷰 질문과 녹음 가이드를 자동으로 공유합니다. 초대 메일은 프로젝트가
                생성되면 즉시 발송돼요.
              </p>
              <div className="mt-4 rounded-2xl border border-navy-800/70 bg-navy-900/40 p-3 text-xs">
                <p className="font-semibold text-[#e4e6eb]">사전 준비</p>
                <p className="mt-1">1) 녹음 장비 테스트 · 2) 질문 미리보기 · 3) 가족 인터뷰 일정 잡기</p>
              </div>
            </div>
          </aside>
        </section>

        <section className="flex flex-col gap-3 rounded-3xl border border-navy-800 bg-navy-900/70 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-[#7a7d8c]">다음 단계</p>
            <p className="text-lg font-semibold">AI가 인터뷰 스크립트와 타임라인을 세팅할 거예요</p>
          </div>
          <button
            onClick={handleSubmit}
            className="rounded-2xl bg-accent px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            프로젝트 생성하기
          </button>
        </section>
      </div>
    </ProjectShell>
  );
}
