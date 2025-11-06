"use client";

import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-[#1F6F63]/20 bg-[#0B0F0E] py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <Image
              src="/logo/oy_logo_white.png"
              alt="Onyu.ai 로고"
              width={70}
              height={16}
              className="mb-4"
            />
            <p className="text-sm text-[#E6F0ED]/60">당신의 목소리가 한 편의 이야기로.</p>
          </div>

          <div>
            <h4 className="mb-4 text-[#E6F0ED]">서비스</h4>
            <ul className="space-y-2 text-sm text-[#E6F0ED]/60">
              <li>
                <a className="transition-colors hover:text-[#2BA08C]" href="#start">
                  시작하기
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-[#2BA08C]" href="#examples">
                  예시 보기
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-[#2BA08C]" href="#pricing">
                  가격
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-[#E6F0ED]">지원</h4>
            <ul className="space-y-2 text-sm text-[#E6F0ED]/60">
              <li>
                <a className="transition-colors hover:text-[#2BA08C]" href="#help">
                  도움말
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-[#2BA08C]" href="#contact">
                  문의하기
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-[#2BA08C]" href="#faq">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-[#E6F0ED]">법적 고지</h4>
            <ul className="space-y-2 text-sm text-[#E6F0ED]/60">
              <li>
                <a className="transition-colors hover:text-[#2BA08C]" href="#terms">
                  이용약관
                </a>
              </li>
              <li>
                <a className="transition-colors hover:text-[#2BA08C]" href="#privacy">
                  개인정보처리방침
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-[#1F6F63]/20 pt-8 text-center text-sm text-[#E6F0ED]/40">
          © 2025 Onyu.ai. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
