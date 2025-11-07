"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { UpgradeModal } from "@/components/upgrade-modal";

export function Navigation() {
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-navy-800/50 bg-gradient-to-r from-navy-900/90 via-navy-900/60 to-navy-900/90 backdrop-blur-xl">
      <UpgradeModal open={isUpgradeOpen} onClose={() => setIsUpgradeOpen(false)} />
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo/oy_logo_white.png"
            alt="Onyu.ai 로고"
            width={72}
            height={16}
            priority
          />
        </Link>

        <div className="hidden items-center gap-8 text-sm md:flex">
          <Link
            href="/#overview"
            className="text-[#E6F0ED]/70 transition-colors hover:text-white"
          >
            홈
          </Link>
          <Link
            href="/projects"
            className="font-medium text-[#2BA08C] transition-colors hover:text-white"
          >
            만들기
          </Link>
          <button
            onClick={() => setIsUpgradeOpen(true)}
            className="rounded-full border border-accent/40 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition-all hover:border-white/80"
          >
            업그레이드
          </button>
        </div>
      </div>
    </nav>
  );
}
