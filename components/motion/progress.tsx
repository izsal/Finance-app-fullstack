// easeui.dev/components/motion/progress
import { cn } from "@/lib/utils";

export interface ProgressProps {
  /** 0 to 100. Omitted, the bar runs indeterminate. */
  value?: number;
  /** Shows the percentage above the bar. Ignored when indeterminate. Default false. */
  showValue?: boolean;
  className?: string;
  barClassName?: string;
}

/** A progress bar that fills with scale, not width, so it stays cheap to animate on the GPU compositor. */
export function Progress({ value, showValue = false, className, barClassName }: ProgressProps) {
  const clamped = value === undefined ? undefined : Math.min(100, Math.max(0, value));

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {showValue && clamped !== undefined ? (
        <span className="text-right text-xs tabular-nums text-slate-400 font-medium">
          {Math.round(clamped)}%
        </span>
      ) : null}
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2 w-full overflow-hidden rounded-full bg-slate-800 border border-slate-700/50"
      >
        <div
          className={cn(
            "h-full w-full origin-left rounded-full bg-teal-400 transition-transform duration-300 ease-out motion-reduce:transition-none",
            barClassName,
          )}
          style={clamped === undefined ? undefined : { transform: `scaleX(${clamped / 100})` }}
        />
      </div>
    </div>
  );
}
