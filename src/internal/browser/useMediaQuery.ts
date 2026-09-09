import { useCallback, useSyncExternalStore } from "react"
import { isBrowser } from "@/internal/browser/isBrowser"

/**
 * Answers a CSS media query, and re-renders when the answer changes.
 *
 * There is no viewport to measure on a server, so the query does not match
 * there: the narrow shape is rendered first and corrected on hydration, which
 * is the safe way round — a phone gets what it asked for immediately, and a
 * desktop swaps a panel before anyone has clicked anything.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!isBrowser()) return () => {}

      const media = window.matchMedia(query)
      media.addEventListener("change", onStoreChange)

      return () => media.removeEventListener("change", onStoreChange)
    },
    [query]
  )

  return useSyncExternalStore(
    subscribe,
    () => (isBrowser() ? window.matchMedia(query).matches : false),
    () => false
  )
}
