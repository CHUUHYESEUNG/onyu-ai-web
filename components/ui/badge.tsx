"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement>;

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1 rounded-md border border-[#2BA08C]/40 bg-[#2BA08C]/10 px-3 py-1 text-xs font-medium text-[#2BA08C]",
          className,
        )}
        {...props}
      />
    );
  },
);

Badge.displayName = "Badge";
