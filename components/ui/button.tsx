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

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-12 px-6 text-base",
  lg: "h-14 px-8 text-lg",
  icon: "h-12 w-12",
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
