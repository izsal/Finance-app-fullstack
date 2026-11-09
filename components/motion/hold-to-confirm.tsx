"use client";
// easeui.dev/components/motion/hold-to-confirm

import { Check } from "lucide-react";
import {
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

/** How long the confirmed state stays before the button resets, in ms. */
const RESET_MS = 2000;
const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";

type HoldState = "idle" | "holding" | "done";

export interface HoldToConfirmProps {
  /** Runs once the hold completes. */
  onConfirm: () => void;
  /** Button label, such as "Tahan untuk Hapus". */
  children: ReactNode;
  /** Label shown with a check after confirming. Default "Selesai". */
  confirmedLabel?: ReactNode;
  /** How long to hold, in ms. Default 1500. */
  duration?: number;
  disabled?: boolean;
  className?: string;
  fillClassName?: string;
}

const LABEL =
  "col-start-1 row-start-1 inline-flex items-center justify-center gap-1.5 whitespace-nowrap transition-[opacity,scale] duration-200 ease-out motion-reduce:transition-none";

function Labels({ done, idle, confirmed }: { done: boolean; idle: ReactNode; confirmed: ReactNode }) {
  return (
    <span className="grid">
      <span aria-hidden={done} className={cn(LABEL, done ? "scale-[0.97] opacity-0" : "opacity-100")}>
        {idle}
      </span>
      <span aria-hidden={!done} className={cn(LABEL, done ? "opacity-100" : "scale-[0.97] opacity-0")}>
        <Check aria-hidden="true" className="h-4 w-4" />
        {confirmed}
      </span>
    </span>
  );
}

export function HoldToConfirm({
  onConfirm,
  children,
  confirmedLabel = "Selesai",
  duration = 1500,
  disabled,
  className,
  fillClassName = "bg-rose-600 text-white",
}: HoldToConfirmProps) {
  const hintId = useId();
  const [state, setState] = useState<HoldState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const start = () => {
    if (disabled || state !== "idle") return;
    setState("holding");
    timer.current = setTimeout(() => {
      setState("done");
      onConfirm();
      timer.current = setTimeout(() => setState("idle"), RESET_MS);
    }, duration);
  };

  const release = () => {
    if (state !== "holding") return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setState("idle");
  };

  const isConfirmKey = (event: KeyboardEvent) => event.key === " " || event.key === "Enter";
  const done = state === "done";

  const fillTransition =
    state === "holding"
      ? `clip-path ${duration}ms linear`
      : `clip-path ${done ? 150 : 300}ms ${EASE_OUT}`;

  return (
    <button
      type="button"
      disabled={disabled}
      aria-describedby={hintId}
      data-state={state}
      onPointerDown={(event: PointerEvent<HTMLButtonElement>) => {
        if (event.button !== 0) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        start();
      }}
      onPointerUp={release}
      onPointerCancel={release}
      onKeyDown={(event) => {
        if (!isConfirmKey(event) || event.repeat) return;
        event.preventDefault();
        start();
      }}
      onKeyUp={(event) => {
        if (!isConfirmKey(event)) return;
        event.preventDefault();
        release();
      }}
      onContextMenu={(event) => event.preventDefault()}
      className={cn(
        "relative inline-flex h-10 touch-manipulation select-none items-center justify-center overflow-hidden rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white outline-none cursor-pointer",
        "border border-slate-700 transition-[scale] duration-150 ease-out active:scale-[0.97] motion-reduce:active:scale-100",
        "focus-visible:ring-2 focus-visible:ring-rose-500/50",
        "disabled:pointer-events-none disabled:opacity-50",
        done && "pointer-events-none border-emerald-500/50",
        className,
      )}
    >
      <Labels done={done} idle={children} confirmed={confirmedLabel} />
      <span
        aria-hidden="true"
        className={cn("absolute inset-0 flex items-center justify-center px-5 font-semibold", fillClassName)}
        style={{
          clipPath: state === "idle" ? "inset(0 100% 0 0)" : "inset(0 0 0 0)",
          transition: fillTransition,
        }}
      >
        <Labels done={done} idle={children} confirmed={confirmedLabel} />
      </span>
    </button>
  );
}
