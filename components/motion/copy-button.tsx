"use client";
// easeui.dev/components/motion/copy-button

import { Check, Copy } from "lucide-react";
import { type ButtonHTMLAttributes, forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type CopyState = "idle" | "copied" | "failed";

export interface CopyButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "value" | "onCopy"> {
  /** Text written to the clipboard. */
  value: string;
  /** Visible text. Leave it out for an icon only button. */
  label?: string;
  /** Visible text after copying. Default "Disalin". */
  copiedLabel?: string;
  /** How long the copied state stays, in ms. Default 1500. */
  timeout?: number;
  /** Called after the text reaches the clipboard. */
  onCopied?: (value: string) => void;
}

const SWAP =
  "col-start-1 row-start-1 transition-[opacity,scale] duration-200 ease-out motion-reduce:transition-none";
const SHOWN = "scale-100 opacity-100";
const ICON_HIDDEN = "scale-50 opacity-0";
const TEXT_HIDDEN = "scale-[0.97] opacity-0";

export const CopyButton = forwardRef<HTMLButtonElement, CopyButtonProps>(function CopyButton(
  { value, label, copiedLabel = "Disalin", timeout = 1500, onCopied, className, onClick, ...props },
  ref,
) {
  const [state, setState] = useState<CopyState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setState("copied");
      onCopied?.(value);
    } catch {
      setState("failed");
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), timeout);
  };

  const copied = state === "copied";
  const status = copied ? "Disalin ke clipboard" : state === "failed" ? "Gagal menyalin" : "";

  return (
    <button
      ref={ref}
      type="button"
      aria-label={label ?? "Salin"}
      data-state={state}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) void copy();
      }}
      className={cn(
        "relative inline-flex h-9 shrink-0 cursor-pointer touch-manipulation select-none items-center justify-center gap-2 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 outline-none",
        "transition-[background-color,border-color,scale] duration-150 ease-out hover:bg-slate-800 hover:text-white active:scale-[0.97] motion-reduce:active:scale-100",
        "focus-visible:ring-2 focus-visible:ring-teal-400/40",
        copied && "border-emerald-500/50 text-emerald-400",
        label ? "px-3.5" : "w-9 after:absolute after:-inset-1",
        className,
      )}
      {...props}
    >
      <span aria-hidden="true" className="grid place-items-center">
        <Copy className={cn(SWAP, "h-3.5 w-3.5", copied ? ICON_HIDDEN : SHOWN)} />
        <Check className={cn(SWAP, "h-3.5 w-3.5 text-emerald-400", copied ? SHOWN : ICON_HIDDEN)} />
      </span>
      {label ? (
        <span aria-hidden="true" className="grid whitespace-nowrap">
          <span className={cn(SWAP, copied ? TEXT_HIDDEN : SHOWN)}>{label}</span>
          <span className={cn(SWAP, copied ? SHOWN : TEXT_HIDDEN)}>{copiedLabel}</span>
        </span>
      ) : null}
      <span aria-live="polite" className="sr-only">
        {status}
      </span>
    </button>
  );
});
