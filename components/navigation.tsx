"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { UpgradeModal } from "@/components/upgrade-modal";

export function Navigation() {
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-[#E5E9F5] bg-[rgba(255,255,255,0.9)] backdrop-blur-md">
      <UpgradeModal open={isUpgradeOpen} onClose={() => setIsUpgradeOpen(false)} />
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3 text-[#0C1523]">
          <Image
            src="/logo/oy_logo_black.png"
            alt="Onyu.ai 로고"
            width={64}
            height={14}
            priority
          />
        </Link>

        <div className="hidden items-center gap-6 text-sm text-[#384153] md:flex">
          <button
            onClick={() => setIsUpgradeOpen(true)}
            className="rounded-full border border-[#CBD5F0] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#1E5EFF] transition-colors hover:border-[#1E5EFF]"
          >
            업그레이드
          </button>
          <Link
            href="/projects/new"
            className="rounded-full bg-[#1E5EFF] px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-[0_10px_30px_rgba(30,94,255,0.3)]"
          >
            시작하기
          </Link>
        </div>
      </div>
    </nav>
  );
}
