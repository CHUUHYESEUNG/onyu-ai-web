"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg" | "icon";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-white hover:bg-accent-hover hover:shadow-[0_0_24px_rgba(91,124,255,0.3)]",
  outline:
    "border border-navy-700 text-[#e4e6eb] hover:bg-accent/10 hover:border-accent",
  ghost: "text-[#e4e6eb] hover:text-white hover:bg-white/10",
};

// 어르신 친화적 크기: 최소 48px, 권장 56px
const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-12 px-6 text-lg",    // 36px → 48px, 터치 타겟 최소 기준
  md: "h-14 px-8 text-xl",    // 48px → 56px, 어르신 권장 크기
  lg: "h-16 px-10 text-2xl",  // 56px → 64px, 주요 CTA용
  icon: "h-14 w-14",          // 48px → 56px, 아이콘 버튼 확대
};

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:pointer-events-none disabled:opacity-60",
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
