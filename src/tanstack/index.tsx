import {
  Link as TanstackLink,
  Navigate as TanstackNavigate,
  useLocation as useTanstackLocation,
  useNavigate as useTanstackNavigate,
} from "@tanstack/react-router"
import type { NavigationPortInterface } from "@/ports"

/**
 * Ready-made navigation adapter for [TanStack Router](https://tanstack.com/router).
 *
 * ```ts
 * import { configurePorts } from "react-resource-view"
 * import { tanstackAdapter } from "react-resource-view/tanstack"
 *
 * configurePorts({ navigation: tanstackAdapter })
 * ```
 *
 * Importing this entry point is what pulls TanStack Router in — the core of the
 * package never references it, so an application on another router installs
 * nothing extra.
 */
export const tanstackAdapter: NavigationPortInterface = {
  useNavigate: () => {
    const navigate = useTanstackNavigate()
    // TanStack types `to` against the generated route tree; the views build
    // their paths at runtime from the resource and action, so it is widened here.
    return ({ to, replace, resetScroll }) =>
      navigate({ to: to as never, replace, resetScroll })
  },

  useLocation: () => {
    const location = useTanstackLocation()
    return {
      pathname: location.pathname,
      searchStr: location.searchStr,
      search: location.search as Record<string, unknown>,
    }
  },

  Link: ({ to, children, ...rest }) => (
    <TanstackLink to={to as never} {...rest}>
      {children}
    </TanstackLink>
  ),

  Navigate: ({ to, replace }) => (
    <TanstackNavigate to={to as never} replace={replace} />
  ),
}
