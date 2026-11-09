// easeui.dev/components/motion/badge
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "neutral" | "accent" | "success" | "warning" | "destructive";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Color treatment. Default "neutral". */
  variant?: BadgeVariant;
}

const VARIANT_CLASS: Record<BadgeVariant, string> = {
  neutral: "bg-slate-800 text-slate-300 border border-slate-700/80",
  accent: "bg-teal-500/15 text-teal-300 border border-teal-500/30",
  success: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
  warning: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
  destructive: "bg-rose-500/15 text-rose-300 border border-rose-500/30",
};

/** A small status pill. Crossfades color when its variant changes, such as pending to success. */
export function Badge({ variant = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors duration-150 ease-out",
        VARIANT_CLASS[variant],
        className,
      )}
      {...props}
    />
  );
}
