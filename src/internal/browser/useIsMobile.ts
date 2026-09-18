import { useMediaQuery } from "@/internal/browser/useMediaQuery"

const MOBILE_BREAKPOINT = "(max-width: 767px)"

/** Below the `md` breakpoint — the point at which the admin layout switches
 * from a sidebar to a bottom navigation bar. */
export function useIsMobile(): boolean {
  return useMediaQuery(MOBILE_BREAKPOINT)
}
