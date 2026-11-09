"use client";
// easeui.dev/components/motion/tabs

import { MotionConfig, motion, useReducedMotion } from "motion/react";
import {
  createContext,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useContext,
  useId,
  useMemo,
  useState,
} from "react";
import { cn } from "@/lib/utils";

type Variant = "pill" | "segment" | "underline";

interface TabsContextValue {
  value: string;
  select: (value: string) => void;
  baseId: string;
  variant: Variant;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs(part: string) {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error(`${part} must be used inside <Tabs>`);
  return ctx;
}

const EASE = [0.23, 1, 0.32, 1] as const;
const INDICATOR_TRANSITION = { duration: 0.2, ease: EASE } as const;

const LIST_CLASS: Record<Variant, string> = {
  pill: "inline-flex items-center gap-1 rounded-2xl bg-slate-900/80 p-1.5 border border-slate-800 backdrop-blur-md",
  segment: "inline-flex items-center gap-0.5 rounded-xl bg-slate-900/80 p-1 border border-slate-800",
  underline: "flex items-center gap-5 border-b border-slate-800",
};

const TRIGGER_CLASS: Record<Variant, string> = {
  pill: "min-h-8 rounded-xl px-3.5 py-1.5 text-xs font-bold",
  segment: "min-h-7 rounded-lg px-3 py-1 text-xs font-semibold",
  underline: "-mb-px min-h-10 px-1 text-sm font-medium",
};

const INDICATOR_CLASS: Record<Variant, string> = {
  pill: "absolute inset-0 rounded-xl bg-teal-500 shadow-md shadow-teal-500/25",
  segment: "absolute inset-0 rounded-lg bg-slate-800 shadow-sm",
  underline: "absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-teal-400",
};

export interface TabsProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  variant?: Variant;
  className?: string;
  children: ReactNode;
}

export function Tabs({
  value,
  defaultValue,
  onValueChange,
  variant = "pill",
  className,
  children,
}: TabsProps) {
  const [inner, setInner] = useState(defaultValue ?? "");
  const baseId = useId();
  const reduce = useReducedMotion();
  const current = value ?? inner;

  const select = useCallback(
    (next: string) => {
      if (value === undefined) setInner(next);
      onValueChange?.(next);
    },
    [value, onValueChange],
  );

  const ctx = useMemo(
    () => ({ value: current, select, baseId, variant }),
    [current, select, baseId, variant],
  );

  return (
    <TabsContext.Provider value={ctx}>
      <MotionConfig transition={reduce ? { duration: 0 } : INDICATOR_TRANSITION}>
        <motion.div layoutRoot className={className}>
          {children}
        </motion.div>
      </MotionConfig>
    </TabsContext.Provider>
  );
}

const NAV_KEYS = new Set(["ArrowRight", "ArrowLeft", "Home", "End"]);

export function TabsList({ className, children }: { className?: string; children: ReactNode }) {
  const { variant } = useTabs("TabsList");

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!NAV_KEYS.has(event.key)) return;
    const tabs = Array.from(
      event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)'),
    );
    const index = tabs.indexOf(document.activeElement as HTMLButtonElement);
    if (index < 0) return;
    event.preventDefault();
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? tabs.length - 1
          : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
    tabs[next].focus();
    tabs[next].click();
  };

  return (
    <div role="tablist" onKeyDown={onKeyDown} className={cn(LIST_CLASS[variant], className)}>
      {children}
    </div>
  );
}

export interface TabsTriggerProps {
  value: string;
  className?: string;
  activeClassName?: string;
  inactiveClassName?: string;
  indicatorClassName?: string;
  children: ReactNode;
}

export function TabsTrigger({
  value,
  className,
  activeClassName,
  inactiveClassName,
  indicatorClassName,
  children,
}: TabsTriggerProps) {
  const ctx = useTabs("TabsTrigger");
  const active = ctx.value === value;

  return (
    <button
      type="button"
      role="tab"
      id={`${ctx.baseId}-tab-${value}`}
      aria-selected={active}
      aria-controls={`${ctx.baseId}-panel-${value}`}
      tabIndex={active || !ctx.value ? 0 : -1}
      onClick={() => ctx.select(value)}
      className={cn(
        "relative inline-flex cursor-pointer touch-manipulation items-center justify-center whitespace-nowrap outline-none transition-colors duration-150",
        "focus-visible:ring-2 focus-visible:ring-teal-400/40",
        TRIGGER_CLASS[ctx.variant],
        active
          ? activeClassName || (ctx.variant === "pill" ? "text-slate-950 font-bold" : "text-white")
          : inactiveClassName || "text-slate-400 hover:text-white",
        className,
      )}
    >
      {active ? (
        <motion.span
          layoutId={`${ctx.baseId}-indicator`}
          aria-hidden="true"
          className={cn(INDICATOR_CLASS[ctx.variant], indicatorClassName)}
        />
      ) : null}
      <span className="relative z-10 flex items-center gap-1.5">{children}</span>
    </button>
  );
}

export interface TabsContentProps {
  value: string;
  className?: string;
  children: ReactNode;
}

export function TabsContent({ value, className, children }: TabsContentProps) {
  const ctx = useTabs("TabsContent");
  const reduce = useReducedMotion();
  const active = ctx.value === value;

  return (
    <motion.div
      role="tabpanel"
      id={`${ctx.baseId}-panel-${value}`}
      aria-labelledby={`${ctx.baseId}-tab-${value}`}
      hidden={!active}
      initial={false}
      animate={{ opacity: active ? 1 : 0 }}
      transition={{ duration: reduce ? 0 : 0.15, ease: EASE }}
      className={cn("mt-4", className)}
    >
      {children}
    </motion.div>
  );
}
