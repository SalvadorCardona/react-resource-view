import { RefObject, useLayoutEffect, useRef } from "react"
import { useMediaQuery } from "@/internal/browser/useMediaQuery"

const DURATION = 180
const EASING = "cubic-bezier(0.2, 0, 0, 1)"

/**
 * Fades the element in, sliding it up a little, the first time `enabled` is
 * true. Played with the Web Animations API, so it needs no stylesheet; with
 * `prefers-reduced-motion: reduce`, it fades without moving.
 */
export function useViewEnterTransition(
  ref: RefObject<HTMLElement | null>,
  enabled: boolean
): void {
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)")
  const playedRef = useRef(false)

  useLayoutEffect(() => {
    if (!enabled || playedRef.current) return
    playedRef.current = true

    const element = ref.current
    if (!element || typeof element.animate !== "function") return

    const keyframes: Keyframe[] = reduceMotion
      ? [{ opacity: 0 }, { opacity: 1 }]
      : [
          { opacity: 0, transform: "translateY(4px)" },
          { opacity: 1, transform: "none" },
        ]
    // Not cancelled on cleanup: strict mode runs the effect twice, and the
    // second run, finding it played, would leave the view without its fade.
    element.animate(keyframes, { duration: DURATION, easing: EASING })
  }, [enabled, reduceMotion, ref])
}
