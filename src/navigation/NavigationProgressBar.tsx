import { useEffect, useState } from "react"
import { cn } from "@/ui/cn"
import { useMediaQuery } from "@/internal/browser/useMediaQuery"

/** Where the bar stops while it waits: it never claims to be done. */
const CEILING = 90
const TRICKLE_INTERVAL = 200
/** How long the bar takes to fill up, then to fade, once the view is there. */
const FINISH_DURATION = 200

type Phase = "hidden" | "running" | "finishing" | "fading"

export interface NavigationProgressBarProps {
  /** Whether a navigation is under way. */
  visible: boolean
  className?: string
}

/**
 * A thin bar along the top of the screen, in the theme's primary colour.
 *
 * It moves optimistically — quickly at first, then slower and slower, never
 * reaching the end on its own — and fills up before fading once the view has
 * arrived. With `prefers-reduced-motion: reduce`, it changes without sliding.
 */
export function NavigationProgressBar({
  visible,
  className,
}: NavigationProgressBarProps) {
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)")
  const [phase, setPhase] = useState<Phase>("hidden")
  const [progress, setProgress] = useState(0)

  if (visible && phase !== "running") {
    // Adjusted during the render, as React allows for state derived from props.
    setPhase("running")
    setProgress(phase === "hidden" ? 15 : Math.min(progress, CEILING))
  } else if (!visible && phase === "running") {
    setPhase("finishing")
    setProgress(100)
  }

  useEffect(() => {
    if (phase === "running") {
      const timer = setInterval(
        () => setProgress((current) => current + (CEILING - current) * 0.15),
        TRICKLE_INTERVAL
      )
      return () => clearInterval(timer)
    }

    if (phase === "finishing" || phase === "fading") {
      const timer = setTimeout(
        () => setPhase(phase === "finishing" ? "fading" : "hidden"),
        FINISH_DURATION
      )
      return () => clearTimeout(timer)
    }
  }, [phase])

  if (phase === "hidden") return null

  const transition = reduceMotion
    ? `opacity ${FINISH_DURATION}ms linear`
    : `width ${FINISH_DURATION}ms ease-out, opacity ${FINISH_DURATION}ms linear`

  return (
    <div
      role="progressbar"
      aria-label="Loading"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-[100] h-0.5",
        className
      )}
    >
      <div
        className="h-full bg-primary shadow-[0_0_8px_var(--primary)]"
        style={{
          width: `${progress}%`,
          opacity: phase === "fading" ? 0 : 1,
          transition,
        }}
      />
    </div>
  )
}
