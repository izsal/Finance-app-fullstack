"use client";
// easeui.dev/components/motion/dropdown-menu

import { motion, useReducedMotion } from "motion/react";
import {
  type ButtonHTMLAttributes,
  createContext,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

const EASE = [0.23, 1, 0.32, 1] as const;
const OPEN = { duration: 0.15, ease: EASE } as const;
const CLOSE = { duration: 0.1, ease: EASE } as const;

interface DropdownMenuContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
  listRef: RefObject<HTMLDivElement | null>;
  triggerId: string;
  listId: string;
}

const DropdownMenuContext = createContext<DropdownMenuContextValue | null>(null);

function useDropdownMenu(part: string) {
  const ctx = useContext(DropdownMenuContext);
  if (!ctx) throw new Error(`${part} must be used inside <DropdownMenu>`);
  return ctx;
}

function enabledItems(list: HTMLElement | null) {
  return Array.from(
    list?.querySelectorAll<HTMLButtonElement | HTMLAnchorElement>('[role="menuitem"]:not(:disabled)') ?? [],
  );
}

export interface DropdownMenuProps {
  /** Controlled open state. */
  open?: boolean;
  /** Initial open state when uncontrolled. Default false. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  children: ReactNode;
}

export function DropdownMenu({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  className,
  children,
}: DropdownMenuProps) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [innerOpen, setInnerOpen] = useState(defaultOpen);
  const open = openProp ?? innerOpen;

  const setOpen = useCallback(
    (next: boolean) => {
      if (openProp === undefined) setInnerOpen(next);
      onOpenChange?.(next);
    },
    [openProp, onOpenChange],
  );

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [open, setOpen]);

  const ctx = useMemo<DropdownMenuContextValue>(
    () => ({
      open,
      setOpen,
      triggerRef,
      listRef,
      triggerId: `${id}-trigger`,
      listId: `${id}-menu`,
    }),
    [open, setOpen, id],
  );

  return (
    <DropdownMenuContext.Provider value={ctx}>
      <div ref={rootRef} className={cn("relative inline-block", className)}>
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
}

export type DropdownMenuTriggerProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "type" | "id" | "onClick" | "onKeyDown"
>;

export function DropdownMenuTrigger({
  className,
  children,
  ...props
}: DropdownMenuTriggerProps) {
  const m = useDropdownMenu("DropdownMenuTrigger");

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      m.setOpen(true);
    }
  };

  return (
    <button
      ref={m.triggerRef}
      type="button"
      id={m.triggerId}
      aria-haspopup="menu"
      aria-expanded={m.open}
      aria-controls={m.listId}
      onClick={() => m.setOpen(!m.open)}
      onKeyDown={onKeyDown}
      className={cn(
        "relative inline-flex cursor-pointer touch-manipulation items-center justify-center rounded-xl text-slate-300 outline-none transition-colors duration-150",
        "hover:text-white",
        "focus-visible:ring-2 focus-visible:ring-teal-400/40",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export interface DropdownMenuContentProps {
  /** Which trigger edge the menu hangs from. Default "start". */
  align?: "start" | "end" | "center";
  className?: string;
  children: ReactNode;
}

export function DropdownMenuContent({
  align = "start",
  className,
  children,
}: DropdownMenuContentProps) {
  const m = useDropdownMenu("DropdownMenuContent");
  const reduce = useReducedMotion();
  const [placement, setPlacement] = useState<"top" | "bottom">("bottom");
  const { open, triggerRef, listRef } = m;

  useLayoutEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    const list = listRef.current;
    if (!trigger || !list) return;
    const rect = trigger.getBoundingClientRect();
    const below = window.innerHeight - rect.bottom;
    setPlacement(below < list.offsetHeight + 16 && rect.top > below ? "top" : "bottom");
  }, [open, triggerRef, listRef]);

  useEffect(() => {
    if (!open) return;
    (enabledItems(listRef.current)[0] as HTMLElement)?.focus({ preventScroll: true });
  }, [open, listRef]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      m.setOpen(false);
      triggerRef.current?.focus();
      return;
    }
    if (event.key === "Tab") {
      m.setOpen(false);
      return;
    }
    const items = enabledItems(listRef.current) as HTMLElement[];
    if (items.length === 0) return;
    const index = items.indexOf(document.activeElement as HTMLElement);
    const next =
      event.key === "ArrowDown"
        ? index + 1
        : event.key === "ArrowUp"
          ? index - 1
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? items.length - 1
              : null;
    if (next === null) return;
    event.preventDefault();
    items[(next + items.length) % items.length].focus();
  };

  const isTop = placement === "top";
  const alignClass =
    align === "end"
      ? "right-0"
      : align === "center"
        ? "left-1/2 -translate-x-1/2"
        : "left-0";

  return (
    <motion.div
      ref={listRef}
      id={m.listId}
      role="menu"
      aria-labelledby={m.triggerId}
      aria-hidden={!open}
      inert={!open}
      onKeyDown={onKeyDown}
      initial={false}
      animate={reduce ? { opacity: open ? 1 : 0 } : { opacity: open ? 1 : 0, scale: open ? 1 : 0.96 }}
      transition={reduce ? { duration: 0 } : open ? OPEN : CLOSE}
      style={{
        transformOrigin: `${isTop ? "bottom" : "top"} ${align === "end" ? "right" : align === "center" ? "center" : "left"}`,
        pointerEvents: open ? "auto" : "none",
      }}
      className={cn(
        "absolute z-50 flex min-w-52 max-w-[calc(100vw-2rem)] flex-col gap-1 rounded-2xl border border-slate-800 bg-slate-900/95 p-1.5 backdrop-blur-2xl shadow-2xl shadow-black/80",
        isTop ? "bottom-full mb-2" : "top-full mt-2",
        alignClass,
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

export interface DropdownMenuItemProps {
  onSelect?: () => void;
  disabled?: boolean;
  destructive?: boolean;
  className?: string;
  href?: string;
  children: ReactNode;
}

export function DropdownMenuItem({
  onSelect,
  disabled = false,
  destructive = false,
  className,
  href,
  children,
}: DropdownMenuItemProps) {
  const m = useDropdownMenu("DropdownMenuItem");

  const commonClass = cn(
    "flex min-h-9 w-full cursor-pointer touch-manipulation items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs sm:text-sm font-medium outline-none transition-colors duration-150",
    destructive
      ? "text-rose-400 hover:bg-rose-500/10 focus:bg-rose-500/10"
      : "text-slate-300 hover:bg-slate-800 hover:text-white focus:bg-slate-800 focus:text-white",
    "disabled:pointer-events-none disabled:opacity-50",
    className,
  );

  const handleClick = () => {
    onSelect?.();
    m.setOpen(false);
    m.triggerRef.current?.focus();
  };

  if (href) {
    return (
      <a
        href={href}
        role="menuitem"
        tabIndex={-1}
        onClick={handleClick}
        className={commonClass}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      tabIndex={-1}
      onClick={handleClick}
      className={commonClass}
    >
      {children}
    </button>
  );
}

export function DropdownMenuSeparator({ className }: { className?: string }) {
  return <hr className={cn("-mx-1 my-1 border-t border-slate-800/80", className)} />;
}
