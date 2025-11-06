"use client";

import Link from "next/link";
import { Plus, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";

export default function DashboardPage() {
  // 목업 프로젝트 데이터
  const projects = [
    {
      id: "project-1",
      title: "나의 자서전",
      progress: 45,
      lastEdited: "2024-03-15",
      chaptersCompleted: 3,
      totalChapters: 7,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B0F0E] text-[#E6F0ED]">
      <Navigation />
      
      <main className="mx-auto max-w-7xl px-6 py-20">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-semibold text-[#E6F0ED]">내 프로젝트</h1>
            <p className="mt-2 text-[#A8C3BC]">진행 중인 자서전 프로젝트를 관리하세요</p>
          </div>
          
          <Button className="gap-2">
            <Plus className="h-5 w-5" />
            새 프로젝트
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}/edit`}
              className="group"
            >
              <div className="rounded-2xl border border-[#2BA08C]/20 bg-[#0E1513] p-6 transition-all hover:border-[#2BA08C]/40 hover:shadow-[0_0_30px_rgba(43,160,140,0.15)]">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-[#2BA08C] to-[#1F6F63]">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm text-[#A8C3BC]">{project.lastEdited}</span>
                </div>

                <h3 className="mb-2 text-xl font-medium text-[#E6F0ED] group-hover:text-[#2BA08C]">
                  {project.title}
                </h3>

                <p className="mb-4 text-sm text-[#A8C3BC]">
                  챕터 {project.chaptersCompleted}/{project.totalChapters} 완료
                </p>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#A8C3BC]">진행률</span>
                    <span className="font-medium text-[#2BA08C]">{project.progress}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#0B0F0E]">
                    <div
                      className="h-full bg-gradient-to-r from-[#1F6F63] to-[#2BA08C]"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
