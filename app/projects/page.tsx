"use client";

import Link from "next/link";
import { Plus, BookOpen, MoreHorizontal } from "lucide-react";
import { ProjectShell } from "@/components/project-shell";

const projects = [
  {
    id: "project-1",
    title: "할아버지의 이야기",
    description: "1950년대부터 현재까지의 삶의 여정",
    progress: 45,
    lastEdited: "2025. 11. 6.",
    chaptersCompleted: 3,
    totalChapters: 7,
  },
  {
    id: "project-2",
    title: "나의 청춘 시절",
    description: "1970년대 청춘의 기억",
    progress: 20,
    lastEdited: "2025. 11. 5.",
    chaptersCompleted: 2,
    totalChapters: 5,
  },
  {
    id: "project-3",
    title: "가족과 함께한 시간",
    description: "가족들과의 소중한 추억",
    progress: 65,
    lastEdited: "2025. 11. 4.",
    chaptersCompleted: 5,
    totalChapters: 8,
  },
];

export default function ProjectsDashboard() {
  return (
    <ProjectShell breadcrumb={[{ label: "홈", href: "/" }, { label: "내 프로젝트" }]}>
      <HeaderSection />
      <ProjectGrid />
    </ProjectShell>
  );
}

function HeaderSection() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-semibold">프로젝트</h1>
        <p className="text-white/60 text-sm">음성 인터뷰로 자서전을 제작하고 있어요</p>
        <div className="mt-3 flex gap-4 text-sm text-white/60">
          <button className="border-b-2 border-[#1E5EFF] pb-1 text-white">내 프로젝트</button>
          <button className="pb-1 text-white/40">공지사항</button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/projects/new" className="flex items-center gap-2 rounded-2xl bg-[#1E5EFF] px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_40px_rgba(30,94,255,0.35)]">
          <Plus className="h-4 w-4" /> 새 프로젝트 생성
        </Link>
      </div>
    </div>
  );
}

function ProjectGrid() {
  return (
    <div className="grid gap-6 lg:grid-cols-3 md:grid-cols-2 grid-cols-1">
      <Link
        href="/projects/new"
        className="flex h-64 flex-col items-center justify-center rounded-3xl border border-white/5 bg-white/5 text-white/70 transition hover:border-[#1E5EFF]"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-dashed border-white/40">
          <Plus className="h-8 w-8" />
        </div>
        <p className="mt-4 text-lg font-semibold text-white">새 프로젝트 생성</p>
      </Link>
      {projects.map((project) => (
        <Link
          key={project.id}
          href={`/projects/${project.id}/overview`}
          className="rounded-3xl border border-white/5 bg-white/5 p-5 transition hover:border-[#1E5EFF]"
        >
          <div className="flex items-center justify-between text-sm text-white/50">
            <span>{project.lastEdited}</span>
            <button className="rounded-full border border-white/10 p-1 text-white/50 hover:text-white">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <div className="rounded-2xl bg-[#1E5EFF]/20 p-3">
              <BookOpen className="h-7 w-7 text-[#1E5EFF]" />
            </div>
            <div>
              <p className="text-lg font-semibold text-white">{project.title}</p>
              <p className="text-sm text-white/60">{project.description}</p>
            </div>
          </div>
          <div className="mt-6 space-y-2 text-sm text-white/60">
            <div className="flex items-center justify-between">
              <span>진행률</span>
              <span className="text-white">{project.progress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-[#1E5EFF] to-[#A855F7]" style={{ width: `${project.progress}%` }} />
            </div>
            <p>챕터 {project.chaptersCompleted}/{project.totalChapters}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
