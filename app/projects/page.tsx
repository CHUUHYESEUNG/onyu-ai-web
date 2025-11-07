"use client";

import Link from "next/link";
import Image from "next/image";
import { Plus, Settings, MoreVertical, BookOpen } from "lucide-react";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";

export default function DashboardPage() {
  // 목업 프로젝트 데이터
  const projects = [
    {
      id: "project-1",
      title: "할아버지의 이야기",
      description: "1950년대부터 현재까지의 삶의 여정",
      progress: 45,
      lastEdited: "2025. 11. 6.",
      chaptersCompleted: 3,
      totalChapters: 7,
      thumbnail: "/books.jpg",
    },
    {
      id: "project-2",
      title: "나의 청춘 시절",
      description: "1970년대 청춘의 기억",
      progress: 20,
      lastEdited: "2025. 11. 5.",
      chaptersCompleted: 2,
      totalChapters: 5,
      thumbnail: "/books.jpg",
    },
    {
      id: "project-3",
      title: "가족과 함께한 시간",
      description: "가족들과의 소중한 추억",
      progress: 65,
      lastEdited: "2025. 11. 4.",
      chaptersCompleted: 5,
      totalChapters: 8,
      thumbnail: "/books.jpg",
    },
  ];

  return (
    <div className="min-h-screen bg-navy-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-navy-800 bg-navy-900/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo/oy_logo_white.png"
              alt="Onyu.ai 로고"
              width={60}
              height={16}
              priority
            />
          </Link>

          <div className="flex items-center gap-3">
            <button className="rounded-lg p-2 text-[#a0a3b1] transition-colors hover:bg-card hover:text-[#e4e6eb]">
              <Settings className="h-5 w-5" />
            </button>
            <div className="h-8 w-8 rounded-full bg-accent" />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-12">
        {/* Top Section */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-semibold text-[#e4e6eb]">내 프로젝트</h2>
            <p className="mt-1 text-[#a0a3b1]">음성으로 만드는 나의 자서전</p>
          </div>

          <Link
            href="/projects/new"
            className="flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
          >
            <Plus className="h-5 w-5" />
            <span>새로 만들기</span>
          </Link>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* New Project Card */}
          <Link
            href="/projects/new"
            className="group flex items-center justify-center rounded-2xl border-2 border-dashed border-navy-700 bg-card/30 transition-all hover:border-accent/50 hover:bg-card/50 h-[328px]"
          >
            <div className="flex flex-col items-center gap-3 text-[#a0a3b1] transition-colors group-hover:text-accent">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-navy-800">
                <Plus className="h-8 w-8" />
              </div>
              <p className="text-lg font-medium">새 프로젝트 만들기</p>
            </div>
          </Link>

          {/* Existing Project Cards */}
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}/overview`}
              className="group relative overflow-hidden rounded-2xl bg-card transition-all hover:ring-2 hover:ring-accent/50 h-[328px] flex flex-col"
            >
              {/* Thumbnail Background */}
              <div className="relative h-40 overflow-hidden">
                <Image
                  src={project.thumbnail}
                  alt={project.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-navy-900/60 to-navy-900" />

                {/* Project Icon & Menu */}
                <div className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/90 backdrop-blur-sm">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <button className="absolute right-4 top-4 rounded-lg bg-navy-900/60 p-2 text-[#a0a3b1] backdrop-blur-sm transition-colors hover:bg-navy-800/80 hover:text-[#e4e6eb]">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="mb-1 text-lg font-semibold text-[#e4e6eb] group-hover:text-accent">
                  {project.title}
                </h3>
                <p className="mb-3 text-sm text-[#a0a3b1]">{project.description}</p>

                {/* Meta Info */}
                <div className="mb-4 flex items-center gap-3 text-xs text-[#7a7d8c]">
                  <span>{project.lastEdited}</span>
                  <span>•</span>
                  <span>챕터 {project.chaptersCompleted}/{project.totalChapters}</span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#7a7d8c]">진행률</span>
                    <span className="font-medium text-accent">{project.progress}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-navy-800">
                    <div
                      className="h-full bg-gradient-to-r from-accent to-accent-light transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State (if no projects) */}
        {projects.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-navy-700 bg-card/30 py-20">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-navy-800">
              <BookOpen className="h-10 w-10 text-[#a0a3b1]" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-[#e4e6eb]">아직 프로젝트가 없어요</h3>
            <p className="mb-6 text-[#a0a3b1]">첫 번째 자서전 프로젝트를 시작해보세요</p>
            <Link
              href="/projects/new"
              className="flex items-center gap-2 rounded-lg bg-accent px-6 py-3 font-medium text-white transition-colors hover:bg-accent-hover"
            >
              <Plus className="h-5 w-5" />
              <span>새 프로젝트 만들기</span>
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
