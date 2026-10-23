"use client";
// easeui.dev/components/motion/text-animation

import { motion, useReducedMotion } from "motion/react";
import { type ElementType, type ReactNode, useEffect, useRef, useState } from "react";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

const SCRAMBLE_GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&@$?/";
/** Scramble tick rate. Fast enough to read as noise, cheap enough for a plain interval. */
const SCRAMBLE_FRAME_MS = 40;
/**
 * The shimmer highlight sweeps across an oversized gradient, on loop. With a
 * 200% background-size, a background-position swing of exactly 200 points
 * moves the paint by exactly one tile width (the pixel shift is (container -
 * image) * ΔP/100 = -container * 2, i.e. one image-width, since image =
 * 2×container) — so the pattern lines back up perfectly and the loop
 * restart is invisible instead of jumping.
 */
const SHIMMER_SWEEP: Keyframe[] = [{ backgroundPosition: "200% 0" }, { backgroundPosition: "0% 0" }];

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export interface TextAnimationProps {
  /** Which animation runs. */
  variant: "scramble" | "reveal" | "shimmer";
  /** Text to animate. Reveal accepts an array to render each entry as its own line. Required for scramble and reveal. */
  text?: string | string[];
  /** Content to animate. Shimmer takes children instead of `text`, so it can wrap rich markup. */
  children?: ReactNode;
  className?: string;
  /** Class name applied to each individual animated word/char */
  tokenClassName?: string;
  /** Scramble: max duration in milliseconds, default 900. Shimmer: seconds per sweep, default 2.5. */
  duration?: number;
  /** Scramble only. Characters sampled while unresolved positions are scrambling. */
  glyphs?: string;
  /** Scramble only. Loop animation periodically. Default false. */
  loop?: boolean;
  /** Scramble only. Period between repeats in milliseconds. Default 5000 (5s). */
  interval?: number;
  /** Reveal only. Element the lines render inside. Default span. */
  as?: ElementType;
  /** Reveal only. Splits each line into words or characters. Default word. */
  split?: "word" | "char";
  /** Reveal only. Delay between each word or character, in seconds. Default 0.09. */
  stagger?: number;
  /** Reveal only. Delay before the first element, in seconds. Default 0. */
  delay?: number;
  /** Reveal only. Starting blur, in pixels. Default 12. */
  blur?: number;
  /** Reveal only. Starting vertical offset. Default "40%". */
  yOffset?: string | number;
  /** Reveal only. Switches from the default tween to a spring with these physical params. */
  spring?: { stiffness?: number; damping?: number; mass?: number };
  /** Reveal only. With whileInView, only plays the first time it enters view. Default true. */
  once?: boolean;
  /** Reveal only. Reveals when scrolled into view instead of on mount. Default false. */
  whileInView?: boolean;
}

function ScrambleText({
  text,
  duration = 1000,
  glyphs = SCRAMBLE_GLYPHS,
  className,
  tokenClassName,
  loop = false,
  interval = 5000,
}: TextAnimationProps) {
  const [display, setDisplay] = useState(text as string);
  const frame = useRef(0);
  const scrambleIntervalId = useRef<number | null>(null);
  const loopIntervalId = useRef<number | null>(null);

  useEffect(() => {
    const value = text as string;
    if (prefersReducedMotion()) {
      setDisplay(value);
      return;
    }

    const totalFrames = Math.max(1, Math.round(duration / SCRAMBLE_FRAME_MS));

    const runScramble = () => {
      if (scrambleIntervalId.current) {
        window.clearInterval(scrambleIntervalId.current);
      }
      frame.current = 0;

      scrambleIntervalId.current = window.setInterval(() => {
        frame.current += 1;
        const progress = frame.current / totalFrames;

        setDisplay(
          value
            .split("")
            .map((char, index) => {
              if (char === " " || char === "\n") return char;
              // Resolves left to right, each position settling a bit before the next.
              const resolvesAt = (index + 1) / value.length;
              return progress >= resolvesAt
                ? char
                : glyphs[Math.floor(Math.random() * glyphs.length)];
            })
            .join(""),
        );

        if (frame.current >= totalFrames) {
          if (scrambleIntervalId.current) {
            window.clearInterval(scrambleIntervalId.current);
            scrambleIntervalId.current = null;
          }
          setDisplay(value);
        }
      }, SCRAMBLE_FRAME_MS);
    };

    // Run on initial mount
    runScramble();

    // If loop is enabled, repeat every `interval` ms
    if (loop) {
      const intervalMs = interval < 100 ? interval * 1000 : interval;
      loopIntervalId.current = window.setInterval(() => {
        if (typeof document !== "undefined" && document.hidden) return;
        runScramble();
      }, intervalMs);
    }

    return () => {
      if (scrambleIntervalId.current) window.clearInterval(scrambleIntervalId.current);
      if (loopIntervalId.current) window.clearInterval(loopIntervalId.current);
    };
  }, [text, duration, glyphs, loop, interval]);

  return (
    <span className={cn("inline-block", className)}>
      <span aria-hidden="true" className={tokenClassName}>{display}</span>
      <span className="sr-only">{text}</span>
    </span>
  );
}

function ShimmerText({
  duration = 1.8,
  interval = 5000,
  loop = true,
  className,
  children,
  text,
}: TextAnimationProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const animationRef = useRef<Animation | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof element.animate !== "function") return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return;

    let onScreen = true;
    let timer: number | null = null;

    const sweepDurationMs = duration > 50 ? duration : duration * 1000;
    const intervalMs = interval ? (interval < 50 ? interval * 1000 : interval) : 5000;

    const runSweep = () => {
      if (!onScreen || (typeof document !== "undefined" && document.hidden)) return;
      if (animationRef.current) {
        animationRef.current.cancel();
      }
      animationRef.current = element.animate(
        [
          { backgroundPosition: "200% 0" },
          { backgroundPosition: "-200% 0" },
        ],
        {
          duration: sweepDurationMs,
          iterations: 1,
          easing: "cubic-bezier(0.23, 1, 0.32, 1)",
        }
      );
    };

    // Run sweep initially on mount
    runSweep();

    // If loop is enabled, repeat periodically every intervalMs
    if (loop) {
      timer = window.setInterval(runSweep, intervalMs);
    }

    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen && loop && !timer) {
        timer = window.setInterval(runSweep, intervalMs);
      } else if (!onScreen && timer) {
        window.clearInterval(timer);
        timer = null;
      }
    });
    observer.observe(element);

    return () => {
      observer.disconnect();
      if (timer) window.clearInterval(timer);
      if (animationRef.current) animationRef.current.cancel();
    };
  }, [duration, interval, loop]);

  return (
    <span
      ref={ref}
      className={cn(
        "inline-block bg-clip-text text-transparent [-webkit-background-clip:text]",
        className,
      )}
      style={{
        backgroundImage:
          "linear-gradient(90deg, #2dd4bf 0%, #34d399 30%, #ffffff 50%, #22d3ee 70%, #2dd4bf 100%)",
        backgroundSize: "200% 100%",
        backgroundPosition: "200% 0",
      }}
    >
      {children ?? (typeof text === "string" ? text : Array.isArray(text) ? text.join(" ") : null)}
    </span>
  );
}

function splitLine(line: string, split: "word" | "char") {
  return split === "char" ? Array.from(line) : line.split(" ");
}

function RevealText({
  text,
  as: As = "span",
  className,
  tokenClassName,
  split = "word",
  stagger = 0.09,
  delay = 0,
  blur = 12,
  yOffset = "40%",
  spring,
  once = true,
  whileInView = false,
}: TextAnimationProps) {
  const reduce = useReducedMotion();
  const lines = Array.isArray(text) ? text : [text as string];
  const transition = spring ? { type: "spring" as const, ...spring } : { duration: 0.4, ease: EASE_OUT };

  let index = -1;

  return (
    <As className={cn("inline-block", className)}>
      {lines.map((line, lineIndex) => (
        <span key={lineIndex} className={cn("inline-flex flex-wrap gap-x-[0.25em]", split === "word" && "inline-flex")}>
          {splitLine(line, split).map((token) => {
            index += 1;
            const tokenDelay = delay + index * stagger;
            return (
              <motion.span
                key={index}
                className={cn("inline-block", tokenClassName)}
                initial={reduce ? false : { opacity: 0, y: yOffset, filter: `blur(${blur}px)` }}
                animate={whileInView ? undefined : { opacity: 1, y: 0, filter: "blur(0px)" }}
                whileInView={whileInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
                viewport={whileInView ? { once } : undefined}
                transition={{ ...transition, delay: tokenDelay }}
              >
                {token === "" ? " " : token}
              </motion.span>
            );
          })}
        </span>
      ))}
    </As>
  );
}

/**
 * One component for animated text, switched with `variant`: `scramble`
 * resolves random glyphs into the final characters, `reveal` slides words or
 * characters up out of a blur, and `shimmer` sweeps a highlight band across a
 * loop for a loading or emphasis state. Reduced motion shows the final text
 * still, with no animation.
 */
export function TextAnimation(props: TextAnimationProps) {
  if (props.variant === "scramble") return <ScrambleText {...props} />;
  if (props.variant === "shimmer") return <ShimmerText {...props} />;
  return <RevealText {...props} />;
}
