"use client";

import Link from "next/link";
import { Mic2 } from "lucide-react";

export function Navigation() {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-[#1F6F63]/20 bg-[#0B0F0E]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#2BA08C] to-[#1F6F63]">
            <Mic2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl tracking-tight text-[#E6F0ED]">Onyu.ai</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link
            href="/#overview"
            className="text-sm text-[#E6F0ED]/70 transition-colors hover:text-[#2BA08C]"
          >
            소개
          </Link>
          <Link
            href="/#features"
            className="text-sm text-[#E6F0ED]/70 transition-colors hover:text-[#2BA08C]"
          >
            예시
          </Link>
          <Link
            href="/#guide"
            className="text-sm text-[#E6F0ED]/70 transition-colors hover:text-[#2BA08C]"
          >
            가이드
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-[#2BA08C] transition-colors hover:text-[#E6F0ED]"
          >
            대시보드
          </Link>
        </div>
      </div>
    </nav>
  );
}
