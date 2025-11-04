import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Onyu.ai | 목소리를 이야기로",
  description: "말로 전한 기억을 챕터로 엮어주는 Onyu.ai 웹 MVP 프로토타입",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased bg-[#0B0F0E] text-[#E6F0ED]">
        {children}
      </body>
    </html>
  );
}
