"use client";
// easeui.dev/components/motion/gradient-text

import { type ComponentProps, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/** Default vibrant teal-emerald-cyan palette matching the app theme */
const DEFAULT_GRADIENT =
  "linear-gradient(90deg, #5eead4, #34d399, #22d3ee, #5eead4)";

/** The visible window circles around the oversized gradient, so the colors drift through the text. */
const DRIFT: Keyframe[] = [
  { backgroundPosition: "0% 50%" },
  { backgroundPosition: "100% 50%" },
  { backgroundPosition: "0% 50%" },
];

export interface GradientTextProps extends Omit<ComponentProps<"span">, "ref"> {
  /** Fills the text with the drifting spectrum. When false the text is muted. Default true. */
  active?: boolean;
  /** Seconds for one full loop. Default 5.5. */
  duration?: number;
  gradient?: string;
}

/**
 * Text filled with a slowly drifting rainbow/gradient from EaseUI.
 * The drift runs through the Web Animations API, so there is no global CSS to install.
 * It pauses while off screen, and with reduced motion the gradient stays still.
 */
export function GradientText({
  active = true,
  duration = 5.5,
  className,
  style,
  gradient,
  children,
  ...props
}: GradientTextProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!active || !element || typeof element.animate !== "function") return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const animation = element.animate(DRIFT, {
      duration: duration * 1000,
      iterations: Number.POSITIVE_INFINITY,
      easing: "linear",
    });
    let onScreen = true;

    const sync = () => {
      if (reducedMotion.matches || !onScreen) animation.pause();
      else animation.play();
    };

    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    });
    observer.observe(element);
    reducedMotion.addEventListener("change", sync);
    sync();

    return () => {
      observer.disconnect();
      reducedMotion.removeEventListener("change", sync);
      animation.cancel();
    };
  }, [active, duration]);

  return (
    <span
      ref={ref}
      data-active={active || undefined}
      className={cn(
        "inline-block pb-[0.05em]",
        active
          ? "bg-clip-text font-semibold text-transparent [-webkit-background-clip:text]"
          : "text-muted-foreground",
        className,
      )}
      style={active ? { backgroundImage: gradient || DEFAULT_GRADIENT, backgroundSize: "200% 200%", ...style } : style}
      {...props}
    >
      {children}
    </span>
  );
}
