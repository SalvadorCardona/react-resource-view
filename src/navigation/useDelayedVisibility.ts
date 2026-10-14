import { useEffect, useRef, useState } from "react"

export interface DelayedVisibilityOptions {
  /** How long `active` must last before anything shows, in milliseconds. */
  delay?: number
  /** How long something shown stays on screen at least, in milliseconds. */
  minDuration?: number
}

/**
 * `active`, slowed down for the eye: nothing shows before `delay`, so an
 * instant change does not flash, and what shows stays `minDuration`, so it does
 * not jump away the moment it appeared.
 */
export function useDelayedVisibility(
  active: boolean,
  { delay = 150, minDuration = 300 }: DelayedVisibilityOptions = {}
): boolean {
  const [visible, setVisible] = useState(false)
  const shownAtRef = useRef(0)

  useEffect(() => {
    if (active && !visible) {
      const timer = setTimeout(() => {
        shownAtRef.current = Date.now()
        setVisible(true)
      }, delay)
      return () => clearTimeout(timer)
    }

    if (!active && visible) {
      const remaining = minDuration - (Date.now() - shownAtRef.current)
      const timer = setTimeout(() => setVisible(false), Math.max(0, remaining))
      return () => clearTimeout(timer)
    }
  }, [active, visible, delay, minDuration])

  return visible
}
