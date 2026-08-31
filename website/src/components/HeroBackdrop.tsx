import { useEffect, useRef } from "react"

/**
 * The light behind the landing headline.
 *
 * The pointer is written straight into two custom properties rather than into
 * React state: it moves at the rate of the mouse, and a component that
 * re-rendered at that rate would drag the hero's demos through the same work.
 * The gradient reading those properties is painted by the compositor, so the
 * whole effect costs one style recalculation per frame and no layout at all.
 *
 * Everything here is decoration; the markup is identical on the server, and the
 * listener is the only thing the browser adds.
 */
export function HeroBackdrop() {
  const spotlight = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = spotlight.current
    if (!element) return

    // A reader who has asked for less motion still gets the static gradient.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    let frame = 0

    function onPointerMove(event: PointerEvent) {
      if (frame) return
      frame = requestAnimationFrame(() => {
        frame = 0
        const node = spotlight.current
        if (!node) return
        const box = node.getBoundingClientRect()
        node.style.setProperty(
          "--spot-x",
          `${((event.clientX - box.left) / box.width) * 100}%`
        )
        node.style.setProperty(
          "--spot-y",
          `${((event.clientY - box.top) / box.height) * 100}%`
        )
      })
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true })
    return () => {
      window.removeEventListener("pointermove", onPointerMove)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="aurora aurora-form -left-32 top-[-8rem] size-[32rem]" />
      <div className="aurora aurora-view -right-24 top-[-4rem] size-[28rem]" />
      <div className="bg-dotted fade-edges absolute inset-0 opacity-70" />
      <div ref={spotlight} className="spotlight absolute inset-0" />
    </div>
  )
}
