"use client";

import { useState, Dispatch, SetStateAction } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Home,
  Rocket,
  Newspaper,
  UsersRound,
  BriefcaseMedical,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface ProjectShellProps {
  breadcrumb: Array<{ label: string; href?: string }>;
  children: React.ReactNode;
}

const sidebarItems = [
  { label: "내 프로젝트", sub: "진행중/완료", icon: Rocket, href: "/projects" },
  { label: "콘텐츠 블로그", sub: "제작 가이드", icon: Newspaper, href: "#" },
  { label: "커뮤니티", sub: "가족 · 에디터 허브", icon: UsersRound, href: "#" },
  { label: "스타트업 툴킷", sub: "자료실", icon: BriefcaseMedical, href: "#" },
];

export function ProjectShell({ breadcrumb, children }: ProjectShellProps) {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div className="min-h-screen bg-[#05060C] text-white flex">
      <ProjectSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex-1 flex flex-col">
        <ProjectTopBar breadcrumb={breadcrumb} />
        <main className="flex-1 px-8 py-8 space-y-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

function ProjectSidebar({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <nav
      className={`hidden ${collapsed ? "w-24" : "w-64"} flex-col border-r border-white/5 bg-[#03040a] py-6 md:flex transition-all duration-300`}
      onMouseEnter={() => setCollapsed(false)}
      onMouseLeave={() => setCollapsed(true)}
    >
      <div className="flex flex-col items-center gap-4 px-4">
        <button
          onClick={() => setCollapsed((prev) => !prev)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 hover:text-white"
          aria-label="toggle sidebar"
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        </button>
        <Link href="/" className="flex items-center justify-center">
          <Image src="/logo/oy_logo_white.png" alt="onyu" width={40} height={40} priority />
        </Link>
      </div>
      <div className="mt-6 flex flex-col gap-3 px-4">
        {sidebarItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition ${collapsed ? "justify-center" : ""} hover:bg-white/5`}
          >
            <item.icon className="h-5 w-5 text-white/70" />
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-semibold text-white">{item.label}</span>
                <span className="text-xs text-white/40">{item.sub}</span>
              </div>
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}

function ProjectTopBar({ breadcrumb }: { breadcrumb: Array<{ label: string; href?: string }> }) {
  return (
    <header className="flex items-center justify-between border-b border-white/5 bg-[#05060C]/80 px-8 py-5">
      <div className="flex items-center gap-2 text-sm text-white/60">
        {breadcrumb.map((crumb, index) => (
          <span key={crumb.label} className="flex items-center gap-2">
            {crumb.href ? (
              <Link href={crumb.href} className="text-white hover:text-[#1E5EFF]">
                {crumb.label}
              </Link>
            ) : (
              <span className="text-white/40">{crumb.label}</span>
            )}
            {index < breadcrumb.length - 1 && <span>/</span>}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-3 text-sm">
        <button className="rounded-full border border-white/10 px-4 py-2 text-white/70 hover:border-white/40">
          업그레이드
        </button>
        <button className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-white/80">
          <span>장혜승</span>
          <span className="h-8 w-8 rounded-full bg-[#1E5EFF]" />
        </button>
      </div>
    </header>
  );
}
