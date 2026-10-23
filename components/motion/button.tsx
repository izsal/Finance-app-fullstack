"use client";
// easeui.dev/components/motion/button

import { type HTMLMotionProps, motion, useReducedMotion } from "motion/react";
import { forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "teal";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  /** Visual style. Default "primary". */
  variant?: ButtonVariant;
  /** Height and padding. "icon" is a square button for a single icon. Default "md". */
  size?: ButtonSize;
  children?: ReactNode;
}

const PRESS = { scale: 0.97 };
const NO_PRESS = { scale: 1 };
const PRESS_TRANSITION = { duration: 0.15, ease: [0.23, 1, 0.32, 1] } as const;

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  teal: "bg-teal-500 text-slate-950 font-bold hover:bg-teal-400 shadow-lg shadow-teal-500/25",
  primary: "bg-white text-slate-950 font-bold hover:bg-slate-100 shadow-xl shadow-white/10",
  secondary: "bg-slate-900 border border-slate-700 text-slate-200 hover:bg-slate-800 hover:border-slate-600",
  outline: "border border-slate-700 bg-transparent text-slate-200 hover:bg-slate-800/60",
  ghost: "text-slate-400 hover:text-white hover:bg-slate-800/40",
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: "h-8 gap-1.5 px-3 text-xs after:absolute after:-inset-1.5",
  md: "h-10 gap-2 px-4 text-sm",
  lg: "h-12 gap-2.5 px-6 text-base",
  icon: "h-9 w-9 after:absolute after:-inset-1",
};

export const MotionButton = forwardRef<HTMLButtonElement, ButtonProps>(function MotionButton(
  { variant = "primary", size = "md", type = "button", className, children, ...props },
  ref,
) {
  const reduce = useReducedMotion();

  return (
    <motion.button
      ref={ref}
      type={type}
      whileTap={reduce ? NO_PRESS : PRESS}
      transition={PRESS_TRANSITION}
      className={cn(
        "group relative inline-flex shrink-0 cursor-pointer touch-manipulation select-none items-center justify-center rounded-2xl font-semibold outline-none will-change-transform",
        "transition-[background-color,color,box-shadow,border-color] duration-150 ease-out",
        "focus-visible:ring-2 focus-visible:ring-teal-400/50",
        "disabled:pointer-events-none disabled:opacity-50",
        VARIANT_CLASS[variant],
        SIZE_CLASS[size],
        className,
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
});
