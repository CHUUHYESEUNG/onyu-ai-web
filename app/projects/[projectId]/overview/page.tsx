"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import {
  ArrowRight,
  CalendarDays,
  BookOpenCheck,
  MailCheck,
  FileText,
  AudioLines,
  PenSquare,
  CheckCircle2,
  Clock3,
  Circle,
  Users,
} from "lucide-react";

const PROJECT_SUMMARIES: Record<
  string,
  {
    title: string;
    tagline: string;
    focus: string[];
    invitees: Array<{ name: string; email: string; status: "sent" | "pending" }>;
  }
> = {
  "project-1": {
    title: "할아버지의 이야기",
    tagline: "세대를 잇는 바닷바람",
    focus: ["유년기", "가족", "도전"],
    invitees: [
      { name: "딸 혜진", email: "hyejin@example.com", status: "sent" },
      { name: "손자 민수", email: "minsu@example.com", status: "pending" },
    ],
  },
  "project-2": {
    title: "나의 청춘 시절",
    tagline: "70년대 청춘의 노래",
    focus: ["사랑", "커리어"],
    invitees: [{ name: "친구 영수", email: "youngsu@example.com", status: "sent" }],
  },
  "project-3": {
    title: "가족과 함께한 시간",
    tagline: "함께 밥을 먹던 저녁들",
    focus: ["가족", "취미", "여행"],
    invitees: [
      { name: "배우자", email: "partner@example.com", status: "pending" },
      { name: "에디터 은정", email: "eunjung@example.com", status: "sent" },
    ],
  },
};

const TIMELINE_PLAN = [
  {
    week: "Week 1",
    theme: "유년기",
    tasks: ["유년기 질문 8개", "사진/유물 스캔 업로드"],
    status: "ready" as const,
  },
  {
    week: "Week 2",
    theme: "청춘 & 사랑",
    tasks: ["연애/결혼 인터뷰", "음성 녹음 15분"],
    status: "in-progress" as const,
  },
  {
    week: "Week 3",
    theme: "커리어",
    tasks: ["회사 에피소드 정리", "타임라인에 카드 추가"],
    status: "upcoming" as const,
  },
];

const AI_PREP_ITEMS = [
  {
    title: "인터뷰 질문 세트",
    description: "포커스 태그 기반 맞춤형 질문 24개 생성",
    status: "완료",
    icon: FileText,
  },
  {
    title: "녹음 가이드 & 스크립트",
    description: "모바일/데스크톱 녹음 가이드 + 오프닝 멘트",
    status: "진행 중",
    icon: AudioLines,
  },
  {
    title: "타임라인 보드",
    description: "주차별 카드와 자동 요약칩 배치",
    status: "대기",
    icon: BookOpenCheck,
  },
];

export default function ProjectOverviewPage() {
  const params = useParams<{ projectId: string }>();
  const project = PROJECT_SUMMARIES[params?.projectId || ""] ?? {
    title: "새 프로젝트",
    tagline: "기록을 준비 중입니다",
    focus: ["유년기"],
    invitees: [],
  };

  return (
    <div className="min-h-screen bg-navy-900 text-[#e4e6eb]">
      <Navigation />
      <main className="mx-auto max-w-6xl px-6 py-24 space-y-10">
        <section className="space-y-5 rounded-3xl border border-navy-800/70 bg-gradient-to-br from-navy-800/60 to-navy-900 p-8">
          <div className="flex items-center gap-3 text-sm text-[#7a7d8c]">
            <Link href="/projects" className="hover:text-[#e4e6eb]">
              프로젝트
            </Link>
            <ArrowRight className="h-4 w-4" />
            <span className="text-[#e4e6eb]">{project.title}</span>
          </div>
          <div className="flex flex-col gap-3">
            <p className="text-xs uppercase tracking-[0.4em] text-accent">Step 2 / 4 · 준비 점검</p>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-semibold">인터뷰 준비가 거의 완료됐어요</h1>
                <p className="text-[#a0a3b1]">초대 현황과 AI 셋업을 확인하고 편집 단계로 넘어가세요.</p>
              </div>
              <div className="flex gap-3">
                <Link
                  href={`/projects/${params?.projectId ?? ""}/edit`}
                  className="rounded-2xl bg-accent px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
                >
                  편집 시작하기
                </Link>
                <Link
                  href={`/projects/${params?.projectId ?? ""}/publish`}
                  className="rounded-2xl border border-navy-700 px-6 py-3 text-sm font-semibold text-[#a0a3b1] hover:border-accent hover:text-accent"
                >
                  출판 플로우 보기
                </Link>
              </div>
            </div>
            <div className="text-sm text-[#a0a3b1]">
              <span className="font-semibold text-[#e4e6eb]">포커스</span>: {project.focus.join(" · ")}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-navy-800 bg-navy-900/60 p-6">
              <div className="mb-4 flex items-center gap-2 text-sm text-[#7a7d8c]">
                <CalendarDays className="h-5 w-5 text-accent" /> 주차별 인터뷰 플랜
              </div>
              <div className="space-y-4">
                {TIMELINE_PLAN.map((week) => (
                  <div
                    key={week.week}
                    className="rounded-2xl border border-navy-800/70 bg-navy-900/40 p-4"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs uppercase tracking-[0.3em] text-[#7a7d8c]">{week.week}</span>
                      <span className="text-sm font-semibold">{week.theme}</span>
                      <span
                        className={`rounded-full px-3 py-0.5 text-xs ${
                          week.status === "ready"
                            ? "bg-green-500/10 text-green-300"
                            : week.status === "in-progress"
                            ? "bg-yellow-500/10 text-yellow-200"
                            : "bg-navy-800 text-[#7a7d8c]"
                        }`}
                      >
                        {week.status === "ready"
                          ? "완료"
                          : week.status === "in-progress"
                          ? "진행 중"
                          : "예정"}
                      </span>
                    </div>
                    <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[#a0a3b1]">
                      {week.tasks.map((task) => (
                        <li key={task}>{task}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-navy-800 bg-navy-900/60 p-6">
              <div className="mb-4 flex items-center gap-2 text-sm text-[#7a7d8c]">
                <BookOpenCheck className="h-5 w-5 text-accent" /> AI 준비 현황
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {AI_PREP_ITEMS.map((item) => (
                  <div key={item.title} className="rounded-2xl border border-navy-800/80 bg-navy-900/30 p-4">
                    <item.icon className="h-5 w-5 text-accent" />
                    <p className="mt-3 text-sm font-semibold">{item.title}</p>
                    <p className="mt-1 text-xs text-[#7a7d8c]">{item.description}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs text-[#a0a3b1]">
                      {item.status === "완료" ? (
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                      ) : item.status === "진행 중" ? (
                        <Clock3 className="h-4 w-4 text-yellow-300" />
                      ) : (
                        <Circle className="h-3 w-3 text-navy-700" />
                      )}
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-navy-800 bg-navy-900/70 p-6">
              <div className="mb-4 flex items-center gap-2 text-sm text-[#7a7d8c]">
                <MailCheck className="h-5 w-5 text-accent" /> 초대 메일 상태
              </div>
              <div className="space-y-3">
                {project.invitees.length === 0 ? (
                  <p className="text-sm text-[#a0a3b1]">아직 초대한 사람이 없습니다.</p>
                ) : (
                  project.invitees.map((invite) => (
                    <div
                      key={invite.email}
                      className="flex items-center justify-between rounded-2xl border border-navy-800/70 bg-navy-900/40 p-3"
                    >
                      <div>
                        <p className="text-sm font-semibold">{invite.name}</p>
                        <p className="text-xs text-[#7a7d8c]">{invite.email}</p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs ${
                          invite.status === "sent"
                            ? "bg-green-500/10 text-green-300"
                            : "bg-yellow-500/10 text-yellow-200"
                        }`}
                      >
                        {invite.status === "sent" ? "발송 완료" : "발송 예정"}
                      </span>
                    </div>
                  ))
                )}
              </div>
              <Link
                href={`/projects/${params?.projectId ?? ""}/edit`}
                className="mt-4 inline-flex items-center gap-2 text-sm text-accent hover:underline"
              >
                <PenSquare className="h-4 w-4" /> 초대 목록 수정하기
              </Link>
            </div>

            <div className="rounded-3xl border border-navy-800 bg-navy-900/70 p-6 text-sm text-[#a0a3b1]">
              <div className="mb-3 flex items-center gap-2 text-base font-semibold text-[#e4e6eb]">
                <Users className="h-5 w-5 text-accent" /> Step 2 요약
              </div>
              <ul className="space-y-2 text-xs">
                <li>· 인터뷰 플랜 3주분 중 1주 완료, 1주 진행 중</li>
                <li>· 초대 메일 {project.invitees.filter((i) => i.status === "sent").length}건 발송</li>
                <li>· AI 준비 항목 3개 중 1개 완료</li>
              </ul>
            </div>
          </aside>
        </section>
      </main>
      <Footer />
    </div>
  );
}
